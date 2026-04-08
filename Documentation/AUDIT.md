# Design System Audit: Karan SaaS

This audit evaluates the current frontend codebase against the `.stitch/DESIGN.md` standards and Shadcn UI best practices.

## 🟢 Compliance (Doing Well)
- **Shadcn Integration**: Core pages like `DashboardModular` (page.tsx) are using `@/components/ui` components (`Card`, `Button`, `Badge`).
- **Variable Mapping**: `globals.css` correctly maps theme-specific variables to Shadcn/Tailwind tokens (`--background`, `--primary`, etc.).
- **Consistent Icons**: Use of `lucide-react` is consistent across evaluated pages.
- **Theme Support**: The project is configured for `dark` mode by default.

## 🟡 Partial Compliance (Needs Attention)
- **Hardcoded Variable Names**: Use of classes like `bg-surface-2` or `text-text-muted` (mapped in `globals.css` but not standard Tailwind/Shadcn) makes the code less portable.
- **Mixed Styling**: `LoginPage` uses a manual container-style approach rather than the Shadcn `Card` or `Form` components.
- **Custom Scrollbars**: Custom scrollbar styles in `globals.css` are using absolute hex/variable names rather than the design tokens.

## 🔴 Discrepancies (To Be Fixed)
- **Hardcoded Colors**: Found `bg-red-500/10` and `border-success/20` in some components. These should ideally use theme tokens like `destructive` or `success` (if defined in Tailwind).
- **Layout Consistency**: `AppShell` (checked later) needs to ensure it provides a consistent navigation experience across all modules.

## Recommendations
1. **Standardize Variables**: Refactor `bg-surface-2` to use `secondary` or a custom `muted` token that is standard in the design system.
2. **Refactor Login**: Move the `LoginPage` to use Shadcn `Form` and `Input` for better consistency.
3. **Stitch Sync**: Use the upcoming Stitch generation to establish a "Silver-Standard" layout that all pages can inherit.
