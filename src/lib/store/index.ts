// ============================================================================
// Clawbot Mission Control — Global State Management (Zustand)
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Task,
  ContentItem,
  CalendarEvent,
  Memory,
  Agent,
  Claw,
  Notification,
  TaskStatus,
  ContentStage,
  AgentActivity,
  DashboardStats,
  ClawConnection,
  ReviewProfile,
  ReviewCategory,
} from '@/lib/types';
import { defaultShellId } from '@/shells/registry';
import { generateId } from '@/lib/utils';
import { defaultAgents } from '@/agents/defaults';

// --- Mission Control Store ---

interface MissionControlState {
  // Active Shell
  activeShellId: string;
  setActiveShell: (id: string) => void;

  // Active Screen
  activeScreen: string;
  setActiveScreen: (screen: string) => void;

  // Sidebar (mobile)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // Content Pipeline
  contentItems: ContentItem[];
  addContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => void;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
  moveContentItem: (id: string, stage: ContentStage) => void;
  deleteContentItem: (id: string) => void;

  // Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Memory
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;

  // Agents
  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setAgentActivity: (id: string, activity: AgentActivity) => void;
  deleteAgent: (id: string) => void;

  // Claws (Multi-Claw System)
  claws: Claw[];
  addClaw: (claw: Omit<Claw, 'id' | 'joinedAt' | 'lastSeen'>) => void;
  updateClaw: (id: string, updates: Partial<Claw>) => void;
  removeClaw: (id: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Connections
  connections: ClawConnection[];
  addConnection: (connection: ClawConnection) => void;
  updateConnection: (id: string, updates: Partial<ClawConnection>) => void;
  removeConnection: (id: string) => void;
  getConnectionForClaw: (clawId: string) => ClawConnection | undefined;

  // Wizard state
  wizardCompleted: boolean;
  setWizardCompleted: (completed: boolean) => void;

  // Code Review Wizard state
  codeReviewWizardCompleted: boolean;
  setCodeReviewWizardCompleted: (completed: boolean) => void;
  reviewProfiles: ReviewProfile[];
  activeReviewProfileId: string | null;
  addReviewProfile: (profile: Omit<ReviewProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReviewProfile: (id: string, updates: Partial<ReviewProfile>) => void;
  deleteReviewProfile: (id: string) => void;
  setActiveReviewProfile: (id: string | null) => void;

  // Reset
  resetToEmpty: () => void;

  // Dashboard
  getStats: () => DashboardStats;
}

export const useMissionControl = create<MissionControlState>()(
  persist(
    (set, get) => ({
      // --- Active Shell ---
      activeShellId: defaultShellId,
      setActiveShell: (id) => set({ activeShellId: id }),

      // --- Active Screen ---
      activeScreen: 'dashboard',
      setActiveScreen: (screen) => set({ activeScreen: screen, sidebarOpen: false }),

      // --- Sidebar (mobile) ---
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // --- Tasks ---
      tasks: [],

      addTask: (task) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: generateId('task'), createdAt: now, updatedAt: now },
          ],
        }));
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
          ),
        })),

      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: new Date().toISOString(),
                  completedAt: status === 'done' ? new Date().toISOString() : t.completedAt,
                }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      // --- Content Pipeline ---
      contentItems: [],
      addContentItem: (item) => {
        const now = new Date().toISOString();
        set((state) => ({
          contentItems: [
            ...state.contentItems,
            { ...item, id: generateId('content'), versions: [], createdAt: now, updatedAt: now },
          ],
        }));
      },

      updateContentItem: (id, updates) =>
        set((state) => ({
          contentItems: state.contentItems.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c,
          ),
        })),

      moveContentItem: (id, stage) =>
        set((state) => ({
          contentItems: state.contentItems.map((c) =>
            c.id === id ? { ...c, stage, updatedAt: new Date().toISOString() } : c,
          ),
        })),

      deleteContentItem: (id) =>
        set((state) => ({
          contentItems: state.contentItems.filter((c) => c.id !== id),
        })),

      // --- Calendar ---
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            { ...event, id: generateId('event'), createdAt: new Date().toISOString() },
          ],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // --- Memory ---
      memories: [],

      addMemory: (memory) => {
        const now = new Date().toISOString();
        set((state) => ({
          memories: [
            ...state.memories,
            { ...memory, id: generateId('mem'), createdAt: now, updatedAt: now },
          ],
        }));
      },

      updateMemory: (id, updates) =>
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m,
          ),
        })),

      deleteMemory: (id) =>
        set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),

      // --- Agents ---
      agents: defaultAgents,

      addAgent: (agent) =>
        set((state) => ({
          agents: [
            ...state.agents,
            { ...agent, id: generateId('agent'), createdAt: new Date().toISOString() },
          ],
        })),

      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      setAgentActivity: (id, activity) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, activity } : a)),
        })),

      deleteAgent: (id) =>
        set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),

      // --- Claws ---
      claws: [],

      addClaw: (claw) => {
        const now = new Date().toISOString();
        set((state) => ({
          claws: [
            ...state.claws,
            { ...claw, id: generateId('claw'), joinedAt: now, lastSeen: now },
          ],
        }));
      },

      updateClaw: (id, updates) =>
        set((state) => ({
          claws: state.claws.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeClaw: (id) =>
        set((state) => ({ claws: state.claws.filter((c) => c.id !== id) })),

      // --- Notifications ---
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId('notif'),
              read: false,
              timestamp: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 50), // Keep max 50
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // --- Connections ---
      connections: [],

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),

      getConnectionForClaw: (clawId) => {
        return get().connections.find((c) => c.clawId === clawId);
      },

      // --- Wizard ---
      wizardCompleted: false,
      setWizardCompleted: (completed) => set({ wizardCompleted: completed }),

      // --- Code Review Wizard ---
      codeReviewWizardCompleted: false,
      setCodeReviewWizardCompleted: (completed) => set({ codeReviewWizardCompleted: completed }),
      reviewProfiles: [],
      activeReviewProfileId: null,

      addReviewProfile: (profile) => {
        const now = new Date().toISOString();
        const id = generateId('rp');
        set((state) => ({
          reviewProfiles: [
            ...state.reviewProfiles,
            { ...profile, id, createdAt: now, updatedAt: now },
          ],
          activeReviewProfileId: state.activeReviewProfileId || id,
        }));
      },

      updateReviewProfile: (id, updates) =>
        set((state) => ({
          reviewProfiles: state.reviewProfiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      deleteReviewProfile: (id) =>
        set((state) => ({
          reviewProfiles: state.reviewProfiles.filter((p) => p.id !== id),
          activeReviewProfileId:
            state.activeReviewProfileId === id
              ? state.reviewProfiles.find((p) => p.id !== id)?.id || null
              : state.activeReviewProfileId,
        })),

      setActiveReviewProfile: (id) => set({ activeReviewProfileId: id }),

      // --- Reset ---
      resetToEmpty: () =>
        set({
          tasks: [],
          contentItems: [],
          events: [],
          memories: [],
          agents: [],
          claws: [],
          connections: [],
          notifications: [],
          wizardCompleted: false,
          codeReviewWizardCompleted: false,
          reviewProfiles: [],
          activeReviewProfileId: null,
          activeScreen: 'wizard',
        }),

      // --- Dashboard Stats ---
      getStats: () => {
        const state = get();
        return {
          totalTasks: state.tasks.length,
          completedTasks: state.tasks.filter((t) => t.status === 'done').length,
          activeAgents: state.agents.filter((a) => a.activity !== 'idle').length,
          totalMemories: state.memories.length,
          contentItems: state.contentItems.length,
          scheduledEvents: state.events.filter((e) => e.status === 'scheduled').length,
          connectedClaws: state.claws.filter((c) => c.isActive).length,
        };
      },
    }),
    {
      name: 'clawbot-mission-control',
      partialize: (state) => ({
        activeShellId: state.activeShellId,
        tasks: state.tasks,
        contentItems: state.contentItems,
        events: state.events,
        memories: state.memories,
        agents: state.agents,
        claws: state.claws,
        connections: state.connections,
        wizardCompleted: state.wizardCompleted,
        codeReviewWizardCompleted: state.codeReviewWizardCompleted,
        reviewProfiles: state.reviewProfiles,
        activeReviewProfileId: state.activeReviewProfileId,
      }),
    },
  ),
);
