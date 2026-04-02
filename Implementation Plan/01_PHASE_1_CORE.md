# 🚀 Phase 1: Core Foundation Implementation Plan

## Overview
This phase implements the bare essentials needed to turn the current Call Center SaaS into an operational, true B2B CRM. It provisions 15 critical database tables handling Companies, Products, Billing, Custom Fields, and Calendars. 

## Architectural Split: Postgres vs MongoDB
*   **Postgres**: Will securely house 99% of Phase 1 (Company, Invoice, Product, CustomField mappings).
*   **MongoDB**: Reserved for unstructured data later. Phase 1 relies exclusively on Postgres for absolute relational data integrity.

## Technical Execution Plan

### 1. Prisma DB Schema Merging
*   Open `schema.prisma`.
*   Inject the `Company`, `ProductCategory`, `Product`, `Invoice`, `InvoiceLine`, `Payment`, `CalendarEvent`, `EventAttendee`, `EmailTemplate`, `CustomField`, `CustomFieldValue`, `BusinessHours`, `BusinessHourSlot`, `Holiday`, and `NumberSequence` models exactly as defined in the `TODO` specs.
*   Update `Lead` to link to `Company` using `companyId String?`.
*   Run `npx prisma db push` to synchronize local DB without wiping data.

### 2. NestJS Backend Generation
*   Run Nest CLI commands to scaffold REST Modules:
    *   `companies`, `products`, `invoices`, `payments`, `calendar`, `email-templates`, `custom-fields`. 
*   In `invoices.service.ts`, implement the PDF generation and auto-increment NumberSequence handler.
*   In `custom-fields.service.ts`, bind the logic to inject/read unstructured `JSONB` fields natively stored on existing Models.

### 3. Next.js App Router (Frontend)
*   **Companies Page** (`/companies`): Grid View, Create Side-drawer. Include a relation section showing linked Deals & Leads.
*   **Products Page** (`/products`): Split screen - Categories on left, Product grid on right. 
*   **Invoicing Page** (`/invoices`): Dashboard tracking outstanding balances, PDF view component, and an "Add Payment" modal that synchronizes with the `payments` state.
*   **Calendar Dashboard** (`/calendar`): Integration with `react-big-calendar` or a similar grid displaying Meetings and Follow-up Calls.
*   Update the Sidebar in `AppShell.tsx` to include `Buildings` (Companies), `Package` (Products), `Receipt` (Invoices), and `CalendarDays` icons.

## Definition of Done
Phase 1 is complete when all items in section "Phase 1: Critical Foundation" in the Master Checklist are marked as `[x]`, and the CRM can fundamentally process product-based quotes and invoice generation.
