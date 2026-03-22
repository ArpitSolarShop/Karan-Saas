# Official WhatsApp Cloud API — Developer Knowledge Guide
**For Humans 🧑‍💻 and AI Agents 🤖**

> This document is a self-contained knowledge base for working with the official Meta WhatsApp Cloud API inside the Karan-Saas project. Refer to this for context, patterns, and troubleshooting.

---

## 1. Architecture Overview: Dual-Engine Design

Karan-Saas runs **two WhatsApp engines in parallel**, selected per-instance via the `connectionType` field:

```
┌──────────────────────────────────────────────────────────┐
│                    WhatsApp Module                        │
│                                                          │
│  ┌─────────────────┐       ┌──────────────────────────┐  │
│  │ BaileysEngine    │       │ CloudApiService           │  │
│  │ (QR Scan,        │       │ (Official Meta Graph API) │  │
│  │  Reverse-Eng.)   │       │                          │  │
│  │                  │       │ POST graph.facebook.com   │  │
│  │ connectionType:  │       │ connectionType:           │  │
│  │ BAILEYS_NATIVE   │       │ CLOUD_API                 │  │
│  └─────────────────┘       └──────────────────────────┘  │
│                    ↑                    ↑                  │
│                    └────── router ──────┘                  │
│                 (based on instance.connectionType)         │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ WhatsappGateway (Socket.io)                         │  │
│  │ Pushes QR codes + messages to Next.js frontend      │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 2. Official Meta Graph API Reference

### Base URL
```
https://graph.facebook.com/v21.0
```

### Authentication
All requests require:
```
Authorization: Bearer {PERMANENT_ACCESS_TOKEN}
```
> **NEVER use temporary tokens in production.** Create a System User in Meta Business Manager → grant admin access to the WABA → generate a permanent token.

### 2.1 Send Text Message
```
POST /{PHONE_NUMBER_ID}/messages

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "919876543210",
  "type": "text",
  "text": { "preview_url": false, "body": "Hello!" }
}
```

### 2.2 Send Template Message
Required for initiating conversations outside the 24-hour service window:
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "parameter_name": "first_name", "text": "Karan" }
        ]
      }
    ]
  }
}
```

### 2.3 Send Media (Image/Document/Video)
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "image",
  "image": { "link": "https://example.com/photo.jpg", "caption": "Check this out" }
}
```

### 2.4 Template Management
```
POST /{WABA_ID}/message_templates — Create template
GET  /{WABA_ID}/message_templates — List all templates
```

**Template categories:** `MARKETING`, `UTILITY`, `AUTHENTICATION`

## 3. Webhook Reference

### 3.1 Verification (GET)
Meta sends a GET request when you register the webhook URL:
```
GET /whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```
Your server MUST return the `hub.challenge` value as plain text.

### 3.2 Incoming Messages (POST)
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "<WABA_ID>",
    "changes": [{
      "field": "messages",
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "1234567890"
        },
        "contacts": [{ "profile": { "name": "User" }, "wa_id": "919876543210" }],
        "messages": [{
          "from": "919876543210",
          "id": "wamid.HBgL...",
          "timestamp": "1658254144",
          "type": "text",
          "text": { "body": "Hello!" }
        }]
      }
    }]
  }]
}
```

### 3.3 Status Updates (delivery/read receipts)
```json
{
  "statuses": [{
    "id": "wamid...",
    "status": "delivered",  // sent | delivered | read | failed
    "timestamp": "1658254144",
    "recipient_id": "919876543210"
  }]
}
```

## 4. Pricing Summary (As of 2026)
| Category | Charged? |
|----------|----------|
| **Template messages** (marketing/utility/auth) | ✅ Per-message, varies by country & category |
| **Non-template messages** (text, image, etc.) within 24h window | ❌ FREE |
| **Utility templates** within 24h window | ❌ FREE |
| **All messages within 72h free entry point window** | ❌ FREE |

## 5. Embedded Signup (For SaaS Multi-Tenant)
If you want your SaaS customers to connect their own WhatsApp numbers:
1. Implement the Meta Embedded Signup flow
2. Customer authenticates, connects their WABA
3. You receive their `phoneNumberId`, `wabaId`, and exchange the code for a token
4. Store these in the `WhatsAppInstance` record

## 6. Key Files in the Project
| File | Purpose |
|------|---------|
| `backend/src/whatsapp/baileys.service.ts` | Baileys engine (existing, complete) |
| `backend/src/whatsapp/cloud-api.service.ts` | Cloud API engine (NEW) |
| `backend/src/whatsapp/cloud-api-webhook.controller.ts` | Meta webhook handler (NEW) |
| `backend/src/whatsapp/whatsapp.controller.ts` | Unified REST controller |
| `backend/src/whatsapp/whatsapp.gateway.ts` | Socket.io for real-time frontend |
| `backend/prisma/schema.prisma` | Database models |
| `frontend/src/app/settings/whatsapp/page.tsx` | Instance settings UI |
| `frontend/src/app/whatsapp/inbox/[jid]/page.tsx` | Chat inbox UI |

## 7. Troubleshooting
- **Webhook not receiving messages?** Check that Meta App is in **Live** mode, webhook URL is HTTPS, and `messages` field is subscribed.
- **Template rejected?** Ensure content follows Meta's commerce policy. Marketing templates need business verification.
- **401 on Graph API?** Token expired or wrong permissions. Generate new System User token.
- **Rate limiting?** Meta enforces messaging limits per quality tier. Start with 250 messages/24h.
