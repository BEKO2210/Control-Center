// ============================================================================
// Clawbot Mission Control — Persisted store migrations (DEFEKT-8)
//
// Extracted from the store so the migration logic can be unit tested without
// instantiating Zustand or touching localStorage. A pure transform:
// (persistedBlob, version) → blob matching the current schema.
// ============================================================================

import type { Memory, Task } from '@/lib/types';

/**
 * Run schema migrations against a persisted blob. Invoked by the Zustand
 * persist middleware whenever the stored `version` is older than
 * {@link STORE_SCHEMA_VERSION}, transforming the blob step-by-step so a
 * breaking schema change never wipes a user's data.
 *
 * @param persistedState - The raw object loaded from localStorage (any shape).
 * @param version - The schema version the blob was written with.
 * @returns A plain object matching the current schema.
 * @example
 *   // v1 (no clawId on tasks) → v2 (clawId backfilled to null)
 *   migrate({ tasks: [{ id: 't1' }] }, 1)
 */
export function migrate(
  persistedState: unknown,
  version: number,
): Record<string, unknown> {
  const state = (persistedState ?? {}) as Record<string, unknown>;

  // v1 → v2: introduce multi-claw isolation. Backfill `clawId: null` on every
  // task and memory so existing items render as "global" (unassigned). The
  // spread comes last so an item that already has a clawId keeps it.
  if (version < 2) {
    if (Array.isArray(state.tasks)) {
      state.tasks = (state.tasks as Task[]).map((t) => ({ clawId: null, ...t }));
    }
    if (Array.isArray(state.memories)) {
      state.memories = (state.memories as Memory[]).map((m) => ({
        clawId: null,
        ...m,
      }));
    }
    state.selectedClawId = null;
  }

  return state;
}
