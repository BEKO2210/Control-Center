# DEVLOG — Clawbot Mission Control

A running log of autonomous development cycles. Newest first.

## Run #2 — 2026-06-07

**Focus:** Security — AIBridge Phase 2 (server-side key) + dependency audit.

**Analysis (start of cycle):** `tsc` clean; `ts-prune` only flagged
barrel/index re-exports (expected); `npm audit` reported 9 vulns (2 moderate,
7 high). Highest value / lowest risk: clear the non-breaking transitive vulns
and ship the prioritized ROADMAP item (server-side AI key), which is itself the
real security fix for the browser-side key introduced in Run #1.

**What I did:**
- Added `src/app/api/ai/route.ts` — a server-side proxy to Anthropic.
  - `GET` → `{ serverKeyConfigured }` so the client can light up the AI UI.
  - `POST { prompt }` → uses `ANTHROPIC_API_KEY` (server env) when present,
    else the client's `x-client-key` header (local mode), and returns `{ text }`.
- Refactored `aiBridge.ts` to call `/api/ai` instead of Anthropic directly;
  dropped the `anthropic-dangerous-direct-browser-access` header. Added
  `checkAiAvailability()` (server-or-client) and wired the TaskBoard button to
  it asynchronously.
- `npm audit fix` (non-`--force`): 9 → 6 vulns. Remaining 6 need Next 16.
- Added `.env.example` documenting the server-only key.

**What I found:**
- The remaining 6 vulns are all in `next` and its eslint `glob` chain and only
  fix via a major (14 → 16) upgrade — out of scope for a hygiene run; queued.
- The `| tail` pipe on `next build` hides output until completion; redirect to
  a file and poll instead.

**Quality gates:** `tsc --noEmit` clean · `eslint` clean on changed files (same
pre-existing font warning) · `next build` ✓ (`/api/ai` registered as ƒ dynamic).

**What's next:** Next 14 → 16 migration run (closes remaining audit items),
then AgentScheduler auto-dispatch of queued AI tasks.

**Open questions:**
- Should the server route stream tokens (SSE) for long completions instead of a
  single 65s-timeout response? Fine for now; revisit if tasks get large.

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
