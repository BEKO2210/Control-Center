// ============================================================================
// Clawbot Mission Control — Shell Registry
// ============================================================================
// Shells are swappable visual themes. Like a real claw changing its shell,
// your Mission Control can wear different skins.
// ============================================================================

import type { Shell } from '@/lib/types';

export const shells: Record<string, Shell> = {
  // ---- Default: Deep Space ----
  'deep-space': {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'The default cosmic theme. Dark, mysterious, with neon cyan accents.',
    author: 'Clawbot Core',
    version: '1.0.0',
    preview: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%)',
    colors: {
      claw: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b',
      },
      glass: {
        light: 'rgba(255, 255, 255, 0.03)',
        medium: 'rgba(255, 255, 255, 0.06)',
        heavy: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      surface: {
        primary: '#0a0a1a',
        secondary: '#111127',
        elevated: '#1a1a3e',
      },
      accent: {
        primary: '#06b6d4',
        secondary: '#8b5cf6',
        glow: 'rgba(6, 182, 212, 0.4)',
      },
      gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%)',
      background: '#0a0a1a',
    },
  },

  // ---- Cyber Neon ----
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    description: 'Cyberpunk-inspired with hot pink and electric blue neon glows.',
    author: 'Clawbot Core',
    version: '1.0.0',
    preview: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d0d1a 100%)',
    colors: {
      claw: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
      },
      glass: {
        light: 'rgba(236, 72, 153, 0.03)',
        medium: 'rgba(236, 72, 153, 0.06)',
        heavy: 'rgba(236, 72, 153, 0.1)',
        border: 'rgba(236, 72, 153, 0.12)',
      },
      surface: {
        primary: '#0d0d0d',
        secondary: '#1a0a2e',
        elevated: '#2d1b4e',
      },
      accent: {
        primary: '#ec4899',
        secondary: '#06b6d4',
        glow: 'rgba(236, 72, 153, 0.5)',
      },
      gradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d0d1a 100%)',
      background: '#0d0d0d',
    },
  },

  // ---- Ocean Depths ----
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep sea vibes with teal, aquamarine, and bioluminescent accents.',
    author: 'Clawbot Core',
    version: '1.0.0',
    preview: 'linear-gradient(135deg, #042f2e 0%, #0d3b3b 50%, #064e3b 100%)',
    colors: {
      claw: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
        950: '#042f2e',
      },
      glass: {
        light: 'rgba(20, 184, 166, 0.03)',
        medium: 'rgba(20, 184, 166, 0.06)',
        heavy: 'rgba(20, 184, 166, 0.1)',
        border: 'rgba(20, 184, 166, 0.1)',
      },
      surface: {
        primary: '#042f2e',
        secondary: '#0d3b3b',
        elevated: '#115e59',
      },
      accent: {
        primary: '#2dd4bf',
        secondary: '#06b6d4',
        glow: 'rgba(45, 212, 191, 0.4)',
      },
      gradient: 'linear-gradient(135deg, #042f2e 0%, #0d3b3b 50%, #064e3b 100%)',
      background: '#042f2e',
    },
  },

  // ---- Ember Forge ----
  ember: {
    id: 'ember',
    name: 'Ember Forge',
    description: 'Volcanic warmth with amber, orange, and molten lava accents.',
    author: 'Clawbot Core',
    version: '1.0.0',
    preview: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
    colors: {
      claw: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      glass: {
        light: 'rgba(245, 158, 11, 0.03)',
        medium: 'rgba(245, 158, 11, 0.06)',
        heavy: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.1)',
      },
      surface: {
        primary: '#1c1917',
        secondary: '#292524',
        elevated: '#44403c',
      },
      accent: {
        primary: '#f59e0b',
        secondary: '#ef4444',
        glow: 'rgba(245, 158, 11, 0.4)',
      },
      gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
      background: '#1c1917',
    },
  },
};

export const defaultShellId = 'deep-space';

export function getShell(id: string): Shell {
  return shells[id] ?? shells[defaultShellId];
}

export function getAllShells(): Shell[] {
  return Object.values(shells);
}

export function getShellCSSVariables(shell: Shell): Record<string, string> {
  const vars: Record<string, string> = {};

  // Claw colors
  for (const [key, value] of Object.entries(shell.colors.claw)) {
    vars[`--claw-${key}`] = value as string;
  }

  // Glass colors
  vars['--glass-light'] = shell.colors.glass.light;
  vars['--glass-medium'] = shell.colors.glass.medium;
  vars['--glass-heavy'] = shell.colors.glass.heavy;
  vars['--glass-border'] = shell.colors.glass.border;

  // Surface colors
  vars['--surface-primary'] = shell.colors.surface.primary;
  vars['--surface-secondary'] = shell.colors.surface.secondary;
  vars['--surface-elevated'] = shell.colors.surface.elevated;

  // Accent colors
  vars['--accent-primary'] = shell.colors.accent.primary;
  vars['--accent-secondary'] = shell.colors.accent.secondary;
  vars['--accent-glow'] = shell.colors.accent.glow;

  // Gradient & background
  vars['--shell-gradient'] = shell.colors.gradient;
  vars['--shell-background'] = shell.colors.background;

  return vars;
}
