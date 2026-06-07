// ============================================================================
// Clawbot Mission Control — AIBridge (DEFEKT-4)
// Turns a board task into a real Claude completion and writes the result back
// into Mission Control as a Memory + a task status transition.
//
// Why a hand-rolled fetch instead of the Anthropic SDK?
//  - Zero extra dependency weight (the SDK pulls in a large transitive tree).
//  - Phase 1 is intentionally backend-less: the call runs straight from the
//    browser, gated behind an explicit opt-in API key.
//
// SECURITY: the key is held in sessionStorage only. It is never written to the
// persisted Zustand/localStorage blob, so it dies with the browser session.
// ============================================================================

import { useMissionControl } from '@/lib/store';
import type { Task } from '@/lib/types';
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_API_VERSION,
  AI_BRIDGE_MAX_TOKENS,
  AI_BRIDGE_MODEL,
  CLAUDE_API_KEY_STORAGE,
} from '@/lib/constants';

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
 * Whether the AIBridge has everything it needs to dispatch a task.
 *
 * @returns true when a non-empty API key is present.
 * @example if (isAiEnabled()) bridge.processTask(task)
 */
export function isAiEnabled(): boolean {
  return Boolean(getApiKey());
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string };
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
    const apiKey = getApiKey();
    if (!apiKey) return false; // graceful degradation — AI simply stays off
    if (this.inFlight.has(task.id)) return false;

    const store = useMissionControl.getState();
    this.inFlight.add(task.id);
    store.updateTask(task.id, { status: 'in_progress' });

    try {
      const prompt = this.buildPrompt(task);
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_API_VERSION,
          // Required for direct browser-side calls (Phase 1, no backend).
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: AI_BRIDGE_MODEL,
          max_tokens: AI_BRIDGE_MAX_TOKENS,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const body = (await response.json()) as AnthropicResponse;
          if (body.error?.message) detail = body.error.message;
        } catch {
          /* keep the status-code fallback */
        }
        throw new Error(detail);
      }

      const data = (await response.json()) as AnthropicResponse;
      const text =
        data.content
          ?.filter((b) => b.type === 'text' && b.text)
          .map((b) => b.text)
          .join('\n')
          .trim() ?? '';

      if (!text) throw new Error('Empty completion from Claude');

      store.addMemory({
        title: `AI result: ${task.title}`,
        content: text,
        category: 'learned',
        source: `ai:${AI_BRIDGE_MODEL}`,
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
