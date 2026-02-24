'use client';

import { useMissionControl } from '@/lib/store';
import { getAllShells, getShell } from '@/shells/registry';
import { cn } from '@/lib/utils';

export function ShellSelector() {
  const activeShellId = useMissionControl((s) => s.activeShellId);
  const setActiveShell = useMissionControl((s) => s.setActiveShell);
  const shells = getAllShells();
  const currentShell = getShell(activeShellId);

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Shell Themes</h2>
        <p className="text-sm text-gray-400">
          Like a claw changing its shell, swap Mission Control&apos;s entire visual identity.
          Each shell transforms the color palette, glassmorphism effects, and ambient lighting.
        </p>
      </div>

      {/* Current Shell */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl"
            style={{ background: currentShell.preview }}
          />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Currently Active</p>
            <h3 className="text-lg font-bold text-white">{currentShell.name}</h3>
            <p className="text-xs text-gray-400">{currentShell.description}</p>
          </div>
        </div>
      </div>

      {/* Shell Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shells.map((shell) => {
          const isActive = shell.id === activeShellId;
          return (
            <button
              key={shell.id}
              onClick={() => setActiveShell(shell.id)}
              className={cn(
                'text-left rounded-xl p-5 transition-all duration-300',
                isActive ? 'ring-2' : 'hover:ring-1',
              )}
              style={{
                background: 'var(--glass-light)',
                border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                ['--tw-ring-color' as string]: 'var(--accent-primary)',
              }}
            >
              {/* Shell Preview */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: shell.preview }}>
                  {/* Mini Preview UI */}
                  <div className="w-full h-full p-2 flex flex-col gap-1">
                    <div className="w-full h-1 rounded-full" style={{ background: shell.colors.accent.primary, opacity: 0.8 }} />
                    <div className="flex-1 rounded" style={{ background: shell.colors.glass.medium }} />
                    <div className="flex gap-1">
                      <div className="w-3 h-1 rounded-full" style={{ background: shell.colors.accent.primary, opacity: 0.6 }} />
                      <div className="w-3 h-1 rounded-full" style={{ background: shell.colors.accent.secondary, opacity: 0.6 }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{shell.name}</h3>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent-primary)', color: 'var(--surface-primary)' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{shell.description}</p>
                  <p className="text-[10px] text-gray-600 mt-1">by {shell.author} · v{shell.version}</p>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded-lg" style={{ background: shell.colors.surface.primary, border: '1px solid rgba(255,255,255,0.05)' }} />
                <div className="flex-1 h-8 rounded-lg" style={{ background: shell.colors.surface.secondary, border: '1px solid rgba(255,255,255,0.05)' }} />
                <div className="flex-1 h-8 rounded-lg" style={{ background: shell.colors.accent.primary }} />
                <div className="flex-1 h-8 rounded-lg" style={{ background: shell.colors.accent.secondary }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Shell Hint */}
      <div className="glass-panel p-5 mt-6">
        <h4 className="text-sm font-semibold text-white mb-2">Create Custom Shells</h4>
        <p className="text-xs text-gray-400">
          Shells are defined in <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-primary)' }}>src/shells/registry.ts</code>.
          Add your own shell by defining colors, gradients, and glass effects. Community shells can be imported and shared.
        </p>
      </div>
    </div>
  );
}
