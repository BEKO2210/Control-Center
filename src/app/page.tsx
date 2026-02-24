'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/screens/Dashboard';
import { TaskBoard } from '@/components/screens/TaskBoard';
import { ContentPipeline } from '@/components/screens/ContentPipeline';
import { Calendar } from '@/components/screens/Calendar';
import { MemoryScreen } from '@/components/screens/MemoryScreen';
import { TeamStructure } from '@/components/screens/TeamStructure';
import { DigitalOffice } from '@/components/screens/DigitalOffice';
import { ShellSelector } from '@/components/screens/ShellSelector';
import { ClawManager } from '@/components/screens/ClawManager';
import { useMissionControl } from '@/lib/store';

const screens: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  tasks: TaskBoard,
  pipeline: ContentPipeline,
  calendar: Calendar,
  memory: MemoryScreen,
  team: TeamStructure,
  office: DigitalOffice,
  shells: ShellSelector,
  claws: ClawManager,
};

export default function MissionControlPage() {
  const activeScreen = useMissionControl((s) => s.activeScreen);
  const ActiveScreen = screens[activeScreen] || Dashboard;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--shell-gradient)' }}>
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <ActiveScreen />
        </main>
      </div>
    </div>
  );
}
