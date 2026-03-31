# 🔬 Complete SaaS Project Analysis

> Analysis of 10 SaaS projects from `C:\Users\arpit\OneDrive\Desktop\Saas` — extracted database architecture, UI/design patterns, project architecture, and feature catalog for building the world's most integrated SaaS platform.

---

## 📋 Project Inventory

| # | Project | Type | Tech Stack | Database | Status |
|---|---------|------|------------|----------|--------|
| 1 | **ERPNext** | Full ERP System | Python (Frappe Framework), JavaScript, Vue.js (Frappe UI) | MariaDB/PostgreSQL | ✅ Core SaaS |
| 2 | **Evolution API** | Messaging/WhatsApp Platform | TypeScript, Node.js, NestJS-style | PostgreSQL (Prisma ORM) / MySQL | ✅ Core SaaS |
| 3 | **n8n** | Workflow Automation | TypeScript, Node.js, Vue.js | PostgreSQL/SQLite (TypeORM) | ✅ Core SaaS |
| 4 | **Twenty** | Open-Source CRM | TypeScript, React, NestJS, GraphQL | PostgreSQL (TypeORM), Redis, BullMQ | ✅ Core SaaS |
| 5 | **Frappe Docker** | Docker Orchestration | Docker, Shell scripts | N/A (deployment tool) | ⚙️ Infrastructure Only |
| 6 | **Traccar** | GPS Tracking System | Java (Netty), React (Web) | H2/MySQL/PostgreSQL (Liquibase) | ✅ Core SaaS |
| 7 | **Chatwoot** | Customer Support Platform | Ruby on Rails, Vue.js | PostgreSQL (pgvector, pg_trgm) | ✅ Core SaaS |
| 8 | **Jasmin** | SMS Gateway | Python (Twisted) | Redis + RabbitMQ (AMQP) | ✅ Core SaaS |
| 9 | **Mailcow** | Self-Hosted Email Suite | Docker, Postfix, Dovecot, SOGo | MariaDB, Redis, Memcached | ✅ Core SaaS |
| 10 | **Frappe HR (HRMS)** | HR & Payroll Platform | Python (Frappe Framework), Vue.js, Ionic | MariaDB (via Frappe ORM) | ✅ Core SaaS |

---

## 1. ERPNext — Full ERP System

### Overview
100% open-source ERP covering accounting, inventory, manufacturing, HR, projects, CRM, and more. Built on the **Frappe Framework** with a Python backend and Vue.js frontend.

### Architecture
```
ERPNext Architecture:
├── Frappe Framework (Full-stack web framework)
│   ├── Python Backend (REST API, ORM, Authentication)
│   ├── MariaDB / PostgreSQL Database
│   ├── Redis (Caching, Queue, Pub/Sub)
│   └── Node.js (Socket.io for real-time updates)
├── Frappe UI (Vue.js component library)
└── ERPNext App (Business logic modules)
```

### 21 Modules & Key Doctypes

#### 💰 Accounts (186 doctypes)
- **Core**: Account, GL Entry, Journal Entry, Payment Entry, Payment Ledger Entry
- **Sales**: Sales Invoice, Sales Invoice Item, Sales Taxes & Charges
- **Purchase**: Purchase Invoice, Purchase Invoice Item, Purchase Taxes & Charges
- **Banking**: Bank, Bank Account, Bank Transaction, Bank Reconciliation Tool, Bank Guarantee
- **POS**: POS Profile, POS Invoice, POS Opening/Closing Entry
- **Subscriptions**: Subscription, Subscription Plan, Subscription Invoice
- **Loyalty**: Loyalty Program, Loyalty Point Entry
- **Pricing**: Pricing Rule, Promotional Scheme, Coupon Code
- **Tax**: Tax Category, Tax Rule, Tax Withholding, Item Tax Template
- **Budget**: Budget, Budget Account, Budget Distribution
- **Dunning**: Dunning, Dunning Type
- **Reports**: Financial Report Template, Fiscal Year, Cost Center, Finance Book

#### 👥 CRM (27 doctypes)
- **Pipeline**: Lead, Opportunity, Opportunity Item, Sales Stage
- **Prospects**: Prospect, Prospect Lead, Prospect Opportunity
- **Campaigns**: Campaign, Email Campaign, Campaign Email Schedule
- **Contracts**: Contract, Contract Template, Contract Fulfilment Checklist
- **Appointments**: Appointment, Appointment Booking Settings/Slots
- **Competition**: Competitor, Competitor Detail
- **Notes**: CRM Note, CRM Settings
- **Segmentation**: Market Segment, Opportunity Type, Opportunity Lost Reason

#### 📦 Stock / Inventory (77 doctypes)
- **Items**: Item, Item Attribute, Item Variant, Item Barcode, Item Price, Item Default
- **Warehousing**: Warehouse, Warehouse Type, Putaway Rule, Inventory Dimension
- **Transactions**: Stock Entry, Stock Ledger Entry, Material Request, Stock Reconciliation
- **Delivery**: Delivery Note, Delivery Trip, Delivery Stop, Shipment, Packing Slip
- **Receiving**: Purchase Receipt, Landed Cost Voucher
- **Tracking**: Serial No, Batch, Serial and Batch Bundle, Stock Reservation Entry
- **Quality**: Quality Inspection, Quality Inspection Template
- **Valuation**: Repost Item Valuation, Stock Closing Entry

#### 🏭 Manufacturing (47 doctypes)
- **BOM**: Bill of Materials, BOM Item, BOM Operation, BOM Scrap Item, BOM Creator
- **Production**: Work Order, Work Order Item, Work Order Operation
- **Job Cards**: Job Card, Job Card Item, Job Card Time Log, Job Card Scheduled Time
- **Planning**: Production Plan, Master Production Schedule, Sales Forecast
- **Workstations**: Workstation, Workstation Type, Workstation Cost
- **Operations**: Operation, Routing, Sub Operation
- **Plant**: Plant Floor, Downtime Entry

#### 🛒 Selling (18 doctypes)
- Customer, Customer Credit Limit
- Quotation, Quotation Item
- Sales Order, Sales Order Item
- Sales Team, Sales Partner Type
- Product Bundle, Product Bundle Item
- Installation Note, Selling Settings, SMS Center

#### 🛍️ Buying (20 doctypes)
- Supplier, Supplier Scorecard, Supplier Quotation
- Purchase Order, Purchase Order Item
- Request for Quotation
- Buying Settings

#### 📋 Projects (15 doctypes)
- Project, Project Template, Project Type, Project Update, Project User
- Task, Task Depends On, Task Type, Dependent Task
- Timesheet, Timesheet Detail
- Activity Cost, Activity Type

#### 🔧 Support (11 doctypes)
- Issue, Issue Type, Issue Priority
- Service Level Agreement, Service Day, Service Level Priority
- Warranty Claim, Support Settings

#### 🏢 Assets (26 doctypes)
- Asset, Asset Category, Asset Depreciation Schedule
- Asset Maintenance, Asset Maintenance Log, Asset Maintenance Team
- Asset Movement, Asset Repair, Asset Value Adjustment
- Asset Capitalization, Location

#### 🔄 Others
- **Quality Management**: Quality Goal, Quality Procedure, Quality Review, Quality Action
- **Subcontracting**: Subcontracting Order, Subcontracting Receipt
- **Communication**: Communication Medium, Communication Channel
- **Telephony**: Call Log, Incoming Call Settings
- **EDI**: EDI integration modules
- **Maintenance**: Maintenance Visit, Maintenance Schedule

### Design/UI Patterns
- **Desk UI**: Classic list/form-based UI with workspace sidebars
- **Frappe UI (Vue.js)**: Modern SPA components for newer views
- **Print Formats**: Customizable PDF templates (Jinja2)
- **Dashboard Charts & Number Cards**: Real-time visualizations
- **Filters, Views, Reports**: Standard list views with advanced filtering

---

## 2. Evolution API — Messaging/WhatsApp Platform

### Overview
Multi-channel messaging API, originally WhatsApp-focused (via Baileys library), now supporting WhatsApp Business API, with integrations to Typebot, Chatwoot, Dify, OpenAI, n8n, Flowise, and more.

### Architecture
```
Evolution API Architecture:
├── TypeScript / Node.js Backend
│   ├── REST API endpoints
│   ├── Prisma ORM
│   └── PostgreSQL / MySQL Database
├── Messaging Engines
│   ├── Baileys (WhatsApp Web)
│   └── WhatsApp Cloud API (Meta Official)
├── Event Streaming
│   ├── RabbitMQ, Apache Kafka, Amazon SQS
│   ├── WebSocket (Socket.io)
│   ├── Pusher, NATS
│   └── Webhooks
├── AI Bot Integrations
│   ├── OpenAI (Assistant + Chat Completion)
│   ├── Dify (ChatBot, TextGenerator, Agent, Workflow)
│   ├── Flowise
│   ├── Evolution Bot (Custom)
│   ├── Evoai
│   └── n8n (webhook-based)
├── External Integrations
│   ├── Chatwoot (Customer Support)
│   ├── Typebot (Conversational Bots)
│   └── Amazon S3 / Minio (Media Storage)
└── Monitoring
    ├── Prometheus
    └── Grafana
```

### Database Schema (35+ Prisma Models)

#### Core Messaging
| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Instance** | WhatsApp connection instance | name, connectionStatus, ownerJid, profileName, number, token, integration |
| **Session** | WhatsApp session credentials | sessionId, creds |
| **Chat** | Chat conversations | remoteJid, name, labels, unreadMessages |
| **Contact** | Contact information | remoteJid, pushName, profilePicUrl |
| **Message** | Messages sent/received | key (JSON), pushName, messageType, message (JSON), source (device), messageTimestamp |
| **MessageUpdate** | Message status updates | keyId, remoteJid, status, pollUpdates |
| **Media** | Message attachments | fileName, type, mimetype |
| **Label** | Chat/contact labels | labelId, name, color |
| **Template** | Message templates | templateId, name, template (JSON) |

#### AI Bot Integrations
| Model | Purpose | Key Fields |
|-------|---------|------------|
| **OpenaiCreds** | OpenAI API credentials | name, apiKey |
| **OpenaiBot** | OpenAI bot config | botType (assistant/chatCompletion), assistantId, model, systemMessages, maxTokens |
| **OpenaiSetting** | OpenAI instance settings | speechToText, fallback |
| **Dify** | Dify AI bot | botType (chatBot/textGenerator/agent/workflow), apiUrl, apiKey |
| **DifySetting** | Dify instance settings | fallback, debounceTime |
| **EvolutionBot** | Custom bot | apiUrl, apiKey |
| **Flowise** | Flowise AI | apiUrl, apiKey |
| **N8n** | n8n webhook bot | webhookUrl, basicAuthUser/Pass |
| **Evoai** | EvoAI agent | agentUrl, apiKey |

> **Common Bot Fields**: enabled, description, expire, keywordFinish, delayMessage, unknownMessage, listeningFromMe, stopBotFromMe, keepOpen, debounceTime, ignoreJids, triggerType, triggerOperator, triggerValue, splitMessages, timePerChar

#### Integration Sessions
| Model | Purpose |
|-------|---------|
| **IntegrationSession** | Active bot conversation sessions with context, status (opened/closed/paused), botId |

#### Event Streaming & Webhooks
| Model | Purpose |
|-------|---------|
| **Webhook** | HTTP webhook config with URL, headers, events |
| **Rabbitmq** | RabbitMQ event streaming |
| **Nats** | NATS event streaming |
| **Sqs** | Amazon SQS event streaming |
| **Kafka** | Apache Kafka event streaming |
| **Websocket** | WebSocket event streaming |
| **Pusher** | Pusher real-time (appId, key, secret, cluster) |

#### External Integrations
| Model | Purpose |
|-------|---------|
| **Chatwoot** | Customer support integration (accountId, token, url, nameInbox, signMsg) |
| **Typebot** | Conversational bot integration (url, typebot, expire, triggerType) |
| **TypebotSetting** | Typebot instance settings with fallback |
| **Proxy** | Proxy configuration (host, port, protocol, auth) |
| **Setting** | Instance settings (rejectCall, groupsIgnore, alwaysOnline, readMessages, syncFullHistory) |

### Design/UI Patterns
- **REST API**: All functionality exposed via REST endpoints
- **Evolution Manager**: Web-based admin panel (Vue.js)
- **Postman Collection**: Full API documentation
- **Multi-tenant**: One API serving multiple WhatsApp instances

---

## 3. n8n — Workflow Automation Platform

### Overview
Workflow automation platform with 400+ integrations, AI-native capabilities (LangChain), visual node-based editor, and fair-code license. Supports JavaScript/Python code nodes.

### Architecture
```
n8n Architecture:
├── Frontend (Vue.js)
│   ├── Workflow Editor (Node-based visual canvas)
│   ├── Execution Viewer
│   └── Admin Panel
├── Backend (TypeScript / Node.js)
│   ├── CLI Package (Main entry point)
│   ├── Core Package (Execution engine)
│   ├── Workflow Package (Data structures)
│   └── @n8n/db Package (Database layer)
├── Database (PostgreSQL / SQLite via TypeORM)
├── Packages
│   ├── nodes-base (400+ integration nodes)
│   ├── @n8n/* (Internal packages)
│   ├── frontend (Vue.js SPA)
│   ├── extensions (AI, image editing, etc.)
│   └── testing (Test utilities)
└── Enterprise Features
    ├── SSO / LDAP / SAML
    ├── Log Streaming
    ├── Insights / Analytics
    ├── Execution Annotations
    └── Test Runs
```

### Database Entities (30+ TypeORM Entities)

#### Core Workflow System
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **WorkflowEntity** | Workflow definitions | name, description, active, isArchived, nodes (JSON), connections (JSON), settings, staticData, versionId, triggerCount, parentFolder |
| **WorkflowHistory** | Workflow version history | workflow, version |
| **WorkflowPublishHistory** | Publish history | version tracking |
| **WorkflowStatistics** | Usage statistics | execution counts |
| **WorkflowDependency** | Dependencies between workflows | parent/child workflow references |
| **WorkflowTagMapping** | Workflow-to-tag mapping | workflowId, tagId |

#### Execution System
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **ExecutionEntity** | Workflow executions | finished, mode, status, createdAt, startedAt, stoppedAt, waitTill, storedAt, retryOf/retrySuccessId |
| **ExecutionData** | Execution input/output data | JSON data blobs |
| **ExecutionMetadata** | Execution metadata | key-value pairs |
| **ExecutionAnnotation** (EE) | Human annotations on executions | rating, notes |
| **TestRun** (EE) | Test run results | pass/fail, test cases |
| **TestCaseExecution** (EE) | Individual test case execution results | expected vs actual |

#### User & Access Control
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **User** | User accounts | email, firstName, lastName, password, mfaEnabled, mfaSecret, mfaRecoveryCodes, disabled, lastActiveAt |
| **Role** | User roles | slug, scope |
| **ApiKey** | API key authentication | key, user |
| **AuthIdentity** | External auth providers | providerType, providerId |
| **AuthProviderSyncHistory** | Auth provider sync tracking | |

#### Organization & Sharing
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **Project** | Project/workspace grouping | name, type |
| **ProjectRelation** | User-to-project mapping | userId, projectId, role |
| **SharedWorkflow** | Workflow sharing | workflowId, userId, role |
| **SharedCredentials** | Credential sharing | credentialsId, userId, role |
| **Folder** | Folder organization | name, parent |
| **FolderTagMapping** | Folder-to-tag associations | |

#### Credentials & Secrets
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **CredentialsEntity** | Encrypted credential storage | name, type, data (encrypted), isManaged |
| **SecretsProviderConnection** | External secrets providers (Vault, etc.) | connectionType, providerUrl, credential |
| **ProjectSecretsProviderAccess** | Project access to secrets providers | |

#### Infrastructure
| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **WebhookEntity** | Registered webhooks | method, path, node, workflowId |
| **TagEntity** | Tags for organization | name |
| **Variables** | Environment variables | key, value, type |
| **Settings** | Global settings | key, value |
| **ProcessedData** | Deduplication tracking | |
| **BinaryDataFile** | Binary data references | |
| **InvalidAuthToken** | Revoked tokens | |

### Design/UI Patterns
- **Visual Workflow Editor**: Drag-and-drop node canvas
- **Node-based Paradigm**: Each integration = a node with inputs/outputs
- **Execution History**: Full execution replay with data inspection
- **Credential Management**: Encrypted storage with sharing
- **Folder Organization**: Hierarchical folder + tag system

---

## 4. Twenty — Open-Source CRM

### Overview
Modern open-source CRM inspired by Notion, Airtable, and Linear. Full customizable data model, workflow automation, email/calendar integration, and role-based permissions.

### Architecture
```
Twenty CRM Architecture:
├── Frontend (React + TypeScript)
│   ├── Jotai (State management)
│   ├── Emotion (CSS-in-JS styling)
│   ├── Lingui (i18n / translations)
│   └── twenty-ui (Component library)
├── Backend (NestJS + TypeScript)
│   ├── GraphQL API (workspace queries)
│   ├── REST API (auth, webhooks)
│   ├── twenty-orm (Custom TypeORM extensions)
│   └── Engine (Core modules + Metadata modules)
├── Database
│   ├── PostgreSQL (Primary store)
│   ├── Redis (Caching, queues)
│   └── BullMQ (Job queue)
├── Supporting Packages
│   ├── twenty-emails (Email templates)
│   ├── twenty-sdk (API SDK)
│   ├── twenty-zapier (Zapier integration)
│   ├── twenty-cli (CLI tools)
│   └── twenty-docs (Documentation site)
└── Nx Monorepo (Build orchestration)
```

### Database Schema — Workspace Entities (37+ entities)

#### CRM Core
| Entity | Purpose |
|--------|---------|
| **Company** | Companies/organizations |
| **Person** | Individual contacts/people |
| **Opportunity** | Sales opportunities/deals |

#### Communication
| Entity | Purpose |
|--------|---------|
| **Message** | Email messages |
| **MessageThread** | Email conversation threads |
| **MessageParticipant** | Email recipients/senders |
| **MessageChannel** | Email account channels (Gmail, Outlook, etc.) |
| **MessageChannelMessageAssociation** | Message-to-channel mapping |
| **MessageFolder** | Email folders (Inbox, Sent, etc.) |

#### Calendar
| Entity | Purpose |
|--------|---------|
| **CalendarEvent** | Calendar events |
| **CalendarEventParticipant** | Event attendees |
| **CalendarChannel** | Calendar account channels |
| **CalendarChannelEventAssociation** | Event-to-channel mapping |

#### Tasks & Notes
| Entity | Purpose |
|--------|---------|
| **Task** | Tasks/to-dos |
| **TaskTarget** | Task associations (link to company/person/opportunity) |
| **Note** | Notes and documentation |
| **NoteTarget** | Note associations |

#### Workflow Automation
| Entity | Purpose |
|--------|---------|
| **Workflow** | Workflow definitions |
| **WorkflowVersion** | Workflow versions |
| **WorkflowRun** | Workflow execution runs |
| **WorkflowAutomatedTrigger** | Automated triggers |

#### Organization
| Entity | Purpose |
|--------|---------|
| **WorkspaceMember** | Workspace members |
| **ConnectedAccount** | Connected external accounts (email, calendar) |
| **Dashboard** | Custom dashboards |
| **Favorite** | User favorites |
| **FavoriteFolder** | Favorite folders |
| **Attachment** | File attachments |
| **Blocklist** | Email blocklist |
| **TimelineActivity** | Activity timeline |

### Database Schema — Core/Metadata Entities (55+ entities)

#### Authentication & Users
| Entity | Purpose |
|--------|---------|
| **User** | System users |
| **UserWorkspace** | User-to-workspace mapping |
| **Workspace** | Tenant workspaces |
| **AppToken** | Application tokens |
| **ApiKey** | API keys |
| **Application** | OAuth applications |
| **ApprovedAccessDomain** | SSO approved domains |
| **TwoFactorAuthenticationMethod** | 2FA methods |
| **WorkspaceSsoIdentityProvider** | SSO identity providers (SAML, OIDC) |

#### Billing & Subscriptions
| Entity | Purpose |
|--------|---------|
| **BillingCustomer** | Billing customer records |
| **BillingSubscription** | Active subscriptions |
| **BillingSubscriptionItem** | Subscription line items |
| **BillingProduct** | Products available for billing |
| **BillingPrice** | Pricing tiers |
| **BillingMeter** | Usage metering |
| **BillingEntitlement** | Feature entitlements |

#### Metadata System (Dynamic Schema)
| Entity | Purpose |
|--------|---------|
| **ObjectMetadata** | Custom object definitions |
| **FieldMetadata** | Custom field definitions |
| **DataSource** | Data source connections |
| **IndexMetadata** | Database indexes |
| **SearchFieldMetadata** | Search index config |

#### Permissions & Roles
| Entity | Purpose |
|--------|---------|
| **Role** | User roles |
| **RoleTarget** | Role assignments |
| **ObjectPermission** | Per-object permissions |
| **FieldPermission** | Per-field permissions |
| **PermissionFlag** | Feature flags for permissions |
| **RowLevelPermissionPredicate** | Row-level security |
| **RowLevelPermissionPredicateGroup** | RLS groups |

#### UI/Layout System
| Entity | Purpose |
|--------|---------|
| **View** | Saved views (table, kanban, etc.) |
| **ViewField** | View column configuration |
| **ViewFieldGroup** | Field grouping in views |
| **ViewFilter** / **ViewSort** | View filters and sorts |
| **PageLayout** | Page layouts |
| **PageLayoutTab** | Page layout tabs |
| **PageLayoutWidget** | Page layout widgets |
| **NavigationMenuItem** | Navigation menu items |
| **CommandMenuItem** | Command palette items |

#### Extensions
| Entity | Purpose |
|--------|---------|
| **Skill** | AI/automation skills |
| **FrontComponent** | Custom front-end components |
| **LogicFunction** | Custom server-side logic |
| **LogicFunctionLayer** | Logic function dependencies |
| **FeatureFlag** | Feature flags |
| **KeyValuePair** | Generic key-value storage |
| **ApplicationVariable** | App-level variables |

### Design/UI Patterns
- **Table & Kanban Views**: Like Airtable/Notion with filters, sorts, group-by
- **Record Detail Pages**: Side sheets with tabbed layout
- **Custom Objects & Fields**: User-defined data models
- **Command Palette**: Quick navigation (Cmd+K)
- **Timeline & Activity Feed**: Chronological activity history
- **Connected Accounts**: OAuth-based email/calendar sync
- **Custom Roles & Permissions**: Fine-grained access control (object, field, row level)
- **Workflow Builder**: Visual trigger + action workflows

---

## 5. Frappe Docker — Deployment Infrastructure

### Overview
Docker images and orchestration for Frappe applications including ERPNext. **Not a standalone SaaS product** — it's the deployment/DevOps layer.

### Components
- `compose.yaml` - Base production setup
- `pwd.yml` - Quick disposable demo
- `docker-compose-prod.yml` - Full production configuration 
- `images/` - Dockerfiles for building Frappe images
- `development/` - Dev environment configurations
- `devcontainer-example/` - VS Code devcontainer

### Relevance to Unified SaaS
This project provides the **deployment blueprint** for our unified SaaS. Its Docker Compose patterns (Nginx, Redis, MariaDB/PostgreSQL, workers, scheduler) will inform our deployment architecture.

---

## 6. Traccar — GPS Tracking System

### Overview
Open-source GPS tracking system supporting **200+ GPS protocols** and **2000+ device models**. Java-based backend using Netty for high-performance protocol decoding. Includes real-time tracking, geofencing, driver behavior monitoring, fleet management, trip/stop reporting, and multi-channel notifications.

### Architecture
```
Traccar Architecture:
├── Backend (Java / Netty)
│   ├── Server Manager (Multi-protocol TCP/UDP listeners)
│   ├── Protocol Decoders (200+ GPS protocol implementations)
│   ├── Processing Pipeline (Handler chain)
│   │   ├── FilterHandler (validate positions)
│   │   ├── GeocoderHandler (reverse geocode lat/lon to address)
│   │   ├── GeolocationHandler (cell tower / WiFi location)
│   │   ├── GeofenceHandler (geofence enter/exit detection)
│   │   ├── MotionHandler (moving/stopped detection)
│   │   ├── EngineHoursHandler (engine runtime tracking)
│   │   ├── DistanceHandler (odometer calculation)
│   │   ├── SpeedLimitHandler (speed limit checks)
│   │   ├── DriverHandler (driver identification)
│   │   └── ComputedAttributesHandler (custom calculations)
│   ├── Event Handlers
│   │   ├── AlarmEventHandler, MotionEventHandler
│   │   ├── GeofenceEventHandler, OverspeedEventHandler
│   │   ├── FuelEventHandler, IgnitionEventHandler
│   │   ├── MaintenanceEventHandler, BehaviorEventHandler
│   │   └── DriverEventHandler, MediaEventHandler
│   ├── REST API (22 JAX-RS resources)
│   ├── WebSocket (real-time position updates)
│   └── Storage Layer (JDBC to any SQL database)
├── Frontend (React — separate traccar-web repo)
│   ├── Live Map (OpenStreetMap / Google Maps / Bing)
│   ├── Device Management
│   ├── Report Viewer
│   └── Geofence Editor
├── Database (H2 / MySQL / PostgreSQL / MS SQL)
│   └── Liquibase Migrations (28 changelog files, v4.0–v6.11)
├── Notifications
│   ├── Firebase Push, Email, SMS
│   ├── Telegram, WhatsApp
│   ├── Pushover, Web Push
│   └── Device Commands
├── Event Forwarding
│   ├── JSON/HTTP, AMQP, Kafka, MQTT, Redis
│   └── Wialon (fleet management protocol)
└── Geocoding (25 providers)
    ├── Google, Bing, Here, Nominatim
    ├── Mapbox, TomTom, OpenCage, MapQuest
    └── Geoapify, LocationIQ, MapTiler, etc.
```

### Database Schema (12 core tables + 20 junction tables)

#### Core Entities
| Table | Purpose | Key Fields |
|-------|---------|------------|
| **tc_users** | User accounts | name, email, hashedPassword, salt, administrator, disabled, deviceLimit, expirationTime, phone, token, poiLayer, map, latitude/longitude/zoom |
| **tc_devices** | GPS tracking devices | name, uniqueId, lastUpdate, positionId, groupId, phone, model, contact, category, disabled |
| **tc_positions** | GPS position data (high-volume) | protocol, deviceId, serverTime, deviceTime, fixTime, valid, latitude, longitude, altitude, speed, course, address, accuracy, network, attributes |
| **tc_events** | System events (alarms, alerts) | type, serverTime, deviceId, positionId, geofenceId, maintenanceId, attributes |
| **tc_geofences** | Geographic zones (shapes) | name, description, area (WKT/GeoJSON), calendarId, attributes |
| **tc_drivers** | Driver identification | name, uniqueId (iButton/RFID), attributes |
| **tc_groups** | Device groups (hierarchical) | name, groupId (parent), attributes |
| **tc_notifications** | Notification rules | type, always, calendarId, notificators, attributes |
| **tc_commands** | Remote device commands | description, type, textChannel, attributes |
| **tc_maintenances** | Maintenance schedules | name, type, start, period, attributes |
| **tc_calendars** | Time-based rule calendars | name, data (iCalendar blob), attributes |
| **tc_attributes** | Computed attributes | description, type, attribute, expression |
| **tc_servers** | Server configuration (singleton) | registration, map, bingKey, mapUrl, readOnly, coordinateFormat, forceSettings |
| **tc_statistics** | Usage statistics | captureTime, activeUsers, activeDevices, requests, messagesReceived/Stored, mailSent, smsSent, geocoderRequests |

#### Junction Tables (Many-to-Many Relationships)
| Pattern | Tables |
|---------|--------|
| **user_X** | tc_user_device, tc_user_group, tc_user_geofence, tc_user_driver, tc_user_notification, tc_user_command, tc_user_attribute, tc_user_calendar, tc_user_maintenance, tc_user_user (managed users) |
| **device_X** | tc_device_geofence, tc_device_driver, tc_device_notification, tc_device_command, tc_device_attribute, tc_device_maintenance |
| **group_X** | tc_group_geofence, tc_group_driver, tc_group_notification, tc_group_command, tc_group_attribute, tc_group_maintenance |

#### Later Additions (from changelogs v4.1–v6.11)
| Table/Column | Purpose |
|--------------|---------|
| **tc_orders** | Delivery order management (added v5.6) |
| **tc_user_order** | User-to-order assignment |
| **tc_device_order** | Device-to-order assignment |
| **tc_reports** | Saved report configurations |
| **tc_queued_commands** | Queued device commands (offline devices) |
| **tc_logs** | Audit/debug log records |
| **tc_revoked_tokens** | Revoked authentication tokens |
| OIDC columns on tc_users | OpenID Connect authentication (hash, issuer) |
| fixedEmail column on tc_users | Email confirmation flag |
| temporaryDisabled on tc_users | Rate limiting flag |

### REST API (22 Resources)
| Resource | Endpoints | Purpose |
|----------|-----------|--------|
| **DeviceResource** | CRUD + accumulators + position history | GPS device management |
| **PositionResource** | GET positions (by device/time range) + CSV/KML export | Position data access |
| **EventResource** | GET events (by device/time range) | Event/alert viewing |
| **GeofenceResource** | CRUD geofences | Geofence management |
| **CommandResource** | Send commands to devices + command types | Remote device control |
| **GroupResource** | CRUD device groups | Device grouping |
| **DriverResource** | CRUD drivers | Driver management |
| **MaintenanceResource** | CRUD maintenance rules | Maintenance scheduling |
| **NotificationResource** | CRUD + test + notification types | Notification config |
| **UserResource** | CRUD users + managed users | User management |
| **SessionResource** | Login/logout | Authentication |
| **OidcResource** | OIDC authentication | OpenID Connect SSO |
| **PasswordResource** | Reset/change password | Password management |
| **PermissionsResource** | Link/unlink permissions | Permission management |
| **ReportResource** | Generate all report types | Report generation |
| **OrderResource** | CRUD delivery orders | Order management |
| **CalendarResource** | CRUD calendars | Calendar management |
| **AttributeResource** | CRUD computed attributes | Attribute config |
| **ServerResource** | Server settings | System configuration |
| **StatisticsResource** | Usage stats | System statistics |
| **HealthResource** | Health check | System health |
| **AuditResource** | Audit log | Audit trail |

### Report Types (11 report providers)
| Report | Purpose |
|--------|---------|
| **RouteReport** | Full route history (all positions for time range) |
| **TripsReport** | Trip detection (start/end points, distance, duration, avg speed) |
| **StopsReport** | Stop detection (location, duration, engine hours) |
| **SummaryReport** | Daily/period summary (distance, speed, engine hours, fuel) |
| **EventsReport** | Event listing (alarms, geofence, overspeed, etc.) |
| **GeofenceReport** | Geofence entry/exit history |
| **DevicesReport** | Device status overview |
| **CombinedReport** | Multi-report combined view |
| **CSV Export** | Export any report to CSV |
| **GPX Export** | Export routes to GPX format |
| **KML Export** | Export routes to Google Earth KML |

### Event Types (12 event handlers)
| Event | Triggers On |
|-------|-------------|
| **Alarm** | Device-generated alarms (SOS, tamper, low battery) |
| **Motion** | Start/stop movement detection |
| **Overspeed** | Exceeding set speed limits |
| **Geofence** | Entering/exiting defined geographic zones |
| **Fuel** | Fuel level drop (fuel theft) or refill |
| **Ignition** | Engine on/off detection |
| **Maintenance** | Maintenance schedule triggered (by km/hours/time) |
| **Driver** | Driver change (iButton/RFID identification) |
| **Behavior** | Harsh braking, rapid acceleration, sharp cornering |
| **Command Result** | Response from device commands |
| **Media** | Media file received from device (photo, video) |

### Notification Channels (10 notificators)
| Channel | Purpose |
|---------|---------|
| **Firebase** | Mobile push notifications (FCM) |
| **Email** | Email notifications (SMTP) |
| **SMS** | Text message alerts (HTTP gateway + Amazon SNS) |
| **Telegram** | Telegram bot notifications |
| **WhatsApp** | WhatsApp message notifications |
| **Pushover** | Pushover push notifications |
| **Web** | In-app web notifications (WebSocket) |
| **Command** | Send device command as notification |
| **Traccar** | Traccar push notification service |

### Additional Features (discovered during cross-check)
- **LDAP Authentication**: Active Directory / LDAP login support (LdapProvider.java)
- **MCP Protocol**: Model Context Protocol support (McpAuthFilter, McpServerHolder in web/)
- **TimescaleDB**: Docker Compose configuration for time-series optimized GPS storage
- **Excel Report Templates**: 6 XLSX templates for formatted report export (devices, events, route, stops, summary, trips)
- **Multi-Language Notifications**: Email/SMS templates in 10 languages (de, el, en, es, fr, it, pl, pt_BR, ru, tr)
- **Position Buffering**: Batch-write positions for high-throughput performance (BufferingManager)
- **Speed Limit Lookup**: Integration with Overpass API for road speed limits
- **Media Storage**: Photo/video file management from GPS devices
- **Redis Broadcasting**: Redis-based multi-instance event broadcasting
- **Scheduled Reports**: Auto-email reports on schedule (ReportMailer)

### Design/UI Patterns
- **Live Map**: Real-time GPS position rendering on maps (OpenStreetMap, Google, Bing, etc.)
- **Geofence Editor**: Draw polygons/circles on map to define zones
- **Device Dashboard**: Connection status, last position, speed, battery
- **Report Viewer**: Tabular + map-based report rendering
- **Permission Model**: User → Device/Group/Geofence/Driver/etc. many-to-many assignments
- **OpenAPI 3.0**: Full API specification (`openapi.yaml` — 87KB)
- **Docker**: 3 Dockerfiles (Alpine/Debian/Ubuntu) + Docker Compose for MySQL and TimescaleDB

---

## 7. Chatwoot — Customer Support Platform

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\chatwoot`
**Tech**: Ruby on Rails, Vue.js (frontend) | PostgreSQL with pgvector, Redis, Sidekiq
**Role**: Open-source alternative to Intercom/Zendesk — omnichannel customer support with AI agent, help center, and enterprise features.

### Core Architecture
- **Framework**: Ruby on Rails 7.1 (MVC architecture)
- **Database**: PostgreSQL with extensions: pgvector (AI embeddings), pg_trgm (fuzzy search), pgcrypto
- **Background Jobs**: Sidekiq (Redis-backed)
- **Frontend**: Vue.js with Vite build, TailwindCSS
- **85 database tables** (1306-line schema.rb)
- **49 ActiveRecord models** + enterprise models

### Messaging Channels (12 channels)
| Channel | Model |
|---------|-------|
| **Web Widget** | Live chat embeddable on any website (with pre-chat forms, HMAC auth) |
| **Email** | Full IMAP/SMTP email channel with provider config |
| **WhatsApp** | Via provider config (Cloud API or custom) |
| **Facebook** | Facebook Page messaging integration |
| **Instagram** | Instagram DM integration |
| **Twitter** | Twitter DM + tweet replies |
| **Telegram** | Telegram bot integration |
| **Line** | LINE messaging integration |
| **SMS** | Generic SMS provider integration |
| **Twilio SMS** | Twilio SMS + WhatsApp via Twilio |
| **TikTok** | TikTok business messaging |
| **Voice** | Voice/phone call channel (Twilio) |
| **API** | Custom API channel with webhooks |

### Captain AI Agent System
| Table | Purpose |
|-------|---------|
| `captain_assistants` | AI assistant definitions with config, response guidelines, guardrails |
| `captain_documents` | Knowledge base documents for AI (external links, content ingestion) |
| `captain_assistant_responses` | AI-generated Q&A with **pgvector embeddings** (1536-dim) for semantic search |
| `captain_scenarios` | AI action scenarios with tools and instructions |
| `captain_custom_tools` | Custom HTTP tools for AI (endpoint URL, auth config, param schema) |
| `captain_inboxes` | Link AI assistants to inboxes |
| `copilot_threads` | Agent copilot chat threads |
| `copilot_messages` | Copilot interaction messages |
| `article_embeddings` | Help center article embeddings for AI search |

### Key Database Tables (85 total)
| Category | Tables |
|----------|--------|
| **Accounts & Auth** | accounts, users, account_users, access_tokens, account_saml_settings, custom_roles |
| **Conversations** | conversations, messages, attachments, conversation_participants, contact_inboxes |
| **Contacts & Companies** | contacts, companies, contact_inboxes |
| **Inboxes & Channels** | inboxes, inbox_members, channel_web_widgets, channel_email, channel_whatsapp, channel_facebook, channel_instagram, channel_twitter, channel_telegram, channel_line, channel_sms, channel_twilio_sms, channel_tiktok, channel_voice, channel_api |
| **AI/Captain** | captain_assistants, captain_documents, captain_assistant_responses, captain_scenarios, captain_custom_tools, captain_inboxes, copilot_threads, copilot_messages, article_embeddings |
| **Help Center** | portals, articles, categories, folders, related_categories |
| **Automation** | automation_rules, campaigns, macros, canned_responses |
| **SLA & Quality** | sla_policies, applied_slas, csat_survey_responses |
| **Teams & Assignment** | teams, team_members, agent_bots, agent_bot_inboxes, assignment_policies, agent_capacity_policies |
| **Reports & Analytics** | reporting_events, audits, data_imports |
| **Integrations** | platform_apps, dashboard_apps, webhooks, integrations_hooks |
| **Other** | labels, mentions, notes, notifications, notification_subscriptions, custom_attribute_definitions, custom_filters, working_hours, email_templates |

### Services (35 service folders)
Account, AutoAssignment, AutomationRules, Contacts, Conversations, CRM, DataImport, Email, EmailTemplates, Facebook, Geocoder, Google, IMAP, Instagram, Internal, Labels, Line, Linear, Liquid, LlmFormatter, Macros, Mailbox, MessageTemplates, Messages, MFA, Microsoft, Notification, SMS, Telegram, TikTok, Twilio, Twitter, WhatsApp, Widget, Search

### Enterprise Features (separate enterprise/ directory)
- Custom role management
- Advanced SLA policies
- Agent capacity management
- SAML SSO authentication
- Enhanced automation & assignment
- Advanced reporting

### Design/UI Patterns
- **Unified Inbox**: All channels in one conversation view
- **Help Center Portal**: Public-facing knowledge base with articles/categories
- **Campaign Manager**: Proactive customer messaging
- **CSAT Surveys**: Customer satisfaction measurement
- **Canned Responses**: Quick reply templates
- **Custom Attributes**: Flexible metadata on contacts/conversations
- **Dashboard Apps**: Embed custom tools within Chatwoot
- **Swagger API docs** available in `swagger/` folder

---

## 8. Jasmin — Open-Source SMS Gateway

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\jasmin`
**Tech**: Python (Twisted framework) | Redis, RabbitMQ (AMQP)
**Role**: Enterprise-grade SMS gateway with SMPP client/server, HTTP API, advanced message routing, billing, and high-throughput in-memory execution.

### Core Architecture
- **Framework**: Python 3 on Twisted (event-driven networking)
- **Message Broker**: RabbitMQ (AMQP) for store-and-forward
- **Cache/DLR**: Redis for in-memory DLR (delivery receipt) tracking and billing
- **Console**: Telnet-based CLI for live configuration (no restart needed)
- **Deployment**: Docker, Kubernetes, Ubuntu/RedHat packages

### Protocol Support (4 protocol types)
| Protocol | Purpose |
|----------|---------|
| `smpp/` | **SMPP Client/Server** — industry-standard SMS protocol (v3.4), binds, PDU handling |
| `http/` | **HTTP API** — RESTful SMS sending/receiving via HTTP |
| `rest/` | **REST API** — modern REST interface for SMS operations |
| `cli/` | **CLI (Telnet)** — console-based management, live configuration |

### Routing Engine (14 files, router.py = 47KB)
| Component | Purpose |
|-----------|---------|
| `Routes.py` | Route definitions (Static, Roundrobin, Failover, Leastcost, HLR) |
| `Filters.py` | Message filters (source/destination address, date/time, content regex) |
| `RoutingTables.py` | Routing table management (MT and MO routes) |
| `Bills.py` | **Billing** — per-message billing with rate tables |
| `Interceptors.py` | **Interceptors** — modify messages in transit (content, headers) |
| `InterceptionTables.py` | Interception rule tables |
| `Routables.py` | Routable message wrapper objects |
| `router.py` | Core routing engine (47KB) — the heart of Jasmin |
| `throwers.py` | Message delivery throwers (31KB) — actual SMS sending logic |
| `jasminApi.py` | Internal API definitions |

### Managers (7 manager files)
| File | Purpose |
|------|---------|
| `clients.py` (27KB) | **SMPP client manager** — connection pooling, bind management |
| `listeners.py` (38KB) | **Event listeners** — AMQP message consumption, delivery handling |
| `dlr.py` (24KB) | **DLR Manager** — delivery receipt tracking via Redis |
| `content.py` (10KB) | Content transformation and encoding |
| `configs.py` | Manager configuration |
| `proxies.py` | Proxy connections for managers |

### Key Features
- **SMPP Client/Server**: Full SMPP v3.4 with TLS support
- **Advanced Routing**: Static, Roundrobin, Failover, Leastcost, HLR lookup
- **Billing Engine**: Per-message rate billing with rate tables
- **Unicode SMS**: UTF-8 multilingual message support
- **Concatenated SMS**: Long message splitting and reassembly
- **Special SMS**: Ringtones, WAP Push, vCards
- **DLR Tracking**: Real-time delivery receipt tracking via Redis
- **Store & Forward**: AMQP-based message queuing for reliability
- **Message Interception**: Modify messages in transit
- **Live Configuration**: Telnet console, no service restart needed

### Deployment
- Docker Compose (with RabbitMQ + Redis)
- Kubernetes cluster deployment
- Grafana monitoring dashboard
- REST API Docker Compose

---

## 9. Mailcow — Self-Hosted Email Suite

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\mailcow-dockerized`
**Tech**: Docker, Postfix, Dovecot, SOGo, Rspamd, ClamAV, PHP, Nginx
**Role**: Complete, secure, and modern enterprise self-hosted email solution with webmail, active sync, anti-spam, and administration features.

### Core Architecture
- **MTA (Mail Transfer Agent)**: Postfix
- **IMAP/POP3 Server**: Dovecot
- **Webmail & Groupware / ActiveSync**: SOGo
- **Anti-Spam & DKIM/ARC**: Rspamd
- **Anti-Virus**: ClamAV
- **Web Server**: Nginx & PHP-FPM
- **Databases**: MariaDB (configuration/users) + Redis (caching/Rspamd)
- **Monitoring/Security**: Netfilter (Fail2ban equivalent), Watchdog, ACME (Let's Encrypt)

### Database Schema highlights (MariaDB)
Mailcow's configuration is driven by MariaDB (approx. 40 tables) managed by a PHP schema tool:
| Tables | Purpose |
|--------|---------|
| `domain`, `domain_admins`, `mailbox`, `alias` | Core tenant, user, and domain management |
| `admin`, `fido2`, `api`, `app_passwd` | Authentication, 2FA, API keys, App passwords |
| `quarantine`, `spamalias`, `user_acl`, `sieve_filters` | Anti-spam configurations, rules, and user preferences |
| `imapsync`, `syncjobs` | Tools for migrating mailboxes |

### Key Features
- **Full Email Stack**: SMTP, IMAP, POP3, sieve scripting
- **Webmail/Groupware**: SOGo provides a sleek UI for mail, contacts, and calendars
- **ActiveSync (EAS)**: Native push sync for mobile devices (iOS, Android, Outlook)
- **Security**: Mandatory TLS, DKIM, DMARC, ARC, SPF checking and signing
- **Spam/Virus Protection**: Advanced Rspamd integration + ClamAV + olefy (macro scanning)
- **Admin UI**: PHP-based central management panel for domains, mailboxes, and server health
- **Two-Factor Auth**: WebAuthn/FIDO2, TOTP

---

## 10. Frappe HR (HRMS) — Open Source HR & Payroll System

### Overview
- **Architecture**: Monolith (Frappe) with two Vue.js frontends (Desktop PWA and specialized Roster app).
- **Core Modules**:
  - **HR**: Employee lifecycle, Attendance, Training, Performance.
  - **Payroll**: Salary processing, Taxation, Benefits.
  - **Roster**: Specialized shift scheduling and roster management (Vite/Vue app).
  - **Regional**: Localized compliance for India (HRA, PT, PF) and UAE (Gratuity).
Complete HRMS with 13+ modules covering Employee Lifecycle, Leave & Attendance, Payroll & Taxation, Expense Claims, Performance Management, Recruitment, Training, and more. Built as a **Frappe Framework** app (separate from ERPNext since v14). Includes a PWA mobile app (Vue.js + Ionic).

### Architecture
```
Frappe HR (HRMS) Architecture:
├── Frappe Framework (Full-stack web framework)
│   ├── Python Backend (doctypes, API, scheduler events)
│   ├── MariaDB Database (via Frappe ORM)
│   └── Redis (Caching, Queue, Socket.io)
├── ERPNext Dependency (accounting, employee, company doctypes)
├── Frappe UI (Vue.js component library)
├── PWA Frontend (Vue 3 + Ionic + Vite + TailwindCSS)
├── Roster Frontend (Shift/scheduling UI)
└── Docker Setup (MariaDB + Redis + Frappe Bench)
```

### 2 Modules & 161 Doctypes

#### 👥 HR Module (118 doctypes)
- **Leave Management**: Leave Application, Leave Allocation, Leave Type, Leave Period, Leave Policy, Leave Policy Assignment, Leave Block List, Leave Ledger Entry, Leave Encashment, Leave Control Panel, Compensatory Leave Request, Leave Adjustment, Earned Leave Schedule
- **Attendance**: Attendance, Attendance Request, Employee Checkin, Upload Attendance, Employee Attendance Tool
- **Shifts**: Shift Type, Shift Assignment, Shift Request, Shift Schedule, Shift Schedule Assignment, Shift Assignment Tool, Shift Location
- **Appraisals**: Appraisal, Appraisal Cycle, Appraisal Template, Appraisal Goal, Appraisal KRA, Appraisee, KRA, Goal
- **Performance**: Employee Performance Feedback, Employee Feedback Criteria, Employee Feedback Rating
- **Onboarding/Separation**: Employee Onboarding, Employee Onboarding Template, Employee Separation, Employee Separation Template, Employee Boarding Activity, Full and Final Statement
- **Lifecycle**: Employee Promotion, Employee Transfer, Employee Property History, Employee Skill Map, Employee Skill, Employee Training
- **Expense Claims**: Expense Claim, Expense Claim Detail, Expense Claim Type, Expense Claim Account, Expense Claim Advance, Expense Taxes and Charges
- **Recruitment**: Job Opening, Job Opening Template, Job Requisition, Job Applicant, Job Applicant Source, Job Offer, Job Offer Term, Job Offer Term Template
- **Interviews**: Interview, Interview Detail, Interview Feedback, Interview Round, Interview Type, Interviewer
- **Training**: Training Event, Training Feedback, Training Program, Training Result, Training Event Employee, Training Result Employee
- **Travel**: Travel Request, Travel Itinerary, Travel Request Costing, Purpose of Travel
- **Miscellaneous**: Employee Advance, Employee Grade, Employee Grievance, Grievance Type, Employee Referral, Employee Health Insurance, Appointment Letter, HR Settings, Vehicle Log, Vehicle Service, Daily Work Summary, PWA Notification, Overtime Slip, Overtime Type, Holiday List Assignment, Exit Interview

#### 💰 Payroll Module (43 doctypes)
- **Salary**: Salary Structure, Salary Structure Assignment, Salary Component, Salary Component Account, Salary Detail, Salary Slip, Salary Slip Leave, Salary Slip Loan, Salary Slip Timesheet
- **Payroll Processing**: Payroll Entry, Payroll Employee Detail, Payroll Period, Payroll Period Date, Payroll Settings, Payroll Correction, Payroll Correction Child
- **Tax**: Income Tax Slab, Income Tax Slab Other Charges, Taxable Salary Slab, Employee Tax Exemption Declaration, Employee Tax Exemption Category, Employee Tax Exemption Sub Category, Employee Tax Exemption Proof Submission
- **Benefits**: Employee Benefit Application, Employee Benefit Application Detail, Employee Benefit Claim, Employee Benefit Detail, Employee Benefit Ledger, Employee Other Income
- **Gratuity**: Gratuity, Gratuity Applicable Component, Gratuity Rule, Gratuity Rule Slab
- **Other**: Additional Salary, Retention Bonus, Employee Incentive, Employee Cost Center, Salary Withholding, Salary Withholding Cycle, Arrear, Bulk Salary Structure Assignment

### 18 Reports
- Employee Analytics, Employee Information, Employee Birthday, Employee Exits
- Employee Leave Balance, Employee Leave Balance Summary, Leave Ledger
- Monthly Attendance Sheet, Shift Attendance, Employees Working on a Holiday
- Employee Advance Summary, Unpaid Expense Claim, Vehicle Expenses
- Employee Hours Utilization (Timesheet), Project Profitability
- Recruitment Analytics, Appraisal Overview, Daily Work Summary Replies

### Docker Setup
- **MariaDB 10.8** — character-set utf8mb4
- **Redis Alpine** — caching, queue, socket.io
- **Frappe Bench** — Python bench environment with auto site creation
- Ports: 8000 (web), 9000 (socket.io)
- Default creds: `Administrator` / `admin`

### Key Features
- **Employee Lifecycle**: Onboarding → Promotion → Transfer → Separation → Exit Interview
- **Leave Management**: Policy-based allocation, block lists, compensatory leaves, earned leaves, encashment
- **Payroll & Taxation**: Salary structures, income tax slabs, regional India HRA/tax overrides, gratuity
- **Attendance & Shifts**: Geolocation check-in, shift scheduling, auto-attendance processing
- **Performance**: KRA-based appraisals, self-evaluation, goal tracking
- **Recruitment**: Job requisitions → openings → applicants → interviews → offers
- **Expense Claims**: Multi-level approval workflows, ERPNext accounting integration
- **PWA Mobile App**: Vue 3 + Ionic + Firebase push notifications + Workbox PWA
- **Regional Overrides**: India-specific HRA exemption, marginal relief tax calculations
- **ERPNext Integration**: Overrides Employee, Timesheet, Payment Entry, Project doctypes

---

## 🔀 Feature Overlap Matrix

| Feature | ERPNext | Evolution API | n8n | Twenty CRM | Traccar | Chatwoot | Jasmin | Mailcow | HRMS | Winner / Merge Strategy |
|---------|---------|---------------|-----|------------|---------|----------|--------|---------|------|------------------------|
| **CRM/Leads** | ✅ Lead, Opportunity | ❌ | ❌ | ✅ Company, Person, Opportunity | ❌ | ✅ Contact, Company | ❌ | ❌ | ❌ | 🔀 **MERGE** - Twenty UI + ERPNext depth + Chatwoot contacts |
| **Contacts** | ✅ Customer, Supplier | ✅ Contact (WhatsApp) | ❌ | ✅ Person, Company | ❌ | ✅ Contacts + Companies | ❌ | ✅ (SOGo) | ❌ | 🔀 **MERGE ALL** - SOGo for CardDAV sync |
| **HR / Employee Management** | ✅ Basic HR | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full HRMS (161 doctypes)** | ✅ **PICK HRMS** - Full Employee Lifecycle |
| **Payroll** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full Payroll (43 doctypes)** | ✅ **PICK HRMS** |
| **Leave & Attendance** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full Leave + Attendance** | ✅ **PICK HRMS** |
| **Recruitment** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full pipeline** | ✅ **PICK HRMS** |
| **Expense Claims** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full with approvals** | ✅ **PICK HRMS** |
| **Performance/Appraisals** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **KRA-based appraisals** | ✅ **PICK HRMS** |
| **Shift Management** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full shift scheduling** | ✅ **PICK HRMS** |
| **Messaging** | ❌ | ✅ Full WhatsApp | ❌ | ✅ Email messages | ❌ | ✅ **12 channels** | ✅ SMS (SMPP) | ✅ Email | ❌ | 🔀 **MERGE** - Chatwoot omnichannel + Evolution WhatsApp + Jasmin SMS + Mailcow Email |
| **Omnichannel Inbox** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Unified inbox** | ❌ | ❌ | ❌ | ✅ **PICK CHATWOOT** |
| **Live Chat Widget** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Web widget** | ❌ | ❌ | ❌ | ✅ **PICK CHATWOOT** |
| **Help Center** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Portal, Articles** | ❌ | ❌ | ❌ | ✅ **PICK CHATWOOT** |
| **SLA Management** | ✅ Basic SLA | ❌ | ❌ | ❌ | ❌ | ✅ **Full SLA policies** | ❌ | ❌ | ❌ | 🔀 **MERGE** - Chatwoot SLA + ERPNext SLA |
| **CSAT Surveys** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full CSAT** | ❌ | ❌ | ❌ | ✅ **PICK CHATWOOT** |
| **SMS Gateway** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Via Twilio/SMS | ✅ **Full SMPP gateway** | ❌ | ❌ | 🔀 **MERGE** - Jasmin SMPP backend + Chatwoot SMS channel |
| **Email Server/MTA**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Full MTA Rack** | ❌ | ✅ **PICK MAILCOW** - Enterprise Email Backend |
| **Workflows/Automation** | ❌ (basic) | ❌ | ✅ Full visual workflows | ✅ CRM workflows | ❌ | ✅ Automation rules | ❌ | ❌ | ✅ Approval workflows | 🔀 **MERGE** - n8n + Twenty + Chatwoot + HRMS approval flows |
| **AI Chatbots** | ❌ | ✅ OpenAI, Dify, etc. | ✅ LangChain | ✅ Skills | ❌ | ✅ **Captain AI** (pgvector) | ❌ | ❌ | ❌ | 🔀 **MERGE** - Captain + Evolution bots + n8n LangChain |
| **AI Copilot** | ❌ | ❌ | ✅ AI Workflow Builder | ❌ | ❌ | ✅ **Copilot threads** | ❌ | ❌ | ❌ | 🔀 **MERGE** |
| **Tasks/Projects** | ✅ Project, Task | ❌ | ❌ | ✅ Task, Note | ❌ | ❌ | ❌ | ✅ (SOGo) | ✅ Onboarding tasks | 🔀 **MERGE** |
| **Calendar** | ❌ | ❌ | ❌ | ✅ Full calendar | ✅ Calendar rules | ✅ Working hours | ❌ | ✅ **Full CalDAV** | ✅ Leave calendar | 🔀 **MERGE** - Mailcow SOGo as CalDAV backend + HRMS leave calendar |
| **GPS Tracking** | ❌ | ❌ | ❌ | ❌ | ✅ **Full GPS system** | ❌ | ❌ | ❌ | ❌ | ✅ **PICK TRACCAR** |
| **Geofencing** | ❌ | ❌ | ❌ | ❌ | ✅ Geofence engine | ❌ | ❌ | ❌ | ✅ Geo-checkin | 🔀 **MERGE** - Traccar + HRMS geo-attendance |
| **Fleet Management** | ❌ | ❌ | ❌ | ❌ | ✅ Devices/Groups/Drivers | ❌ | ❌ | ❌ | ✅ Vehicle Log | 🔀 **MERGE** - Traccar + HRMS Vehicle Logs |
| **Geocoding** | ❌ | ❌ | ❌ | ✅ Geo Map | ✅ 25 geocoder providers | ✅ Geocoder service | ❌ | ❌ | ❌ | 🔀 **MERGE** |
| **Notifications** | ✅ Email notifs | ✅ WhatsApp msgs | ✅ (via nodes) | ❌ | ✅ 10 notificators | ✅ In-app notifs | ❌ | ❌ | ✅ PWA push notifs | 🔀 **MERGE ALL** |
| **Accounting** | ✅ Full double-entry | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Payroll JV integration | 🔀 **MERGE** - ERPNext accounting + HRMS payroll JV |
| **Inventory/Stock** | ✅ Full inventory | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **PICK ERPNEXT** |
| **Manufacturing** | ✅ BOM, Work Orders | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **PICK ERPNEXT** |
| **Buying/Procurement** | ✅ PO, RFQ, Supplier | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **PICK ERPNEXT** |
| **Support/Tickets** | ✅ Issue, SLA | ❌ | ❌ | ❌ | ❌ | ✅ **Full helpdesk** | ❌ | ❌ | ✅ Employee Grievance | 🔀 **MERGE** - Chatwoot omnichannel + ERPNext + HRMS grievance |
| **Campaigns** | ✅ Email campaign | ❌ | ❌ | ❌ | ❌ | ✅ **Proactive campaigns** | ❌ | ❌ | ❌ | 🔀 **MERGE** |
| **Billing/Subscriptions** | ✅ Subscription | ❌ | ❌ | ✅ Full billing | ❌ | ❌ | ✅ Per-msg billing | ❌ | ❌ | 🔀 **MERGE** |
| **Webhooks** | ❌ | ✅ Webhooks | ✅ Webhook nodes | ✅ Webhooks | ❌ | ✅ Webhooks | ✅ HTTP callbacks | ❌ | ❌ | 🔀 **MERGE** |
| **Event Streaming** | ❌ | ✅ RabbitMQ/Kafka/SQS | ✅ (via nodes) | ❌ | ✅ AMQP/Kafka/MQTT | ❌ | ✅ AMQP | ❌ | ❌ | 🔀 **MERGE ALL** |
| **Auth/SSO** | ✅ Frappe auth | ❌ | ✅ SSO/LDAP/MFA | ✅ SSO/2FA/OAuth | ✅ OIDC/LDAP | ✅ SAML SSO | ❌ | ✅ **FIDO2/TOTP** | ✅ Frappe auth | 🔀 **MERGE ALL** |
| **RBAC/Permissions** | ✅ Role-based | ❌ | ✅ Project roles | ✅ Object/field/row | ✅ User→device | ✅ Custom roles | ❌ | ✅ Admin/User | ✅ HR roles | 🔀 **MERGE** |
| **Audit Trail** | ❌ | ❌ | ❌ | ✅ Full audit | ❌ | ✅ Audits table | ❌ | ✅ Logs table | ❌ | 🔀 **MERGE** |
| **Multi-tenant** | ✅ (sites) | ✅ (instances) | ✅ (projects) | ✅ (workspaces) | ✅ (managed users) | ✅ (accounts) | ❌ | ✅ (domains) | ✅ (companies) | 🔀 **MERGE** |
| **Dashboards** | ✅ Dashboard charts | ❌ | ❌ | ✅ Dashboard entity | ❌ | ✅ Dashboard apps | ❌ | ✅ Mailcow Admin | ✅ HR dashboards | 🔀 **MERGE** |
| **Data Import** | ✅ Excel import | ❌ | ❌ | ✅ Spreadsheet import | ❌ | ✅ Data imports | ❌ | ✅ IMAP sync | ✅ Attendance upload | 🔀 **MERGE** |
