// ============================================================================
// Clawbot Mission Control — Real Connection Service
// Handles WebSocket, REST API, and MQTT connections to Claw Bot instances.
// ============================================================================

import type {
  ClawConnection,
  ConnectionType,
  ConnectionStatus,
  ClawProtocolMessage,
} from '@/lib/types';
import { generateId } from '@/lib/utils';

// --- Event Types ---

type ConnectionEventType =
  | 'status_change'
  | 'message'
  | 'agents_discovered'
  | 'error'
  | 'ping';

interface ConnectionEvent {
  type: ConnectionEventType;
  connectionId: string;
  data: unknown;
}

type ConnectionEventHandler = (event: ConnectionEvent) => void;

// --- Connection Manager ---

class ConnectionManager {
  private connections: Map<string, ClawConnection> = new Map();
  private sockets: Map<string, WebSocket> = new Map();
  private pollers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private heartbeats: Map<string, ReturnType<typeof setInterval>> = new Map();
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private pollFailures: Map<string, number> = new Map();
  private listeners: ConnectionEventHandler[] = [];

  // --- Event System ---

  subscribe(handler: ConnectionEventHandler): () => void {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter((h) => h !== handler);
    };
  }

  private emit(event: ConnectionEvent) {
    this.listeners.forEach((h) => h(event));
  }

  // --- Connection Creation ---

  createConnection(
    clawId: string,
    type: ConnectionType,
    endpoint: string,
    port: number,
    path: string,
    useTls: boolean,
    authToken?: string,
  ): ClawConnection {
    const connection: ClawConnection = {
      id: generateId('conn'),
      clawId,
      type,
      endpoint,
      port,
      path,
      useTls,
      authToken,
      status: 'disconnected',
      messagesReceived: 0,
      messagesSent: 0,
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  // --- Build URL ---

  private buildUrl(conn: ClawConnection): string {
    const cleanEndpoint = conn.endpoint.replace(/^(wss?|https?|mqtt):\/\//, '');

    switch (conn.type) {
      case 'websocket': {
        const proto = conn.useTls ? 'wss' : 'ws';
        return `${proto}://${cleanEndpoint}:${conn.port}${conn.path}`;
      }
      case 'rest': {
        const proto = conn.useTls ? 'https' : 'http';
        return `${proto}://${cleanEndpoint}:${conn.port}${conn.path}`;
      }
      case 'mqtt': {
        // MQTT over WebSocket
        const proto = conn.useTls ? 'wss' : 'ws';
        return `${proto}://${cleanEndpoint}:${conn.port}${conn.path}`;
      }
      default:
        throw new Error(`Unknown connection type: ${conn.type}`);
    }
  }

  // --- Connect ---

  async connect(connectionId: string): Promise<boolean> {
    const conn = this.connections.get(connectionId);
    if (!conn) throw new Error(`Connection ${connectionId} not found`);

    this.updateStatus(connectionId, 'connecting');

    try {
      switch (conn.type) {
        case 'websocket':
        case 'mqtt':
          return await this.connectWebSocket(conn);
        case 'rest':
          return await this.connectRest(conn);
        default:
          throw new Error(`Unsupported connection type: ${conn.type}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.updateStatus(connectionId, 'error', message);
      return false;
    }
  }

  // --- WebSocket Connection ---

  private connectWebSocket(conn: ClawConnection): Promise<boolean> {
    return new Promise((resolve) => {
      const url = this.buildUrl(conn);
      const timeoutMs = 10000;

      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create WebSocket';
        this.updateStatus(conn.id, 'error', message);
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          this.updateStatus(conn.id, 'error', 'Connection timeout (10s)');
          resolve(false);
        }
      }, timeoutMs);

      ws.onopen = () => {
        clearTimeout(timeout);
        this.sockets.set(conn.id, ws);
        this.updateStatus(conn.id, 'connected');
        conn.connectedAt = new Date().toISOString();
        this.connections.set(conn.id, { ...conn });

        // Send auth if token provided
        if (conn.authToken) {
          this.sendMessage(conn.id, {
            type: 'auth',
            data: { token: conn.authToken },
            timestamp: new Date().toISOString(),
          });
        }

        // Start heartbeat
        this.startHeartbeat(conn.id);

        // Request initial status
        this.sendMessage(conn.id, {
          type: 'get_status',
          timestamp: new Date().toISOString(),
        });

        resolve(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ClawProtocolMessage;
          const c = this.connections.get(conn.id);
          if (c) {
            c.messagesReceived++;
            c.lastMessage = new Date().toISOString();
            this.connections.set(conn.id, { ...c });
          }

          this.handleMessage(conn.id, message);
        } catch {
          // Non-JSON message, treat as raw
          this.emit({
            type: 'message',
            connectionId: conn.id,
            data: { raw: event.data },
          });
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        this.updateStatus(conn.id, 'error', 'WebSocket connection failed');
        resolve(false);
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        this.sockets.delete(conn.id);
        this.stopHeartbeat(conn.id);

        if (this.connections.get(conn.id)?.status === 'connected') {
          this.updateStatus(
            conn.id,
            'error',
            `Connection closed: ${event.reason || 'Unknown reason'} (code: ${event.code})`,
          );
          // Auto-reconnect after 5 seconds
          this.scheduleReconnect(conn.id, 5000);
        }
      };
    });
  }

  // --- REST API Connection ---

  private async connectRest(conn: ClawConnection): Promise<boolean> {
    const baseUrl = this.buildUrl(conn);
    const healthUrl = `${baseUrl}/health`;

    try {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (conn.authToken) {
        headers['Authorization'] = `Bearer ${conn.authToken}`;
      }

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        this.updateStatus(
          conn.id,
          'error',
          `HTTP ${response.status}: ${response.statusText}`,
        );
        return false;
      }

      const data = await response.json();
      conn.lastPing = latency;
      conn.connectedAt = new Date().toISOString();
      this.connections.set(conn.id, { ...conn });

      this.updateStatus(conn.id, 'connected');

      // Start polling for status updates
      this.startRestPolling(conn.id, baseUrl, headers);

      this.emit({
        type: 'message',
        connectionId: conn.id,
        data: { type: 'health', data, latency },
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'Connection timeout (10s)'
            : err.message
          : 'Connection failed';
      this.updateStatus(conn.id, 'error', message);
      return false;
    }
  }

  // --- REST Polling ---

  private startRestPolling(
    connectionId: string,
    baseUrl: string,
    headers: Record<string, string>,
  ) {
    // Clear existing poller
    this.stopRestPolling(connectionId);
    // Reset failure counter
    this.pollFailures.set(connectionId, 0);

    const poll = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch(`${baseUrl}/status`, {
          headers,
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          const latency = Math.round(performance.now() - startTime);
          const conn = this.connections.get(connectionId);
          if (conn) {
            conn.lastPing = latency;
            conn.messagesReceived++;
            conn.lastMessage = new Date().toISOString();
            this.connections.set(connectionId, { ...conn });
          }

          // Reset failure counter on success
          this.pollFailures.set(connectionId, 0);

          this.emit({
            type: 'message',
            connectionId,
            data: { type: 'status', data, latency },
          });
        } else if (response.status === 401 || response.status === 403) {
          this.updateStatus(connectionId, 'error', 'Authentication failed');
          this.stopRestPolling(connectionId);
        }
      } catch {
        // Poll failure - mark as error after 3 consecutive failures
        const failures = (this.pollFailures.get(connectionId) ?? 0) + 1;
        this.pollFailures.set(connectionId, failures);

        if (failures >= 3) {
          const conn = this.connections.get(connectionId);
          if (conn && conn.status === 'connected') {
            this.updateStatus(connectionId, 'error', 'Connection lost (3 consecutive poll failures)');
            this.stopRestPolling(connectionId);
            this.scheduleReconnect(connectionId, 5000);
          }
        }
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(poll, 5000);
    this.pollers.set(connectionId, interval);
  }

  private stopRestPolling(connectionId: string) {
    const poller = this.pollers.get(connectionId);
    if (poller) {
      clearInterval(poller);
      this.pollers.delete(connectionId);
    }
    this.pollFailures.delete(connectionId);
  }

  // --- Heartbeat ---

  private startHeartbeat(connectionId: string) {
    this.stopHeartbeat(connectionId);

    const beat = () => {
      const ws = this.sockets.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        const pingTime = Date.now();
        this.sendMessage(connectionId, {
          type: 'ping',
          data: { timestamp: pingTime },
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Heartbeat every 15 seconds
    const interval = setInterval(beat, 15000);
    this.heartbeats.set(connectionId, interval);
  }

  private stopHeartbeat(connectionId: string) {
    const hb = this.heartbeats.get(connectionId);
    if (hb) {
      clearInterval(hb);
      this.heartbeats.delete(connectionId);
    }
  }

  // --- Reconnection ---

  private scheduleReconnect(connectionId: string, delayMs: number) {
    this.cancelReconnect(connectionId);
    const timer = setTimeout(() => {
      const conn = this.connections.get(connectionId);
      if (conn && conn.status !== 'connected') {
        this.connect(connectionId);
      }
    }, delayMs);
    this.reconnectTimers.set(connectionId, timer);
  }

  private cancelReconnect(connectionId: string) {
    const timer = this.reconnectTimers.get(connectionId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(connectionId);
    }
  }

  // --- Message Handling ---

  private handleMessage(connectionId: string, message: ClawProtocolMessage) {
    switch (message.type) {
      case 'pong': {
        const data = message.data as { timestamp?: number } | undefined;
        if (data?.timestamp) {
          const latency = Date.now() - data.timestamp;
          const conn = this.connections.get(connectionId);
          if (conn) {
            conn.lastPing = latency;
            this.connections.set(connectionId, { ...conn });
          }
          this.emit({ type: 'ping', connectionId, data: { latency } });
        }
        break;
      }

      case 'status':
      case 'agents':
      case 'agent_update':
      case 'task_update':
        this.emit({
          type: 'message',
          connectionId,
          data: message,
        });
        break;

      case 'agents_list':
        this.emit({
          type: 'agents_discovered',
          connectionId,
          data: message.data,
        });
        break;

      case 'error':
        this.emit({
          type: 'error',
          connectionId,
          data: message.data,
        });
        break;

      default:
        this.emit({
          type: 'message',
          connectionId,
          data: message,
        });
    }
  }

  // --- Send Message ---

  sendMessage(connectionId: string, message: ClawProtocolMessage): boolean {
    const ws = this.sockets.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.messagesSent++;
        this.connections.set(connectionId, { ...conn });
      }
      return true;
    }
    return false;
  }

  // --- Send REST Command ---

  async sendRestCommand(
    connectionId: string,
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    const conn = this.connections.get(connectionId);
    if (!conn || conn.type !== 'rest') {
      throw new Error('Invalid REST connection');
    }

    const baseUrl = this.buildUrl(conn);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (conn.authToken) {
      headers['Authorization'] = `Bearer ${conn.authToken}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });

    conn.messagesSent++;
    this.connections.set(connectionId, { ...conn });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // --- Disconnect ---

  disconnect(connectionId: string) {
    this.cancelReconnect(connectionId);
    this.stopHeartbeat(connectionId);
    this.stopRestPolling(connectionId);

    const ws = this.sockets.get(connectionId);
    if (ws) {
      ws.close(1000, 'User disconnect');
      this.sockets.delete(connectionId);
    }

    this.updateStatus(connectionId, 'disconnected');
  }

  // --- Disconnect All ---

  disconnectAll() {
    Array.from(this.connections.keys()).forEach((id) => {
      this.disconnect(id);
    });
    this.connections.clear();
  }

  // --- Remove Connection ---

  removeConnection(connectionId: string) {
    this.disconnect(connectionId);
    this.connections.delete(connectionId);
  }

  // --- Get Connection ---

  getConnection(connectionId: string): ClawConnection | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionByClawId(clawId: string): ClawConnection | undefined {
    return Array.from(this.connections.values()).find((conn) => conn.clawId === clawId);
  }

  getAllConnections(): ClawConnection[] {
    return Array.from(this.connections.values());
  }

  // --- Status Update ---

  private updateStatus(
    connectionId: string,
    status: ConnectionStatus,
    error?: string,
  ) {
    const conn = this.connections.get(connectionId);
    if (conn) {
      conn.status = status;
      conn.error = error;
      this.connections.set(connectionId, { ...conn });
    }

    this.emit({
      type: 'status_change',
      connectionId,
      data: { status, error },
    });
  }

  // --- Test Connection (for wizard) ---

  async testConnection(
    type: ConnectionType,
    endpoint: string,
    port: number,
    path: string,
    useTls: boolean,
    authToken?: string,
  ): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
    serverInfo?: unknown;
  }> {
    const tempId = generateId('test');
    const conn = this.createConnection(
      tempId,
      type,
      endpoint,
      port,
      path,
      useTls,
      authToken,
    );

    try {
      if (type === 'rest') {
        return await this.testRestConnection(conn);
      } else {
        return await this.testWebSocketConnection(conn);
      }
    } finally {
      this.removeConnection(conn.id);
    }
  }

  private async testRestConnection(
    conn: ClawConnection,
  ): Promise<{ success: boolean; latency?: number; error?: string; serverInfo?: unknown }> {
    const baseUrl = this.buildUrl(conn);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (conn.authToken) {
        headers['Authorization'] = `Bearer ${conn.authToken}`;
      }

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000),
      });

      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        return {
          success: false,
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      let serverInfo: unknown;
      try {
        serverInfo = await response.json();
      } catch {
        serverInfo = { status: 'ok' };
      }

      return { success: true, latency, serverInfo };
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      const message =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'Connection timeout (10s)'
            : err.message
          : 'Connection failed';
      return { success: false, latency, error: message };
    }
  }

  private testWebSocketConnection(
    conn: ClawConnection,
  ): Promise<{ success: boolean; latency?: number; error?: string; serverInfo?: unknown }> {
    return new Promise((resolve) => {
      const url = this.buildUrl(conn);
      const startTime = performance.now();

      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create WebSocket';
        resolve({ success: false, error: message });
        return;
      }

      const timeout = setTimeout(() => {
        ws.close();
        const latency = Math.round(performance.now() - startTime);
        resolve({
          success: false,
          latency,
          error: 'Connection timeout (10s)',
        });
      }, 10000);

      ws.onopen = () => {
        const latency = Math.round(performance.now() - startTime);
        clearTimeout(timeout);

        // Send auth + status request
        if (conn.authToken) {
          ws.send(
            JSON.stringify({
              type: 'auth',
              data: { token: conn.authToken },
              timestamp: new Date().toISOString(),
            }),
          );
        }

        ws.send(
          JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString(),
          }),
        );

        // Wait briefly for a response
        const responseTimeout = setTimeout(() => {
          ws.close(1000);
          resolve({
            success: true,
            latency,
            serverInfo: { connected: true, protocol: 'websocket' },
          });
        }, 2000);

        ws.onmessage = (event) => {
          clearTimeout(responseTimeout);
          let serverInfo: unknown;
          try {
            serverInfo = JSON.parse(event.data);
          } catch {
            serverInfo = { raw: event.data };
          }
          ws.close(1000);
          resolve({ success: true, latency, serverInfo });
        };
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        const latency = Math.round(performance.now() - startTime);
        resolve({
          success: false,
          latency,
          error: 'WebSocket connection refused or unreachable',
        });
      };
    });
  }

  // --- Discover Agents via REST ---

  async discoverAgents(
    type: ConnectionType,
    endpoint: string,
    port: number,
    path: string,
    useTls: boolean,
    authToken?: string,
  ): Promise<{ agents: Array<{ id: string; name: string; role: string; status: string }>; error?: string }> {
    if (type === 'rest') {
      try {
        const proto = useTls ? 'https' : 'http';
        const cleanEndpoint = endpoint.replace(/^(wss?|https?|mqtt):\/\//, '');
        const url = `${proto}://${cleanEndpoint}:${port}${path}/agents`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
          const agents = Array.isArray(data)
            ? data
            : Array.isArray(data?.agents)
              ? data.agents
              : [];
          return { agents };
        }
        return { agents: [], error: `HTTP ${response.status}` };
      } catch (err) {
        return {
          agents: [],
          error: err instanceof Error ? err.message : 'Failed to discover agents',
        };
      }
    }

    // For WebSocket, agent discovery happens through messages
    return { agents: [], error: 'Agent discovery requires an active WebSocket connection' };
  }
}

// Singleton instance
export const connectionManager = new ConnectionManager();
