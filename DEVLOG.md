# DEVLOG — Clawbot Mission Control

A running log of autonomous development cycles. Newest first.

## Run #1 — 2026-06-07

**Focus:** Close the eight fundamental architecture defects (DEFEKT-1 … DEFEKT-8).

**What I did:**
- **DEFEKT-1/2/3** — Built `RealtimeEngine` (`src/lib/services/realtimeEngine.ts`),
  the missing bridge between the wire and the store. It subscribes to the
  `ConnectionManager`, normalizes the various inbound message shapes into a
  typed protocol, and dispatches Zustand actions that reconcile remote
  tasks/agents/memories. Its `AgentScheduler` polls every live claw on a 5s
  interval and idles a claw's agents (with a warning) when it drops. Mounted
  the engine once from `app/page.tsx`.
- **DEFEKT-4** — Built `AIBridge` (`src/lib/services/aiBridge.ts`): dispatches a
  board task to Claude (`claude-sonnet-4-20250514`), writes the result back as
  a Memory, and transitions the task `queued → in_progress → review`. Added an
  optional Claude API key field to the Setup Wizard (sessionStorage only) and a
  "Run with AI" button on idea/queued cards.
- **DEFEKT-5** — Added optional `clawId` to `Task`/`Memory`, a `selectedClawId`
  store filter, and a Dashboard filter bar to isolate per-claw data.
- **DEFEKT-6** — Verified the REST `pollFailures` counter (reset-on-success and
  reset-on-restart are correct). Replaced magic numbers with shared constants.
- **DEFEKT-7** — Added `mountedRef` guards to all Setup Wizard navigation/
  completion handlers.
- **DEFEKT-8** — Added persist `version: 2` + a `migrate()` runner; v1→v2
  backfills `clawId: null`.
- Added `src/lib/constants.ts` to centralize all timing/limit constants.

**What I found:**
- The inbound message shape is inconsistent across transports (WS emits the full
  `ClawProtocolMessage`; REST emits `{ type, data, latency }` wrappers). The
  engine's `normalize()` smooths over both, accepting `payload` (new protocol)
  or `data` (legacy).
- Calling Anthropic directly from the browser needs the
  `anthropic-dangerous-direct-browser-access` header — acceptable for the
  intentionally backend-less Phase 1, but a server route is the real fix.

**Quality gates:** `tsc --noEmit` clean · `eslint` clean on changed files (one
pre-existing custom-font warning in `layout.tsx`, untouched) · `next build` ✓.

**What's next:**
- DEFEKT-4 Phase 2: move the AI call behind a Next.js API route so the key never
  reaches the browser.
- Auto-dispatch queued AI tasks from the AgentScheduler instead of manual click.
- A lightweight test harness (Vitest) to lock in the poll-failure and migration
  logic.

**Open questions:**
- Should remote-created tasks default to `assignedTo: 'ai'` or mirror what the
  claw reports? Currently defaults to `'ai'` when unspecified.
