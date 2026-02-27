'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMissionControl } from '@/lib/store';
import { connectionManager } from '@/lib/services/connectionService';
import type { Claw, ClawConnection } from '@/lib/types';
import { cn, timeAgo } from '@/lib/utils';
import { Bot, Link, X, Wifi, WifiOff, Plus, Settings } from 'lucide-react';

const clawColors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

const statusColors: Record<string, string> = {
  connected: '#10b981',
  connecting: '#f59e0b',
  disconnected: '#6b7280',
  error: '#ef4444',
};

export function ClawManager() {
  const claws = useMissionControl((s) => s.claws);
  const addClaw = useMissionControl((s) => s.addClaw);
  const updateClaw = useMissionControl((s) => s.updateClaw);
  const removeClaw = useMissionControl((s) => s.removeClaw);
  const agents = useMissionControl((s) => s.agents);
  const connections = useMissionControl((s) => s.connections);
  const updateConnection = useMissionControl((s) => s.updateConnection);
  const removeConnection = useMissionControl((s) => s.removeConnection);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);
  const addNotification = useMissionControl((s) => s.addNotification);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#06b6d4');
  const [selectedClaw, setSelectedClaw] = useState<Claw | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((event) => {
      if (event.type === 'status_change') {
        const data = event.data as { status: string; error?: string };
        const conn = connectionManager.getConnection(event.connectionId);
        if (conn) {
          updateConnection(conn.id, {
            status: conn.status,
            error: conn.error,
            lastPing: conn.lastPing,
            messagesReceived: conn.messagesReceived,
            messagesSent: conn.messagesSent,
          });

          if (data.status === 'connected') {
            updateClaw(conn.clawId, {
              isActive: true,
              lastSeen: new Date().toISOString(),
            });
            addNotification({
              title: 'Claw Connected',
              message: `Connection to ${conn.endpoint}:${conn.port} established`,
              type: 'success',
            });
          } else if (data.status === 'error' || data.status === 'disconnected') {
            updateClaw(conn.clawId, {
              isActive: false,
              lastSeen: new Date().toISOString(),
            });
          }
        }
        setConnectingId(null);
      }
    });

    return unsubscribe;
  }, [updateConnection, updateClaw, addNotification]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addClaw({
      name: newName,
      description: newDesc,
      avatar: 'bot',
      color: newColor,
      agents: [],
      isActive: false,
    });
    setNewName('');
    setNewDesc('');
    setShowForm(false);
  };

  const getConnectionForClaw = useCallback(
    (clawId: string): ClawConnection | undefined => {
      return connections.find((c) => c.clawId === clawId);
    },
    [connections],
  );

  const handleConnect = async (claw: Claw) => {
    const conn = getConnectionForClaw(claw.id);
    if (!conn) {
      setActiveScreen('wizard');
      return;
    }

    setConnectingId(claw.id);

    // Clean up any existing connection in the ConnectionManager for this claw
    const existingMgrConn = connectionManager.getConnectionByClawId(conn.clawId);
    if (existingMgrConn) {
      connectionManager.removeConnection(existingMgrConn.id);
    }

    const mgrConn = connectionManager.createConnection(
      conn.clawId,
      conn.type,
      conn.endpoint,
      conn.port,
      conn.path,
      conn.useTls,
      conn.authToken,
    );

    // Sync the store connection ID with the new ConnectionManager entry
    updateConnection(conn.id, { id: mgrConn.id });

    const success = await connectionManager.connect(mgrConn.id);

    if (!success) {
      setConnectingId(null);
      addNotification({
        title: 'Connection Failed',
        message: `Could not connect to ${conn.endpoint}:${conn.port}. Check your bot is running.`,
        type: 'error',
      });
    }
  };

  const handleDisconnect = (claw: Claw) => {
    const conn = getConnectionForClaw(claw.id);
    if (conn) {
      connectionManager.disconnect(conn.id);
      updateConnection(conn.id, { status: 'disconnected' });
    }
    updateClaw(claw.id, {
      isActive: false,
      lastSeen: new Date().toISOString(),
    });
  };

  const handleRemove = (claw: Claw) => {
    const conn = getConnectionForClaw(claw.id);
    if (conn) {
      connectionManager.disconnect(conn.id);
      removeConnection(conn.id);
    }
    removeClaw(claw.id);
  };

  const toggleConnection = (claw: Claw) => {
    if (claw.isActive) {
      handleDisconnect(claw);
    } else {
      handleConnect(claw);
    }
  };

  // Empty state
  if (claws.length === 0 && !showForm) {
    return (
      <div className="animate-fade-in max-w-5xl">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Claw Manager</h2>
          <p className="text-sm text-gray-400">
            Manage connected Claws — independent bot instances that can join your Mission Control.
          </p>
        </div>

        <div className="glass-panel p-12 text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No Claws Connected</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Connect your first Claw Bot to start orchestrating AI agents.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActiveScreen('wizard')}
              className="btn-primary flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              Connect via Wizard
            </button>
            <button onClick={() => setShowForm(true)} className="btn-ghost flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Claw Manager</h2>
        <p className="text-sm text-gray-400">
          Manage connected Claws — independent bot instances that can join your Mission Control.
          Each Claw brings its own agents and capabilities, creating a collaborative swarm.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-white">{claws.length}</p>
          <p className="text-[10px] text-gray-500">Total Claws</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {claws.filter((c) => c.isActive).length}
          </p>
          <p className="text-[10px] text-gray-500">Connected</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {claws.reduce((sum, c) => sum + c.agents.length, 0)}
          </p>
          <p className="text-[10px] text-gray-500">Total Agents</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {connections.filter((c) => c.status === 'connected').length}
          </p>
          <p className="text-[10px] text-gray-500">Live Connections</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={() => setActiveScreen('wizard')}
          className="btn-primary"
        >
          + Connect via Wizard
        </button>
        <button onClick={() => setShowForm(!showForm)} className="btn-ghost">
          + Quick Add
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Add Claw (without connection)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Claw Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Clawbot Alpha"
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this claw do?"
                className="input-glass"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {clawColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn(
                      'w-9 h-9 rounded-lg transition-all',
                      newColor === c && 'ring-2 ring-white',
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">
              Add Claw
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Claw Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claws.map((claw) => {
          const clawAgents = agents.filter((a) => a.clawId === claw.id);
          const conn = getConnectionForClaw(claw.id);
          const isConnecting = connectingId === claw.id;

          return (
            <div
              key={claw.id}
              className="glass-panel-hover p-5 cursor-pointer group"
              onClick={() => setSelectedClaw(claw)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all',
                    claw.isActive && 'animate-pulse-slow',
                  )}
                  style={{
                    background: `${claw.color}15`,
                    border: `2px solid ${claw.color}50`,
                    boxShadow: claw.isActive
                      ? `0 0 20px ${claw.color}30`
                      : 'none',
                  }}
                >
                  <Bot className="w-6 h-6" style={{ color: claw.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">
                      {claw.name}
                    </h3>
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        claw.isActive
                          ? 'bg-green-400 animate-pulse'
                          : 'bg-gray-600',
                      )}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{claw.description}</p>

                  {/* Connection Info */}
                  {conn && (
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${statusColors[conn.status]}15`,
                          color: statusColors[conn.status],
                        }}
                      >
                        {conn.status.toUpperCase()}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--glass-heavy)', color: 'var(--accent-primary)' }}
                      >
                        {conn.type.toUpperCase()}
                      </span>
                      {conn.lastPing !== undefined && conn.status === 'connected' && (
                        <span className="text-[10px] text-gray-500">
                          {conn.lastPing}ms
                        </span>
                      )}
                    </div>
                  )}

                  {!conn && (
                    <div className="mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                        NO CONNECTION CONFIGURED
                      </span>
                    </div>
                  )}

                  {/* Agent count */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {clawAgents.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center border"
                          style={{
                            background: 'var(--glass-heavy)',
                            borderColor: claw.color,
                          }}
                          title={a.name}
                        >
                          <Bot className="w-2.5 h-2.5" style={{ color: claw.color }} />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {clawAgents.length} agents
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {conn ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConnection(claw);
                      }}
                      disabled={isConnecting}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-1',
                        isConnecting && 'opacity-50',
                      )}
                      style={{
                        background: claw.isActive
                          ? 'rgba(239,68,68,0.1)'
                          : 'rgba(16,185,129,0.1)',
                        color: claw.isActive ? '#ef4444' : '#10b981',
                      }}
                    >
                      {isConnecting ? (
                        'Connecting...'
                      ) : claw.isActive ? (
                        <><WifiOff className="w-3 h-3" /> Disconnect</>
                      ) : (
                        <><Wifi className="w-3 h-3" /> Connect</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveScreen('wizard');
                      }}
                      className="text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-1"
                      style={{
                        background: 'rgba(6,182,212,0.1)',
                        color: '#06b6d4',
                      }}
                    >
                      <Settings className="w-3 h-3" /> Setup
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(claw);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Connection URL */}
              {conn && (
                <div
                  className="mt-2 px-2 py-1 rounded text-[10px] font-mono truncate"
                  style={{ background: 'var(--glass-light)', color: 'var(--accent-primary)' }}
                >
                  {conn.type === 'rest'
                    ? `${conn.useTls ? 'https' : 'http'}://${conn.endpoint}:${conn.port}${conn.path}`
                    : `${conn.useTls ? 'wss' : 'ws'}://${conn.endpoint}:${conn.port}${conn.path}`}
                </div>
              )}

              {/* Last Seen */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-600">
                  Joined {timeAgo(claw.joinedAt)}
                </span>
                <span className="text-[10px] text-gray-600">
                  Last seen {timeAgo(claw.lastSeen)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedClaw && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="glass-panel-solid p-6 max-w-lg w-full animate-slide-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${selectedClaw.color}15`,
                  border: `2px solid ${selectedClaw.color}50`,
                }}
              >
                <Bot className="w-7 h-7" style={{ color: selectedClaw.color }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedClaw.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedClaw.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaw(null)}
                className="ml-auto text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Details */}
            {(() => {
              const conn = getConnectionForClaw(selectedClaw.id);
              if (conn) {
                return (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">
                      Connection Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="glass-panel p-3">
                        <p className="text-xs text-gray-500">Protocol</p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          {conn.type.toUpperCase()}
                        </p>
                      </div>
                      <div className="glass-panel p-3">
                        <p className="text-xs text-gray-500">Status</p>
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: statusColors[conn.status],
                          }}
                        >
                          {conn.status.charAt(0).toUpperCase() +
                            conn.status.slice(1)}
                        </p>
                      </div>
                      <div className="glass-panel p-3">
                        <p className="text-xs text-gray-500">Latency</p>
                        <p className="text-sm font-medium text-white">
                          {conn.lastPing !== undefined
                            ? `${conn.lastPing}ms`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="glass-panel p-3">
                        <p className="text-xs text-gray-500">Messages</p>
                        <p className="text-sm font-medium text-white">
                          {conn.messagesReceived} in / {conn.messagesSent} out
                        </p>
                      </div>
                    </div>
                    <div
                      className="p-2 rounded-lg text-xs font-mono truncate"
                      style={{
                        background: 'var(--glass-light)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {conn.type === 'rest'
                        ? `${conn.useTls ? 'https' : 'http'}://${conn.endpoint}:${conn.port}${conn.path}`
                        : `${conn.useTls ? 'wss' : 'ws'}://${conn.endpoint}:${conn.port}${conn.path}`}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-panel p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: selectedClaw.isActive ? '#10b981' : '#6b7280',
                  }}
                >
                  {selectedClaw.isActive ? 'Active' : 'Offline'}
                </p>
              </div>
              <div className="glass-panel p-3">
                <p className="text-xs text-gray-500">Agents</p>
                <p className="text-sm font-medium text-white">
                  {agents.filter((a) => a.clawId === selectedClaw.id).length}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">
                Agents
              </h4>
              <div className="space-y-2">
                {agents
                  .filter((a) => a.clawId === selectedClaw.id)
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'var(--glass-light)' }}
                    >
                      <Bot className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-white">{agent.name}</span>
                      <span className="text-[10px] text-gray-500">
                        — {agent.role}
                      </span>
                      <div
                        className={`ml-auto status-dot ${agent.activity}`}
                      />
                    </div>
                  ))}
                {agents.filter((a) => a.clawId === selectedClaw.id).length === 0 && (
                  <p className="text-xs text-gray-600 py-2">No agents assigned to this claw.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedClaw(null)}
                className="btn-ghost"
              >
                Close
              </button>
              {!getConnectionForClaw(selectedClaw.id) && (
                <button
                  onClick={() => {
                    setSelectedClaw(null);
                    setActiveScreen('wizard');
                  }}
                  className="btn-primary"
                >
                  Setup Connection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
