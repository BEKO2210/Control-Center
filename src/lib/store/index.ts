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
} from '@/lib/types';
import { defaultShellId } from '@/shells/registry';
import { generateId } from '@/lib/utils';
import { defaultAgents, defaultClaw } from '@/agents/defaults';

// --- Mission Control Store ---

interface MissionControlState {
  // Active Shell
  activeShellId: string;
  setActiveShell: (id: string) => void;

  // Active Screen
  activeScreen: string;
  setActiveScreen: (screen: string) => void;

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
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      // --- Tasks ---
      tasks: [
        {
          id: 'task-welcome',
          title: 'Welcome to Mission Control',
          description: 'Explore all screens and customize your shell theme. Drag tasks between columns!',
          status: 'in_progress' as TaskStatus,
          assignedTo: 'user',
          priority: 'medium' as const,
          relatedFiles: [],
          tags: ['onboarding'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-shell',
          title: 'Try different shells',
          description: 'Go to Settings and swap between Deep Space, Cyber Neon, Ocean Depths, and Ember Forge.',
          status: 'queued' as TaskStatus,
          assignedTo: 'user',
          priority: 'low' as const,
          relatedFiles: [],
          tags: ['customization'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-agent',
          title: 'Review AI agent team',
          description: 'Check the Team Structure screen to see your AI agent organization.',
          status: 'idea' as TaskStatus,
          assignedTo: 'ai',
          priority: 'medium' as const,
          relatedFiles: [],
          tags: ['agents'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

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
      memories: [
        {
          id: 'mem-init',
          title: 'Mission Control Initialized',
          content: 'Clawbot Mission Control has been initialized. All systems are operational.',
          category: 'context' as const,
          source: 'system',
          tags: ['system', 'init'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

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
      claws: [defaultClaw],

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
      }),
    },
  ),
);
