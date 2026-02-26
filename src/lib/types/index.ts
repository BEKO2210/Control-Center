// ============================================================================
// Clawbot Mission Control — Core Type Definitions
// ============================================================================

// --- Task Board Types ---

export type TaskStatus = 'idea' | 'queued' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskAssignee = 'user' | 'ai' | string; // string for specific agent IDs

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: TaskAssignee;
  priority: TaskPriority;
  relatedFiles: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// --- Content Pipeline Types ---

export type ContentStage =
  | 'ideas'
  | 'research'
  | 'outline'
  | 'script'
  | 'assets'
  | 'editing'
  | 'scheduled'
  | 'published';

export interface ContentVersion {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  stage: ContentStage;
  content: string;
  attachments: string[];
  versions: ContentVersion[];
  assignedTo: string;
  tags: string[];
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Calendar / Scheduler Types ---

export type EventType = 'task' | 'recurring' | 'cron' | 'deadline' | 'publish';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  relatedTaskId?: string;
  relatedContentId?: string;
  color?: string;
  createdAt: string;
}

// --- Memory Screen Types ---

export type MemoryCategory =
  | 'preference'
  | 'context'
  | 'learned'
  | 'project'
  | 'decision'
  | 'conversation';

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Team / Agent Types ---

export type AgentRole =
  | 'developer'
  | 'writer'
  | 'designer'
  | 'researcher'
  | 'operator'
  | 'growth';

export type AgentActivity = 'idle' | 'thinking' | 'building' | 'reviewing' | 'blocked';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: AgentRole;
  responsibilities: string[];
  currentTasks: string[]; // task IDs
  activity: AgentActivity;
  clawId: string; // which claw instance this agent belongs to
  stats: {
    tasksCompleted: number;
    tasksInProgress: number;
    uptime: number; // hours
  };
  createdAt: string;
}

// --- Multi-Claw Types ---

export interface Claw {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  agents: string[]; // agent IDs
  isActive: boolean;
  joinedAt: string;
  lastSeen: string;
}

// --- Shell / Theme Types ---

export interface ShellColors {
  claw: Record<string, string>;
  glass: {
    light: string;
    medium: string;
    heavy: string;
    border: string;
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  accent: {
    primary: string;
    secondary: string;
    glow: string;
  };
  gradient: string;
  background: string;
}

export interface Shell {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  preview: string; // gradient CSS for preview
  colors: ShellColors;
}

// --- Notification Types ---

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

// --- Connection Types ---

export type ConnectionType = 'websocket' | 'rest' | 'mqtt';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ClawConnection {
  id: string;
  clawId: string;
  type: ConnectionType;
  endpoint: string;
  port: number;
  path: string; // e.g., "/ws" or "/api"
  useTls: boolean;
  authToken?: string;
  status: ConnectionStatus;
  lastPing?: number; // latency in ms
  error?: string;
  connectedAt?: string;
  lastMessage?: string;
  messagesReceived: number;
  messagesSent: number;
}

export interface ClawProtocolMessage {
  type: string;
  data?: unknown;
  timestamp: string;
  id?: string;
}

// Extended Claw with connection info
export interface ClawWithConnection extends Claw {
  connection?: ClawConnection;
}

// --- Dashboard Stats ---

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  activeAgents: number;
  totalMemories: number;
  contentItems: number;
  scheduledEvents: number;
  connectedClaws: number;
}
