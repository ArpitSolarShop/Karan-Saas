# 🤖 Phase 3: Automation & Integrations Plan

## Overview
Based on `TODO/08_INTEGRATION_IDEAS.md` and `TODO/09_AUTOMATION_WORKFLOWS.md`, Phase 3 turns the UI-driven CRM into an intelligent, event-driven engine that automates background tasks.

## Technical Execution Plan

### 1. Database & Architecture (NestJS)
*   **Workflow Engine (TCA)**: Create `Workflow`, `WorkflowCondition`, `WorkflowAction` Postgres models.
*   **Event-Driven Bus**: Implement `@nestjs/event-emitter`. Every action (create lead, win deal, answer call) emits a typed internal event.
*   **Approval Workflows**: Add multi-step manager approval chains for things like high-value quotes or massive discounts.

### 2. Core Integrations
*   **Email Sync (IMAP/SMTP)**: Cron jobs to poll generic IMAP accounts to parse inbound threads and attach them to contacts.
*   **Payment Gateway Sync**: Implementing Razorpay checkout links onto the `Invoices` generated in Phase 1.
*   **n8n Wire-up**: Connect NestJS outbound webhooks to the existing n8n Docker instance for drag-and-drop third-party logic.
*   **Mass Email/Autoresponders**: Basic drip campaign models.

### 3. Frontend App Additions
*   **Web Forms Builder**: Drag-and-drop embeddable lead capture form builder mimicking Typeform. Generates an iframe or JS snippet.
*   **Workflow UI**: A rule builder interface indicating triggers (`ON_CREATE`), conditions (`AMOUNT > 5000`), and actions (`SEND_EMAIL`).
