// ============================================================================
// Clawbot Mission Control — AIBridge (DEFEKT-4)
// Turns a board task into a real Claude completion and writes the result back
// into Mission Control as a Memory + a task status transition.
//
// Phase 2: the actual Anthropic call now goes through the server route at
// `/api/ai`, so a deployment can keep the key server-side (ANTHROPIC_API_KEY)
// and the browser never needs the direct-browser-access escape hatch. The
// backend-less local mode still works: the session key is forwarded to the
// route via the `x-client-key` header, used for that request only.
//
// SECURITY: the client-held key lives in sessionStorage only. It is never
// written to the persisted Zustand/localStorage blob, so it dies with the
// browser session. In a real deployment, prefer the server env var so no key
// ever reaches the browser at all.
// ============================================================================

import { useMissionControl } from '@/lib/store';
import type { Task } from '@/lib/types';
import { CLAUDE_API_KEY_STORAGE } from '@/lib/constants';

/** Local API route that proxies to Anthropic (server-side). */
const AI_ROUTE = '/api/ai';

const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Persist the Claude API key for the current browser session only.
 *
 * @param key - The Anthropic API key, or an empty string to clear it.
 * @returns void
 * @example setApiKey('sk-ant-...')
 */
export function setApiKey(key: string): void {
  if (!isBrowser()) return;
  try {
    if (key) {
      window.sessionStorage.setItem(CLAUDE_API_KEY_STORAGE, key);
    } else {
      window.sessionStorage.removeItem(CLAUDE_API_KEY_STORAGE);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[AIBridge] Failed to persist API key:', err);
    }
  }
}

/**
 * Read the session-scoped Claude API key.
 *
 * @returns The stored key, or null when none is set.
 * @example const key = getApiKey()
 */
export function getApiKey(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(CLAUDE_API_KEY_STORAGE);
  } catch {
    return null;
  }
}

/**
 * Synchronous best-effort check: true when a client session key is present.
 * Does not see a server-side key — use {@link checkAiAvailability} for that.
 *
 * @returns true when a non-empty client key is present.
 * @example if (isAiEnabled()) bridge.processTask(task)
 */
export function isAiEnabled(): boolean {
  return Boolean(getApiKey());
}

/**
 * Authoritative availability check. AI is usable when either the server has a
 * key configured (`ANTHROPIC_API_KEY`) or the client holds a session key.
 *
 * @returns Resolves true when a completion can be dispatched.
 * @example const ready = await checkAiAvailability()
 */
export async function checkAiAvailability(): Promise<boolean> {
  if (getApiKey()) return true;
  if (!isBrowser()) return false;
  try {
    const res = await fetch(AI_ROUTE, { method: 'GET' });
    if (!res.ok) return false;
    const data = (await res.json()) as { serverKeyConfigured?: boolean };
    return Boolean(data.serverKeyConfigured);
  } catch {
    return false;
  }
}

interface AiRouteResponse {
  text?: string;
  error?: string;
}

/**
 * The AIBridge singleton. Pulls a task off the board, asks Claude to work it,
 * and threads the answer back into the store as a reviewable artifact.
 */
class AIBridge {
  /** Tasks currently mid-flight, keyed by task id (prevents double dispatch). */
  private inFlight: Set<string> = new Set();

  /**
   * Send a single task to Claude and write the result back as a Memory.
   *
   * Flow: `queued` → `in_progress` (Claude is working) → `review` (result is
   * ready for a human). On failure the task is parked back in `queued` and an
   * error notification is raised. No-ops gracefully when no API key is set.
   *
   * @param task - The board task to process.
   * @returns Resolves true when a result was written, false otherwise.
   * @example await aiBridge.processTask(myTask)
   */
  async processTask(task: Task): Promise<boolean> {
    if (this.inFlight.has(task.id)) return false;

    const store = useMissionControl.getState();
    this.inFlight.add(task.id);
    store.updateTask(task.id, { status: 'in_progress' });

    try {
      const prompt = this.buildPrompt(task);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      // Forward the session key only when there is no server-side key; the
      // route prefers ANTHROPIC_API_KEY and ignores this header when set.
      const clientKey = getApiKey();
      if (clientKey) headers['x-client-key'] = clientKey;

      const response = await fetch(AI_ROUTE, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(65_000),
      });

      const data = (await response.json().catch(() => ({}))) as AiRouteResponse;

      if (!response.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const text = data.text?.trim() ?? '';
      if (!text) throw new Error('Empty completion from Claude');

      store.addMemory({
        title: `AI result: ${task.title}`,
        content: text,
        category: 'learned',
        source: 'ai:claude',
        tags: ['ai', 'task-result', ...task.tags],
        clawId: task.clawId ?? null,
      });

      store.updateTask(task.id, { status: 'review' });
      store.addNotification({
        title: 'AI completed a task',
        message: `"${task.title}" is ready for review.`,
        type: 'success',
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI error';
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[AIBridge] processTask failed:', message);
      }
      store.updateTask(task.id, { status: 'queued' }); // park it back
      store.addNotification({
        title: 'AI task failed',
        message: `"${task.title}": ${message}`,
        type: 'error',
      });
      return false;
    } finally {
      this.inFlight.delete(task.id);
    }
  }

  /**
   * Compose the instruction prompt sent to Claude for a given task.
   *
   * @param task - The task being dispatched.
   * @returns A self-contained prompt string.
   */
  private buildPrompt(task: Task): string {
    const lines = [
      'You are an autonomous agent inside "Clawbot Mission Control".',
      'Work the following task and return a concise, actionable result.',
      '',
      `Title: ${task.title}`,
      `Priority: ${task.priority}`,
    ];
    if (task.description) lines.push(`Description: ${task.description}`);
    if (task.relatedFiles.length) {
      lines.push(`Related files: ${task.relatedFiles.join(', ')}`);
    }
    if (task.tags.length) lines.push(`Tags: ${task.tags.join(', ')}`);
    lines.push('', 'Respond with the deliverable only — no preamble.');
    return lines.join('\n');
  }
}

export const aiBridge = new AIBridge();
