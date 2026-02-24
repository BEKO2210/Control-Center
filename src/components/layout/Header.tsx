'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import { toLabel, timeAgo } from '@/lib/utils';

export function Header() {
  const activeScreen = useMissionControl((s) => s.activeScreen);
  const notifications = useMissionControl((s) => s.notifications);
  const markNotificationRead = useMissionControl((s) => s.markNotificationRead);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const screenTitles: Record<string, string> = {
    dashboard: 'Mission Dashboard',
    tasks: 'Task Board',
    pipeline: 'Content Pipeline',
    calendar: 'Calendar & Scheduler',
    memory: 'Memory Bank',
    team: 'Team Structure',
    office: 'Digital Office',
    shells: 'Shell Themes',
    claws: 'Claw Manager',
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 relative z-20" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-light)' }}>
      <div>
        <h2 className="text-lg font-semibold text-white">
          {screenTitles[activeScreen] || toLabel(activeScreen)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Mission Control..."
            className="input-glass w-64 text-xs pl-8"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">⌕</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}
          >
            <span className="text-sm">🔔</span>
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: 'var(--accent-primary)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 glass-panel-solid p-4 z-50">
              <h3 className="text-sm font-semibold text-white mb-3">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No notifications yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                      style={{ opacity: n.read ? 0.5 : 1 }}
                    >
                      <p className="text-xs text-white">{n.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Online</span>
        </div>
      </div>
    </header>
  );
}
