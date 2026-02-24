# Agent System Guide

## Overview

The Agent System is the workforce layer of Clawbot Mission Control. Agents are AI-powered workers organized into role-based divisions, each with specific responsibilities and capabilities.

## Agent Roles

| Role | Division | Emoji | Focus Area |
|------|----------|-------|------------|
| `developer` | Engineering | 💻 | Code, architecture, infrastructure |
| `writer` | Content | ✍️ | Documentation, articles, copy |
| `designer` | Creative | 🎨 | UI/UX, visual design, branding |
| `researcher` | Intelligence | 🔬 | Research, analysis, evaluation |
| `operator` | Operations | 🚀 | Deployment, monitoring, CI/CD |
| `growth` | Marketing | 📈 | Growth, marketing, community |

## Activity States

| State | Color | Description |
|-------|-------|-------------|
| `idle` | Gray | Waiting for task assignment |
| `thinking` | Yellow (pulsing) | Analyzing, planning, reasoning |
| `building` | Blue (pulsing) | Actively creating or coding |
| `reviewing` | Purple (pulsing) | Quality checking, reviewing work |
| `blocked` | Red (pulsing) | Waiting for external dependency |

## Default Agents

Mission Control ships with 8 pre-configured agents:

| Name | Role | Description |
|------|------|-------------|
| **Archie** | Developer | System architecture & code review |
| **Pixel** | Developer | Frontend development & UI building |
| **Core** | Developer | Backend APIs & database management |
| **Quill** | Writer | Documentation & content creation |
| **Nova** | Designer | Visual design & branding |
| **Scout** | Researcher | Market research & tech evaluation |
| **Ops** | Operator | Deployment & infrastructure |
| **Buzz** | Growth | Growth strategy & marketing |

## Creating Custom Agents

### Via the UI

1. Go to **Team Structure**
2. Click **+ New Agent**
3. Fill in name, role, and responsibilities
4. Click **Deploy Agent**

### Via Code

Add to `src/agents/defaults.ts`:

```typescript
{
  id: 'agent-custom',
  name: 'Atlas',
  avatar: '🗺️',
  role: 'researcher',
  responsibilities: [
    'Geographic data analysis',
    'Location-based intelligence',
    'Map visualization',
  ],
  currentTasks: [],
  activity: 'idle',
  clawId: 'claw-primary',
  stats: { tasksCompleted: 0, tasksInProgress: 0, uptime: 0 },
  createdAt: new Date().toISOString(),
}
```

## Agent-Claw Relationship

Every agent belongs to exactly one Claw:

```
Claw (Clawbot Prime)
├── Archie (developer)
├── Pixel (developer)
├── Core (developer)
├── Quill (writer)
├── Nova (designer)
├── Scout (researcher)
├── Ops (operator)
└── Buzz (growth)

Claw (External Bot)
├── Agent A
└── Agent B
```

When a new Claw connects, it can bring its own agents. When a Claw disconnects, its agents become inactive but remain in the system.

## Digital Office

The Digital Office provides a visual representation of all agent workstations:

- Each agent has a "desk" with their avatar, name, and role
- Active agents glow with their activity color
- Status indicators pulse for non-idle states
- Hover to quickly change agent activity
- Grid background simulates an office floor plan
