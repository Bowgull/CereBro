# CereBro Castle UI Design System

## Purpose

Define the visual system for CereBro V1.

CereBro should feel like a serious local AI command center with a tasteful RPG/castle layer.

It must not look like a generic SaaS dashboard.

## Visual Identity

Keywords:

- dark
- focused
- cinematic
- castle-inspired
- local command center
- premium
- practical
- agent-aware
- not childish
- not cluttered
- not fake fantasy UI

## Color Tokens

### Required Token Map

```ts
export const cerebroColors = {
  background: "#0E1116",
  backgroundSoft: "#131821",
  surface: "#181F2A",
  surfaceRaised: "#202A38",
  surfaceMuted: "#151A23",
  border: "#334155",
  borderSoft: "#253041",
  textPrimary: "#F4EFE3",
  textSecondary: "#B8C0CC",
  textMuted: "#7E8898",
  accent: "#6BA6FF",
  accentSoft: "#2D5B8F",
  accentViolet: "#8B5CF6",
  glowViolet: "#A78BFA",
  success: "#9FD2B7",
  warning: "#F6C177",
  danger: "#EF6F6C",
  blocked: "#7F1D1D",
  gold: "#D9B56A",
  stone: "#6B7280"
};
```

## Typography

Recommended:

- UI font: system sans-serif
- Code/log font: monospace
- Page titles: strong, clear
- Section headings: medium weight
- Metadata: small, muted
- Long text: readable line height

## Radius

```ts
export const radius = {
  small: "0.5rem",
  medium: "0.75rem",
  large: "1rem",
  xl: "1.25rem",
  card: "1rem"
};
```

## Spacing

Use:

- 4 px base scale
- 8 px small gaps
- 12 px compact card padding
- 16 px normal card padding
- 24 px section spacing
- 32 px major layout spacing

## Shadows

Use subtle shadows only.

Avoid heavy glow spam.

## Layout

Main shell:

```text
Left rail
Center workspace
Right context panel
Bottom command bar
```

## Component Style

Cards:

- dark raised surface
- soft border
- clear heading
- no nested card maze

Buttons:

- primary action clear
- secondary muted
- danger explicit
- disabled obvious

Badges:

- agent status
- task mode
- validation status
- permission class

## Agent Status Colors

```ts
export const agentStatus = {
  idle: "textMuted",
  active: "accent",
  waiting: "warning",
  validating: "accentViolet",
  blocked: "danger",
  complete: "success",
  sealed: "stone"
};
```

## Motion Rules

Use motion for:

- panel transitions
- task timeline updates
- agent status changes
- output reveal
- approval prompt appearance

Do not use motion for:

- decoration without function
- constant glowing animations
- distracting background effects

## Anti-Slop Rules

Do not:

- use generic blue SaaS dashboard defaults
- use random glassmorphism everywhere
- use gradient blobs without purpose
- use cards inside cards inside cards
- hide core task information
- overdo fantasy decoration
- create fake agent chat noise
- ignore empty states
- ignore error states

## Empty State Tone

Helpful, direct, a little warm.

Example:

```text
No Project Spaces yet. Create one to give CereBro a place to organize tasks, sources, memory, and outputs.
```
