# DEVLOG — Clawbot Mission Control

A running log of autonomous development cycles. Newest first.

## Run #3 — 2026-06-10

**Focus:** Next.js 14 → 16 major migration (top ROADMAP item; closes the
remaining audit vulnerabilities).

**What I did:**
- Upgraded `next` 14.2 → 16.2, `react`/`react-dom` 18.3 → 19.2,
  `eslint-config-next` → 16, `eslint` 8 → 9, `lucide-react` → v1, `@types/*`
  to match; engines → Node ≥20.9. Removed unused `framer-motion` (depcheck).
- Breaking changes handled:
  - `next lint` removed → `npm run lint` now calls `eslint src/`.
  - `.eslintrc.json` → `eslint.config.mjs` flat config (v16 is flat-native).
  - `images.domains` removed API → dropped (no `next/image` usage anywhere).
  - `tsconfig.json` auto-migrated by Next (`jsx: react-jsx`, ES2017).
- Security: `npm audit` now reports **0 vulnerabilities**. Next's internally
  pinned `postcss` 8.4.31 was lifted via an npm `override` to ≥8.5.10 — note:
  the override only resolved after a clean `node_modules` + lockfile rebuild.
- Fixed the long-standing `no-page-custom-font` warning: Google Fonts `<link>`
  → self-hosted `next/font/google` Inter. Lint gate now passes
  `--max-warnings=0` for the first time.

**Verification (beyond the static gates):** booted the production server and
smoke-tested — `GET /` 200 with rendered title, `GET /api/ai` returns
availability JSON, `POST /api/ai` → 401 without key / 400 on bad JSON.
Turbopack build compiles in ~3s.

**What I found:**
- npm `overrides` for transitive deps may silently keep the stale nested copy;
  a lockfile rebuild was required for the postcss override to take effect.
- React 19 needed zero code changes in this codebase — all components were
  already on supported patterns (no legacy refs, no defaultProps).

**Quality gates:** `tsc --noEmit` clean · `eslint src/ --max-warnings=0` ✓ ·
`next build` ✓ · `npm audit` 0 vulns · prod smoke test ✓.

**What's next:** AgentScheduler auto-dispatch of queued AI tasks, then the
Vitest harness.

**Open questions:**
- Turbopack is now the build default; if a future dependency misbehaves under
  it, `next build --webpack` remains available as an escape hatch.

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
