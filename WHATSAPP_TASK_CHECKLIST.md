# WhatsApp Business API — Task Checklist

> **Last Updated:** 2026-03-22
> **Project:** Karan-Saas
> **Status Legend:** `[x]` Done | `[/]` In Progress | `[ ]` To Do

---

## Phase 1: Research & Planning
- [x] Analyze project directory and existing open-source WhatsApp API projects
- [x] Deep-dive into Karan-Saas project to find existing WhatsApp code
- [x] Read ALL official Facebook WhatsApp Cloud API docs
  - [x] Get Started & Overview (https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
  - [x] Pricing (https://developers.facebook.com/docs/whatsapp/pricing)
  - [x] Embedded Signup (https://developers.facebook.com/docs/whatsapp/embedded-signup)
  - [x] System Users (https://developers.facebook.com/docs/whatsapp/business-management-api/system-users)
  - [x] Phone Numbers (https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers)
  - [x] Message Templates (https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
  - [x] Webhooks (https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
  - [x] Messages Reference (https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages)
- [x] Create knowledge guide `WHATSAPP_CLOUD_API_GUIDE.md` in project folder
- [x] Create comprehensive `WHATSAPP_IMPLEMENTATION_PLAN.md`

## Phase 2: Backend — Cloud API Engine
- [x] Create `backend/src/whatsapp/cloud-api.service.ts`
  - [x] `sendTextMessage(instanceId, to, text)`
  - [x] `sendTemplateMessage(instanceId, to, templateName, langCode, components)`
  - [x] `sendMediaMessage(instanceId, to, type, mediaUrl, caption)`
  - [x] `getTemplates(wabaId, accessToken)`
  - [x] `createTemplate(wabaId, accessToken, templateData)`
  - [x] `getPhoneNumbers(wabaId, accessToken)`
- [x] Create `backend/src/whatsapp/cloud-api-webhook.controller.ts`
  - [x] GET `/whatsapp/webhook` — Meta verification endpoint
  - [x] POST `/whatsapp/webhook` — Incoming messages, status updates, read receipts
  - [x] Persist incoming messages to `WhatsAppMessage` table
  - [x] Upsert `WhatsAppContact`
  - [x] Emit to `WhatsappGateway` (Socket.io) for real-time frontend
  - [x] Log to CRM `Activity` table
- [x] Update `backend/src/whatsapp/whatsapp.module.ts`
  - [x] Add `CloudApiService` provider
  - [x] Add `CloudApiWebhookController` controller
  - [x] Add `@nestjs/config` globally
- [x] Update `backend/src/whatsapp/whatsapp.controller.ts`
  - [x] Support `connectionType: 'CLOUD_API'` in instance creation
  - [x] Route `POST send/text` by connectionType
  - [x] Add `POST send/template` endpoint
  - [x] Add `POST send/media` endpoint
  - [x] Add `GET templates/:instanceId` endpoint
  - [x] Add `GET phone-numbers/:instanceId` endpoint

## Phase 3: Database — Prisma Schema
- [x] Add new fields to `WhatsAppInstance`
  - [x] `webhookVerifyToken String?`
  - [x] `businessName String?`
- [x] Add `WhatsAppTemplate` model
- [x] Add `templates WhatsAppTemplate[]` relation to `WhatsAppInstance`
- [x] Run `npx prisma generate` & migrate

## Phase 4: Frontend — Settings Page
- [x] Add Cloud API / Baileys toggle tabs to `frontend/src/app/settings/whatsapp/page.tsx`
- [x] Add Cloud API config form (phoneNumberId, wabaId, accessToken inputs)
- [x] Add template management panel (list, create, status)
- [x] Keep existing Baileys QR scan flow intact and auto-connecting

## Phase 5: Frontend — Inbox
- [x] Update `frontend/src/app/whatsapp/inbox/[jid]/page.tsx` to handle both engine types
- [x] Add template picker for Cloud API instances
- [x] Unified chat UI for both engines

## Phase 6: Environment
- [x] Added `META_WEBHOOK_VERIFY_TOKEN` and `META_GRAPH_API_VERSION` requirements

## Phase 7: Verification (User Action Required)
- [ ] Test `GET /whatsapp/webhook` verification endpoint (via Meta Dashboard)
- [ ] Test real `POST /whatsapp/webhook` incoming message (Send message from personal phone)
- [ ] Test `POST /whatsapp/send/text` via Cloud API (Reply from Inbox UI)
- [ ] End-to-end test with real Meta App Dashboard + ngrok

## Phase 8: Embedded Signup (Frictionless Onboarding)
- [x] **Backend:** Add `POST /whatsapp/embedded-signup` endpoint
- [x] **Backend:** Fetch `wabaId` and `phoneNumberId` via Graph API
- [x] **Backend:** Auto-provision `WhatsAppInstance`
- [x] **Frontend:** Integrate Facebook JS SDK
- [x] **Frontend:** Add "Login with Facebook" Embedded Signup button

---

## Key Files Reference

| File | Engine | Purpose |
|------|--------|---------|
| `backend/src/whatsapp/baileys.service.ts` | Baileys | Core socket engine |
| `backend/src/whatsapp/prisma-auth-store.ts` | Baileys | PostgreSQL auth state |
| `backend/src/whatsapp/cloud-api.service.ts` | Cloud API | **NEW** — Graph API service |
| `backend/src/whatsapp/cloud-api-webhook.controller.ts` | Cloud API | **NEW** — Meta webhook handler |
| `backend/src/whatsapp/whatsapp.gateway.ts` | Both | Socket.io real-time gateway |
| `backend/src/whatsapp/whatsapp.controller.ts` | Both | Unified REST controller |
| `backend/src/whatsapp/whatsapp.module.ts` | Both | NestJS module |
| `backend/prisma/schema.prisma` | Both | Database models |
| `frontend/src/hooks/useWhatsappSocket.ts` | Both | React hook |
| `frontend/src/app/settings/whatsapp/page.tsx` | Both | Settings UI |
| `frontend/src/app/whatsapp/inbox/[jid]/page.tsx` | Both | Chat inbox UI |
| `WHATSAPP_CLOUD_API_GUIDE.md` | Cloud API | Knowledge guide |
| `WHATSAPP_IMPLEMENTATION_PLAN.md` | Cloud API | Detailed plan |
| `WHATSAPP_TASK_CHECKLIST.md` | Cloud API | This checklist |
