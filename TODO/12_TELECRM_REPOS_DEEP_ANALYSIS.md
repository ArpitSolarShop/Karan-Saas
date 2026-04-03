# 📞 Tele CRM GitHub Repos — In-Depth Analysis (13 Projects)

> **Generated**: 2026-04-03  
> **Source**: `C:\Users\arpit\OneDrive\Desktop\Tele CRM Geithub Repos`  
> **Scope**: Full file-by-file, schema, architecture, feature, and design audit of all 13 repositories

---

## Table of Contents

1. [Rocket.Chat](#1-rocketchat)
2. [Asterisk](#2-asterisk)
3. [Chatwoot](#3-chatwoot)
4. [Fonoster](#4-fonoster)
5. [FreePBX (framework)](#5-freepbx-framework)
6. [FusionPBX](#6-fusionpbx)
7. [ICTCore](#7-ictcore)
8. [IssabelPBX](#8-issabelpbx)
9. [Issabel Call Center (callcenter)](#9-issabel-call-center-callcenter)
10. [OMniLeads (ominicontacto)](#10-omnileads-ominicontacto)
11. [GOautodial (v4.0)](#11-goautodial-v40)
12. [VICIdial](#12-vicidial)
13. [Wazo-confd](#13-wazo-confd)
14. [Cross-Project Feature Matrix](#14-cross-project-feature-matrix)
15. [Unified Schema Extraction](#15-unified-schema-extraction)
16. [Architecture Patterns Summary](#16-architecture-patterns-summary)
17. [Integration Recommendations for Karan SaaS](#17-integration-recommendations-for-karan-saas)

---

## 1. Rocket.Chat

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | Rocket.Chat |
| **Version** | 8.4.0-develop |
| **License** | MIT |
| **Language** | TypeScript (Monorepo) |
| **Package Manager** | Yarn 4.12 + Turborepo |
| **Node Version** | 22.16.0 |
| **Database** | MongoDB 6.10 |
| **Category** | Team Communication / Omnichannel Customer Engagement |

### Directory Structure (Top Level)
```
Rocket.Chat/
├── apps/               # Main apps (meteor, uikit-playground)
│   └── meteor/         # Core server app (Meteor.js-based)
├── packages/           # 55 shared packages
│   ├── core-services/  # Business logic services
│   ├── core-typings/   # Shared TypeScript types
│   ├── models/         # Database models (MongoDB)
│   ├── model-typings/  # Model type definitions
│   ├── livechat/       # Livechat widget
│   ├── api-client/     # REST API client
│   ├── rest-typings/   # REST API type definitions
│   ├── i18n/           # 30+ language translations
│   ├── ui-voip/        # VoIP UI components
│   ├── ui-video-conf/  # Video conferencing UI
│   ├── omni-core/      # Omnichannel core
│   ├── apps-engine/    # Apps marketplace engine
│   └── ... (42 more packages)
├── ee/                 # Enterprise Edition features
├── docker-compose-ci.yml
├── turbo.json          # Turborepo build config
└── package.json
```

### Key Features (from FEATURES.md + README)
- **Team Collaboration**: Channels, DMs, threads, file sharing, screen sharing
- **Omnichannel**: WhatsApp, SMS, Facebook, Instagram, Twitter, Email integration
- **Live Chat**: Embeddable widget, visitor routing, canned responses
- **Video/Audio**: Built-in video conferencing, WebRTC, screen sharing
- **Apps Engine**: Marketplace for installable apps, custom app development
- **Federation**: Decentralized communication across servers
- **Authentication**: OAuth, SAML, LDAP, CAS, 2FA
- **Rich Media**: Markdown, code blocks, emojis, reactions, link previews
- **REST API**: Full API coverage for all operations
- **RBAC**: Role-based access control with custom permissions
- **Off-the-Record**: Encrypted transient messaging
- **Self-hosted**: Docker, Kubernetes, multiple cloud providers

### Architecture Pattern
- **Monorepo** with Turborepo for build orchestration
- **Meteor.js** core server (Node.js + MongoDB)
- **55 npm workspaces** for modular packages
- **Enterprise Edition** features in `ee/` directory
- **Microservices-ready** with `apps/meteor/ee/server/services`

### Schema (MongoDB Collections — inferred from model-typings)
Key collections: `users`, `rooms`, `messages`, `subscriptions`, `livechat_visitor`, `livechat_rooms`, `livechat_department`, `livechat_agent`, `integrations`, `roles`, `permissions`, `settings`, `uploads`, `custom_sounds`, `custom_emoji`, `oauthApps`, `webdav_accounts`, `federation_events`

### Design & UI
- **Fuselage** design system (custom React component library)
- Dark mode support, customizable themes
- Responsive web + native mobile (React Native) + desktop (Electron)

---

## 2. Asterisk

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | Asterisk Open Source PBX |
| **Copyright** | 2001-2025 Sangoma Technologies |
| **License** | GPL v2 |
| **Language** | C (pure C codebase) |
| **Build System** | GNU Autotools (configure + make) |
| **Category** | PBX / Telephony Engine |

### Directory Structure
```
asterisk/
├── apps/           # 90 dialplan applications (C modules)
│   ├── app_dial.c          # Core dialing (137KB)
│   ├── app_queue.c         # Call queuing (407KB!)
│   ├── app_voicemail.c     # Voicemail (579KB!)
│   ├── app_confbridge.c    # Conference bridging (145KB)
│   ├── app_meetme.c        # Legacy conferencing (174KB)
│   ├── app_agent_pool.c    # Agent management
│   ├── app_amd.c           # Answering machine detection
│   ├── app_record.c        # Call recording
│   ├── app_sms.c           # SMS handling
│   └── ... (80+ more apps)
├── channels/       # Channel drivers
│   ├── chan_pjsip.c        # PJSIP channel (120KB)
│   ├── chan_dahdi.c         # DAHDI/analog (650KB!)
│   ├── chan_iax2.c          # IAX2 protocol (493KB)
│   ├── chan_websocket.c     # WebSocket support
│   └── chan_rtp.c           # RTP channel
├── bridges/        # Bridge modules for connecting calls
├── cdr/            # Call Detail Records backends
├── cel/            # Channel Event Logging
├── codecs/         # Audio codec implementations
├── configs/        # Sample configuration files
├── funcs/          # Dialplan functions
├── include/        # C header files
├── main/           # Core PBX engine
├── pbx/            # PBX switching logic
├── res/            # Resource modules (ARI, PJSIP, etc.)
├── rest-api/       # Asterisk REST Interface (ARI) definitions
└── tests/          # Unit tests
```

### Key Features
- **SIP/PJSIP**: Full SIP support via PJSIP stack
- **DAHDI**: Support for analog/digital telephony hardware
- **IAX2**: Inter-Asterisk Exchange protocol
- **Call Queuing**: Sophisticated ACD (app_queue.c — 407KB!)
- **Voicemail**: Full voicemail system with IMAP/ODBC backends
- **Conference Bridging**: Multi-party conferencing (ConfBridge)
- **IVR**: Interactive Voice Response via dialplan
- **AMI**: Asterisk Manager Interface for control
- **ARI**: RESTful API for modern application development
- **AGI**: Asterisk Gateway Interface for scripting
- **CDR/CEL**: Call detail records and channel event logging
- **WebSocket**: WebRTC gateway support
- **AMD**: Answering Machine Detection
- **Call Recording**: MixMonitor for recording
- **Music on Hold**: Streaming audio for callers on hold

### Architecture Pattern
- **Modular C architecture** with loadable modules
- **Channel → Bridge → Application** call flow model
- **Dialplan** drives call routing logic
- **Thread-per-channel** concurrency model
- Core engine in `main/`, everything else is a loadable module

### Schema
Asterisk itself is schema-less (config files), but supports:
- **Realtime** SQL backends for dynamic config (MySQL, PostgreSQL, ODBC)
- **CDR tables**: `cdr` (call detail records)
- **CEL tables**: Channel Event Logging
- **Voicemail tables**: When using ODBC backend
- **Queue tables**: `queue_members`, `queues`

---

## 3. Chatwoot

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | Chatwoot — Open Source Customer Support Platform |
| **Version** | See VERSION_CW (latest) |
| **License** | MIT |
| **Language** | Ruby on Rails (backend) + Vue.js (frontend) |
| **Database** | PostgreSQL (with pgvector for AI embeddings) |
| **Cache/Queue** | Redis + Sidekiq |
| **Category** | Omnichannel Customer Support / CRM |

### Directory Structure
```
chatwoot/
├── app/
│   ├── models/         # 54 ActiveRecord models
│   │   ├── account.rb, user.rb, contact.rb
│   │   ├── conversation.rb, message.rb, inbox.rb
│   │   ├── campaign.rb, automation_rule.rb, team.rb
│   │   ├── channel/    # Channel adapters (WhatsApp, FB, etc.)
│   │   └── integrations/  # Third-party integrations
│   ├── controllers/    # Rails API controllers
│   ├── services/       # Business logic services
│   ├── jobs/           # Background jobs (Sidekiq)
│   ├── mailers/        # Email templates
│   ├── javascript/     # Vue.js frontend app
│   ├── views/          # Server-side views
│   ├── policies/       # Authorization policies (Pundit)
│   └── finders/        # Query objects
├── db/
│   ├── schema.rb       # 59KB — Full PostgreSQL schema (1322 lines!)
│   ├── migrate/        # Rails migrations
│   └── seeds.rb        # Initial data
├── config/             # Rails configuration
├── enterprise/         # Enterprise-only features
├── spec/               # RSpec tests
├── swagger/            # API documentation
└── docker-compose.yaml
```

### Database Schema (59KB — 65+ tables!)
**Core Tables:**
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `accounts` | name, domain, locale, feature_flags, limits, settings | Multi-tenant accounts |
| `users` | name, email, provider, 2FA fields, pubsub_token | Agents/Admins |
| `account_users` | role, availability, auto_offline, custom_role_id | Account membership |
| `contacts` | name, email, phone, custom_attributes, company_id, blocked | Customer contacts |
| `companies` | name, domain, description, contacts_count | B2B company entities |
| `conversations` | status, assignee_id, team_id, priority, sla_policy_id, uuid | Support conversations |
| `messages` | content, message_type, private, sentiment, processed_content | Chat messages |
| `inboxes` | channel_type, channel_id, auto_assignment, working_hours | Communication channels |
| `campaigns` | title, message, trigger_rules, audience, scheduled_at | Outreach campaigns |
| `automation_rules` | event_name, conditions (JSONB), actions (JSONB) | Workflow automation |
| `teams` | name, allow_auto_assign | Agent teams |
| `labels` | title, color, show_on_sidebar | Conversation labels |
| `canned_responses` | short_code, content | Quick reply templates |
| `sla_policies` | first_response_time, resolution_time, business_hours | SLA tracking |
| `custom_attribute_definitions` | key, display_type, model, regex | Custom data fields |
| `webhooks` | url, subscriptions (JSONB), secret | Event webhooks |
| `macros` | name, actions (JSONB), visibility | Action automations |
| `working_hours` | day_of_week, open_hour, close_hour | Business hours |
| `reporting_events` | name, value, conversation_id | Analytics events |
| `reporting_events_rollups` | date, metric, count, sum_value | Pre-aggregated metrics |

**Channel Tables (13 channel types!):**
| Channel Table | Protocol/Platform |
|-------------|-------------------|
| `channel_web_widgets` | Website live chat widget |
| `channel_facebook_pages` | Facebook Messenger |
| `channel_instagram` | Instagram DMs |
| `channel_twitter_profiles` | Twitter/X DMs |
| `channel_whatsapp` | WhatsApp Business API |
| `channel_telegram` | Telegram Bot |
| `channel_email` | Email (IMAP/SMTP) |
| `channel_sms` | SMS (generic) |
| `channel_twilio_sms` | Twilio SMS/WhatsApp |
| `channel_line` | LINE Messenger |
| `channel_api` | Custom API channel |
| `channel_voice` | Voice/Phone calls |
| `channel_tiktok` | TikTok Business |

**AI/Captain Tables (Chatwoot's AI Agent):**
| Table | Purpose |
|-------|---------|
| `captain_assistants` | AI assistant configurations |
| `captain_documents` | Knowledge base documents |
| `captain_assistant_responses` | AI-generated responses with embeddings |
| `captain_scenarios` | AI scenario workflows |
| `captain_custom_tools` | Custom API tool integrations |
| `captain_inboxes` | AI assistant ↔ inbox mapping |
| `article_embeddings` | Vector embeddings for help articles |
| `copilot_threads` | Agent Copilot conversations |
| `copilot_messages` | Copilot message history |

### Key Features
- **Omnichannel Inbox**: WhatsApp, Facebook, Instagram, Twitter, Telegram, LINE, TikTok, Email, SMS, Web Widget, Voice, Custom API
- **Captain AI Agent**: OpenAI-powered auto-responses, knowledge base, custom tools
- **Agent Copilot**: AI assistant for agents
- **Help Center Portal**: Self-service knowledge base with articles
- **SLA Policies**: Response time & resolution tracking
- **CSAT Surveys**: Customer satisfaction measurement
- **Automation Rules**: Event-driven workflow automation
- **Campaigns**: Proactive outreach (one-off + ongoing)
- **Macros**: One-click multi-action sequences
- **Custom Attributes**: Extensible contact/conversation data
- **Custom Roles**: Fine-grained RBAC
- **Agent Capacity Policies**: Workload balancing
- **Assignment Policies**: Round-robin, capacity-based routing
- **Reporting**: Conversation, agent, inbox, team, label reports with rollups
- **Leaves Management**: Agent leave tracking
- **Business Hours**: Per-inbox working hours
- **SAML SSO**: Enterprise single sign-on
- **Shopify Integration**: Order management in-chat

### Architecture Pattern
- **Rails monolith** with clear MVC + service layer
- **Vue.js SPA** for frontend dashboard
- **Sidekiq** for async job processing
- **ActionCable/PubSub** for real-time updates
- **pgvector** for AI embedding similarity search
- **Multi-tenant** via `account_id` on every table

---

## 4. Fonoster

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | Fonoster — Open Source Alternative to Twilio |
| **License** | MIT |
| **Language** | TypeScript (Node.js monorepo) |
| **Build System** | Lerna + npm workspaces |
| **Database** | PostgreSQL (Prisma ORM) + InfluxDB (metrics) |
| **Messaging** | NATS |
| **Category** | Programmable Telecommunications Stack |

### Directory Structure
```
fonoster/
├── mods/               # 14 microservice modules
│   ├── apiserver/      # Main API server (gRPC)
│   │   ├── schema.prisma   # PostgreSQL schema
│   │   └── src/
│   ├── identity/       # Auth & user management
│   ├── sipnet/         # SIP networking (Routr integration)
│   ├── voice/          # Voice application server
│   ├── streams/        # Audio streaming (AudioSocket)
│   ├── autopilot/      # AI-powered voice assistant
│   ├── authz/          # Authorization service
│   ├── sdk/            # Client SDK (@fonoster/sdk)
│   ├── ctl/            # CLI tool
│   ├── dashboard/      # Web dashboard (Next.js)
│   ├── common/         # Shared utilities
│   ├── types/          # Shared TypeScript types
│   ├── logger/         # Logging module
│   └── mcp/            # Model Context Protocol
├── asterisk/           # Asterisk configuration
├── config/             # Service configuration files
├── compose.yaml        # Docker Compose (10 services!)
└── package.json
```

### Docker Compose Services (Full Stack)
| Service | Purpose | Tech |
|---------|---------|------|
| `apiserver` | Main API (gRPC on 50051) | Node.js + Prisma |
| `dashboard` | Web UI (port 3030) | Next.js |
| `autopilot` | AI voice assistant (port 50061) | OpenAI + S3 |
| `routr` | SIP proxy/router | Routr (Java) |
| `rtpengine` | RTP media relay | RTPEngine |
| `asterisk` | Media server | Asterisk 20 |
| `postgres` | Main database | PostgreSQL 16 |
| `influxdb` | Call metrics/analytics | InfluxDB 2.7 |
| `nats` | Event messaging | NATS 2.11 |
| `envoy` | API gateway/TLS termination | Envoy Proxy |

### Prisma Schema (apiserver)
```
Application (ref, name, type, endpoint)
  → TextToSpeech (config, credentials)
  → SpeechToText (config, credentials)
  → Intelligence (config, credentials)
Product (name, vendor, type: TTS|STT|LLM)
Secret (name, secret_hash)

Enums:
  ApplicationType: EXTERNAL, AUTOPILOT
  ProductType: TTS, STT, LLM
  ProductVendor: GOOGLE, MICROSOFT, AMAZON, DEEPGRAM, IBM, OPENAI, GROQ, ANTHROPIC, ELEVEN_LABS
```

### Key Features
- **Voice Applications**: Programmable call flows (Answer, Hangup, Play, Say, Gather, Stream, Dial, Record, Mute)
- **AI Autopilot**: OpenAI-powered conversational voice agent
- **SDK**: Full TypeScript SDK for programmatic control
- **SIP/WebRTC**: Routr SIP proxy + RTPEngine for media
- **Multi-vendor AI**: Google, OpenAI, Deepgram, Amazon, etc.
- **Call Recording**: S3-compatible storage
- **Multitenancy**: Workspace/access-key based isolation
- **OAuth2**: GitHub OAuth + JWT authentication
- **RBAC**: Role-based access control
- **CLI**: Command-line management tool

### Architecture Pattern
- **Microservices** communicating via gRPC + NATS
- **Event-driven** with NATS pub/sub
- **API-first** design (gRPC → REST via Envoy)
- **Prisma ORM** for database access
- **Docker Compose** orchestration

---

## 5. FreePBX (framework)

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | FreePBX — Open Source GUI for Asterisk |
| **Version** | 17 |
| **License** | GPL (module-specific) |
| **Language** | PHP + JavaScript (jQuery) |
| **Database** | MySQL/MariaDB |
| **Category** | PBX GUI / Asterisk Management |

### Directory Structure
```
framework/
├── amp_conf/           # Main application code
│   ├── admin/         # Core admin interface
│   ├── astetcdir/     # Asterisk config templates
│   └── htdocs/        # Web root
├── hooks/              # Event hooks
├── install.php         # Installation script
├── installlib/         # Installation library
├── module.xml          # Module manifest (9.7KB)
├── upgrades/           # DB upgrade scripts
└── utests/             # Unit tests
```

### Key Features
- **Extension Management**: Create/manage SIP extensions
- **Trunk Configuration**: SIP trunk setup for PSTN connectivity
- **IVR Builder**: Visual IVR flow designer
- **Ring Groups**: Multi-extension ringing strategies
- **Queue Management**: ACD queues for call centers
- **CDR Reports**: Call Detail Record reporting (uses JPGraph)
- **Voicemail**: Visual voicemail management
- **Feature Codes**: Star codes configuration
- **Module System**: Installable modules for extensibility
- **Device Provisioning**: Auto-provision IP phones
- **Backup/Restore**: System backup utilities

### Frontend Stack
- jQuery + jQuery UI + Bootstrap
- Chosen (select boxes), Typeahead, Sortable
- Font Awesome icons
- toastr notifications
- Smart Wizard for multi-step forms

### Architecture Pattern
- **PHP monolith** with module system
- **Asterisk config generation** from web UI
- MySQL for configuration storage
- Module-based extensibility (each module = separate package)

---

## 6. FusionPBX

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | FusionPBX — Multi-Tenant PBX |
| **License** | MPL 1.1 |
| **Language** | PHP |
| **Database** | PostgreSQL (primary), SQLite, MySQL |
| **PBX Engine** | FreeSWITCH (not Asterisk!) |
| **Category** | Multi-Tenant PBX / Carrier-Grade Switch |

### Directory Structure (76 app modules!)
```
fusionpbx/
├── app/                    # 76 application modules!
│   ├── extensions/         # SIP extensions
│   ├── call_centers/       # Call center module
│   ├── call_recordings/    # Call recording
│   ├── conferences/        # Conference rooms
│   ├── destinations/       # Call destinations
│   ├── devices/            # Phone provisioning
│   ├── dialplans/         # Dialplan manager
│   ├── fax/               # Fax server
│   ├── gateways/          # SIP gateways/trunks
│   ├── ivr_menus/         # IVR designer
│   ├── ring_groups/       # Ring groups
│   ├── voicemails/        # Voicemail
│   ├── xml_cdr/           # CDR reporting
│   ├── call_flows/        # Call flow toggle
│   ├── follow_me/         # Find-me/Follow-me
│   ├── time_conditions/   # Time-based routing
│   ├── recordings/        # Audio recordings manager
│   ├── music_on_hold/     # MOH manager
│   ├── bridges/           # Call bridges
│   ├── click_to_call/     # Click-to-call
│   ├── provision/         # Device auto-provisioning
│   ├── operator_panel/    # Receptionist panel
│   │   ── ... (50+ more modules for specific phone brands)
│   ├── yealink/, poly/, grandstream/, cisco/, snom/  # Phone brand-specific provisioning
│   └── ... 
├── core/               # Core framework code
├── resources/          # Shared resources
├── themes/             # UI themes
└── secure/             # Authentication
```

### Key Features
- **Multi-Tenant**: Domain-based isolation for hosting providers
- **76 App Modules**: Extremely comprehensive PBX feature set
- **FreeSWITCH Backend**: High-performance media server
- **Call Center**: Full ACD with agent management
- **Fax Server**: T.38 fax support
- **Device Provisioning**: Auto-config for 10+ phone brands
- **Call Recording**: Per-extension and per-trunk recording
- **Hot Desking**: Login to any phone with personal settings
- **High Availability**: Cluster support with redundancy
- **REST API**: Gold membership feature
- **Call Center Wallboard**: Real-time agent monitoring

### Architecture Pattern
- **PHP monolith** with modular app system
- **FreeSWITCH** for all telephony (not Asterisk)
- **PostgreSQL** primary database
- Each app module is self-contained (`app/{module}/`)
- Domain-based multi-tenancy at database level

---

## 7. ICTCore

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | ICTCore — Unified Communications Framework for CTI |
| **License** | MPL v2 |
| **Language** | PHP |
| **Database** | MySQL (InnoDB) |
| **Gateways** | FreeSWITCH, Kannel (SMS), Sendmail |
| **Category** | CTI (Computer Telephony Integration) Framework |

### Directory Structure
```
ictcore/
├── core/               # Core framework
│   ├── Account.php     # User account management
│   ├── Campaign.php    # Campaign engine
│   ├── Contact.php     # Contact management
│   ├── Program.php     # Communication program logic (22KB)
│   ├── Transmission.php # Transmission engine (21KB)
│   ├── Spool.php       # Call spooling
│   ├── Provider.php    # Trunk providers
│   ├── Gateway/        # Gateway adapters (FreeSWITCH, Kannel, etc.)
│   ├── Service/        # Voice, Fax, SMS, Email services
│   ├── Message/        # Message types
│   ├── Program/        # Built-in programs (SendFax, AutoDial, etc.)
│   ├── Api/            # REST API endpoints
│   └── User/           # User management
├── db/                 # Database schemas (118KB main schema!)
│   ├── database.sql    # Core schema (1833 lines!)
│   ├── voice.sql       # Voice-specific tables
│   ├── fax.sql         # Fax-specific tables
│   ├── email.sql       # Email-specific tables
│   ├── sms.sql         # SMS-specific tables
│   └── data/           # Seed data (roles, demo users)
├── etc/                # Configuration files
├── bin/                # CLI scripts
└── wwwroot/            # Web API entry point
```

### Database Schema (Core — 30+ tables)
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `account` | SIP/communication accounts | username, passwd, type, settings |
| `usr` | System users | username, passwd, role_id, company, timezone |
| `role` | User roles | name, description |
| `permission` | 80+ granular permissions | name (program_create, campaign_start, etc.) |
| `contact` | Contact directory | first_name, phone, email, custom1-3 |
| `contact_group` | Contact groups | name, contact_total |
| `contact_link` | Group ↔ Contact mapping | group_id, contact_id |
| `transmission` | Communication instances | service_flag, origin, direction, status, try_allowed |
| `campaign` | Batch campaigns | program_id, group_id, cpm, contact_total, contact_done |
| `spool` | Active call tracking | call_id, status, response, amount, node_id |
| `spool_result` | Call results | application_id, type, name, data |
| `program` | Communication programs | name, type, data (JSON) |
| `application` | Program steps | name, type, weight, program_id |
| `action` | Application actions | type, action, data |
| `gateway` | Supported gateways | name, service_flag (voice=1, fax=2, sms=4, email=8) |
| `node` | Server nodes | api_host, ssh_host, channel capacity, cps |
| `provider` | Trunk providers | — |
| `task` | Scheduled tasks | type, action, due_at, is_recurring |
| `schedule` | Cron-like scheduling | year, month, day, hour, minute |
| `ivr` | IVR trees | name, data (JSON tree) |
| `configuration` | System settings | type, name, data |

### Key Features
- **Unified Communications**: Voice + Fax + SMS + Email in one framework
- **Program/Scenario System**: Declarative communication workflows
- **Campaign Engine**: Batch calling/faxing/messaging with progress tracking
- **Multi-Gateway**: FreeSWITCH (voice/fax), Kannel (SMS), Sendmail (email)
- **Cross-service Integration**: SMS after call, email to fax, etc.
- **REST API**: Full CRUD API for all resources
- **Multi-Node**: Distributed across multiple servers
- **CRM Integration**: ICTCRM built on top

### Architecture Pattern
- **PHP framework** with service/program abstraction
- **MySQL triggers** for campaign progress auto-tracking
- **MySQL events** for job scheduling (1-second resolution!)
- **Multi-gateway** abstraction layer
- Program → Application → Action → Transmission → Spool pipeline

---

## 8. IssabelPBX

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | IssabelPBX — Open Source GUI for Asterisk |
| **Version** | 2.12 |
| **License** | GPL v3 |
| **Language** | PHP |
| **Forked From** | FreePBX (originally AMP from 2004) |
| **Database** | MySQL |
| **Category** | PBX GUI |

### Directory Structure (83+ modules!)
```
issabelPBX/
├── framework/          # Core framework
├── core/              # Core PBX module
├── queues/            # Call queue management
├── conferences/       # Conference rooms
├── ivr/               # IVR builder
├── ringgroups/        # Ring groups
├── voicemail/         # Voicemail
├── cdr/               # Call Detail Records
├── recordings/        # Audio recordings
├── backup/            # Backup/restore
├── callrecording/     # Call recording toggle
├── callforward/       # Call forwarding
├── callwaiting/       # Call waiting
├── findmefollow/      # Find-me/Follow-me
├── timeconditions/    # Time-based routing
├── parking/           # Call parking
├── paging/            # Paging/intercom
├── fax/               # Fax support
├── extensionsettings/ # Per-extension settings
├── sipsettings/       # Global SIP settings
├── trunks.balance/    # Trunk balance monitoring
├── tts/               # Text-to-Speech
├── userman/           # User management
├── customcontexts/    # Custom dialplan contexts
├── superfecta/        # CallerID superfecta
├── cidlookup/         # CallerID lookup
├── phonebook/         # Phone directory
├── dashboard/         # Admin dashboard
└── ... (50+ more modules)
```

### Key Features
- **83 Modules**: Most comprehensive module set of any PBX GUI
- **Full PBX Management**: Extensions, trunks, routes, IVR, queues
- **CallerID Management**: Superfecta, CID lookup, set CID
- **Hotel Wakeup**: Hotel wake-up call feature
- **Speed Dial**: Quick dial management
- **DND/Call Forward**: Per-extension call handling
- **Bulk Operations**: Bulk DIDs, bulk extensions
- **Custom Contexts**: Advanced dialplan customization
- **Queue Metrics**: QueueMetrics integration
- **Day/Night Mode**: Business hour routing
- **DISA**: Direct Inward System Access
- **Dictation**: Voice dictation module
- **Inventory DB**: Hardware/device inventory tracking

---

## 9. Issabel Call Center (callcenter)

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | Issabel Call Center Module |
| **License** | GPL v2 |
| **Language** | PHP |
| **Parent** | Issabel (fork of Elastix) |
| **Category** | Call Center |

### Module Structure (28 sub-modules)
```
callcenter/modules/
├── agent_console/              # Agent web interface
├── agents/                     # Agent management
├── campaign_out/               # Outbound campaigns
├── campaign_in/                # Inbound campaigns
├── campaign_lists/             # Contact lists for campaigns
├── campaign_monitoring/        # Real-time campaign monitoring
├── queues/                     # ACD queue management
├── client/                     # Client/customer management
├── form_designer/              # Custom form builder
├── form_list/                  # Form preview
├── dont_call_list/             # DNC list management
├── external_url/               # CRM popup URLs
├── eccp_users/                 # ECCP API users
├── cb_extensions/              # Callback extensions
├── break_administrator/        # Agent break management
├── reports_break/              # Break reports
├── calls_detail/               # Detailed call reports
├── calls_per_hour/             # Volume per hour
├── calls_per_agent/            # Volume per agent
├── hold_time/                  # Hold time analytics
├── login_logout/               # Agent session tracking
├── ingoings_calls_success/     # Inbound success rate
├── graphic_calls/              # Graphical call visualization
├── rep_agent_information/      # Agent performance
├── rep_agents_monitoring/      # Real-time agent monitoring
├── rep_trunks_used_per_hour/   # Trunk utilization
├── rep_incoming_calls_monitoring/ # Inbound monitoring
└── callcenter_config/          # System configuration
```

### Menu Structure (from menu.xml)
```
Call Center
├── Agent Console
├── Outgoing Calls
│   ├── Campaigns
│   ├── Do Not Call List
│   └── External URLs
├── Campaign Lists
├── Ingoing Calls
│   ├── Queues
│   ├── Clients
│   └── Ingoing Campaigns
├── Agent Options
│   ├── Agents
│   ├── ECCP Users
│   └── Callback Extensions
├── Breaks
├── Forms
│   ├── Form Designer
│   └── Form Preview
├── Reports
│   ├── Break Reports, Call Detail, Calls/Hour, Calls/Agent
│   ├── Hold Time, Login/Logout, Ingoing Success
│   ├── Graphical Calls, Agent Info, Agent Monitoring
│   ├── Trunk Usage, Incoming Monitoring, Campaign Monitoring
└── Configuration
```

### Key Features
- **Predictive/Preview Dialing**: Outbound campaign modes
- **ACD Queuing**: Inbound call distribution
- **Agent Console**: Web-based agent interface
- **Campaign Management**: Inbound + outbound with contact lists
- **Form Designer**: Custom forms for agent data capture
- **DNC List**: Do-Not-Call compliance
- **Break Management**: Track agent break times
- **External URLs**: CRM screen-pop integration
- **ECCP Protocol**: External Control for Call Centers
- **13 Report Types**: Comprehensive analytics

---

## 10. OMniLeads (ominicontacto)

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | OMniLeads (OML) — Open Source Contact Center |
| **License** | GPL v3 |
| **Language** | Python (Django) + JavaScript (Vue.js) |
| **Database** | PostgreSQL |
| **PBX Engine** | Asterisk + Kamailio + RTPEngine |
| **Category** | Contact Center / Omnichannel |

### Directory Structure
```
ominicontacto/
├── ominicontacto_app/      # Main Django app (160KB models.py!)
│   ├── models.py           # All database models (160KB — massive!)
│   ├── urls.py             # URL routing (50KB!)
│   ├── views*/             # 20+ view files for different features
│   ├── services/           # Business logic services
│   ├── forms/              # Django forms
│   ├── migrations/         # Database migrations
│   ├── asterisk_config.py  # Asterisk conf generation (38KB)
│   └── bgtasks/            # Background tasks
├── api_app/                # REST API
├── omnileads_ui/           # Vue.js frontend
├── reportes_app/           # Reporting module
├── supervision_app/        # Real-time supervision
├── notification_app/       # Notifications
├── reciclado_app/          # Lead recycling
├── whatsapp_app/           # WhatsApp integration
├── configuracion_telefonia_app/ # Telephony configuration
├── orquestador_app/        # Campaign orchestrator
├── manage.py               # Django management
└── requirements/           # Python dependencies
```

### Key Features
- **WebRTC Agent Console**: Browser-based softphone
- **4 User Profiles**: Administrator, Supervisor Admin, Supervisor Client, Agent
- **Campaign Types**: Inbound, Preview, Manual Outbound, Predictive/Progressive (via API)
- **Video Calls**: Video call campaigns from web pages (v1.25+)
- **WhatsApp Integration**: Built-in WhatsApp channel
- **Answering Machine Detection**: AMD for outbound calls
- **Full Recording**: All calls recorded
- **Productivity Reports**: Performance analytics
- **Real-time Supervision**: Live agent monitoring
- **Web Form Builder**: Custom agent forms
- **CRM/ERP Integration**: API-based CRM connectivity
- **Remote Agents**: Work-from-home agent support
- **Lead Recycling**: Re-contact management
- **Clusterization**: Distributed component deployment

### Architecture Pattern
- **Django monolith** with app-per-feature structure
- **Asterisk** for call handling
- **Kamailio** for SIP proxy/load balancing
- **RTPEngine** for media relay
- **Vue.js** frontend (in `omnileads_ui/`)
- Docker/Podman containerized deployment

---

## 11. GOautodial (v4.0)

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | GOautodial Open Source Omni-channel Contact Center Suite |
| **Version** | 4.0 |
| **License** | AGPL v2 |
| **Language** | PHP 7 + JavaScript + NodeJS |
| **Database** | MariaDB/MySQL |
| **PBX Engine** | Asterisk + Kamailio |
| **Category** | Contact Center Suite |

### Directory Structure (94 files!)
```
v4.0/
├── index.php               # Main entry (116KB!)
├── agent.php               # Agent interface (134KB!)
├── telephonycampaigns.php  # Campaign management (183KB!)
├── telephonyinbound.php    # Inbound campaigns (131KB!)
├── edittelephonycampaign.php # Campaign editor (276KB!)
├── edittelephonyinbound.php  # Inbound editor (203KB!)
├── telephonyusers.php      # User management (53KB)
├── reports.php             # Reporting (53KB)
├── callreports.php         # Call reports (40KB)
├── crm.php                 # Built-in CRM (23KB)
├── editcontacts.php        # Contact editor (47KB)
├── customerslist.php       # Customer list (21KB)
├── tasks.php               # Task management
├── events.php              # Event calendar
├── messages.php            # Messaging
├── livechat.php            # Live chat
├── notifications.php       # Notifications
├── composemail.php         # Email compose
├── settings*.php           # Multiple settings pages
├── telephonylist.php       # Dialing lists (48KB)
├── telephonyscripts.php    # Agent scripts
├── telephonyfilters.php    # Call filters
├── addcustomfield.php      # Custom fields (48KB)
├── job-scheduler.php       # Job scheduler
├── install.php             # Installer
├── adminlte/               # AdminLTE theme
├── php/                    # PHP libraries
├── js/                     # JavaScript assets
├── css/                    # Stylesheets
├── modules/                # Loadable modules
└── jobs/                   # Background jobs
```

### Key Features
- **Predictive Dialer**: Built on VICIdial engine
- **Preview & Manual Dialing**: Multiple dialing modes
- **Inbound IVR + ACD**: Full inbound call center
- **Built-in CRM**: Contact management, customer lists
- **REST APIs**: Plugin-based API system
- **Agent Scripts**: Dynamic agent scripting
- **Custom Fields**: Extensible lead data
- **Task Management**: Agent task tracking
- **Event Calendar**: Scheduling system
- **Live Chat**: Real-time chat support
- **Email**: Compose and send emails
- **Reports & Analytics**: Comprehensive call reports
- **WebRTC**: JSSIP-based softphone via WebRTC
- **Socket.IO**: Real-time agent dashboard updates
- **Multi-language**: Internationalization support

### Architecture Pattern
- **PHP monolith** (massive individual files — some 200KB+!)
- **AdminLTE** UI framework
- Built on **VICIdial** dialer engine
- **Asterisk** for telephony
- **Kamailio** for SIP proxy
- **WebRTC via JSSIP** for browser-based calling
- **Socket.IO + Node.js** for real-time features

---

## 12. VICIdial

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | VICIdial — Call Center Software |
| **License** | AGPL v2 |
| **Language** | Perl + PHP + C |
| **Database** | MySQL/MariaDB |
| **PBX Engine** | Asterisk |
| **Category** | Contact Center / Auto-Dialer |

### Repository Contents
This is a Chinese-translated/customized version of VICIdial focusing on:
- **Asterisk ARI (Asterisk REST Interface)** integration
- **Speech Recognition API** integration
- **External Media** sessions for AI processing

### Key VICIdial Features (from upstream)
- **Predictive Dialer**: Statistical algorithm for optimal dialing
- **Inbound ACD**: Automatic Call Distribution
- **Blended Campaigns**: Inbound + outbound simultaneously
- **Recording**: Full call recording
- **Agent Interface**: Web-based with WebRTC
- **Lead Management**: Contact list import/management
- **DNC Compliance**: Do-Not-Call list management
- **Reporting**: 100+ built-in reports
- **Multi-Server**: Distributed architecture across servers
- **Script Builder**: Dynamic agent scripts
- **Real-Time Monitoring**: Live agent dashboard
- **API**: Non-agent API for integrations
- **Callback Scheduling**: Agent and auto callbacks
- **Quality Control**: Call grading and monitoring
- **IVR**: Interactive Voice Response builder

### Architecture Pattern
- **Perl daemons** for dialer engine and background processes
- **PHP web interface** for agents and admins
- **Asterisk AMI** for call control
- **MySQL** for all data storage
- Multi-server architecture with dedicated roles

---

## 13. Wazo-confd

### Identity
| Field | Value |
|-------|-------|
| **Full Name** | wazo-confd — Wazo Platform Configuration Daemon |
| **License** | GPL v3 |
| **Language** | Python (Flask/Connexion) |
| **Database** | PostgreSQL (via SQLAlchemy/xivo-dao) |
| **Category** | UC Platform Configuration API |

### Directory Structure
```
wazo-confd/
├── wazo_confd/
│   ├── plugins/        # 112 API plugins!
│   │   ├── user/           # User management
│   │   ├── line/           # Phone lines
│   │   ├── extension/      # Extensions
│   │   ├── trunk/          # SIP trunks
│   │   ├── incall/         # Inbound routes
│   │   ├── outcall/        # Outbound routes
│   │   ├── queue/          # ACD queues
│   │   ├── agent/          # Call center agents
│   │   ├── agent_skill/    # Agent skills for routing
│   │   ├── skill/          # Skill definitions
│   │   ├── skill_rule/     # Skill-based routing rules
│   │   ├── group/          # Ring groups
│   │   ├── conference/     # Conference rooms
│   │   ├── ivr/            # IVR menus
│   │   ├── switchboard/    # Switchboard/receptionist
│   │   ├── voicemail/      # Voicemail management
│   │   ├── parking_lot/    # Call parking
│   │   ├── paging/         # Paging groups
│   │   ├── call_filter/    # Boss-secretary filtering
│   │   ├── call_permission/# Call permissions/restrictions
│   │   ├── call_pickup/    # Call pickup groups
│   │   ├── schedule/       # Time-based routing
│   │   ├── meeting/        # Virtual meetings
│   │   ├── device/         # Phone provisioning
│   │   ├── endpoint_sip/   # SIP endpoint config
│   │   ├── endpoint_iax/   # IAX endpoint config
│   │   ├── context/        # Dialplan contexts
│   │   ├── sound/          # Sound file management
│   │   ├── moh/            # Music on hold
│   │   ├── recordings/     # Call recordings
│   │   ├── tenant/         # Multi-tenant management
│   │   ├── external_app/   # External app integration
│   │   └── ... (80+ more plugins)
│   ├── database/       # Database helpers
│   ├── helpers/        # Utility functions
│   ├── representations/ # Data serialization
│   └── tests/          # Unit tests
├── integration_tests/  # Docker-based integration tests
├── etc/                # Configuration
└── debian/             # Debian packaging
```

### Key Features
- **112 REST API Plugins**: Most extensive telephony API
- **Full PBX Configuration**: Users, lines, extensions, trunks, routes
- **Skill-Based Routing**: Agent skills, rules, and matching
- **Multi-Tenant**: Tenant-based isolation
- **Boss-Secretary**: Call filtering patterns
- **Switchboard**: Receptionist console support
- **Meeting Management**: Virtual meeting rooms
- **Phone Provisioning**: Device auto-configuration
- **Voicemail Transcription**: Speech-to-text for voicemails
- **OpenAPI Specification**: Auto-generated API docs per plugin
- **Event Bus**: Integration with `wazo-bus` for notifications

### Architecture Pattern
- **Plugin-based microservice** architecture
- **Flask/Connexion** REST framework with OpenAPI
- **SQLAlchemy** ORM via `xivo-dao`
- **Wazo Platform** ecosystem (wazo-confd is one of many services)
- Each plugin is self-contained with its own API spec

---

## 14. Cross-Project Feature Matrix

| Feature | Rocket.Chat | Asterisk | Chatwoot | Fonoster | FreePBX | FusionPBX | ICTCore | IssabelPBX | Callcenter | OMniLeads | GOautodial | VICIdial | Wazo |
|---------|:-----------:|:--------:|:--------:|:--------:|:-------:|:---------:|:-------:|:----------:|:----------:|:---------:|:----------:|:--------:|:----:|
| **SIP/VoIP** | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **WebRTC** | ✅ | ✅ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ | ✅ | ✅ | ✅ |
| **Predictive Dialer** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ | ✅ | ✅ | ✅ | ✗ |
| **ACD/Queues** | ✗ | ✅ | ✗ | ✗ | ✅ | ✅ | ✗ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **IVR** | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ | ✅ | ✅ |
| **Call Recording** | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ | ✗ | ✅ | ✗ | ✅ | ✅ | ✅ | ✅ |
| **Live Chat** | ✅ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ |
| **WhatsApp** | ✅ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ |
| **Email** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ |
| **SMS** | ✅ | ✅ | ✅ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Fax** | ✗ | ✗ | ✗ | ✗ | ✅ | ✅ | ✅ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **CRM** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✅ | ✗ | ✗ | ✅ | ✅ | ✅ | ✗ |
| **AI/ML** | ✅ | ✗ | ✅ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Multi-Tenant** | ✗ | ✗ | ✅ | ✅ | ✗ | ✅ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ |
| **REST API** | ✅ | ✅ | ✅ | ✅ | ✗ | ✅ | ✅ | ✗ | ✗ | ✅ | ✅ | ✅ | ✅ |
| **Reporting** | ✗ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✗ |
| **Agent Console** | ✗ | ✗ | ✅ | ✗ | ✗ | ✗ | ✗ | ✗ | ✅ | ✅ | ✅ | ✅ | ✗ |

---

## 15. Unified Schema Extraction

### Tables We Should Build in Karan SaaS (from these repos)

#### From Chatwoot (Highest Priority — Modern Schema)
- `channel_voice` — Voice channel configuration (already in Chatwoot!)
- `captain_assistants` — AI agent configuration
- `captain_scenarios` — AI workflow scenarios
- `captain_custom_tools` — Custom API tool integrations
- `sla_policies` + `applied_slas` + `sla_events` — SLA tracking
- `assignment_policies` — Fair distribution algorithms
- `agent_capacity_policies` + `inbox_capacity_limits` — Workload balancing
- `automation_rules` — Event-driven workflow engine
- `campaigns` — Proactive outreach with scheduling
- `custom_attribute_definitions` — Dynamic custom fields
- `reporting_events_rollups` — Pre-aggregated analytics
- `leaves` — Agent leave management

#### From ICTCore (Unique to CTI)
- `transmission` — Unified communication tracking (voice/fax/sms/email)
- `spool` — Active call/session tracking
- `spool_result` — Per-call outcome data
- `program` + `application` + `action` — Communication workflow engine
- `node` — Multi-server management
- `gateway` — Gateway/trunk provider abstraction
- `ivr` — IVR tree storage

#### From Wazo-confd (Telephony Config)
- `skill` + `skill_rule` + `agent_skill` — Skill-based routing
- `switchboard` + `switchboard_member` — Receptionist console
- `parking_lot` — Call parking management
- `call_filter` — Boss-secretary patterns
- `call_permission` — Call restriction rules

#### From GOautodial/VICIdial (Dialer)
- Campaign dialer configuration (predictive/preview/manual modes)
- Agent script engine
- DNC list management
- Campaign monitoring / wallboard data

---

## 16. Architecture Patterns Summary

| Pattern | Used By | Relevance to Karan SaaS |
|---------|---------|------------------------|
| **Monorepo + Turborepo** | Rocket.Chat | ⭐⭐⭐ Consider for frontend packages |
| **Rails MVC + Service Layer** | Chatwoot | ⭐⭐⭐ Similar to NestJS pattern |
| **Microservices + gRPC** | Fonoster | ⭐⭐ For telephony services |
| **Plugin Architecture** | Wazo-confd (112 plugins) | ⭐⭐⭐ For extensible API |
| **Module-per-Feature** | FusionPBX (76 modules) | ⭐⭐⭐ Already using in NestJS |
| **Program → Transmission Pipeline** | ICTCore | ⭐⭐⭐ For campaign engine |
| **Event-driven (NATS)** | Fonoster | ⭐⭐ For real-time features |
| **Multi-tenant (account_id)** | Chatwoot, FusionPBX, ICTCore | ⭐⭐⭐ Already implemented |
| **WebRTC Softphone** | OMniLeads, GOautodial | ⭐⭐⭐ For agent console |
| **AI Agent (pgvector)** | Chatwoot (Captain) | ⭐⭐⭐ Priority integration |
| **Skill-based Routing** | Wazo-confd | ⭐⭐⭐ For call center module |
| **MySQL Triggers for Counters** | ICTCore | ⭐⭐ Prisma middleware alternative |

---

## 17. Integration Recommendations for Karan SaaS

### Tier 1: Must Extract & Build (Core Business Value)
1. **Chatwoot's Omnichannel Engine** — 13 channel types, conversation model, inbox routing
2. **Chatwoot's Captain AI** — Vector search, custom tools, AI scenarios
3. **ICTCore's Campaign/Transmission Pipeline** — Unified voice/sms/email campaigns
4. **Wazo's Skill-Based Routing** — Agent skills, matching rules, queue optimization
5. **Chatwoot's SLA System** — Response time tracking, escalation events

### Tier 2: Should Build (Competitive Advantage)
6. **OMniLeads' WebRTC Agent Console** — Browser-based softphone
7. **GOautodial's Predictive Dialer Logic** — Statistical dialing algorithms
8. **FusionPBX's Multi-Tenant PBX** — Domain-based telephony isolation
9. **Fonoster's Programmable Voice** — API-driven call flow control
10. **Chatwoot's Automation Rules** — Event → condition → action engine

### Tier 3: Nice to Have (Differentiation)
11. **Rocket.Chat's Apps Engine** — Marketplace for custom integrations
12. **IssabelPBX's 83 Modules** — Feature inspiration library
13. **ICTCore's Cross-Service Integration** — SMS after call, email-to-fax
14. **Chatwoot's Reporting Rollups** — Pre-aggregated analytics for dashboards
15. **Wazo's 112 API Plugins** — API design patterns for extensibility
