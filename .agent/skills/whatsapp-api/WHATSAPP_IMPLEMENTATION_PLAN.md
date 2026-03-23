# WhatsApp Official Cloud API Integration — Implementation Plan

## Context & Problem

The **Karan-Saas** project already has a fully-built Baileys (reverse-engineered) WhatsApp engine:

| File | Purpose | Status |
|------|---------|--------|
| `backend/src/whatsapp/baileys.service.ts` | Core Baileys socket engine (QR, reconnect, message persist) | ✅ Complete |
| `backend/src/whatsapp/prisma-auth-store.ts` | PostgreSQL-backed auth state for Baileys | ✅ Complete |
| `backend/src/whatsapp/whatsapp.gateway.ts` | Socket.io gateway (QR push, message push to frontend) | ✅ Complete |
| `backend/src/whatsapp/whatsapp.controller.ts` | REST API for instances & send text | ✅ Complete |
| `backend/src/communications/whatsapp-client.service.ts` | Alternative multi-session client (text, image, doc, broadcast) | ✅ Complete |
| `backend/src/communications/providers/whatsapp.service.ts` | Thin proxy to WhatsAppClientService | ✅ Complete |
| `backend/src/queue/processors/whatsapp-blast.processor.ts` | Bull queue processor for campaigns | ✅ Complete |
| `frontend/src/hooks/useWhatsappSocket.ts` | React hook for real-time QR & messages | ✅ Complete |
| `frontend/src/app/settings/whatsapp/page.tsx` | Instance management UI (create, QR scan, disconnect) | ✅ Complete |
| `frontend/src/app/whatsapp/inbox/[jid]/page.tsx` | Chat inbox UI | ✅ Complete |
| `backend/prisma/schema.prisma` (lines 992-1076) | `WhatsAppInstance`, `WhatsAppMessage`, `WhatsAppContact`, `WhatsAppAuthState` | ✅ Complete |

The Prisma schema already includes `WaConnectionType` enum with **both** `CLOUD_API` and `BAILEYS_NATIVE`, and `WhatsAppInstance` has `phoneNumberId`, `wabaId`, `accessToken` fields. **But the `CLOUD_API` path is completely unimplemented.**

**Goal:** Implement the official Meta WhatsApp Cloud API engine alongside the existing Baileys engine. Both should coexist — the instance's `connectionType` determines which engine handles it.

---

## Pre-requisites (Manual Steps)

> **WARNING: You must do these steps manually before the Cloud API will work:**
> 1. Create a Meta Developer App at https://developers.facebook.com/apps
> 2. Add the "WhatsApp" product use case
> 3. Link a WhatsApp Business Account (WABA)
> 4. Create a System User → generate a permanent access token
> 5. Expose the backend via HTTPS (e.g., ngrok) for webhook verification

---

## Proposed Changes

### 1. Backend — New Cloud API Engine Service

#### [NEW] `backend/src/whatsapp/cloud-api.service.ts`

Self-sufficient service using only `axios` (already in project) to hit `graph.facebook.com/v21.0`:

- **`sendTextMessage(instanceId, to, text)`** — POST to `/{phoneNumberId}/messages`
- **`sendTemplateMessage(instanceId, to, templateName, langCode, components)`** — Template messages for conversations outside 24h window
- **`sendMediaMessage(instanceId, to, type, mediaUrl|mediaId, caption)`** — Images, documents, video
- **`getTemplates(wabaId, accessToken)`** — GET templates from `/{wabaId}/message_templates`
- **`createTemplate(wabaId, accessToken, templateData)`** — POST new template
- **`getPhoneNumbers(wabaId, accessToken)`** — List registered phone numbers

---

### 2. Backend — Webhook Controller

#### [NEW] `backend/src/whatsapp/cloud-api-webhook.controller.ts`

- **`GET /whatsapp/webhook`** — Meta verification endpoint (returns `hub.challenge`)
- **`POST /whatsapp/webhook`** — Receives incoming messages, status updates, read receipts
  - Persists to `WhatsAppMessage` table
  - Upserts `WhatsAppContact`
  - Emits to `WhatsappGateway` for real-time frontend updates
  - Logs to CRM `Activity` table

---

### 3. Backend — Update Existing Module & Controller

#### [MODIFY] `backend/src/whatsapp/whatsapp.module.ts`

- Add `CloudApiService` as a provider
- Add `CloudApiWebhookController` as a controller
- Add `HttpModule` (from `@nestjs/axios`) import

#### [MODIFY] `backend/src/whatsapp/whatsapp.controller.ts`

- Add `POST instances` with `connectionType: 'CLOUD_API'` support (accepts `phoneNumberId`, `wabaId`, `accessToken`)
- Add `POST send/text` that routes to **Cloud API** when instance type is `CLOUD_API`
- Add `POST send/template` endpoint
- Add `POST send/media` endpoint
- Add `GET templates/:instanceId` endpoint
- Add `GET phone-numbers/:instanceId` endpoint

---

### 4. Backend — Prisma Schema Enhancement

#### [MODIFY] `backend/prisma/schema.prisma`

Add to `WhatsAppInstance`:
- `webhookVerifyToken String?` — for Meta webhook verification
- `businessName String?` — display name from WABA

Add new model:
```prisma
model WhatsAppTemplate {
  id           String           @id @default(cuid())
  instanceId   String
  instance     WhatsAppInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  templateId   String           // Meta's template ID
  name         String
  category     String           // MARKETING, UTILITY, AUTHENTICATION
  language     String
  status       String           // APPROVED, PENDING, REJECTED
  components   Json
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  
  @@unique([instanceId, name, language])
  @@map("whatsapp_templates")
}
```

---

### 5. Backend — Environment Variables

#### [MODIFY] `.env` / `.env.example`

```env
# Meta WhatsApp Cloud API (per-instance values stored in DB)
META_GRAPH_API_VERSION=v21.0
META_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
META_APP_SECRET=your_meta_app_secret
```

---

### 6. Frontend — Settings Page Enhancement

#### [MODIFY] `frontend/src/app/settings/whatsapp/page.tsx`

- Add a toggle/tabs: "Baileys (QR Scan)" vs "Cloud API (Official)"
- Cloud API form: inputs for `phoneNumberId`, `wabaId`, `accessToken`
- Show template management panel for Cloud API instances
- Keep existing Baileys QR scan flow intact

#### [MODIFY] `frontend/src/app/whatsapp/inbox/[jid]/page.tsx`

- Detect instance type, show template picker for Cloud API instances
- Both engine types feed the same chat UI

---

### 7. Knowledge Skill Document

#### [NEW] `WHATSAPP_CLOUD_API_GUIDE.md` (already created)

Comprehensive reference for humans and AI agents covering:
- Architecture overview (dual-engine design)
- Meta Graph API endpoints and payload formats
- Webhook payload structure
- Pricing model summary
- Template management guide
- Embedded Signup flow reference
- Troubleshooting guide

---

## Verification Plan

### Automated Tests
1. Start NestJS server, verify `GET /whatsapp/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=test123` returns `test123`
2. Send simulated `POST /whatsapp/webhook` with Meta's documented message payload, verify DB persistence
3. Verify `POST /whatsapp/send/text` for Cloud API instance constructs correct Graph API request

### Manual Verification
1. Configure Meta App Dashboard with your ngrok URL as webhook
2. Send a test template message to your phone
4. Verify real-time frontend update via Socket.io

---

## Phase 8: Embedded Signup (Frictionless SaaS User Onboarding)

**Context:** The end-user of this SaaS product is a non-technical business owner. They cannot be expected to navigate the Meta Developer Dashboard to get `wabaId` or `accessToken`. To solve this, Meta provides **Embedded Signup**.

### The Frictionless Flow:
1. The user clicks "Connect Official WhatsApp" in the SaaS UI.
2. A Facebook popup opens (using the Facebook SDK).
3. The user logs in and grants permissions.
4. The frontend receives an `accessToken` and passes it to the backend.
5. The backend (`cloud-api.service.ts`) fetches the `wabaId` and `phoneNumberId` automatically via the Graph API and connects the instance without the user typing any IDs.

### Backend Requirements:
- **`POST /whatsapp/embedded-signup`**: Receives the Facebook access token.
- **`cloud-api.service.ts` updates**: Add helper functions to query `/me/accounts` or the specific endpoints to auto-discover the user's provisioned Phone Number ID and WABA ID. Create the `WhatsAppInstance` record automatically.

### Frontend Requirements:
- Include the Facebook JavaScript SDK in the Next.js app (`window.FB`).
- Add the "Login with Facebook" button triggering the Embedded Signup flow with scopes: `whatsapp_business_management`, `whatsapp_business_messaging`.
- Send the resulting `accessToken` to the new backend endpoint.
