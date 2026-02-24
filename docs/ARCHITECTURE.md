# Architecture Guide

## System Overview

Clawbot Mission Control is a client-side Next.js application that serves as a command center for AI agent orchestration. The architecture is designed to be modular, extensible, and visually stunning.

## Core Principles

### 1. Shell-Driven Theming
The entire visual identity is controlled by **shells** — theme definitions that map to CSS custom properties. This means a single shell change cascades through every component without any component-level logic.

### 2. Entity-Based State
All data entities (Tasks, Content, Events, Memories, Agents, Claws) follow the same pattern:
- Defined as TypeScript interfaces in `lib/types/`
- Managed through Zustand actions in `lib/store/`
- Rendered by screen components in `components/screens/`

### 3. Screen Architecture
Each screen is a self-contained React component that:
- Reads from the Zustand store via selectors
- Manages its own local UI state (modals, forms)
- Contains full CRUD UI for its entity type
- Uses glass-panel CSS classes for consistent styling

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── MissionControlPage (app/page.tsx)
    ├── Sidebar (components/layout/Sidebar.tsx)
    ├── Header (components/layout/Header.tsx)
    └── ActiveScreen (dynamic, based on state)
        ├── Dashboard
        ├── TaskBoard
        ├── ContentPipeline
        ├── Calendar
        ├── MemoryScreen
        ├── TeamStructure
        ├── DigitalOffice
        ├── ShellSelector
        └── ClawManager
```

## State Architecture

```
Zustand Store
├── activeShellId: string
├── activeScreen: string
├── tasks: Task[]
├── contentItems: ContentItem[]
├── events: CalendarEvent[]
├── memories: Memory[]
├── agents: Agent[]
├── claws: Claw[]
└── notifications: Notification[]
```

### Persistence
The store uses Zustand's `persist` middleware with `localStorage` as the storage backend. The `partialize` option controls which state slices are persisted.

## Shell System Architecture

```
Shell Registry (shells/registry.ts)
├── Shell Definitions (colors, gradients, glass effects)
├── getShellCSSVariables() → CSS variable map
└── Shell CRUD (getShell, getAllShells)

RootLayout (app/layout.tsx)
├── useEffect on activeShellId change
└── Applies CSS variables to document.documentElement

Tailwind Config (tailwind.config.ts)
├── References CSS variables via var(--name)
└── Extends theme with shell-aware colors

Global CSS (app/globals.css)
├── Default variable values
└── Glass component classes
```

## Multi-Claw Architecture

Each Claw is an independent entity that owns a set of agents:

```
Claw
├── id, name, avatar, color
├── agents[] → Agent IDs
├── isActive → connection status
└── timestamps

Agent
├── id, name, avatar, role
├── clawId → parent Claw
├── activity → current state
└── stats → performance metrics
```

This design allows for future expansion where Claws could be:
- Remote API-connected bots
- Different AI model instances
- Specialized workflow engines
- Community-contributed agent packs

## CSS Architecture

### Glass Panel System
Three levels of glass panels:
- `.glass-panel` — Base: subtle background, border, backdrop blur
- `.glass-panel-hover` — Interactive: hover glow and border accent
- `.glass-panel-solid` — Modals: heavier background for overlay context

### Custom Properties Flow
```
Shell Definition → CSS Variables → Tailwind Classes → Components
```

This creates a single point of control for the entire visual identity.
