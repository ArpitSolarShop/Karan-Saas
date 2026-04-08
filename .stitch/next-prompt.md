# Enhanced Prompt: Premium Dashboard Layout Shell

A high-performance, modern SaaS dashboard layout with a focus on data density and "Linear-grade" aesthetics.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Palette: Primary Black (#000000) for actions, White (#FFFFFF) for background, Zinc-based grays for boundaries (Border: #E2E8F0, Accent: #F4F4F5).
- Typography: Inter (Sans), high tracking-tight for headings.
- Styles: 0.5rem (8px) corner radius, subtle shadow-sm for UI cards, shadow-md for popovers.
- Atmosphere: Professional, efficient, "Silicon Valley" dark/light mode adaptable.

**PAGE STRUCTURE:**
1. **Sidebar Navigation (Persistent):**
   - Slim or expandable sidebar on the left.
   - Links: Home, CRM, Leads, Campaigns, Analytics, Settings.
   - Active state indicator: Small accent bar or subtle background-zinc change.
2. **Top Header (Global):**
   - Centered or right-aligned search bar (Command-K style).
   - Right-side profile section with avatar and notification bell.
   - Breadcrumb navigation for contextual awareness.
3. **Main Workspace (Responsive Grid):**
   - Full-width content area with internal padding (p-8).
   - Layout should accommodate modular cards of varying sizes (span-1, span-2).
   - Integration points for Radix UI primitives (Tabs, Accordions).
4. **Footer (Minimal):**
   - Subpixel-level status indicator (e.g., "System: Operational").
   - Discrete copyright and link section.

**COMPONENTS TO INCLUDE:**
- Sidebar with tooltips.
- Global Search Input with "Cmd+K" label.
- User Profile Dropdown placeholder.
- Multi-column layout shell using CSS Grid/Flexbox.

---
💡 **Next Step:** If approved, I will call `generate_screen_from_text` using this prompt to populate project `6701551294500210840`.
