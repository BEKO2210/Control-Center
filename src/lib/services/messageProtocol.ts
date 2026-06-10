// ============================================================================
// Clawbot Mission Control — Inbound Message Protocol (pure helpers)
//
// Extracted from the RealtimeEngine so the wire-decoding logic can be unit
// tested in isolation, with no store, sockets, or timers involved. Everything
// here is a pure function: same input → same output, no side effects.
// ============================================================================

import type {
  AgentActivity,
  AgentRole,
  InboundMessage,
  RemoteAgentPayload,
  RemoteMemoryPayload,
  RemoteStatusPayload,
  RemoteTaskPayload,
  TaskStatus,
} from '@/lib/types';

export const VALID_ACTIVITIES: AgentActivity[] = [
  'idle',
  'thinking',
  'building',
  'reviewing',
  'blocked',
];

export const VALID_TASK_STATUS: TaskStatus[] = [
  'idea',
  'queued',
  'in_progress',
  'review',
  'done',
];

export const VALID_ROLES: AgentRole[] = [
  'developer',
  'writer',
  'designer',
  'researcher',
  'operator',
  'growth',
];

/**
 * Pull an agent array out of the many shapes a claw might send: a bare array,
 * `{ agents: [...] }`, or `{ data: [...] }`.
 *
 * @param data - Arbitrary inbound value.
 * @returns The extracted agent array, or `[]` when none is present.
 * @example coerceAgentArray({ agents: [{ id: 'a1' }] }) // → [{ id: 'a1' }]
 */
export function coerceAgentArray(data: unknown): RemoteAgentPayload[] {
  if (Array.isArray(data)) return data as RemoteAgentPayload[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.agents)) return obj.agents as RemoteAgentPayload[];
    if (Array.isArray(obj.data)) return obj.data as RemoteAgentPayload[];
  }
  return [];
}

/**
 * Narrow an unknown value to a valid {@link AgentActivity}, or null.
 *
 * @param value - Candidate activity string.
 * @returns The activity when valid, otherwise null.
 * @example safeActivity('building') // → 'building'
 */
export function safeActivity(value: unknown): AgentActivity | null {
  return VALID_ACTIVITIES.includes(value as AgentActivity)
    ? (value as AgentActivity)
    : null;
}

/**
 * Narrow an unknown value to a valid {@link TaskStatus}, or null.
 *
 * @param value - Candidate status string.
 * @returns The status when valid, otherwise null.
 * @example safeStatus('review') // → 'review'
 */
export function safeStatus(value: unknown): TaskStatus | null {
  return VALID_TASK_STATUS.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : null;
}

/**
 * Narrow an unknown value to a valid {@link AgentRole}, defaulting to
 * `'operator'` for anything unrecognized.
 *
 * @param value - Candidate role string.
 * @returns A valid role (never null).
 * @example safeRole('martian') // → 'operator'
 */
export function safeRole(value: unknown): AgentRole {
  return VALID_ROLES.includes(value as AgentRole)
    ? (value as AgentRole)
    : 'operator';
}

/**
 * Normalize the many shapes ConnectionManager emits into a typed
 * {@link InboundMessage}. Accepts both the documented protocol
 * (`{ type, payload }`) and legacy wrappers (`{ type, data }`), and maps
 * transport-level aliases (`agent_update` → `agent_status`, `pong`/`ping` →
 * `heartbeat`, `health` → `status`) onto the canonical message types.
 *
 * @param raw - Arbitrary inbound value off the wire.
 * @returns A typed message, or null when it can't be understood.
 * @example
 *   normalizeInboundMessage({ type: 'task_update', payload: { id: 't1' } })
 *   // → { type: 'task_update', payload: { id: 't1' } }
 */
export function normalizeInboundMessage(raw: unknown): InboundMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const type = typeof obj.type === 'string' ? obj.type : null;
  if (!type) return null;

  // payload may live under `payload` (new protocol) or `data` (legacy).
  const payload = (obj.payload ?? obj.data) as unknown;

  switch (type) {
    case 'task_update':
      return { type: 'task_update', payload: payload as RemoteTaskPayload };
    case 'agent_status':
    case 'agent_update':
      return { type: 'agent_status', payload: payload as RemoteAgentPayload };
    case 'agents':
    case 'agents_list':
      return { type: 'agents_list', payload: coerceAgentArray(payload) };
    case 'memory_write':
      return { type: 'memory_write', payload: payload as RemoteMemoryPayload };
    case 'status':
    case 'health':
      return { type: 'status', payload: (payload ?? {}) as RemoteStatusPayload };
    case 'heartbeat':
    case 'pong':
    case 'ping':
      return { type: 'heartbeat', payload };
    default:
      return null;
  }
}
