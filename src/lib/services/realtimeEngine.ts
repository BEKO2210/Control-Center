// ============================================================================
// Clawbot Mission Control — RealtimeEngine (DEFEKT-1, DEFEKT-2, DEFEKT-3)
//
// The missing link between the wire and the UI. Before this existed, the
// ConnectionManager received messages and threw them away — nothing ever wrote
// to the Zustand store, so React never re-rendered and agents never changed
// state on their own.
//
// Responsibilities:
//  1. Subscribe to ConnectionManager events and DISPATCH store actions
//     (DEFEKT-1) so every inbound datum updates state → React re-renders
//     automatically (DEFEKT-2).
//  2. Run an AgentScheduler that actively polls every connected claw for agent
//     status on a fixed interval, giving agents real autonomy (DEFEKT-3).
//  3. Drive a claw offline (agents → idle, warning notification) when a
//     connection drops.
//
// It is a browser-only singleton: `start()` is idempotent and safe to call on
// every mount; `stop()` tears everything down.
// ============================================================================

import { connectionManager } from '@/lib/services/connectionService';
import { useMissionControl } from '@/lib/store';
import { generateId } from '@/lib/utils';
import {
  AGENT_POLL_INTERVAL_MS,
  CLAW_STALE_TIMEOUT_MS,
} from '@/lib/constants';
import {
  coerceAgentArray,
  normalizeInboundMessage,
  safeActivity,
  safeRole,
  safeStatus,
} from '@/lib/services/messageProtocol';
import type {
  InboundMessage,
  RemoteAgentPayload,
  RemoteMemoryPayload,
  RemoteStatusPayload,
  RemoteTaskPayload,
} from '@/lib/types';

type StoreApi = ReturnType<typeof useMissionControl.getState>;

class RealtimeEngine {
  private running = false;
  private unsubscribe: (() => void) | null = null;
  private agentTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Boot the engine: wire up the ConnectionManager subscription and start the
   * AgentScheduler. Idempotent — calling it while already running is a no-op.
   *
   * @returns void
   * @example realtimeEngine.start()
   */
  start(): void {
    if (this.running || typeof window === 'undefined') return;
    this.running = true;

    this.unsubscribe = connectionManager.subscribe((event) => {
      try {
        this.handleEvent(event);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[RealtimeEngine] event handler error:', err);
        }
      }
    });

    this.agentTimer = setInterval(() => {
      this.pollAgents();
    }, AGENT_POLL_INTERVAL_MS);
  }

  /**
   * Tear the engine down: drop the subscription and clear the poll loop.
   *
   * @returns void
   * @example realtimeEngine.stop()
   */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.agentTimer) {
      clearInterval(this.agentTimer);
      this.agentTimer = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  // --- Event handling -------------------------------------------------------

  private handleEvent(event: {
    type: string;
    connectionId: string;
    data: unknown;
  }): void {
    const clawId = connectionManager.getConnection(event.connectionId)?.clawId;
    if (!clawId) return;

    const store = useMissionControl.getState();

    switch (event.type) {
      case 'status_change': {
        const data = event.data as { status?: string };
        if (data.status === 'error' || data.status === 'disconnected') {
          this.onClawOffline(store, clawId);
        }
        break;
      }
      case 'agents_discovered': {
        const agents = coerceAgentArray(event.data);
        agents.forEach((a) => this.reconcileAgent(store, clawId, a));
        break;
      }
      case 'message': {
        const msg = normalizeInboundMessage(event.data);
        if (msg) this.route(store, clawId, msg);
        break;
      }
      default:
        break;
    }
  }

  private route(store: StoreApi, clawId: string, msg: InboundMessage): void {
    switch (msg.type) {
      case 'task_update':
        this.reconcileTask(store, clawId, msg.payload);
        break;
      case 'agent_status':
        this.reconcileAgent(store, clawId, msg.payload);
        break;
      case 'agents_list':
        msg.payload.forEach((a) => this.reconcileAgent(store, clawId, a));
        break;
      case 'memory_write':
        this.writeMemory(store, clawId, msg.payload);
        break;
      case 'status':
        this.applyStatus(store, clawId, msg.payload);
        break;
      case 'heartbeat':
        store.updateClaw(clawId, { lastSeen: new Date().toISOString() });
        break;
    }
  }

  // --- Reconcilers ----------------------------------------------------------

  private applyStatus(
    store: StoreApi,
    clawId: string,
    payload: RemoteStatusPayload,
  ): void {
    store.updateClaw(clawId, { lastSeen: new Date().toISOString() });
    payload.agents?.forEach((a) => this.reconcileAgent(store, clawId, a));
    payload.tasks?.forEach((t) => this.reconcileTask(store, clawId, t));
  }

  private reconcileAgent(
    store: StoreApi,
    clawId: string,
    remote: RemoteAgentPayload,
  ): void {
    if (!remote || !remote.id) return;

    const existing = store.agents.find(
      (a) =>
        a.clawId === clawId &&
        (a.externalId === remote.id ||
          a.id === remote.id ||
          (!!remote.name && a.name === remote.name)),
    );

    const activity = safeActivity(remote.activity);
    const now = new Date().toISOString();

    if (existing) {
      store.updateAgent(existing.id, {
        externalId: remote.id,
        activity: activity ?? existing.activity,
        ...(remote.currentTasks ? { currentTasks: remote.currentTasks } : {}),
        lastSeen: now,
      });
    } else if (remote.name) {
      store.addAgent({
        name: remote.name,
        avatar: 'bot',
        role: safeRole(remote.role),
        responsibilities: [],
        currentTasks: remote.currentTasks ?? [],
        activity: activity ?? 'idle',
        clawId,
        externalId: remote.id,
        lastSeen: now,
        stats: { tasksCompleted: 0, tasksInProgress: 0, uptime: 0 },
      });
    }
  }

  private reconcileTask(
    store: StoreApi,
    clawId: string,
    remote: RemoteTaskPayload,
  ): void {
    if (!remote || !remote.id) return;

    const existing = store.tasks.find(
      (t) =>
        (t.externalId === remote.id || t.id === remote.id) &&
        (t.clawId === clawId || t.clawId == null),
    );

    const status = safeStatus(remote.status);

    if (existing) {
      store.updateTask(existing.id, {
        ...(remote.title ? { title: remote.title } : {}),
        ...(remote.description !== undefined
          ? { description: remote.description }
          : {}),
        ...(status ? { status } : {}),
        ...(remote.priority ? { priority: remote.priority } : {}),
        ...(remote.assignedTo ? { assignedTo: remote.assignedTo } : {}),
        ...(remote.tags ? { tags: remote.tags } : {}),
        ...(remote.relatedFiles ? { relatedFiles: remote.relatedFiles } : {}),
        externalId: remote.id,
        clawId,
      });
    } else {
      store.addTask({
        title: remote.title ?? `Task ${remote.id}`,
        description: remote.description ?? '',
        status: status ?? 'queued',
        assignedTo: remote.assignedTo ?? 'ai',
        priority: remote.priority ?? 'medium',
        relatedFiles: remote.relatedFiles ?? [],
        tags: remote.tags ?? [],
        clawId,
        externalId: remote.id,
      });
    }
  }

  private writeMemory(
    store: StoreApi,
    clawId: string,
    remote: RemoteMemoryPayload,
  ): void {
    if (!remote || !remote.title) return;
    store.addMemory({
      title: remote.title,
      content: remote.content ?? '',
      category: remote.category ?? 'context',
      source: remote.source ?? `claw:${clawId}`,
      tags: remote.tags ?? [],
      clawId,
    });
  }

  private onClawOffline(store: StoreApi, clawId: string): void {
    const claw = store.claws.find((c) => c.id === clawId);
    const hadActiveAgents = store.agents.some(
      (a) => a.clawId === clawId && a.activity !== 'idle',
    );
    store.setClawAgentsIdle(clawId);
    if (claw?.isActive || hadActiveAgents) {
      store.addNotification({
        title: 'Claw offline',
        message: `${claw?.name ?? 'A claw'} disconnected — its agents were set to idle.`,
        type: 'warning',
      });
    }
  }

  // --- AgentScheduler (DEFEKT-3) -------------------------------------------

  /**
   * Ask every live connection for fresh agent status. REST connections get a
   * `GET /agents`; socket connections get a `get_status` push (the response
   * routes back through the normal message path). Also flags stale claws.
   */
  private pollAgents(): void {
    const live = connectionManager
      .getAllConnections()
      .filter((c) => c.status === 'connected');

    const store = useMissionControl.getState();

    for (const conn of live) {
      // Detect a silent claw: connected but no traffic for too long.
      if (conn.lastMessage) {
        const age = Date.now() - new Date(conn.lastMessage).getTime();
        if (age > CLAW_STALE_TIMEOUT_MS) {
          this.onClawOffline(store, conn.clawId);
        }
      }

      if (conn.type === 'rest') {
        connectionManager
          .sendRestCommand(conn.id, 'GET', '/agents')
          .then((data) => {
            const agents = coerceAgentArray(data);
            const s = useMissionControl.getState();
            agents.forEach((a) => this.reconcileAgent(s, conn.clawId, a));
          })
          .catch(() => {
            /* poll failures are handled by ConnectionManager's own counter */
          });
      } else {
        connectionManager.sendMessage(conn.id, {
          type: 'get_status',
          id: generateId('req'),
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

export const realtimeEngine = new RealtimeEngine();
