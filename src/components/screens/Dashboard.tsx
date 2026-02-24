'use client';

import { useMissionControl } from '@/lib/store';
import { toLabel, timeAgo } from '@/lib/utils';

export function Dashboard() {
  const tasks = useMissionControl((s) => s.tasks);
  const agents = useMissionControl((s) => s.agents);
  const memories = useMissionControl((s) => s.memories);
  const contentItems = useMissionControl((s) => s.contentItems);
  const events = useMissionControl((s) => s.events);
  const claws = useMissionControl((s) => s.claws);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: '☰', color: '#06b6d4', screen: 'tasks' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, icon: '✓', color: '#10b981', screen: 'tasks' },
    { label: 'Active Agents', value: agents.filter((a) => a.activity !== 'idle').length, icon: '⚡', color: '#8b5cf6', screen: 'team' },
    { label: 'Memories', value: memories.length, icon: '◉', color: '#f59e0b', screen: 'memory' },
    { label: 'Content Items', value: contentItems.length, icon: '▶', color: '#ec4899', screen: 'pipeline' },
    { label: 'Scheduled', value: events.filter((e) => e.status === 'scheduled').length, icon: '◷', color: '#2dd4bf', screen: 'calendar' },
  ];

  const activeAgents = agents.filter((a) => a.activity !== 'idle');
  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome to Mission Control</h1>
          <p className="text-sm text-gray-400">
            Your AI operations hub. {claws.filter(c => c.isActive).length} claw{claws.filter(c => c.isActive).length !== 1 ? 's' : ''} connected, {agents.length} agents deployed.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">🦀</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setActiveScreen(stat.screen)}
            className="glass-panel-hover p-4 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{stat.icon}</span>
              <span
                className="text-2xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Tasks</h3>
            <button
              onClick={() => setActiveScreen('tasks')}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--accent-primary)' }}
            >
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No tasks yet. Create one on the Task Board!</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg transition-colors" style={{ background: 'var(--glass-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`status-dot ${task.status === 'in_progress' ? 'building' : task.status === 'done' ? 'bg-green-500' : 'idle'}`} />
                    <div>
                      <p className="text-sm text-white">{task.title}</p>
                      <p className="text-[10px] text-gray-500">{toLabel(task.status)} · {task.assignedTo}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-600">{timeAgo(task.updatedAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Agents */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Active Agents</h3>
            <button
              onClick={() => setActiveScreen('office')}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--accent-primary)' }}
            >
              Office →
            </button>
          </div>
          <div className="space-y-3">
            {activeAgents.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">All agents idle</p>
            ) : (
              activeAgents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--glass-light)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--glass-heavy)' }}>
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">{agent.name}</p>
                    <p className="text-[10px] text-gray-500">{toLabel(agent.activity)}</p>
                  </div>
                  <div className={`status-dot ${agent.activity}`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Connected Claws */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Connected Claws</h3>
          <button
            onClick={() => setActiveScreen('claws')}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
          >
            Manage →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {claws.map((claw) => (
            <div key={claw.id} className="glass-panel-hover p-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${claw.color}20`, border: `1px solid ${claw.color}40` }}
                >
                  {claw.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{claw.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${claw.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500">{claw.isActive ? 'Active' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">{claw.agents.length} agents · Last seen {timeAgo(claw.lastSeen)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
