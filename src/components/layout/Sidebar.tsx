'use client';

import { useMissionControl } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  KanbanSquare,
  Play,
  CalendarDays,
  Brain,
  Users,
  Building2,
  Palette,
  Bot,
  Link,
  X,
  Shell,
  ClipboardCheck,
} from 'lucide-react';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Task Board', icon: KanbanSquare },
  { id: 'pipeline', label: 'Content Pipeline', icon: Play },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'team', label: 'Team Structure', icon: Users },
  { id: 'office', label: 'Digital Office', icon: Building2 },
  { id: 'code-review', label: 'Code Review', icon: ClipboardCheck },
];

const settingsNav = [
  { id: 'shells', label: 'Shell Themes', icon: Palette },
  { id: 'claws', label: 'Claw Manager', icon: Bot },
  { id: 'wizard', label: 'Connect Bot', icon: Link },
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
          'fixed top-0 left-0 w-64 md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ borderColor: 'var(--glass-border)', background: 'var(--surface-primary)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-heavy)' }}>
              <Shell className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Clawbot</h1>
              <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>Mission Control</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'var(--glass-light)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider px-3 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Screens
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={cn('nav-item w-full text-left', activeScreen === item.id && 'active')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-wider px-3 py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Settings
            </p>
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={cn('nav-item w-full text-left', activeScreen === item.id && 'active')}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Claw Status */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="glass-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Connected Claws</span>
              <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>{activeClaws}</span>
            </div>
            {claws.filter(c => c.isActive).length > 0 ? (
              <div className="flex -space-x-2">
                {claws.filter(c => c.isActive).slice(0, 5).map((claw) => (
                  <div
                    key={claw.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2"
                    style={{ background: 'var(--glass-heavy)', borderColor: claw.color }}
                    title={claw.name}
                  >
                    <Bot className="w-3.5 h-3.5" style={{ color: claw.color }} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-600">No claws connected</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
