# 🏗️ Unified SaaS Architecture

> System architecture for the world's most integrated SaaS platform, combining ERP, CRM, Messaging, Workflow Automation, AI, GPS Fleet Tracking, Customer Support, and SMS Gateway capabilities.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React + TypeScript SPA                     │   │
│  │                                                              │   │
│  │  ┌────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────────┐ │   │
│  │  │twenty- │ │ Jotai    │ │ Emotion   │ │ Lingui          │ │   │
│  │  │ui lib  │ │ (State)  │ │ (CSS-JS)  │ │ (i18n)          │ │   │
│  │  └────────┘ └──────────┘ └───────────┘ └─────────────────┘ │   │
│  │                                                              │   │
│  │  Pages: Dashboard | CRM | Inbox | Workflows | Inventory |   │   │
│  │         Finance | Projects | Support | Settings | Roster     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            │ GraphQL + REST                         │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                         API GATEWAY                                 │
│  ┌─────────────────────────┼────────────────────────────────────┐   │
│  │                    NestJS Application                         │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ GraphQL  │  │  REST    │  │ WebSocket│  │ Webhook  │   │   │
│  │  │ Gateway  │  │  API     │  │ Gateway  │  │ Receiver │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  Middleware: Auth | RBAC | Workspace | Rate Limit    │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                              │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Module System (NestJS Modules)               │ │
│  │                                                                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │  CRM    │ │Messaging│ │ Workflow │ │   AI & Bots      │   │ │
│  │  │ Module  │ │ Module  │ │  Engine  │ │   Module         │   │ │
│  │  │         │ │         │ │          │ │                  │   │ │
│  │  │Contact  │ │WhatsApp │ │Node      │ │OpenAI/Dify/     │   │ │
│  │  │Company  │ │Email    │ │Execution │ │Flowise/Custom   │   │ │
│  │  │Lead     │ │SMS      │ │Versioning│ │Bot Sessions     │   │ │
│  │  │Opportun.│ │Calendar │ │Scheduling│ │Voice-to-Text    │   │ │
│  │  │Campaign │ │Templates│ │Retry     │ │Trigger Mgmt     │   │ │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────────┘   │ │
│  │                                                                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │Finance  │ │Inventory│ │ Projects │ │   Support        │   │ │
│  │  │ Module  │ │ Module  │ │  Module  │ │   Module         │   │ │
│  │  │         │ │         │ │          │ │                  │   │ │
│  │  │Accounts │ │Items    │ │Projects  │ │Tickets           │   │ │
│  │  │Invoices │ │Warehouse│ │Tasks     │ │SLA               │   │ │
│  │  │Payments │ │Stock    │ │Timesheet │ │Knowledge Base    │   │ │
│  │  │Taxes    │ │Batches  │ │Calendar  │ │Customer Portal   │   │ │
│  │  │Reports  │ │Serial   │ │Gantt     │ │Escalation        │   │ │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────────┘   │ │
│  │                                                                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │Manufact.│ │ Buying  │ │ Assets   │ │   HR & Payroll   │   │ │
│  │  │ Module  │ │ Module  │ │ Module   │ │      Module      │   │ │
│  │  │         │ │         │ │          │ │                  │   │ │
│  │  │BOM      │ │Supplier │ │Asset CRUD│ │Employee Lifecycle│   │ │
│  │  │WorkOrder│ │PO/RFQ   │ │Deprec.  │ │Payroll & Tax     │   │ │
│  │  │JobCard  │ │Scorecard│ │Mainten. │ │Shift/Attendance  │   │ │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────────┘   │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │  GPS & Fleet Module (from Traccar)                       │   │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐ │   │ │
│  │  │  │Tracking │ │Geofence │ │ Reports  │ │  Notifications│ │   │ │
│  │  │  │Devices  │ │Engine   │ │(11 types)│ │  (10 channels)│ │   │ │
│  │  │  │Drivers  │ │Events   │ │GPX/KML   │ │  Firebase/SMS │ │   │ │
│  │  │  │Positions│ │Geocoding│ │CSV Export│ │  Telegram/WA  │ │   │ │
│  │  │  └─────────┘ └─────────┘ └──────────┘ └──────────────┘ │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │  Customer Support Module (from Chatwoot)                  │   │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐ │   │ │
│  │  │  │Omnichan.│ │Captain  │ │Help      │ │  SLA & CSAT  │ │   │ │
│  │  │  │Inbox    │ │AI Agent │ │Center    │ │  Engine      │ │   │ │
│  │  │  │12 Chan. │ │pgvector │ │Portal    │ │  Automation  │ │   │ │
│  │  │  │WebSocket│ │Copilot  │ │Articles  │ │  Campaigns   │ │   │ │
│  │  │  └─────────┘ └─────────┘ └──────────┘ └──────────────┘ │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                                                                │ │
│  │  ┌────────────────────────────────────────────────────────┐   │ │
│  │  │  Shared Services: Events | Files | Search | Billing   │   │ │
│  │  └────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  GPS Protocol Server (from Traccar — Java/Netty sidecar)       │ │
│  │  200+ protocol decoders | TCP/UDP listeners | Position pipe    │ │
│  │  Connects to main API via internal REST/message queue          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SMS Gateway (from Jasmin — Python/Twisted sidecar)            │ │
│  │  SMPP Client/Server | HTTP/REST API | Message Router           │ │
│  │  Billing Engine | DLR Tracking (Redis) | AMQP Queuing          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Email Suite (from Mailcow — Docker/Postfix/Dovecot/SOGo)      │ │
│  │  MTA Server | IMAP/POP3 Storage | CalDAV/CardDAV | ActiveSync  │ │
│  │  Spam & Virus Filtering (Rspamd/ClamAV) | Admin UI             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                    DATA & INFRASTRUCTURE LAYER                      │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐    │
│  │PostgreSQL│  │  Redis   │  │  BullMQ  │  │ S3 / Minio      │    │
│  │          │  │          │  │          │  │                 │    │
│  │ Core DB  │  │ Cache    │  │Job Queue │  │ File Storage    │    │
│  │ Metadata │  │ Sessions │  │ Workers  │  │ Media Files     │    │
│  │ Tenants  │  │ Pub/Sub  │  │ Scheduled│  │ Attachments     │    │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Event Streaming Options                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │RabbitMQ│ │ Kafka  │ │  SQS   │ │ NATS   │ │Websocket│   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Compose Stack                    │
│                   (from Frappe Docker patterns)          │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Nginx     │  │  Frontend   │  │   API        │    │
│  │   Reverse   │──│  Container  │  │   Server     │    │
│  │   Proxy     │  │  (React)    │  │   (NestJS)   │    │
│  │   + SSL     │  └─────────────┘  └──────┬───────     │
│  └──────┬──────┘                          │            │
│         │                                  │            │
│  ┌──────┴──────────────────────────────────▼──────┐    │
│  │                Worker Containers               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
│  │  │ Workflow │ │ Messaging│ │  General  │      │    │
│  │  │ Worker   │ │ Worker   │ │  Worker   │      │    │
│  │  └──────────┘ └──────────┘ └──────────┘      │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │PostgreSQL│  │  Redis   │  │  S3/Minio        │     │
│  │  + PgBo. │  │  7.x     │  │  File Storage    │     │
│  └──────────┘  └──────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## Conflict Resolution Strategy

### 1. CRM Contacts & Calendars: Four Sources → One Model

| Source | Has | Decision |
|--------|-----|----------|
| **Twenty CRM Person** | first_name, last_name, email, phone, avatar, jobTitle, city | ✅ Use as base structure |
| **Chatwoot / Evolution API Contact** | remoteJid, pushName, social profiles | ✅ Add omnichannel fields |
| **ERPNext Customer** | customer_type, customer_group, territory, industry, credit_limit | ✅ Add business fields |
| **Mailcow (SOGo)** | CardDAV / CalDAV endpoints | ✅ Use as sync backend |

**Result**: Unified `contact` table with all fields. Contacts auto-created from conversations, enriched with CRM data, linked to accounting customer records, and bi-directionally synced to mobile devices via SOGo CardDAV.

### 2. Messaging: Four Sources → One Unified Inbox

| Source | Has | Decision |
|--------|-----|----------|
| **Chatwoot** | 12 channels, omnichannel inbox, SLAs, macros | ✅ Use as unified UI & engine |
| **Evolution API** | WhatsApp (Baileys + Cloud API), webhooks | ✅ WhatsApp integration |
| **Jasmin** | SMPP SMS Gateway, routing, DLR engine | ✅ SMS delivery logic |
| **Mailcow** | Self-hosted email backend (Postfix/Dovecot) | ✅ Email delivery/storage |

**Result**: Chatwoot unified inbox powered by multiple specialized backends. Evolution API handles WhatsApp, Jasmin routes SMS, and Mailcow provides robust email infrastructure. Messages from any channel appear in one seamless UI.

### 4. HR & Employee Lifecycle: Integration Path

| Source | Has | Decision |
|--------|-----|----------|
| **ERPNext** | Basic Employee, Company | ✅ Use as organizational base |
| **HRMS** | 161 doctypes, Full Payroll, Attendance, Recruitment | ✅ Core HR logic & engine |
| **Chatwoot** | Customer Support (Employee-facing) | ✅ Link Support to HR profiles |
| **Traccar** | Fleet/Driver Tracking | ✅ Link Drivers to HR Employees |

**Result**: A unified employee master record. Recruitment leads from HRMS become Employees, synced to ERPNext for accounting (expenses/payroll JV), linked to Traccar for fleet tracking, and mapped to Chatwoot for internal support/grievances.

---

| Source | Has | Decision |
|--------|-----|----------|
| **n8n** | Full visual builder, 400+ nodes, execution history, credentials, versioning | ✅ Use n8n's data model as base |
| **Twenty CRM** | Record-based triggers (create/update/delete), workflow runs | ✅ Use trigger system |

**Result**: n8n's workflow execution model (nodes, connections, executions) with Twenty's event-driven triggers integrated. Workflows can be triggered by CRM events OR by n8n-style triggers (webhook, schedule, manual).

### 4. AI Bots: Keep Evolution API's Comprehensive System

Evolution API has the most comprehensive AI bot system (6 bot types, session management, fallback bots, trigger configuration). n8n has AI capabilities via LangChain nodes. Twenty has Skills/LogicFunctions.

**Result**: Evolution API's bot model as the primary AI layer, with n8n providing workflow-based AI agent capabilities. Both coexist — simple chatbots use the direct bot system, complex multi-step AI agents use n8n workflows.

### 5. Accounting: ERPNext Only

No other project has accounting. **ERPNext's double-entry accounting system stands alone** with chart of accounts, GL entries, invoicing, payments, taxes.

### 6. Identical Features → Pick the Best

| Feature | ERPNext | n8n | Twenty | Winner | Why |
|---------|---------|-----|--------|--------|-----|
| Tags | Doctype tags | TagEntity | Tags field | Twenty | JSONB array approach is simpler and more flexible |
| Folders | N/A | Folder entity | FavoriteFolder | n8n | Hierarchical folder system is more complete |
| Views | List View | N/A | View entity | Twenty | Most sophisticated view system with filter/sort/group/kanban |
| API Keys | N/A | ApiKey entity | ApiKey entity | Merged | Both are nearly identical - combine with scoped permissions |
| Roles | Role doctype | Role entity | Role entity | Twenty | Most granular with object/field/row level permissions |
| Webhooks | N/A | WebhookEntity | Webhook config | Merged | Combine n8n's workflow webhooks + general event webhooks |

---

## File Structure for the Unified Project

```
unified-saas/
├── docker-compose.yml          # From Frappe Docker patterns
├── docker-compose.dev.yml
├── .env.example
├── nx.json                     # Nx monorepo config (from Twenty)
├── package.json
│
├── packages/
│   ├── frontend/               # React SPA (from Twenty twenty-front)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── crm/
│   │   │   │   ├── messaging/
│   │   │   │   ├── workflows/
│   │   │   │   ├── finance/
│   │   │   │   ├── inventory/
│   │   │   │   ├── projects/
│   │   │   │   ├── support/
│   │   │   │   ├── manufacturing/
│   │   │   │   ├── assets/
│   │   │   │   └── settings/
│   │   │   ├── state/          # Jotai atoms
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── server/                 # NestJS backend (from Twenty twenty-server)
│   │   ├── src/
│   │   │   ├── engine/         # Core engine
│   │   │   │   ├── core-modules/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── workspace/
│   │   │   │   │   ├── user/
│   │   │   │   │   ├── billing/
│   │   │   │   │   └── file/
│   │   │   │   ├── metadata-modules/
│   │   │   │   │   ├── object-metadata/
│   │   │   │   │   ├── field-metadata/
│   │   │   │   │   ├── role/
│   │   │   │   │   └── view/
│   │   │   │   └── api/
│   │   │   │       └── graphql/
│   │   │   │
│   │   │   ├── modules/        # Business modules
│   │   │   │   ├── crm/
│   │   │   │   │   ├── contact/
│   │   │   │   │   ├── company/
│   │   │   │   │   ├── lead/
│   │   │   │   │   ├── opportunity/
│   │   │   │   │   └── campaign/
│   │   │   │   ├── messaging/
│   │   │   │   │   ├── whatsapp/       # From Evolution API
│   │   │   │   │   ├── email/          # From Twenty & Mailcow
│   │   │   │   │   ├── sms/            # From Jasmin
│   │   │   │   │   ├── channel/        # From Chatwoot
│   │   │   │   │   ├── conversation/
│   │   │   │   │   └── template/
│   │   │   │   ├── workflow/
│   │   │   │   │   ├── builder/        # From n8n
│   │   │   │   │   ├── execution/
│   │   │   │   │   ├── trigger/
│   │   │   │   │   └── credential/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── provider/
│   │   │   │   │   ├── bot/
│   │   │   │   │   └── session/
│   │   │   │   ├── finance/
│   │   │   │   │   ├── account/
│   │   │   │   │   ├── invoice/
│   │   │   │   │   ├── payment/
│   │   │   │   │   └── tax/
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── item/
│   │   │   │   │   ├── warehouse/
│   │   │   │   │   └── stock/
│   │   │   │   ├── manufacturing/
│   │   │   │   ├── project/
│   │   │   │   ├── support/           # From Chatwoot
│   │   │   │   │   ├── ticket/
│   │   │   │   │   ├── article/
│   │   │   │   │   ├── portal/
│   │   │   │   │   └── sla/
│   │   │   │   ├── buying/
│   │   │   │   ├── hrms/              # From HRMS
│   │   │   │   │   ├── employee/
│   │   │   │   │   ├── payroll/
│   │   │   │   │   ├── leave/
│   │   │   │   │   ├── attendance/
│   │   │   │   │   ├── recruitment/
│   │   │   │   │   └── performance/
│   │   │   │   ├── asset/
│   │   │   │   └── tracking/          # From Traccar
│   │   │   │       ├── device/
│   │   │   │       ├── position/
│   │   │   │       ├── geofence/
│   │   │   │       ├── driver/
│   │   │   │       ├── event/
│   │   │   │       ├── command/
│   │   │   │       ├── report/
│   │   │   │       └── geocoder/
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── events/
│   │   │       ├── webhooks/
│   │   │       └── search/
│   │   └── package.json
│   │
│   ├── ui/                     # Component library (from Twenty twenty-ui)
│   ├── sdk/                    # API SDK (from Twenty twenty-sdk)
│   ├── shared/                 # Shared types & utils
│   ├── emails/                 # Email templates (from Twenty twenty-emails)
│   ├── cli/                    # CLI tools
│   └── docs/                   # Documentation site
│
├── prisma/                     # Database schemas (from Evolution API pattern)
│   ├── schema.prisma
│   └── migrations/
│
└── scripts/
    ├── setup.sh
    ├── seed.ts
    └── migrate.ts
```

---

## Key Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React | Twenty CRM's proven setup, largest ecosystem |
| Backend framework | NestJS | Best TypeScript backend, modular architecture |
| Database | PostgreSQL | Used by all 5 core projects, supports JSONB for flexibility |
| API style | GraphQL + REST | GraphQL for frontend, REST for external integrations |
| Multi-tenancy | Workspace-based row isolation | Simpler than schema-per-tenant, scales well |
| File storage | S3/Minio | Standard for production, from Evolution API |
| Queue system | BullMQ + Redis | From Twenty, handles async jobs |
| Event streaming | Pluggable (RabbitMQ/Kafka/SQS/MQTT) | From Evolution API + Traccar's flexible approach |
| Monorepo tool | Nx | From Twenty, handles multi-package builds |
| ORM | TypeORM + Prisma | TypeORM for main app, Prisma for messaging module |
| GPS protocols | Java/Netty sidecar service | From Traccar, 200+ protocol decoders |
| Map rendering | OpenStreetMap + pluggable | From Traccar, supports 25 map/geocoder providers |
| Deployment | Docker Compose | From Frappe Docker, proven patterns |
| **HR Engine** | Frappe HR (v16) | Comprehensive Employee/Payroll/Regional suites |
| **Shift Engine** | HRMS Roster | Specialized Vite/Vue app for scheduling |
| **Mobile Architecture** | Vue + Ionic PWA | Offline-first remote employee self-service |
| **Regional Engines** | India & UAE | Python-based localized tax/legal logic |
