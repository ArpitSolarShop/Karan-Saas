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
| `primary` | Brand/Action | `#4F46E5` |
| `secondary` | Secondary brand | `#F3F4F6` |
| `background` | Page background | `#FAFAFA` |
| `foreground` | Main text | `#111827` |
| `muted` | Secondary text | `#6B7280` |
| `accent` | Highlight | `#EEF2FF` |
| `border` | Dividers | `#E5E7EB` |

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

