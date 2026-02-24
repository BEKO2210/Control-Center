'use client';

import { useMissionControl } from '@/lib/store';
import type { AgentActivity, AgentRole } from '@/lib/types';
import { cn, toLabel } from '@/lib/utils';

const roleColors: Record<AgentRole, string> = {
  developer: '#60a5fa',
  writer: '#c084fc',
  designer: '#f472b6',
  researcher: '#fbbf24',
  operator: '#34d399',
  growth: '#fb923c',
};

const activityLabels: Record<AgentActivity, { label: string; desc: string; color: string }> = {
  idle: { label: 'Idle', desc: 'Waiting for tasks', color: '#6b7280' },
  thinking: { label: 'Thinking', desc: 'Analyzing and planning', color: '#f59e0b' },
  building: { label: 'Building', desc: 'Writing code / Creating', color: '#3b82f6' },
  reviewing: { label: 'Reviewing', desc: 'Checking work quality', color: '#8b5cf6' },
  blocked: { label: 'Blocked', desc: 'Waiting for dependency', color: '#ef4444' },
};

export function DigitalOffice() {
  const agents = useMissionControl((s) => s.agents);
  const setAgentActivity = useMissionControl((s) => s.setAgentActivity);
  const claws = useMissionControl((s) => s.claws);

  const activeCount = agents.filter((a) => a.activity !== 'idle').length;
  const idleCount = agents.filter((a) => a.activity === 'idle').length;

  return (
    <div className="animate-fade-in">
      {/* Office Stats Bar */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400"><span className="text-white font-medium">{activeCount}</span> active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <span className="text-xs text-gray-400"><span className="text-white font-medium">{idleCount}</span> idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Claws: <span className="text-white font-medium">{claws.filter(c => c.isActive).length}</span></span>
        </div>
      </div>

      {/* Office Floor Plan */}
      <div className="glass-panel p-6 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        {/* Floor Header */}
        <div className="relative z-10 mb-6">
          <h3 className="text-sm font-semibold text-white mb-1">Office Floor</h3>
          <p className="text-[10px] text-gray-500">Real-time view of all agent workstations</p>
        </div>

        {/* Workstations Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const actInfo = activityLabels[agent.activity];
            const roleColor = roleColors[agent.role];
            const isActive = agent.activity !== 'idle';

            return (
              <div
                key={agent.id}
                className="relative rounded-xl p-5 transition-all duration-500 group"
                style={{
                  background: isActive ? `${roleColor}08` : 'var(--glass-light)',
                  border: `1px solid ${isActive ? `${roleColor}30` : 'var(--glass-border)'}`,
                  boxShadow: isActive ? `0 0 0 1px ${roleColor}40` : undefined,
                }}
              >
                {/* Activity Glow */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${actInfo.color}40 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Workstation Content */}
                <div className="relative z-10">
                  {/* Avatar & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all',
                          isActive && 'animate-pulse-slow',
                        )}
                        style={{
                          background: `${roleColor}15`,
                          border: `2px solid ${roleColor}40`,
                          boxShadow: isActive ? `0 0 15px ${roleColor}30` : 'none',
                        }}
                      >
                        {agent.avatar}
                      </div>
                      {/* Status Indicator */}
                      <div
                        className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2', isActive && 'animate-pulse')}
                        style={{
                          background: actInfo.color,
                          borderColor: 'var(--surface-primary)',
                        }}
                      />
                    </div>

                    {/* Claw Badge */}
                    {(() => {
                      const claw = claws.find((c) => c.id === agent.clawId);
                      return claw ? (
                        <span className="text-sm" title={claw.name}>{claw.avatar}</span>
                      ) : null;
                    })()}
                  </div>

                  {/* Agent Info */}
                  <h4 className="text-sm font-semibold text-white mb-0.5">{agent.name}</h4>
                  <p className="text-[10px] mb-2" style={{ color: roleColor }}>{toLabel(agent.role)}</p>

                  {/* Activity Status */}
                  <div
                    className="px-2 py-1 rounded-md text-[10px] font-medium inline-block"
                    style={{
                      background: `${actInfo.color}15`,
                      color: actInfo.color,
                    }}
                  >
                    {actInfo.label}
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1">{actInfo.desc}</p>

                  {/* Quick Activity Setter */}
                  <div className="flex gap-1 mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {(Object.keys(activityLabels) as AgentActivity[]).map((act) => (
                      <button
                        key={act}
                        onClick={() => setAgentActivity(agent.id, act)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] transition-all"
                        style={{
                          background: agent.activity === act ? `${activityLabels[act].color}30` : 'var(--glass-light)',
                          boxShadow: agent.activity === act ? `0 0 0 1px ${activityLabels[act].color}` : undefined,
                        }}
                        title={activityLabels[act].label}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: activityLabels[act].color }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desk Decoration Line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${roleColor}40, transparent)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Legend */}
      <div className="glass-panel p-4 mt-6">
        <h4 className="text-xs font-semibold text-white mb-3">Activity Legend</h4>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(activityLabels) as [AgentActivity, typeof activityLabels[AgentActivity]][]).map(([key, info]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
              <span className="text-[10px] text-gray-400">{info.label}: {info.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
