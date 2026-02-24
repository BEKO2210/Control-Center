'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import type { Claw } from '@/lib/types';
import { cn, timeAgo } from '@/lib/utils';

const clawColors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
const clawAvatars = ['🦀', '🦞', '🦐', '🦑', '🐙', '🐚', '🪸', '🦂', '🕷️', '🤖'];

export function ClawManager() {
  const claws = useMissionControl((s) => s.claws);
  const addClaw = useMissionControl((s) => s.addClaw);
  const updateClaw = useMissionControl((s) => s.updateClaw);
  const removeClaw = useMissionControl((s) => s.removeClaw);
  const agents = useMissionControl((s) => s.agents);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAvatar, setNewAvatar] = useState('🦀');
  const [newColor, setNewColor] = useState('#06b6d4');
  const [selectedClaw, setSelectedClaw] = useState<Claw | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addClaw({
      name: newName,
      description: newDesc,
      avatar: newAvatar,
      color: newColor,
      agents: [],
      isActive: true,
    });
    setNewName('');
    setNewDesc('');
    setShowForm(false);
  };

  const toggleActive = (claw: Claw) => {
    updateClaw(claw.id, {
      isActive: !claw.isActive,
      lastSeen: new Date().toISOString(),
    });
  };

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-white">{claws.length}</p>
          <p className="text-[10px] text-gray-500">Total Claws</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{claws.filter(c => c.isActive).length}</p>
          <p className="text-[10px] text-gray-500">Active</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {claws.reduce((sum, c) => sum + c.agents.length, 0)}
          </p>
          <p className="text-[10px] text-gray-500">Total Agents</p>
        </div>
      </div>

      {/* Add Claw */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Connect New Claw
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Connect a New Claw</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Claw Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Clawbot Alpha" className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this claw do?" className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Avatar</label>
              <div className="flex gap-2 flex-wrap">
                {clawAvatars.map((a) => (
                  <button
                    key={a}
                    onClick={() => setNewAvatar(a)}
                    className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all', newAvatar === a && 'ring-2')}
                    style={{ background: 'var(--glass-light)', ringColor: 'var(--accent-primary)' }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {clawColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn('w-9 h-9 rounded-lg transition-all', newColor === c && 'ring-2 ring-white')}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">Connect Claw</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Claw Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claws.map((claw) => {
          const clawAgents = agents.filter((a) => a.clawId === claw.id);
          return (
            <div
              key={claw.id}
              className="glass-panel-hover p-5 cursor-pointer group"
              onClick={() => setSelectedClaw(claw)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all', claw.isActive && 'animate-pulse-slow')}
                  style={{
                    background: `${claw.color}15`,
                    border: `2px solid ${claw.color}50`,
                    boxShadow: claw.isActive ? `0 0 20px ${claw.color}30` : 'none',
                  }}
                >
                  {claw.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{claw.name}</h3>
                    <div className={cn('w-2 h-2 rounded-full', claw.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600')} />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{claw.description}</p>

                  {/* Agent Avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {clawAgents.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border"
                          style={{ background: 'var(--glass-heavy)', borderColor: claw.color }}
                          title={a.name}
                        >
                          {a.avatar}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">{clawAgents.length} agents</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleActive(claw); }}
                    className="text-[10px] px-2 py-1 rounded transition-colors"
                    style={{
                      background: claw.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: claw.isActive ? '#ef4444' : '#10b981',
                    }}
                  >
                    {claw.isActive ? 'Disconnect' : 'Connect'}
                  </button>
                  {claw.id !== 'claw-primary' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeClaw(claw.id); }}
                      className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Last Seen */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-gray-600">Joined {timeAgo(claw.joinedAt)}</span>
                <span className="text-[10px] text-gray-600">Last seen {timeAgo(claw.lastSeen)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedClaw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="glass-panel-solid p-6 max-w-lg w-full animate-slide-in">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${selectedClaw.color}15`, border: `2px solid ${selectedClaw.color}50` }}
              >
                {selectedClaw.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedClaw.name}</h3>
                <p className="text-xs text-gray-400">{selectedClaw.description}</p>
              </div>
              <button onClick={() => setSelectedClaw(null)} className="ml-auto text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-panel p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium" style={{ color: selectedClaw.isActive ? '#10b981' : '#6b7280' }}>
                  {selectedClaw.isActive ? 'Active' : 'Offline'}
                </p>
              </div>
              <div className="glass-panel p-3">
                <p className="text-xs text-gray-500">Agents</p>
                <p className="text-sm font-medium text-white">{agents.filter(a => a.clawId === selectedClaw.id).length}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Agents</h4>
              <div className="space-y-2">
                {agents.filter(a => a.clawId === selectedClaw.id).map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--glass-light)' }}>
                    <span>{agent.avatar}</span>
                    <span className="text-xs text-white">{agent.name}</span>
                    <span className="text-[10px] text-gray-500">— {agent.role}</span>
                    <div className={`ml-auto status-dot ${agent.activity}`} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedClaw(null)} className="btn-ghost">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
