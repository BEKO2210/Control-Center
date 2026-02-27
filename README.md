<p align="center">
  <img src="docs/assets/logo.png" alt="Clawbot Mission Control" width="200" />
</p>

<h1 align="center">Clawbot Mission Control</h1>

<p align="center">
  <strong>AI Agent Orchestration Dashboard</strong><br/>
  Connect your Claw Bots. Deploy agents. Take control.
</p>

<p align="center">
  <a href="https://control-center-xi.vercel.app/">Live Demo</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#screenshots">Screenshots</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#shell-system">Shell System</a> &bull;
  <a href="#multi-claw">Multi-Claw</a> &bull;
  <a href="#changelog">Changelog</a>
</p>

<p align="center">
  <a href="https://control-center-xi.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-4.5-000?logo=react" alt="Zustand" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## What is Clawbot Mission Control?

**Clawbot Mission Control** is an open-source AI agent orchestration dashboard. It serves as the command center for your AI workforce -- a persistent workspace where you connect Claw Bot instances, deploy AI agents, manage tasks, content pipelines, schedules, and memories.

**Current State (v1.4.0 -- 27. February 2026):**

- The app starts completely **empty** -- no mock data, no fake agents, no simulated activity
- New users are guided through a **Setup Wizard** to connect their first Claw Bot
- Only after connecting a real Claw can agents be created and the full dashboard be used
- All UI icons are **premium Lucide SVG icons** -- no emojis anywhere
- Real connection protocols supported: **WebSocket**, **REST API**, **MQTT**

**Key differentiators:**

- **Zero-State Architecture** -- App starts empty and builds up as users connect real bots and deploy agents. No fake demo data.
- **Setup Wizard** -- Guided connection flow with preset templates (Local Dev, Production API, ESP32/Hardware, MQTT, Cloud Agent, Custom).
- **Real Connection Manager** -- WebSocket, REST, and MQTT protocols with connection testing, latency monitoring, and auth token support.
- **Shell System** -- Swap the entire visual theme with one click. Four built-in themes with support for custom community shells.
- **Multi-Claw Architecture** -- Multiple independent bot instances can connect to a single Mission Control, each with their own agents.
- **Dark Glassmorphism UI** -- Frosted glass panels, ambient lighting orbs, and neon accent glows. All icons are premium SVGs (Lucide React).
- **Ten Mission Screens** -- Dashboard, Task Board, Content Pipeline, Calendar, Memory Bank, Team Structure, Digital Office, Shell Themes, Claw Manager, Setup Wizard.
- **Fully Persistent** -- All state is persisted via Zustand with localStorage, surviving page refreshes and sessions.

---

## Live Demo

**[control-center-xi.vercel.app](https://control-center-xi.vercel.app/)**

The live demo starts with the Setup Wizard. All data is stored locally in your browser. Connect a Claw Bot (or skip through the wizard) to explore the full dashboard.

---

## Screenshots

> Screenshots captured on mobile -- the UI is fully responsive across all screen sizes.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/assets/Dashboard.jpg" alt="Dashboard -- Deep Space Theme" /><br/>
      <strong>Dashboard</strong><br/>
      <sub>Deep Space Theme -- Command center overview with stats, agents & connected claws</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/assets/Taskbord.jpg" alt="Task Board -- Ember Forge Theme" /><br/>
      <strong>Task Board</strong><br/>
      <sub>Ember Forge Theme -- Kanban board with drag-and-drop across 5 status columns</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/assets/Content-pipeline.jpg" alt="Content Pipeline -- Deep Space Theme" /><br/>
      <strong>Content Pipeline</strong><br/>
      <sub>Deep Space Theme -- 8-stage content lifecycle from Ideas to Published</sub>
    </td>
    <td align="center">
      <img src="docs/assets/Calender.jpg" alt="Calendar -- Cyber Neon Theme" /><br/>
      <strong>Calendar & Scheduler</strong><br/>
      <sub>Cyber Neon Theme -- Monthly calendar with event management</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/assets/Teamstructure%20.jpg" alt="Team Structure -- Ocean Depths Theme" /><br/>
      <strong>Team Structure</strong><br/>
      <sub>Ocean Depths Theme -- Agent organization grouped by division</sub>
    </td>
    <td align="center">
      <img src="docs/assets/Digitaloffice.jpg" alt="Digital Office -- Ocean Depths Theme" /><br/>
      <strong>Digital Office</strong><br/>
      <sub>Ocean Depths Theme -- Visual workspace with real-time agent activity</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/assets/ShellThemen%20.jpg" alt="Shell Themes -- Deep Space Theme" /><br/>
      <strong>Shell Themes</strong><br/>
      <sub>Deep Space Theme -- Swap the entire visual identity with one click</sub>
    </td>
    <td align="center">
      <img src="docs/assets/Clawmamager.jpg" alt="Claw Manager -- Ember Forge Theme" /><br/>
      <strong>Claw Manager</strong><br/>
      <sub>Ember Forge Theme -- Connect and manage multiple bot instances</sub>
    </td>
  </tr>
</table>

---

## Features

### Core Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Overview with stats, recent tasks, active agents, and connected claws. Shows empty state with setup prompt when no claws are connected. |
| **Task Board** | Kanban board with drag-and-drop across 5 status columns (Ideas, Queued, In Progress, Review, Done) |
| **Content Pipeline** | 8-stage content lifecycle from Ideas to Published with move actions and detail modals |
| **Calendar** | Monthly calendar view with event scheduling, type color-coding, and upcoming events sidebar |
| **Memory Bank** | Searchable, categorized memory storage (Preferences, Context, Learned, Project, Decisions, Conversations) |
| **Team Structure** | Agent organization grouped by role (Developer, Writer, Designer, Researcher, Operator, Growth) with empty state and claw assignment |
| **Digital Office** | Visual workspace showing agent workstations with real-time activity states and ambient glow effects |
| **Shell Themes** | One-click theme switcher with 4 built-in shells and CSS variable architecture |
| **Claw Manager** | Connect, disconnect, and manage multiple bot instances with connection status monitoring |
| **Setup Wizard** | 6-step guided connection flow with preset templates, connection testing, and bot configuration |

### Setup Wizard

New users are automatically directed to the Setup Wizard on first launch. The wizard guides through:

1. **Welcome** -- Overview of what's needed (endpoint, auth token, protocol)
2. **Protocol Selection** -- 6 preset templates: Local Dev Server, Production API, ESP32/Hardware, MQTT Broker, Cloud Agent (OpenClaw), Custom Setup
3. **Endpoint Configuration** -- Host, port, path, TLS toggle, auth token
4. **Connection Test** -- Live connection test with real-time log output and latency measurement
5. **Bot Configuration** -- Name, description, color theme
6. **Summary** -- Review and complete setup

### Connection Protocols

| Protocol | Use Case | Details |
|----------|----------|---------|
| **WebSocket** | Real-time bidirectional communication | Live control, streaming updates, hardware bots |
| **REST API** | HTTP request/response | Cloud APIs, stateless agent services |
| **MQTT** | Lightweight pub/sub messaging | IoT devices, hardware bots, sensor networks |

### Shell System

| Shell | Theme | Accent |
|-------|-------|--------|
| **Deep Space** (Default) | Cosmic dark with indigo | Cyan + Violet |
| **Cyber Neon** | Cyberpunk noir | Hot Pink + Electric Blue |
| **Ocean Depths** | Deep sea teal | Aquamarine + Cyan |
| **Ember Forge** | Volcanic warmth | Amber + Red |

### Multi-Claw System

- Connect multiple independent Claw Bot instances via the Setup Wizard
- Each Claw has its own agents, color identity, and connection configuration
- Real connection management with connect/disconnect toggle
- Connection status monitoring (Connected, Connecting, Disconnected, Error)
- Latency tracking and message counters
- Agents are assigned to specific Claws
- All Claws share the same task, memory, and content pools

### Icon System

All icons throughout the application use **Lucide React** -- a premium open-source SVG icon library. No emojis are used anywhere in the UI. Icons include:

- **Navigation:** LayoutDashboard, KanbanSquare, Play, CalendarDays, Brain, Users, Building2, Palette, Bot, Link
- **Actions:** Bell, Search, Menu, X, ChevronLeft, ChevronRight, Plus, Settings
- **Roles:** Code2, PenTool, Palette, Microscope, Rocket, TrendingUp
- **Pipeline:** Lightbulb, Search, FileText, File, Image, Scissors, CalendarCheck, Rocket
- **Memory:** Settings, ClipboardList, Brain, FolderOpen, Scale, MessageSquare, Database
- **Wizard:** Monitor, Globe, Plug, Radio, Cloud, Settings, Key, Wifi, CheckCircle2, XCircle

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/BEKO2210/Control-Center.git
cd Control-Center

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be greeted by the Setup Wizard.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Server-side rendering, routing |
| **Language** | TypeScript 5.5 | Type safety across the entire codebase |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS with custom theme variables |
| **State** | Zustand 4.5 | Lightweight, persistent global state |
| **Animation** | Framer Motion 11 | Smooth transitions and micro-interactions |
| **Icons** | Lucide React | Premium SVG icon system (no emojis) |
| **Utils** | clsx, date-fns | Class merging, date formatting |

### Project Structure

```
Control-Center/
├── public/                          # Static assets
│   └── favicon.svg
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with shell injection
│   │   ├── page.tsx                 # Main page with wizard gate logic
│   │   └── globals.css              # Global styles + glass components
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar with Lucide icons
│   │   │   └── Header.tsx           # Top bar with search & notifications
│   │   └── screens/
│   │       ├── Dashboard.tsx        # Overview dashboard (with empty state)
│   │       ├── TaskBoard.tsx        # Kanban task management
│   │       ├── ContentPipeline.tsx  # Content lifecycle management
│   │       ├── Calendar.tsx         # Calendar & event scheduling
│   │       ├── MemoryScreen.tsx     # AI memory bank (with empty state)
│   │       ├── TeamStructure.tsx    # Agent team organization (with empty state)
│   │       ├── DigitalOffice.tsx    # Visual agent workspace (with empty state)
│   │       ├── ShellSelector.tsx    # Theme/shell switcher
│   │       ├── ClawManager.tsx      # Multi-claw management (with empty state)
│   │       └── SetupWizard.tsx      # 6-step connection wizard
│   ├── lib/
│   │   ├── types/index.ts          # All TypeScript type definitions
│   │   ├── store/index.ts          # Zustand global state store
│   │   ├── services/
│   │   │   └── connectionService.ts # WebSocket/REST/MQTT connection manager
│   │   └── utils/index.ts          # Utility functions
│   ├── shells/
│   │   └── registry.ts             # Shell definitions & CSS variable system
│   └── agents/
│       └── defaults.ts             # Default agent config (empty by default)
├── data/                            # Data storage directory
├── docs/                            # Documentation assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

### Data Flow

```
First Launch
       |
   Setup Wizard (gated)
       |
   Connect Claw Bot (WebSocket/REST/MQTT)
       |
   Create Agents & Configure
       |
   Full Dashboard Access
       |
   React Components (screens/)
       |
   Zustand Store (lib/store/)
       |
   localStorage (persist middleware)
       |
   Shell System (shells/registry.ts)
       |
   CSS Custom Properties
       |
   Tailwind + Global Styles
```

---

## Screens

### 1. Dashboard

The command center overview. Shows:
- **Empty State** -- When no claws are connected, displays a welcome card with a "Connect Your First Claw" button
- **Stats Grid** -- Total tasks, completed tasks, active agents, memories, content items, scheduled events (all Lucide SVG icons)
- **Recent Tasks** -- Last 5 updated tasks with status and assignee
- **Active Agents** -- Currently working agents with activity indicators
- **Connected Claws** -- All connected Claw instances with status

### 2. Task Board

A full-featured Kanban board with 5 columns:

| Column | Description |
|--------|-------------|
| **Ideas** | Raw task ideas, not yet prioritized |
| **Queued** | Approved and waiting to be picked up |
| **In Progress** | Currently being worked on |
| **Review** | Awaiting review or approval |
| **Done** | Completed tasks |

Features: Drag-and-drop, priority badges (Critical/High/Medium/Low), quick-move buttons, tags, assignee tracking, timestamps.

### 3. Content Pipeline

An 8-stage content lifecycle manager:

```
Ideas -> Research -> Outline -> Script -> Assets -> Editing -> Scheduled -> Published
```

Each stage has a Lucide SVG icon (Lightbulb, Search, FileText, File, Image, Scissors, CalendarCheck, Rocket).

### 4. Calendar & Scheduler

Monthly calendar with event types: Task, Recurring, Cron, Deadline, Publish. Color-coded events, upcoming events sidebar, today highlighting, month navigation with Lucide chevron icons.

### 5. Memory Bank

Searchable memory storage with 6 categories (each with a Lucide SVG icon):
Preferences (Settings), Context (ClipboardList), Learned (Brain), Project (FolderOpen), Decisions (Scale), Conversations (MessageSquare).

### 6. Team Structure

Agent organization by role division. Each role has a dedicated Lucide icon:
- **Developer** -- Code2
- **Writer** -- PenTool
- **Designer** -- Palette
- **Researcher** -- Microscope
- **Operator** -- Rocket
- **Growth** -- TrendingUp

Includes agent creation form with Claw assignment, performance stats, and activity toggle. Empty state shown when no agents are deployed.

### 7. Digital Office

Visual workspace with agent workstations. Activity states: Idle (gray), Thinking (yellow), Building (blue), Reviewing (purple), Blocked (red). Ambient glow effects, activity legend, quick activity switcher. Empty state with create agents / connect claw actions.

### 8. Setup Wizard

6-step guided connection flow:
1. Welcome -- Requirements checklist and protocol overview
2. Protocol -- 6 preset templates with Lucide icons (Monitor, Globe, Plug, Radio, Cloud, Settings)
3. Endpoint -- Host, port, path, TLS toggle, auth token, URL preview
4. Test -- Connection testing with real-time log output
5. Configure -- Bot name, description, color theme, live preview
6. Summary -- Configuration review with next steps

### 9. Shell Themes

One-click theme switcher with gradient previews. Four built-in shells (Deep Space, Cyber Neon, Ocean Depths, Ember Forge). Custom shells can be added via `src/shells/registry.ts`.

### 10. Claw Manager

Full bot instance management: connect via wizard, quick add, connect/disconnect toggle, connection status monitoring, latency display, agent roster per claw, remove claws. Empty state with wizard/quick add options.

---

## Shell System

### How Shells Work

Shells are theme definitions that control the entire visual identity. Switching a shell updates CSS custom properties on the root element, causing a cascading visual transformation.

```
Shell Definition (registry.ts)
       |
getShellCSSVariables() -> Record<string, string>
       |
document.documentElement.style.setProperty()
       |
CSS Variables (--claw-*, --glass-*, --surface-*, --accent-*)
       |
Tailwind config references variables
       |
Entire UI transforms
```

### Creating a Custom Shell

1. Open `src/shells/registry.ts`
2. Add a new entry to the `shells` object:

```typescript
'my-custom-shell': {
  id: 'my-custom-shell',
  name: 'My Custom Shell',
  description: 'A custom theme for my workflow.',
  author: 'Your Name',
  version: '1.0.0',
  preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  colors: {
    claw: {
      50: '#...',  // Lightest
      // ... 100-900
      950: '#...', // Darkest
    },
    glass: {
      light: 'rgba(R, G, B, 0.03)',
      medium: 'rgba(R, G, B, 0.06)',
      heavy: 'rgba(R, G, B, 0.1)',
      border: 'rgba(R, G, B, 0.08)',
    },
    surface: {
      primary: '#...',
      secondary: '#...',
      elevated: '#...',
    },
    accent: {
      primary: '#...',
      secondary: '#...',
      glow: 'rgba(R, G, B, 0.4)',
    },
    gradient: 'linear-gradient(135deg, ...)',
    background: '#...',
  },
},
```

3. Your shell will automatically appear in the Shell Selector screen.

---

## Multi-Claw System

### Concept

Multiple independent Claw Bot instances can connect to a single Mission Control, each bringing their own agents and capabilities.

```
                    +------------------+
                    |  Mission Control |
                    |   (Dashboard)    |
                    +--------+---------+
                             |
            +----------------+----------------+
            |                |                |
     +------+------+  +-----+------+  +------+------+
     | Claw Alpha  |  | Claw Beta  |  | Claw Gamma  |
     | WebSocket   |  | REST API   |  | MQTT        |
     | 3 agents    |  | 5 agents   |  | 2 agents    |
     +-------------+  +------------+  +-------------+
```

### How to Connect a New Claw

1. Launch the app -- the **Setup Wizard** opens automatically on first use
2. Choose a **preset template** (Local Dev, Production, ESP32, MQTT, Cloud, Custom)
3. Configure the **endpoint** (host, port, path, TLS, auth token)
4. **Test the connection** with real-time logs and latency measurement
5. **Name your bot** and choose a color theme
6. **Complete setup** -- redirected to Claw Manager

Additional claws can be connected anytime via the Setup Wizard (accessible from the sidebar).

### Connection Properties

| Property | Description |
|----------|-------------|
| `type` | Protocol: websocket, rest, or mqtt |
| `endpoint` | Host or IP address |
| `port` | Port number |
| `path` | URL path (e.g., /ws, /api, /mqtt) |
| `useTls` | TLS/SSL enabled (wss://, https://) |
| `authToken` | Optional Bearer token or API key |
| `status` | connected, connecting, disconnected, error |
| `lastPing` | Latency in milliseconds |
| `messagesReceived` | Inbound message counter |
| `messagesSent` | Outbound message counter |

---

## State Management

### Zustand Store

All state is managed through a single Zustand store with localStorage persistence:

```typescript
import { useMissionControl } from '@/lib/store';

// Read state
const tasks = useMissionControl((s) => s.tasks);
const agents = useMissionControl((s) => s.agents);
const claws = useMissionControl((s) => s.claws);

// Write state
const addTask = useMissionControl((s) => s.addTask);
const addClaw = useMissionControl((s) => s.addClaw);
const resetToEmpty = useMissionControl((s) => s.resetToEmpty);
```

### Available Actions

#### Tasks
- `addTask(task)` -- Create a new task
- `updateTask(id, updates)` -- Update task fields
- `moveTask(id, status)` -- Move task to a different column
- `deleteTask(id)` -- Remove a task

#### Content
- `addContentItem(item)` -- Add content to pipeline
- `updateContentItem(id, updates)` -- Update content fields
- `moveContentItem(id, stage)` -- Move content to a different stage
- `deleteContentItem(id)` -- Remove content

#### Calendar
- `addEvent(event)` -- Schedule a new event
- `updateEvent(id, updates)` -- Update event details
- `deleteEvent(id)` -- Remove an event

#### Memory
- `addMemory(memory)` -- Store a new memory
- `updateMemory(id, updates)` -- Update memory content
- `deleteMemory(id)` -- Delete a memory

#### Agents
- `addAgent(agent)` -- Deploy a new agent
- `updateAgent(id, updates)` -- Update agent fields
- `setAgentActivity(id, activity)` -- Change agent activity state
- `deleteAgent(id)` -- Remove an agent

#### Claws
- `addClaw(claw)` -- Connect a new Claw
- `updateClaw(id, updates)` -- Update Claw details
- `removeClaw(id)` -- Disconnect and remove a Claw

#### Connections
- `addConnection(connection)` -- Add a connection configuration
- `updateConnection(id, updates)` -- Update connection state
- `removeConnection(id)` -- Remove a connection

#### Shell
- `setActiveShell(id)` -- Switch to a different shell theme

#### Wizard
- `setWizardCompleted(completed)` -- Mark wizard as completed

#### System
- `resetToEmpty()` -- Reset entire store to empty state (clears all data, reopens wizard)
- `addNotification(notification)` -- Push a notification
- `markNotificationRead(id)` -- Mark as read
- `clearNotifications()` -- Clear all notifications

---

## Design Principles

### 1. Zero-State First
The app starts completely empty. No mock data, no fake agents, no simulated activity. Everything is real -- users build their workspace from scratch by connecting actual Claw Bot instances.

### 2. Dark Glassmorphism
Every panel uses frosted glass effects with semi-transparent backgrounds, subtle borders, and backdrop blur. This creates depth without heaviness.

### 3. Premium SVG Icons
All icons use Lucide React -- a consistent, high-quality SVG icon library. No emojis anywhere in the UI for a professional, clean appearance.

### 4. Ambient Lighting
Floating gradient orbs in the background create atmosphere. Active elements emit soft glows in the accent color.

### 5. Shell Consistency
Every color in the UI flows from shell CSS variables. Switching shells transforms everything -- backgrounds, borders, accents, glows, and text colors.

### 6. Progressive Disclosure
Complex actions are hidden behind hover states. Cards reveal move buttons, delete actions, and activity toggles only when you interact with them.

### 7. Empty States
Every screen handles the empty case gracefully, guiding users toward the right action (connect a claw, create agents, add tasks).

---

## Roadmap

- [ ] **Backend API** -- REST/WebSocket API for real-time multi-user sync
- [ ] **Database** -- SQLite/PostgreSQL persistence instead of localStorage
- [ ] **Authentication** -- User auth with GitHub OAuth
- [ ] **Real Agent Integration** -- Connect to OpenAI, Anthropic, and other AI APIs
- [ ] **Webhook System** -- Agent completion notifications
- [ ] **Custom Shell Marketplace** -- Community shell sharing
- [ ] **Keyboard Shortcuts** -- Power user navigation
- [ ] **Plugin System** -- Extensible screen/widget architecture
- [ ] **Export/Import** -- Backup and restore Mission Control state

---

## Changelog

All changes to Clawbot Mission Control, listed in reverse chronological order.

### v1.4.0 -- 2026-02-27

**Bug Fixes & Code Quality**

| Area | Description |
|------|-------------|
| **fix: REST polling consecutive failure counter** | The REST polling `catch` block claimed to fail after 3 consecutive errors but actually failed on the first. Added a `pollFailures` counter that increments on each failed poll and only marks the connection as error after 3 consecutive failures. Resets on success. (`connectionService.ts`) |
| **fix: truncate() guard for small maxLength** | `truncate(str, maxLength)` produced incorrect output when `maxLength <= 3` (e.g., returning `"..."` for `maxLength=2`). Added guard: if `maxLength <= 3`, return hard-truncated string without ellipsis. (`utils/index.ts`) |
| **fix: connection ID mutation in ClawManager** | `handleConnect` created a new `ConnectionManager` entry on every connect attempt without cleaning up the previous one, causing orphaned connections. Now cleans up existing ConnectionManager entries before creating new ones. (`ClawManager.tsx`) |
| **fix: async cleanup in SetupWizard test** | `runTest` set React state after `await` without checking if the component was still mounted. Added `mountedRef` guard to prevent state updates on unmounted components. (`SetupWizard.tsx`) |
| **chore: remove unused dependencies** | Removed `date-fns`, `uuid`, and `@types/uuid` from `package.json` -- none were imported anywhere in the codebase. |
| **chore: bump version to 1.4.0** | Updated `package.json` version from `1.0.0` to `1.4.0` to match release history. |
| **style: replace HTML entities in JSX** | Replaced `&mdash;` HTML entities with Unicode em dash characters in `ClawManager.tsx` and `SetupWizard.tsx` for idiomatic React/JSX. |

### v1.3.0 -- 2026-02-26

**Reset to Empty State & Wizard-First Setup**

| Commit | Author | Description |
|--------|--------|-------------|
| `1ea5b52` | Claude | **feat: reset app to empty state with wizard-first setup flow** -- Remove all mock data (8 fake agents, fake claw, welcome tasks, init memory). App starts at zero. Gate behind Setup Wizard. Replace all emojis with Lucide SVG icons. Add empty state views for Dashboard, Digital Office, Team Structure, Claw Manager, Memory Screen. Add `resetToEmpty()` store action. SVG favicon. |

### v1.2.0 -- 2026-02-26

**Real Claw Bot Connection Wizard**

| Commit | Author | Description |
|--------|--------|-------------|
| `d3d61db` | BEKO2210 | Merge pull request #3 from BEKO2210/claude/claw-bot-wizard-uGqSE |
| `511da13` | Claude | **feat: add real Claw Bot connection wizard with WebSocket/REST/MQTT support** -- 6-step Setup Wizard with preset templates, endpoint configuration, live connection testing with logs, bot customization. Real ConnectionManager service for WebSocket, REST API, and MQTT protocols. Connection status tracking, latency monitoring, auth token support. |

### v1.1.0 -- 2026-02-25

**Mobile Responsive, Bug Fixes & Documentation**

| Commit | Author | Description |
|--------|--------|-------------|
| `1e136c9` | BEKO2210 | Update live demo description in README |
| `c448805` | BEKO2210 | Merge pull request #2 from BEKO2210/claude/fix-ringcolor-css-5UyMh |
| `1be5daf` | Claude | Add live demo link, screenshot gallery, and mobile screenshots to README |
| `0643ac4` | BEKO2210 | Add files via upload (documentation assets) |
| `7a12284` | BEKO2210 | Merge pull request #1 from BEKO2210/claude/fix-ringcolor-css-5UyMh |
| `17f203d` | Claude | **fix: replace --tw-ring-color inline style hack with boxShadow** -- Fix CSS compatibility issue with Tailwind ring color |
| `5683c4f` | Claude | **chore: add package-lock.json for reproducible builds** |
| `7851e67` | Claude | **feat: add Android/mobile responsive layout** -- Full mobile support with hamburger menu, responsive grid layouts, touch-friendly interactions |

### v1.0.0 -- 2026-02-24

**Initial Release**

| Commit | Author | Description |
|--------|--------|-------------|
| `b450fab` | BEKO2210 | Update logo image source in README.md |
| `a1a5f6f` | BEKO2210 | Add files via upload (initial assets) |
| `40619d8` | Claude | **feat: Clawbot Mission Control -- AI Agent Orchestration Dashboard** -- Initial release with 10 screens (Dashboard, Task Board, Content Pipeline, Calendar, Memory Bank, Team Structure, Digital Office, Shell Themes, Claw Manager, Setup Wizard). 4 built-in shell themes (Deep Space, Cyber Neon, Ocean Depths, Ember Forge). Multi-Claw architecture. Dark glassmorphism UI. Zustand state management with localStorage persistence. |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Use TypeScript strict mode -- no `any` types
- Follow the existing component patterns
- Use Lucide React icons -- no emojis in the UI
- Add new shells to `src/shells/registry.ts`
- Test all screen components before submitting
- Ensure empty states are handled for new screens

---

## License

This project is licensed under the **MIT License** -- see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built by <a href="https://github.com/BEKO2210">BEKO2210</a>
</p>
