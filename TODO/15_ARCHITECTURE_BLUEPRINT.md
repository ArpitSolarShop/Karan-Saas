# 🏗️ Architecture Blueprint — Tele CRM → Karan SaaS Integration

> **Purpose**: Define exactly how each of the 13 telephony/CRM repos should be integrated into Karan SaaS  
> **Stack**: NestJS + Next.js + PostgreSQL (Prisma) + Redis + Asterisk

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KARAN SAAS PLATFORM                        │
├─────────────┬──────────────┬──────────────┬─────────────────────────┤
│  FRONTEND   │   API LAYER  │   SERVICES   │     INFRASTRUCTURE     │
│  (Next.js)  │   (NestJS)   │              │                        │
├─────────────┼──────────────┼──────────────┼─────────────────────────┤
│             │              │              │                        │
│ Agent       │ REST API     │ CRM Core     │ PostgreSQL (Prisma)    │
│ Console     │ (controllers)│ Module       │   ├─ accounts          │
│             │              │              │   ├─ contacts          │
│ Supervisor  │ WebSocket    │ Telephony    │   ├─ conversations     │
│ Dashboard   │ Gateway      │ Module       │   ├─ messages          │
│             │              │              │   ├─ campaigns         │
│ Admin       │ GraphQL      │ Omnichannel  │   ├─ telephony_*       │
│ Panel       │ (optional)   │ Module       │   └─ ... (174 tables)  │
│             │              │              │                        │
│ Customer    │ Webhook      │ Campaign     │ Redis                  │
│ Widget      │ Engine       │ Engine       │   ├─ sessions          │
│             │              │              │   ├─ cache             │
│ WebRTC      │              │ AI Agent     │   ├─ pub/sub           │
│ Softphone   │              │ Module       │   └─ BullMQ queues     │
│             │              │              │                        │
│             │              │ Automation   │ Asterisk / FreeSWITCH  │
│             │              │ Engine       │   ├─ ARI (REST)        │
│             │              │              │   ├─ AMI (TCP)         │
│             │              │ Reporting    │   └─ WebSocket events  │
│             │              │ Engine       │                        │
│             │              │              │ S3 / MinIO             │
│             │              │ Workforce    │   ├─ recordings        │
│             │              │ Module       │   ├─ attachments       │
│             │              │              │   └─ fax documents     │
└─────────────┴──────────────┴──────────────┴─────────────────────────┘
```

---

## 2. Module-by-Module Integration Map

### 2.1 Telephony Core Module (from Asterisk + FreePBX + Wazo)

**Source Repos**: Asterisk, FreePBX, FusionPBX, Wazo-confd, ICTCore

**NestJS Module**: `src/modules/telephony/`

```
telephony/
├── telephony.module.ts
├── controllers/
│   ├── extensions.controller.ts      # ← FreePBX extensions
│   ├── trunks.controller.ts          # ← FreePBX trunks + ICTCore providers
│   ├── did.controller.ts             # ← ICTCore DID management
│   ├── ivr.controller.ts             # ← FreePBX IVR + ICTCore IVR trees
│   ├── queues.controller.ts          # ← Asterisk app_queue + Wazo queue plugins
│   ├── ring-groups.controller.ts     # ← FreePBX ring groups + Wazo group
│   ├── conferences.controller.ts     # ← Asterisk confbridge + Wazo conference
│   ├── recordings.controller.ts      # ← All repos - call recording
│   ├── voicemail.controller.ts       # ← Asterisk voicemail + Wazo voicemail
│   ├── parking.controller.ts         # ← Wazo parking_lot
│   ├── call-filter.controller.ts     # ← Wazo call_filter (boss-secretary)
│   └── time-conditions.controller.ts # ← FreePBX + Wazo schedule
├── services/
│   ├── asterisk-ari.service.ts       # ARI REST client (from Asterisk)
│   ├── asterisk-ami.service.ts       # AMI TCP client (from Asterisk)
│   ├── extension.service.ts          # CRUD + Asterisk provisioning
│   ├── trunk.service.ts              # SIP trunk management
│   ├── ivr-builder.service.ts        # JSON → Asterisk dialplan generator
│   ├── queue.service.ts              # ACD queue management
│   ├── recording.service.ts          # Recording storage + retrieval
│   └── cdr.service.ts               # Call Detail Records
├── gateways/
│   ├── asterisk-ws.gateway.ts        # WebSocket for real-time events
│   └── stasis.gateway.ts             # ARI Stasis event handler
├── entities/
│   ├── extension.entity.ts
│   ├── trunk.entity.ts
│   ├── did.entity.ts
│   ├── ivr-node.entity.ts
│   ├── queue.entity.ts
│   ├── queue-member.entity.ts
│   ├── ring-group.entity.ts
│   ├── conference.entity.ts
│   ├── recording.entity.ts
│   ├── voicemail.entity.ts
│   ├── parking-lot.entity.ts
│   └── cdr.entity.ts
└── dto/
    └── ... (create/update DTOs for each)
```

**Prisma Schema additions:**
```prisma
model Extension {
  id          String   @id @default(uuid())
  number      String   @unique
  name        String
  type        ExtensionType  // SIP, IAX, DAHDI
  password    String
  callerIdName String?
  callerIdNum  String?
  context     String   @default("from-internal")
  voicemailEnabled Boolean @default(false)
  callRecording    Boolean @default(false)
  tenantId    String
  createdAt   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  queueMembers QueueMember[]
  ringGroupMembers RingGroupMember[]
}

model SipTrunk {
  id          String   @id @default(uuid())
  name        String
  host        String
  port        Int      @default(5060)
  username    String?
  password    String?
  transport   String   @default("udp")  // udp, tcp, tls
  codecs      String[] @default(["ulaw", "alaw"])
  maxChannels Int      @default(0)
  active      Boolean  @default(true)
  tenantId    String
  
  outboundRoutes OutboundRoute[]
}

model IvrMenu {
  id          String   @id @default(uuid())
  name        String
  greeting    String?  // audio file path
  timeout     Int      @default(10)
  retries     Int      @default(3)
  nodes       Json     // IVR tree structure
  tenantId    String
}

model AcdQueue {
  id           String   @id @default(uuid())
  name         String
  strategy     QueueStrategy  // ringall, leastrecent, fewestcalls, random, rrmemory
  timeout      Int      @default(30)
  wrapUpTime   Int      @default(15)
  maxWaitTime  Int      @default(300)
  musicOnHold  String?
  announcementFreq Int  @default(60)
  tenantId     String
  
  members      QueueMember[]
  skills       QueueSkill[]
}

model AgentSkill {
  id       String @id @default(uuid())
  agentId  String
  skillId  String
  level    Int    @default(1)  // 1-100
  
  agent    User   @relation(fields: [agentId], references: [id])
  skill    Skill  @relation(fields: [skillId], references: [id])
  @@unique([agentId, skillId])
}

model Skill {
  id          String @id @default(uuid())
  name        String @unique
  description String?
  tenantId    String
  
  agents      AgentSkill[]
  rules       SkillRule[]
}

model SkillRule {
  id       String @id @default(uuid())
  name     String
  skillId  String
  minLevel Int    @default(1)
  timeout  Int    @default(30)  // seconds before relaxing
  
  skill    Skill @relation(fields: [skillId], references: [id])
}
```

---

### 2.2 Omnichannel Module (from Chatwoot)

**Source Repo**: Chatwoot (primary), Rocket.Chat (supplementary)

**NestJS Module**: `src/modules/omnichannel/`

```
omnichannel/
├── omnichannel.module.ts
├── controllers/
│   ├── inbox.controller.ts            # ← Chatwoot inboxes
│   ├── conversation.controller.ts     # ← Chatwoot conversations
│   ├── message.controller.ts          # ← Chatwoot messages
│   ├── contact.controller.ts          # (already in CRM module)
│   ├── canned-response.controller.ts  # ← Chatwoot canned_responses
│   └── widget.controller.ts           # ← Chatwoot channel_web_widgets
├── channels/
│   ├── whatsapp.channel.ts            # ✅ Already exists
│   ├── email.channel.ts              # ← Chatwoot channel_email
│   ├── facebook.channel.ts           # ← Chatwoot channel_facebook_pages
│   ├── instagram.channel.ts          # ← Chatwoot channel_instagram
│   ├── telegram.channel.ts           # ← Chatwoot channel_telegram
│   ├── sms.channel.ts                # ← Chatwoot channel_sms
│   ├── voice.channel.ts              # ← Chatwoot channel_voice + Asterisk ARI
│   ├── webchat.channel.ts            # ← Chatwoot channel_web_widgets
│   └── custom-api.channel.ts         # ← Chatwoot channel_api
├── services/
│   ├── conversation.service.ts        # Conversation lifecycle
│   ├── message.service.ts             # Message handling
│   ├── inbox-routing.service.ts       # Assignment policies
│   ├── auto-assignment.service.ts     # Round-robin, capacity-based
│   └── channel-adapter.service.ts     # Channel abstraction layer
├── entities/
│   ├── inbox.entity.ts
│   ├── conversation.entity.ts
│   ├── message.entity.ts
│   ├── channel-config.entity.ts       # Unified JSONB channel config
│   └── canned-response.entity.ts
└── gateways/
    └── pubsub.gateway.ts              # WebSocket for real-time
```

**Key Design Decision**: Chatwoot uses separate tables per channel (`channel_whatsapp`, `channel_email`, etc.). For Karan SaaS, use a **single `channel_configs` table** with a `type` enum and JSONB `config` column — simpler schema, easier extensibility.

```prisma
model Inbox {
  id            String   @id @default(uuid())
  name          String
  channelType   ChannelType  // WHATSAPP, EMAIL, FACEBOOK, VOICE, WEBCHAT, etc.
  channelConfig Json     // Unified JSONB — provider creds, settings
  autoAssign    Boolean  @default(true)
  greetingMessage String?
  workingHoursEnabled Boolean @default(false)
  csatEnabled   Boolean  @default(false)
  tenantId      String
  
  conversations Conversation[]
  members       InboxMember[]
  workingHours  WorkingHour[]
}

model Conversation {
  id            String   @id @default(uuid())
  displayId     Int      // Auto-increment per tenant (Chatwoot pattern!)
  status        ConversationStatus  // open, resolved, pending, snoozed
  priority      ConversationPriority?
  contactId     String
  inboxId       String
  assigneeId    String?
  teamId        String?
  slaId         String?
  uuid          String   @default(uuid())
  lastActivityAt DateTime @default(now())
  waitingSince   DateTime?
  firstReplyAt   DateTime?
  customAttributes Json  @default("{}")
  tenantId      String
  
  contact       Contact  @relation(fields: [contactId], references: [id])
  inbox         Inbox    @relation(fields: [inboxId], references: [id])
  messages      Message[]
  participants  ConversationParticipant[]
}

model Message {
  id              String   @id @default(uuid())
  content         String?
  messageType     MessageType  // incoming, outgoing, activity
  contentType     ContentType  // text, input_select, cards, form, article
  private         Boolean  @default(false)
  senderType      String?  // User, Contact, AgentBot
  senderId        String?
  externalIds     Json     @default("{}")
  sentiment       Json     @default("{}")
  conversationId  String
  tenantId        String
  createdAt       DateTime @default(now())
  
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  attachments     Attachment[]
}
```

---

### 2.3 Campaign Engine (from ICTCore + GOautodial + VICIdial)

**Source Repos**: ICTCore (architecture), GOautodial/VICIdial (dialer logic), Callcenter (campaign UI)

**NestJS Module**: `src/modules/campaigns/`

```
campaigns/
├── campaigns.module.ts
├── controllers/
│   ├── campaign.controller.ts         # Campaign CRUD
│   ├── campaign-list.controller.ts    # Contact list management
│   ├── dnc.controller.ts              # Do-Not-Call lists
│   ├── transmission.controller.ts     # Per-contact tracking
│   └── dialer.controller.ts           # Dialer control API
├── services/
│   ├── campaign.service.ts            # Campaign lifecycle
│   ├── dialer-engine.service.ts       # ← VICIdial/GOautodial pacing logic
│   ├── transmission.service.ts        # ← ICTCore transmission pipeline
│   ├── spool.service.ts               # ← ICTCore active call tracking
│   ├── contact-list.service.ts        # List import/management
│   ├── dnc.service.ts                 # DNC compliance check
│   ├── progress-tracker.service.ts    # Real-time campaign progress
│   └── callback.service.ts            # Callback scheduling
├── processors/
│   ├── predictive.processor.ts        # ← VICIdial predictive algorithm
│   ├── preview.processor.ts           # Preview dial mode
│   ├── progressive.processor.ts       # Progressive dial mode
│   └── blast.processor.ts             # SMS/email blast mode
├── entities/
│   ├── campaign.entity.ts
│   ├── campaign-list.entity.ts
│   ├── campaign-contact.entity.ts
│   ├── transmission.entity.ts         # ← ICTCore transmission table
│   ├── call-spool.entity.ts           # ← ICTCore spool table
│   ├── spool-result.entity.ts
│   ├── dnc-entry.entity.ts
│   └── agent-script.entity.ts
└── queues/
    ├── dial.queue.ts                  # BullMQ dial job queue
    ├── sms-blast.queue.ts             # SMS campaign queue
    └── email-blast.queue.ts           # Email campaign queue
```

**Prisma Schema:**
```prisma
model Campaign {
  id            String   @id @default(uuid())
  name          String
  type          CampaignType  // PREDICTIVE, PREVIEW, PROGRESSIVE, MANUAL, SMS_BLAST, EMAIL_BLAST
  status        CampaignStatus // DRAFT, RUNNING, PAUSED, COMPLETED, CANCELLED
  programId     String?  // ← ICTCore: linked communication program
  queueId       String?  // ← linked ACD queue for inbound
  callsPerMinute Int     @default(2)  // ← ICTCore: cpm
  maxRetries    Int      @default(3)  // ← ICTCore: try_allowed
  totalContacts Int      @default(0)
  completedContacts Int  @default(0)
  scheduledAt   DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  tenantId      String
  createdBy     String
  
  contactList   CampaignContact[]
  transmissions Transmission[]
}

model Transmission {
  id            String   @id @default(uuid())
  campaignId    String
  contactId     String
  serviceType   ServiceType  // VOICE, SMS, EMAIL, FAX
  direction     String   @default("outbound")
  status        String   @default("pending")
  response      String?
  retriesAllowed Int     @default(1)
  retriesDone   Int      @default(0)
  lastAttemptAt DateTime?
  tenantId      String
  
  campaign      Campaign @relation(fields: [campaignId], references: [id])
  spools        CallSpool[]
}

model CallSpool {
  id              String   @id @default(uuid())
  transmissionId  String
  callId          String?  // Asterisk channel ID
  status          String
  response        String?
  duration        Int      @default(0)
  recordingUrl    String?
  startTime       DateTime?
  connectTime     DateTime?
  endTime         DateTime?
  providerId      String?
  nodeId          String?
  tenantId        String
  
  transmission    Transmission @relation(fields: [transmissionId], references: [id])
  results         SpoolResult[]
}
```

---

### 2.4 AI Agent Module (from Chatwoot Captain + Fonoster Autopilot)

**Source Repos**: Chatwoot (Captain), Fonoster (Autopilot + AI products)

**NestJS Module**: `src/modules/ai-agent/`

```
ai-agent/
├── ai-agent.module.ts
├── controllers/
│   ├── assistant.controller.ts        # AI assistant CRUD
│   ├── knowledge.controller.ts        # Document management
│   ├── scenario.controller.ts         # AI scenarios
│   ├── custom-tool.controller.ts      # Custom API tools
│   └── copilot.controller.ts          # Agent copilot
├── services/
│   ├── assistant.service.ts           # ← Chatwoot captain_assistants
│   ├── knowledge-base.service.ts      # ← Chatwoot captain_documents
│   ├── embedding.service.ts           # ← pgvector similarity search
│   ├── response-generator.service.ts  # ← Captain assistant_responses
│   ├── tool-executor.service.ts       # ← Captain custom_tools execution
│   ├── copilot.service.ts             # Agent copilot conversations
│   └── provider.service.ts            # ← Fonoster multi-vendor (OpenAI, Google, etc.)
├── providers/
│   ├── openai.provider.ts
│   ├── google.provider.ts
│   ├── deepgram.provider.ts           # ← Fonoster product vendors
│   ├── anthropic.provider.ts
│   └── elevenlabs.provider.ts
├── entities/
│   ├── ai-assistant.entity.ts
│   ├── knowledge-document.entity.ts
│   ├── document-embedding.entity.ts
│   ├── ai-scenario.entity.ts
│   ├── custom-tool.entity.ts
│   └── copilot-thread.entity.ts
└── queues/
    ├── embedding.queue.ts             # Background document embedding
    └── response.queue.ts              # Async AI response generation
```

---

### 2.5 Automation Engine (from Chatwoot)

**Source Repo**: Chatwoot (automation_rules, macros)

**NestJS Module**: `src/modules/automation/`

```
automation/
├── automation.module.ts
├── controllers/
│   ├── rule.controller.ts            # Automation rules
│   ├── macro.controller.ts           # Quick action macros
│   └── webhook.controller.ts         # Webhook management
├── services/
│   ├── rule-engine.service.ts        # Event → Condition → Action engine
│   ├── condition-evaluator.service.ts # JSONB condition matching
│   ├── action-executor.service.ts    # Execute automated actions
│   ├── macro.service.ts              # Macro execution
│   └── webhook.service.ts            # Webhook dispatch
├── entities/
│   ├── automation-rule.entity.ts
│   ├── macro.entity.ts
│   └── webhook.entity.ts
└── listeners/
    ├── conversation.listener.ts       # Listen for conversation events
    ├── message.listener.ts            # Listen for message events
    └── contact.listener.ts            # Listen for contact events
```

**Automation Rule Schema (from Chatwoot pattern):**
```prisma
model AutomationRule {
  id         String   @id @default(uuid())
  name       String
  eventName  String   // conversation_created, message_created, etc.
  conditions Json     // [{ attribute: "status", operator: "equal_to", values: ["open"] }]
  actions    Json     // [{ action: "assign_team", params: ["team_uuid"] }]
  active     Boolean  @default(true)
  tenantId   String
}
```

---

### 2.6 SLA & Quality Module (from Chatwoot)

**Source Repo**: Chatwoot (sla_policies, applied_slas, sla_events, csat)

```prisma
model SlaPolicy {
  id                        String @id @default(uuid())
  name                      String
  firstResponseTimeThreshold Float?  // seconds
  nextResponseTimeThreshold  Float?
  resolutionTimeThreshold    Float?
  onlyDuringBusinessHours   Boolean @default(false)
  tenantId                  String
}

model AppliedSla {
  id             String @id @default(uuid())
  slaPolicyId    String
  conversationId String
  slaStatus      Int    @default(0) // 0=active, 1=hit, 2=missed
  tenantId       String
  
  @@unique([slaPolicyId, conversationId])
}

model CsatResponse {
  id              String @id @default(uuid())
  conversationId  String
  contactId       String
  assignedAgentId String?
  rating          Int    // 1-5
  feedbackMessage String?
  tenantId        String
  createdAt       DateTime @default(now())
}
```

---

## 3. Integration Patterns

### 3.1 Asterisk ↔ Karan SaaS (ARI Pattern from Fonoster)

```typescript
// Pattern from Fonoster's voice module + Asterisk ARI
@Injectable()
export class AsteriskAriService {
  private client: AriClient;
  
  async connect() {
    this.client = await ari.connect(
      process.env.ASTERISK_ARI_URL,      // http://asterisk:8088
      process.env.ASTERISK_ARI_USERNAME,  // From Fonoster compose
      process.env.ASTERISK_ARI_PASSWORD
    );
    
    // Subscribe to Stasis events (Fonoster pattern)
    this.client.on('StasisStart', (event, channel) => {
      this.handleIncomingCall(channel);
    });
    
    this.client.start('karan-saas');
  }
  
  // Verb-based API (from Fonoster's Voice module)
  async answer(channelId: string) { /* ... */ }
  async hangup(channelId: string) { /* ... */ }
  async playback(channelId: string, mediaUri: string) { /* ... */ }
  async record(channelId: string, options: RecordOptions) { /* ... */ }
  async bridge(channelId1: string, channelId2: string) { /* ... */ }
  async originate(endpoint: string, callerId: string) { /* ... */ }
}
```

### 3.2 WebRTC Softphone (from OMniLeads + GOautodial)

```typescript
// Frontend: SIP.js or JsSIP (used by OMniLeads and GOautodial)
// Connect to Asterisk via WebSocket → chan_websocket
const userAgent = new JsSIP.UA({
  uri: `sip:${extension}@${asteriskHost}`,
  password: extensionPassword,
  ws_servers: `wss://${asteriskHost}:8089/ws`,
  display_name: agentName,
});

userAgent.on('newRTCSession', (data) => {
  // Handle incoming/outgoing call
  // Show caller info from CRM (screen pop - from Callcenter external_url pattern)
});
```

### 3.3 Real-Time Events (from Rocket.Chat + Chatwoot)

```typescript
// Pattern: WebSocket gateway for real-time agent updates
// Combines Rocket.Chat's pub/sub + Chatwoot's ActionCable pattern
@WebSocketGateway({ namespace: '/agent' })
export class AgentGateway {
  @SubscribeMessage('subscribe:queue')
  handleQueueSubscription(client, queueId) {
    // Real-time queue stats (from Callcenter campaign_monitoring)
    // Calls waiting, agents online, service level
  }
  
  @SubscribeMessage('subscribe:conversation')
  handleConversationSubscription(client, conversationId) {
    // Real-time message updates (Chatwoot pattern)
  }
}
```

---

## 4. Data Flow Diagrams

### 4.1 Inbound Call Flow
```
Phone Call → Asterisk (SIP) → ARI Stasis Event
  → Karan SaaS ARI Service
    → Check DNC list (from GOautodial pattern)
    → Match IVR menu (from FreePBX/ICTCore)
    → Play greeting, gather DTMF
    → Route to ACD queue (from Asterisk app_queue)
      → Skill-based matching (from Wazo agent_skill)
      → Assign to agent (from Chatwoot assignment_policies)
        → Create/update Conversation (Chatwoot model)
        → Screen pop CRM data (from Callcenter external_url)
        → Agent handles call via WebRTC (OMniLeads pattern)
        → Record call (Asterisk MixMonitor)
        → Save CDR + update Transmission (ICTCore pattern)
```

### 4.2 Outbound Campaign Flow
```
Campaign Created (UI)
  → Load contact list (from GOautodial telephonylist)
  → Check DNC (from VICIdial DNC check)
  → Campaign Engine starts (from ICTCore campaign model)
    → BullMQ job per contact
      → Create Transmission record (ICTCore)
      → Calculate pacing (VICIdial predictive algorithm)
      → Originate call via ARI (Fonoster voice pattern)
        → AMD check (Asterisk app_amd)
        → If human: bridge to agent + screen pop
        → If machine: leave message or retry
        → Save CallSpool result (ICTCore spool)
      → Update Campaign progress (ICTCore triggers pattern)
  → Real-time monitoring dashboard (Callcenter campaign_monitoring)
```

### 4.3 Omnichannel Message Flow
```
Message arrives (WhatsApp/Email/Web/etc.)
  → Channel adapter identifies channel type
  → Find or create Contact (Chatwoot model)
  → Find or create Conversation (Chatwoot model)
  → Create Message (Chatwoot model)
  → Run automation rules (Chatwoot automation_rules)
    → Auto-assign (Chatwoot assignment_policies)
    → AI agent check (Chatwoot Captain pattern)
      → If AI can handle: generate response via LLM
      → If not: route to human agent
    → SLA timer starts (Chatwoot sla_policies)
  → Notify agent via WebSocket
  → Agent responds → send via channel adapter
  → Track CSAT if resolved (Chatwoot csat pattern)
```

---

## 5. Environment Variables (from all repos)

```env
# Core (existing)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Asterisk (from Fonoster compose.yaml)
ASTERISK_ARI_URL=http://asterisk:8088
ASTERISK_ARI_USERNAME=karan
ASTERISK_ARI_PASSWORD=secret
ASTERISK_AMI_HOST=asterisk
ASTERISK_AMI_PORT=5038
ASTERISK_WEBSOCKET_URL=wss://asterisk:8089/ws

# AI (from Fonoster + Chatwoot)
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
GOOGLE_TTS_CREDENTIALS=...

# Omnichannel (from Chatwoot .env.example)
WHATSAPP_API_KEY=...           # Already exists
FB_APP_ID=...
FB_APP_SECRET=...
IG_VERIFY_TOKEN=...
TWITTER_CONSUMER_KEY=...
SLACK_CLIENT_ID=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USERNAME=...
SMTP_PASSWORD=...

# WebRTC (from OMniLeads/GOautodial)
WEBRTC_ENABLED=true
SIP_PROXY_HOST=kamailio
SIP_PROXY_PORT=5060

# Storage (from Chatwoot)
S3_BUCKET_NAME=karan-recordings
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1

# Event Bus (from Fonoster — optional)
NATS_URL=nats://nats:4222
```

---

## 6. Docker Compose Addition (from Fonoster pattern)

```yaml
# Add to existing docker-compose.yml
services:
  asterisk:
    image: fonoster/asterisk:20      # From Fonoster
    environment:
      ARI_SECRET: ${ASTERISK_ARI_PASSWORD}
      ARI_USERNAME: ${ASTERISK_ARI_USERNAME}
    ports:
      - "5060:5060/udp"              # SIP
      - "8088:8088"                   # ARI
      - "8089:8089"                   # WSS (WebRTC)
      
  kamailio:
    image: kamailio/kamailio:latest   # From OMniLeads
    ports:
      - "5061:5061"                   # SIP TLS
      
  rtpengine:
    image: fonoster/rtpengine:0.3.17  # From Fonoster
    ports:
      - "10000-10100:10000-10100/udp" # RTP media
```
