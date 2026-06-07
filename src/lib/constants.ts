// ============================================================================
// Clawbot Mission Control — Shared Constants
// Centralizes all "magic numbers" so timing/limits live in one place.
// ============================================================================

/** How often the RealtimeEngine REST-polls a claw for fresh state (ms). */
export const REALTIME_POLL_INTERVAL_MS = 5_000;

/** How often the AgentScheduler asks each claw for agent status (ms). */
export const AGENT_POLL_INTERVAL_MS = 5_000;

/** Heartbeat interval used to detect a silent/stale claw (ms). */
export const HEARTBEAT_INTERVAL_MS = 15_000;

/** A claw is considered stale if no message has arrived within this window (ms). */
export const CLAW_STALE_TIMEOUT_MS = 30_000;

/** Number of consecutive REST poll failures before a connection is marked errored. */
export const MAX_POLL_FAILURES = 3;

/** Base delay for exponential reconnect backoff (ms). */
export const RECONNECT_BASE_DELAY_MS = 5_000;

/** Anthropic Messages API endpoint used by the AIBridge. */
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/** Default Claude model the AIBridge dispatches tasks to. */
export const AI_BRIDGE_MODEL = 'claude-sonnet-4-20250514';

/** Anthropic API version header value. */
export const ANTHROPIC_API_VERSION = '2023-06-01';

/** Max tokens requested per AIBridge completion. */
export const AI_BRIDGE_MAX_TOKENS = 2_048;

/** sessionStorage key under which the (non-persisted) Claude API key lives. */
export const CLAUDE_API_KEY_STORAGE = 'clawbot-claude-api-key';

/** Persisted Zustand store schema version — bump when the shape changes. */
export const STORE_SCHEMA_VERSION = 2;
