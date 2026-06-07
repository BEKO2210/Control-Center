# ROADMAP — Clawbot Mission Control

## Done

- [x] **DEFEKT-1** — `connectionService` → store integration via `RealtimeEngine`
- [x] **DEFEKT-2** — Active realtime loop drives automatic React re-renders
- [x] **DEFEKT-3** — `AgentScheduler` gives agents autonomous status updates
- [x] **DEFEKT-4** — `AIBridge`: real Claude calls (Phase 1, browser-side)
- [x] **DEFEKT-5** — Multi-claw isolation (`clawId` + Dashboard filter)
- [x] **DEFEKT-6** — REST poll-failure counter verified + constant-ized
- [x] **DEFEKT-7** — Setup Wizard `mountedRef` guards on all handlers
- [x] **DEFEKT-8** — Store schema `version` + `migrate()` (v1 → v2)

## Next (prioritized)

1. **AIBridge Phase 2** — Move the Anthropic call behind a Next.js API route so
   the key never touches the browser. Removes the `dangerous-direct-browser`
   header.
2. **Auto-dispatch** — Have the `AgentScheduler` pull queued AI tasks
   automatically when a key is set, instead of a manual "Run with AI" click.
3. **Test harness** — Add Vitest and cover: poll-failure counter, store
   migration, and the `RealtimeEngine` message router.

## Backlog (idea pool)

- [ ] Real-time collaboration across tabs via `BroadcastChannel`
- [ ] Plugin system — external screens via dynamic `import()`
- [ ] AI-autocomplete for task creation
- [ ] Full keyboard navigation (accessibility)
- [ ] Offline support — Service Worker + IndexedDB
- [ ] Export/Import — JSON backup & restore with schema validation
- [ ] Visual shell/theme editor in-app
- [ ] Agent health monitor with exponential-backoff reconnect
- [ ] Task dependencies (DAG)
- [ ] Notification center — Web Push when an agent finishes
- [ ] SQLite backend via API route (replace localStorage)
- [ ] CLI quickstart — `npx clawbot connect ws://localhost:8080`
