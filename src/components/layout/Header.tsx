'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import { toLabel, timeAgo } from '@/lib/utils';
import { Bell, Search, Menu } from 'lucide-react';

export function Header() {
  const activeScreen = useMissionControl((s) => s.activeScreen);
  const notifications = useMissionControl((s) => s.notifications);
  const markNotificationRead = useMissionControl((s) => s.markNotificationRead);
  const toggleSidebar = useMissionControl((s) => s.toggleSidebar);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
    <header className="h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 relative z-20" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-light)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}
        >
          <Menu className="w-4 h-4" />
        </button>

        <h2 className="text-sm md:text-lg font-semibold text-white truncate">
          {screenTitles[activeScreen] || toLabel(activeScreen)}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}
        >
          <Search className="w-4 h-4" />
        </button>
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search Mission Control..."
            className="input-glass w-64 text-xs pl-8"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}
          >
            <Bell className="w-4 h-4 text-gray-400" />
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
            <div className="absolute right-0 top-12 w-72 md:w-80 glass-panel-solid p-4 z-50">
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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Online</span>
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 p-3 md:hidden z-50" style={{ background: 'var(--surface-primary)', borderBottom: '1px solid var(--glass-border)' }}>
          <input
            type="text"
            placeholder="Search Mission Control..."
            className="input-glass w-full text-sm"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
