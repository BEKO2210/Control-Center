'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import type { Agent, AgentRole, AgentActivity } from '@/lib/types';
import { cn, toLabel, timeAgo } from '@/lib/utils';

const roleColors: Record<AgentRole, string> = {
  developer: '#60a5fa',
  writer: '#c084fc',
  designer: '#f472b6',
  researcher: '#fbbf24',
  operator: '#34d399',
  growth: '#fb923c',
};

const roleIcons: Record<AgentRole, string> = {
  developer: '💻',
  writer: '✍️',
  designer: '🎨',
  researcher: '🔬',
  operator: '🚀',
  growth: '📈',
};

const roles: AgentRole[] = ['developer', 'writer', 'designer', 'researcher', 'operator', 'growth'];

export function TeamStructure() {
  const agents = useMissionControl((s) => s.agents);
  const addAgent = useMissionControl((s) => s.addAgent);
  const updateAgent = useMissionControl((s) => s.updateAgent);
  const setAgentActivity = useMissionControl((s) => s.setAgentActivity);
  const deleteAgent = useMissionControl((s) => s.deleteAgent);
  const claws = useMissionControl((s) => s.claws);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AgentRole>('developer');
  const [newResponsibilities, setNewResponsibilities] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addAgent({
      name: newName,
      avatar: roleIcons[newRole],
      role: newRole,
      responsibilities: newResponsibilities.split('\n').filter(Boolean),
      currentTasks: [],
      activity: 'idle' as AgentActivity,
      clawId: 'claw-primary',
      stats: { tasksCompleted: 0, tasksInProgress: 0, uptime: 0 },
    });
    setNewName('');
    setNewResponsibilities('');
    setShowForm(false);
  };

  const agentsByRole = roles.reduce((acc, role) => {
    acc[role] = agents.filter((a) => a.role === role);
    return acc;
  }, {} as Record<AgentRole, Agent[]>);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-500">
          {agents.length} agents across {roles.length} divisions · {agents.filter(a => a.activity !== 'idle').length} active
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + New Agent
        </button>
      </div>

      {/* New Agent Form */}
      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Deploy New Agent</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Agent Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Agent codename..." className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as AgentRole)} className="input-glass">
                {roles.map((r) => <option key={r} value={r}>{toLabel(r)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Responsibilities (one per line)</label>
              <textarea value={newResponsibilities} onChange={(e) => setNewResponsibilities(e.target.value)} placeholder="Responsibility 1&#10;Responsibility 2" className="input-glass min-h-[80px] resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">Deploy Agent</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Team Grid by Role */}
      <div className="space-y-6">
        {roles.map((role) => {
          const roleAgents = agentsByRole[role];
          if (roleAgents.length === 0) return null;
          return (
            <div key={role}>
              {/* Role Header */}
              <div className="flex items-center gap-2 mb-3">
                <span>{roleIcons[role]}</span>
                <h3 className="text-sm font-semibold" style={{ color: roleColors[role] }}>
                  {toLabel(role)} Division
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${roleColors[role]}15`, color: roleColors[role] }}>
                  {roleAgents.length}
                </span>
              </div>

              {/* Agent Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {roleAgents.map((agent) => {
                  const claw = claws.find((c) => c.id === agent.clawId);
                  return (
                    <div
                      key={agent.id}
                      className="glass-panel-hover p-4 cursor-pointer group"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      {/* Agent Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: `${roleColors[role]}15`, border: `1px solid ${roleColors[role]}30` }}
                        >
                          {agent.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <div className={`status-dot ${agent.activity}`} />
                            <span className="text-[10px] text-gray-500">{toLabel(agent.activity)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-500 hover:text-red-400 transition-all"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-1.5 rounded" style={{ background: 'var(--glass-light)' }}>
                          <p className="text-xs font-bold text-white">{agent.stats.tasksCompleted}</p>
                          <p className="text-[9px] text-gray-500">Done</p>
                        </div>
                        <div className="text-center p-1.5 rounded" style={{ background: 'var(--glass-light)' }}>
                          <p className="text-xs font-bold text-white">{agent.stats.tasksInProgress}</p>
                          <p className="text-[9px] text-gray-500">Active</p>
                        </div>
                        <div className="text-center p-1.5 rounded" style={{ background: 'var(--glass-light)' }}>
                          <p className="text-xs font-bold text-white">{agent.stats.uptime}h</p>
                          <p className="text-[9px] text-gray-500">Uptime</p>
                        </div>
                      </div>

                      {/* Claw Badge */}
                      {claw && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <span>{claw.avatar}</span>
                          <span>{claw.name}</span>
                        </div>
                      )}

                      {/* Activity Toggle (on hover) */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(['idle', 'thinking', 'building', 'reviewing'] as AgentActivity[]).map((act) => (
                          <button
                            key={act}
                            onClick={(e) => { e.stopPropagation(); setAgentActivity(agent.id, act); }}
                            className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded transition-colors',
                              agent.activity === act ? 'text-white' : 'text-gray-600',
                            )}
                            style={{
                              background: agent.activity === act ? `${roleColors[role]}30` : 'var(--glass-light)',
                            }}
                          >
                            {toLabel(act)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="glass-panel-solid p-6 max-w-md w-full animate-slide-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${roleColors[selectedAgent.role]}15`, border: `1px solid ${roleColors[selectedAgent.role]}30` }}
              >
                {selectedAgent.avatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedAgent.name}</h3>
                <p className="text-xs" style={{ color: roleColors[selectedAgent.role] }}>{toLabel(selectedAgent.role)}</p>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="ml-auto text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Responsibilities</h4>
              <ul className="space-y-1">
                {selectedAgent.responsibilities.map((r, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span style={{ color: roleColors[selectedAgent.role] }}>•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-panel p-3 text-center">
                <p className="text-lg font-bold text-white">{selectedAgent.stats.tasksCompleted}</p>
                <p className="text-[10px] text-gray-500">Completed</p>
              </div>
              <div className="glass-panel p-3 text-center">
                <p className="text-lg font-bold text-white">{selectedAgent.stats.tasksInProgress}</p>
                <p className="text-[10px] text-gray-500">In Progress</p>
              </div>
              <div className="glass-panel p-3 text-center">
                <p className="text-lg font-bold text-white">{selectedAgent.stats.uptime}h</p>
                <p className="text-[10px] text-gray-500">Uptime</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`status-dot ${selectedAgent.activity}`} />
              <span className="text-xs text-gray-400">Currently: {toLabel(selectedAgent.activity)}</span>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setSelectedAgent(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
