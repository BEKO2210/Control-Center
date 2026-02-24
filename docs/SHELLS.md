# Shell Development Guide

## What is a Shell?

A **Shell** is a complete visual theme for Clawbot Mission Control. Just like a hermit crab swaps its shell, your Mission Control can wear different visual identities.

## Shell Interface

```typescript
interface Shell {
  id: string;           // Unique identifier (kebab-case)
  name: string;         // Display name
  description: string;  // Short description
  author: string;       // Creator name
  version: string;      // Semantic version
  preview: string;      // CSS gradient for preview thumbnail
  colors: ShellColors;  // Complete color definition
}

interface ShellColors {
  claw: Record<string, string>;  // 50-950 color scale
  glass: {
    light: string;    // rgba - subtle backgrounds
    medium: string;   // rgba - card backgrounds
    heavy: string;    // rgba - elevated elements
    border: string;   // rgba - border color
  };
  surface: {
    primary: string;    // Main background color
    secondary: string;  // Secondary area color
    elevated: string;   // Elevated card color
  };
  accent: {
    primary: string;     // Primary accent (buttons, links)
    secondary: string;   // Secondary accent
    glow: string;        // rgba - glow/shadow color
  };
  gradient: string;      // Background gradient CSS
  background: string;    // Fallback solid background
}
```

## Step-by-Step: Creating a Shell

### 1. Choose Your Color Palette

Start with three decisions:
- **Background tone** — What color family for the dark background? (blue, green, warm, neutral)
- **Primary accent** — What color draws attention? (cyan, pink, amber, green)
- **Secondary accent** — What color provides contrast? (violet, blue, red)

### 2. Define Glass Properties

Glass effects should use the **primary accent color** at very low opacity:
```
light:  rgba(accent, 0.03)  — barely visible
medium: rgba(accent, 0.06)  — noticeable on hover
heavy:  rgba(accent, 0.10)  — clearly visible
border: rgba(accent, 0.08)  — subtle definition
```

### 3. Create Surface Colors

Three levels of darkness:
```
primary:   darkest  (main background)
secondary: slightly lighter
elevated:  lighter still (for cards on cards)
```

### 4. Set Accent Colors

- `primary` — Used for buttons, active states, links
- `secondary` — Used for secondary badges, alternate highlights
- `glow` — Same as primary but with `rgba(..., 0.4)` for box-shadow effects

### 5. Register Your Shell

Add your shell to `src/shells/registry.ts`:

```typescript
'arctic-aurora': {
  id: 'arctic-aurora',
  name: 'Arctic Aurora',
  description: 'Northern lights over frozen tundra.',
  author: 'Your Name',
  version: '1.0.0',
  preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  colors: {
    claw: { /* 50-950 scale */ },
    glass: { light: '...', medium: '...', heavy: '...', border: '...' },
    surface: { primary: '#0f172a', secondary: '#1e293b', elevated: '#334155' },
    accent: { primary: '#38bdf8', secondary: '#a78bfa', glow: 'rgba(56, 189, 248, 0.4)' },
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    background: '#0f172a',
  },
},
```

### 6. Test Your Shell

1. Run the development server
2. Navigate to Shell Themes
3. Click your new shell
4. Verify all screens look correct

## Tips for Great Shells

- **Glass contrast**: Ensure glass panels are visible against the background
- **Text readability**: White/light text must be readable on all glass levels
- **Accent visibility**: Accent colors must stand out on both glass and surface backgrounds
- **Glow subtlety**: Glow effects should enhance, not overwhelm
- **Preview accuracy**: The preview gradient should represent the overall feel
