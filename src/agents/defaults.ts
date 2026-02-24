// ============================================================================
// Clawbot Mission Control — Default Agents & Claw Configuration
// ============================================================================

import type { Agent, Claw, AgentRole, AgentActivity } from '@/lib/types';

/**
 * Default AI agents that come pre-configured with Mission Control.
 * Each agent represents a specialized role within the Clawbot ecosystem.
 */
export const defaultAgents: Agent[] = [
  {
    id: 'agent-architect',
    name: 'Archie',
    avatar: '🏗️',
    role: 'developer' as AgentRole,
    responsibilities: [
      'System architecture design',
      'Code review and quality assurance',
      'Technical decision-making',
      'Performance optimization',
    ],
    currentTasks: [],
    activity: 'thinking' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 42, tasksInProgress: 2, uptime: 720 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-frontend',
    name: 'Pixel',
    avatar: '🎨',
    role: 'developer' as AgentRole,
    responsibilities: [
      'Frontend development (React/Next.js)',
      'UI component building',
      'Responsive design implementation',
      'Animation and interaction design',
    ],
    currentTasks: [],
    activity: 'building' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 38, tasksInProgress: 1, uptime: 680 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-backend',
    name: 'Core',
    avatar: '⚙️',
    role: 'developer' as AgentRole,
    responsibilities: [
      'Backend API development',
      'Database design and management',
      'Server infrastructure',
      'Security implementation',
    ],
    currentTasks: [],
    activity: 'idle' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 55, tasksInProgress: 0, uptime: 800 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-writer',
    name: 'Quill',
    avatar: '✍️',
    role: 'writer' as AgentRole,
    responsibilities: [
      'Documentation writing',
      'Content creation and editing',
      'Blog posts and articles',
      'Copy and UX writing',
    ],
    currentTasks: [],
    activity: 'building' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 28, tasksInProgress: 1, uptime: 500 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-designer',
    name: 'Nova',
    avatar: '💫',
    role: 'designer' as AgentRole,
    responsibilities: [
      'Visual design and branding',
      'UI/UX design',
      'Icon and asset creation',
      'Design system maintenance',
    ],
    currentTasks: [],
    activity: 'reviewing' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 22, tasksInProgress: 1, uptime: 400 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-researcher',
    name: 'Scout',
    avatar: '🔍',
    role: 'researcher' as AgentRole,
    responsibilities: [
      'Market and competitor research',
      'Technology evaluation',
      'Data analysis and insights',
      'Trend monitoring',
    ],
    currentTasks: [],
    activity: 'thinking' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 35, tasksInProgress: 2, uptime: 600 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-operator',
    name: 'Ops',
    avatar: '🚀',
    role: 'operator' as AgentRole,
    responsibilities: [
      'Deployment and CI/CD',
      'Monitoring and alerting',
      'Infrastructure management',
      'Incident response',
    ],
    currentTasks: [],
    activity: 'idle' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 48, tasksInProgress: 0, uptime: 750 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-growth',
    name: 'Buzz',
    avatar: '📈',
    role: 'growth' as AgentRole,
    responsibilities: [
      'Growth strategy',
      'Marketing campaigns',
      'Community engagement',
      'Analytics and metrics',
    ],
    currentTasks: [],
    activity: 'thinking' as AgentActivity,
    clawId: 'claw-primary',
    stats: { tasksCompleted: 18, tasksInProgress: 1, uptime: 350 },
    createdAt: new Date().toISOString(),
  },
];

/**
 * The default primary Claw instance.
 */
export const defaultClaw: Claw = {
  id: 'claw-primary',
  name: 'Clawbot Prime',
  description: 'The primary Clawbot instance managing this Mission Control.',
  avatar: '🦀',
  color: '#06b6d4',
  agents: defaultAgents.map((a) => a.id),
  isActive: true,
  joinedAt: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
};
