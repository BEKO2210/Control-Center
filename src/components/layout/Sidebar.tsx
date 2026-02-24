'use client';

import { useMissionControl } from '@/lib/store';
import { cn } from '@/lib/utils';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '◆' },
  { id: 'tasks', label: 'Task Board', icon: '☰' },
  { id: 'pipeline', label: 'Content Pipeline', icon: '▶' },
  { id: 'calendar', label: 'Calendar', icon: '◷' },
  { id: 'memory', label: 'Memory', icon: '◉' },
  { id: 'team', label: 'Team Structure', icon: '⚡' },
  { id: 'office', label: 'Digital Office', icon: '▣' },
];

const settingsNav = [
  { id: 'shells', label: 'Shell Themes', icon: '◐' },
  { id: 'claws', label: 'Claw Manager', icon: '🦀' },
];

export function Sidebar() {
  const activeScreen = useMissionControl((s) => s.activeScreen);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);
  const claws = useMissionControl((s) => s.claws);
  const activeClaws = claws.filter((c) => c.isActive).length;
  const sidebarOpen = useMissionControl((s) => s.sidebarOpen);
  const setSidebarOpen = useMissionControl((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'h-screen flex flex-col border-r relative z-40 transition-transform duration-300 ease-in-out',
          // Mobile: fixed overlay, hidden by default
          'fixed top-0 left-0 w-64 md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ borderColor: 'var(--glass-border)', background: 'var(--surface-primary)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--glass-heavy)' }}>
              🦀
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Clawbot</h1>
              <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>Mission Control</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'var(--glass-light)' }}
          >
            ✕
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider px-3 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Screens
          </p>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={cn('nav-item w-full text-left', activeScreen === item.id && 'active')}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-wider px-3 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Settings
            </p>
            {settingsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={cn('nav-item w-full text-left', activeScreen === item.id && 'active')}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Claw Status */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="glass-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Connected Claws</span>
              <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>{activeClaws}</span>
            </div>
            <div className="flex -space-x-2">
              {claws.filter(c => c.isActive).slice(0, 5).map((claw) => (
                <div
                  key={claw.id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
                  style={{ background: 'var(--glass-heavy)', borderColor: claw.color }}
                  title={claw.name}
                >
                  {claw.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
