# Karan SaaS Design System (Stitch + Shadcn UI)

Source of truth for the modern, high-performance UI/UX of the Karan SaaS project, built with a focus on speed, accessibility, and "Linear-grade" aesthetics.

## Core Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI (Radix UI primitives)
- **State**: Redux (for complex states) + React Context/Hooks

## Visual Language
- **Style**: Modern SaaS, high-density, sharp borders, consistent spacing.
- **Atmosphere**: Premium, professional, "Linear-esque", focused on data clarity.
- **Micro-interactions**: Subtle hover states, smooth transitions using Tailwind `transition-all`.

## Color Palette (Shadcn Defaults + Custom)
| Token | Role | Hex Code |
|:---|:---|:---|
| `primary` | Brand/Action | `#000000` |
| `secondary` | Secondary brand | `#F4F4F5` |
| `background` | Page background | `#FFFFFF` |
| `foreground` | Main text | `#09090B` |
| `muted` | Secondary text | `#71717A` |
| `accent` | Highlight | `#F4F4F5` |
| `border` | Dividers | `#E2E8F0` |

## Typography
- **Font Family**: Inter (Standard for Shadcn)
- **Sans**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`
- **Mono**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

## Component Standards
- **Radius**: `0.5rem` (Standard Shadcn `md`)
- **Shadows**: `shadow-sm` for cards, `shadow-md` for popovers.
- **Borders**: `1px solid hsl(var(--border))`
- **Spacing**: Follows Tailwind spacing scale (4, 8, 16px, etc.)

## Stitch Integration
All generations from **Stitch** (https://stitch.withgoogle.com/) should adhere to:
1. **Semantic HTML**: Use proper tags (`<header>`, `<main>`, `<footer>`).
2. **Tailwind-First**: Avoid inline styles; use utility classes.
3. **Accessibility**: Maintain Radix UI ARIA standards.
4. **Consistency**: Use the color tokens defined above.

