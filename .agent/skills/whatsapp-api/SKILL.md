---
name: whatsapp-api
description: >
  Comprehensive knowledge base for integrating WhatsApp with a NestJS/Next.js/PostgreSQL stack.
  Covers both the official Meta WhatsApp Cloud API and the reverse-engineered Baileys/WAHA/WPPConnect 
  protocol approaches. Use this skill when building WhatsApp messaging, automation, chatbot, 
  or CRM integration features.
---

# WhatsApp API Integration Skill

## Overview: Two Major Approaches

There are two fundamentally **different** strategies for WhatsApp integration. Choose carefully.

---

## Approach 1: Official Meta WhatsApp Cloud API (RECOMMENDED FOR BUSINESS)

### What it is
The official Meta/Facebook API. Requires a verified Meta Business Account.

### Key Concepts
- **Phone Number ID**: Identifies your WhatsApp Business number
- **WABA ID**: WhatsApp Business Account ID
- **Access Token**: System User token from Meta Business Manager
- **Webhook**: Meta calls your HTTPS endpoint when messages arrive
- **Templates (HSM)**: Pre-approved message formats required for outbound contact initiation

### Prerequisites
1. Facebook Developer Account
2. Meta App → WhatsApp product added
3. WhatsApp Business Account (WABA)
4. Verified Business phone number
5. System User + Permanent Access Token (never expose this)
6. HTTPS Webhook endpoint for receiving messages

### REST API Endpoints

```
Base URL: https://graph.facebook.com/v20.0/

# Send Message
POST /{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "91XXXXXXXXXX",
  "type": "text",
  "text": { "body": "Hello!" }
}

# Send Template Message  
POST /{PHONE_NUMBER_ID}/messages
{
  "messaging_product": "whatsapp",
  "to": "91XXXXXXXXXX",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "en_US" }
  }
}

# Send Image
POST /{PHONE_NUMBER_ID}/messages
{
  "messaging_product": "whatsapp",
  "to": "91XXXXXXXXXX",
  "type": "image",
  "image": { "link": "https://example.com/image.jpg" }
}

# Mark Message as Read
POST /{PHONE_NUMBER_ID}/messages
{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "wamid.xxxxx"
}
```

### Webhook Setup (NestJS)
```typescript
// NestJS Controller
@Controller('whatsapp/webhook')
export class WhatsAppWebhookController {
  // Meta calls this to verify your webhook
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
      res.send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  // Meta POSTs incoming messages here
  @Post()
  receive(@Body() body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (messages?.[0]) {
      // Handle incoming message
      const message = messages[0];
      // message.type: 'text', 'image', 'audio', 'document', etc.
    }
  }
}
```

### Message Types Supported
| Type | Description |
|------|-------------|
| text | Plain text messages |
| template | Pre-approved HSM templates |
| image | JPEG/PNG images |
| audio | MP3/OGG/AAC audio |
| video | MP4 video |
| document | PDF, DOCX, XLSX, etc. |
| location | Lat/Lng coordinates |
| contacts | vCard contact info |
| interactive | Buttons, Lists (call-to-action) |
| reaction | Emoji reactions |
| sticker | WebP stickers |

### Pricing (India)
- Business-initiated conversations: ~₹0.75 per conversation (24hr window)
- User-initiated conversations: ~₹0.25 per conversation (24hr window)
- Template messages always count as business-initiated
- Free tier: 1,000 conversations/month

### Limitations
- Cannot send templates without pre-approval from Meta
- 24-hour window for free-form messages (after user initiates)
- Rate limits: 250 messages/second per phone number
- Phone numbers must be verified

---

## Approach 2: Reverse-Engineered WhatsApp Web Protocol (For Personal/Scale Use)

> ⚠️ **LEGAL WARNING**: This approach violates WhatsApp's Terms of Service. Accounts can be banned. Do NOT use for spam. For CRM use, Meta Cloud API is strongly recommended.

### Library Comparison

| Library | Language | Protocol | Resource Use | TOS Risk |
|---------|----------|----------|--------------|----------|
| **Baileys** | TypeScript | WebSocket multi-device | Low (no Chromium) | HIGH |
| **whatsapp-web.js** | JavaScript | Puppeteer/Chromium | High (browser) | HIGH |
| **WPPConnect** | JavaScript | Puppeteer-based | High | HIGH |
| **venom-bot** | JavaScript | Puppeteer-based | High | HIGH |
| **whatsmeow** | Go | WebSocket multi-device | Very low | HIGH |
| **go-whatsapp-web-multidevice** | Go | whatsmeow wrapper | Low | HIGH |
| **WAHA** | TypeScript/Docker | REST API wrapper | Medium | HIGH |
| **Evolution API** | NestJS/TypeScript | Baileys REST API | Medium | HIGH |

### Best Choice: **Evolution API** (for REST-based integration)
Evolution API is a production-grade NestJS REST API that wraps Baileys. It exposes clean HTTP endpoints for all WhatsApp actions.

#### Evolution API Key Concepts
- **Instance**: One WhatsApp account connection (authenticated via QR or Pairing Code)
- **Session**: Encrypted auth state stored in PostgreSQL
- **Webhook**: Your endpoint that Evolution API calls on events

#### Evolution API Prisma Schema (Key Models)
```prisma
model Instance {
  id               String   @id @default(cuid())
  name             String   @unique
  connectionStatus Enum     // open | close | connecting
  ownerJid         String?  // Phone number JID
  integration      String?  // "WHATSAPP-BAILEYS" | "WHATSAPP-BUSINESS"
}

model Chat {
  instanceId  String
  remoteJid   String   // phoneNumber@s.whatsapp.net
  name        String?
  unreadMessages Int   @default(0)
}

model Message {
  instanceId   String
  key          Json    // {id, remoteJid, fromMe}
  messageType  String  // text | imageMessage | audioMessage...
  message      Json    // full message object
  status       String? // PENDING | PLAYED | READ | DELIVERY_ACK
}
```

#### Baileys Core Usage (TypeScript)
```typescript
import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

// Connect
const { state, saveCreds } = await useMultiFileAuthState('auth_info');
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true,
  markOnlineOnConnect: false,
});

// Save session on update
sock.ev.on('creds.update', saveCreds);

// Handle connection state
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'close') {
    const shouldReconnect = 
      (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
    if (shouldReconnect) connectToWhatsApp();
  }
});

// Receive messages
sock.ev.on('messages.upsert', ({ messages }) => {
  for (const m of messages) {
    // m.message.conversation = text | m.message.imageMessage = image...
  }
});

// Send messages
await sock.sendMessage('919876543210@s.whatsapp.net', {
  text: 'Hello!'
});

// Send image
await sock.sendMessage(jid, {
  image: { url: 'https://example.com/img.jpg' },
  caption: 'My image'
});
```

---

## Recommended Architecture for CRM Integration

### Dual-Mode Strategy
Use **both** in tandem:
1. **Evolution API** (Baileys) for internal team operations (unofficial, no approval required)
2. **Meta Cloud API** for customer-facing messaging (official, approved templates)

### NestJS Module Structure
```
backend/src/
  whatsapp/
    whatsapp.module.ts
    whatsapp.controller.ts     # Webhook receiver + send endpoints
    whatsapp.service.ts        # Core send/receive logic
    cloud-api.service.ts       # Meta Cloud API HTTP calls
    baileys.service.ts         # Baileys WebSocket management
    dto/
      send-message.dto.ts
      webhook-payload.dto.ts
    
  whatsapp-templates/
    templates.module.ts
    templates.service.ts       # CRUD for message templates
    templates.controller.ts
```

### PostgreSQL Schema (Add to Karan SaaS)
```prisma
model WhatsAppInstance {
  id               String   @id @default(cuid())
  tenantId         String
  name             String   @unique
  phoneNumber      String?
  connectionType   String   // "CLOUD_API" | "BAILEYS"
  connectionStatus String   @default("disconnected")
  phoneNumberId    String?  // Meta Cloud API
  wabaId           String?  // Meta WABA ID
  accessToken      String?  // Encrypted
  sessionCreds     String?  // Baileys auth (encrypted JSON)
  webhookSecret    String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  tenant           Tenant   @relation(fields:[tenantId], references:[id])
  messages         WhatsAppMessage[]
  contacts         WhatsAppContact[]
}

model WhatsAppMessage {
  id           String   @id @default(cuid())
  instanceId   String
  direction    String   // "INBOUND" | "OUTBOUND"
  messageId    String?  // WA message ID
  jid          String   // remoteJid (phone@s.whatsapp.net)
  type         String   // text | image | audio | document
  content      Json     // {text} | {mediaUrl, caption} etc.
  status       String   @default("PENDING")
  sentAt       DateTime?
  deliveredAt  DateTime?
  readAt       DateTime?
  createdAt    DateTime @default(now())
  leadId       String?  // Link to CRM Lead
  instance     WhatsAppInstance @relation(...)
}

model WhatsAppContact {
  id          String   @id @default(cuid())
  instanceId  String
  jid         String
  name        String?
  profilePic  String?
  leadId      String?  // Link to CRM Lead
  instance    WhatsAppInstance @relation(...)
  @@unique([instanceId, jid])
}

model WhatsAppTemplate {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  category    String   // UTILITY | MARKETING | AUTHENTICATION
  language    String   @default("en_US")
  status      String   @default("PENDING")  // PENDING | APPROVED | REJECTED
  components  Json     // Header, Body, Footer, Buttons
  metaId      String?  // ID from Meta after approval
  createdAt   DateTime @default(now())
}
```

---

## Frontend: Next.js WhatsApp Inbox (shadcn/ui + Tailwind)

### Pages to Build
- `/settings/whatsapp` — Connect/disconnect instances, manage tokens
- `/inbox` — WhatsApp conversation inbox (already exists, enhance it)
- `/settings/whatsapp/templates` — Template management dashboard

### Key UI Components
```tsx
// WhatsApp QR Scanner
'use client'
function QRScanner({ instanceId }: { instanceId: string }) {
  const [qr, setQr] = useState<string | null>(null);
  
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.on(`qr:${instanceId}`, (data: { qr: string }) => {
      setQr(data.qr);
    });
    socket.on(`connected:${instanceId}`, () => setQr(null));
    return () => { socket.disconnect(); };
  }, [instanceId]);
  
  return qr ? <QRCodeSVG value={qr} size={256} /> : <ConnectedBadge />;
}
```

---

## Security Best Practices

1. **Never store raw tokens in DB** — encrypt with `crypto.createCipheriv`
2. **Webhook Verification**: Always validate `X-Hub-Signature-256` header from Meta
3. **Rate Limiting**: Apply `@nestjs/throttler` to all `/whatsapp/send` endpoints
4. **Session Encryption**: Encrypt Baileys `creds` JSON before storing in PostgreSQL
5. **HTTPS Only**: Meta Cloud API webhooks require HTTPS with valid certificate

## Official Documentation Links
- Main: https://developers.facebook.com/docs/whatsapp
- Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Get Started: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Messages Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
- Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- Templates: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
- Phone Numbers: https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers
- Pricing: https://developers.facebook.com/docs/whatsapp/pricing

## Reference Projects (Local)
All projects are at: `C:\Users\arpit\OneDrive\Desktop\whats app bussiness api\`
- `Baileys/` — TypeScript WebSocket library (core protocol)
- `evolution-api/` — NestJS REST API over Baileys (BEST reference)
- `whatsapp-web.js/` — Puppeteer-based Node.js library
- `wppconnect/` — Another Puppeteer-based option
- `wppconnect-server/` — REST server for wppconnect
- `waha/` — Docker-based HTTP API (easiest to run)
- `whatsmeow/` — Go implementation (lowest resource use)
- `go-whatsapp-web-multidevice/` — Go REST API wrapper
- `venom/` — Node.js library (Puppeteer-based)
- `wa-automate-nodejs/` — Node.js automation library
- `wa-js/` — Frontend JS injection library
- `matterbridge/` — Multi-protocol bridge (Go)
- `whatsapp-web-reveng/` — Protocol reverse engineering reference
- `Super-Light-Web-WhatsApp-API-Server/` — Lightweight REST wrapper

## Migrated Project Resources
The following implementation guides and checklists have been migrated from the project root into this knowledge base for safekeeping:
- [WhatsApp Cloud API Guide](./WHATSAPP_CLOUD_API_GUIDE.md)
- [WhatsApp Implementation Plan](./WHATSAPP_IMPLEMENTATION_PLAN.md)
- [WhatsApp Task Checklist](./WHATSAPP_TASK_CHECKLIST.md)
