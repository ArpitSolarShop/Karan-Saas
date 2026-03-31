# 📘 Feature Implementation Guide

> Comprehensive guide for implementing every feature of the unified SaaS platform, with detailed specifications for each module based on the best patterns extracted from ERPNext, Evolution API, n8n, and Twenty CRM.

---

## Architecture Overview

### Recommended Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React + TypeScript | Twenty CRM's proven modern stack |
| **UI Library** | Custom component library (from Twenty UI) | Consistent design system |
| **State Management** | Jotai | Lightweight atomic state (from Twenty) |
| **Styling** | Emotion (CSS-in-JS) | Dynamic theming support |
| **i18n** | Lingui | Multi-language support (from Twenty) |
| **Backend** | NestJS + TypeScript | Twenty's modular architecture |
| **API** | GraphQL + REST | GraphQL for frontend, REST for integrations |
| **Database** | PostgreSQL | Used by all 4 core projects |
| **ORM** | TypeORM / Prisma | TypeORM for core, Prisma for messaging |
| **Cache/Queue** | Redis + BullMQ | From Twenty CRM's proven setup |
| **Search** | PostgreSQL Full-Text + optional ElasticSearch | Scalable search |
| **File Storage** | S3 / Minio | From Evolution API pattern |
| **Real-time** | WebSocket (Socket.io) | Real-time updates & messaging |
| **Build System** | Nx Monorepo | From Twenty's scalable setup |
| **Deployment** | Docker Compose | From Frappe Docker patterns |

---

## MODULE 1: Core Platform & Multi-Tenancy

### Source: Twenty CRM (primary) + n8n (auth patterns)

### Features to Implement

1. **Workspace Management**
   - Create/edit/delete workspaces
   - Custom domain per workspace
   - Workspace settings (timezone, currency, fiscal year)
   - Workspace switching for users in multiple workspaces

2. **User Management**
   - Registration & invitation flows
   - Email verification
   - Profile management (avatar, name, phone)
   - User deactivation/reactivation
   - Last active tracking

3. **Authentication**
   - Email + password login
   - Magic link / passwordless login
   - OAuth providers (Google, Microsoft, GitHub)
   - SAML/OIDC SSO (from Twenty)
   - LDAP integration (from n8n)
   - Two-factor authentication (TOTP) with recovery codes (from n8n)
   - Session management & token refresh

4. **Role-Based Access Control**
   - Predefined roles: Owner, Admin, Member, Guest
   - Custom role creation
   - Object-level permissions (CRUD per object type) — from Twenty
   - Field-level permissions (show/hide/readonly per field) — from Twenty
   - Row-level security predicates — from Twenty
   - Project-scoped permissions (from n8n)

5. **API Key Management**
   - Generate/revoke API keys
   - Scoped permissions per key
   - Usage tracking & rate limiting
   - Key prefix display (security)

### Implementation Notes
- All data must be filtered by `workspace_id` — never expose cross-tenant data
- Use middleware/guards for automatic workspace_id injection
- JWT tokens should contain `user_id` + `workspace_id`

---

## MODULE 2: CRM & Sales Pipeline

### Source: Twenty CRM (UI/UX patterns) + ERPNext (business logic depth)

### Features to Implement

1. **Contact Management**
   - Full contact CRUD with rich fields
   - Company/individual distinction (from ERPNext customer_type)
   - Multi-channel contact info: email, phone, WhatsApp JID
   - Contact deduplication detection
   - Import/export (CSV, vCard)
   - Contact timeline showing all interactions
   - Merge duplicate contacts
   - Link contacts to companies

2. **Company Management**
   - Company profiles with industry, size, revenue
   - Company hierarchy (parent/child companies)
   - ICP (Ideal Customer Profile) tagging — from Twenty
   - Company-level activity feed
   - Multiple contacts per company

3. **Lead Management**
   - Lead capture from multiple sources (web form, WhatsApp, email, API)
   - Lead scoring algorithm
   - Lead qualification workflow
   - Lead-to-contact conversion
   - Lead assignment rules (round-robin, territory-based)
   - Lead source tracking & analytics
   - Market segment categorization — from ERPNext

4. **Opportunity/Deal Management**
   - Visual pipeline with drag-and-drop kanban — from Twenty
   - Multiple pipelines per workspace
   - Stage probability mapping
   - Win/loss reason tracking — from ERPNext
   - Competitor tracking — from ERPNext
   - Revenue forecasting from pipeline
   - Weighted pipeline reports

5. **Campaign Management**
   - Multi-channel campaigns (email, WhatsApp, SMS)
   - Campaign scheduling
   - A/B testing
   - Campaign analytics (open rate, click rate, response rate)
   - Campaign budget tracking — from ERPNext

6. **Custom Views**
   - Table view with column customization — from Twenty
   - Kanban board view — from Twenty
   - Advanced filters (AND/OR conditions) — from Twenty
   - Custom sorts and grouping — from Twenty
   - Saved views (personal & shared) — from Twenty
   - Calendar view for date-based records

---

## MODULE 3: Unified Messaging & Communication

### Source: Evolution API (messaging engine) + Twenty CRM (email integration)

### Features to Implement

1. **Unified Inbox**
   - Single view for all channels: WhatsApp, Email, SMS
   - Conversation threading
   - Auto-link conversations to contacts/companies/deals
   - Unread count & notification badges
   - Quick reply templates
   - Internal notes on conversations

2. **WhatsApp Integration** (from Evolution API)
   - WhatsApp Web connection via Baileys
   - WhatsApp Business API (Cloud API) support
   - QR code scanning for connection
   - Multi-instance support
   - Send/receive: text, images, videos, audio, documents
   - Message templates (approved by Meta)
   - Group messaging
   - Contact sync from WhatsApp
   - Read receipts & delivery status
   - Instance settings: always online, read messages, reject calls, sync history

3. **Email Integration** (from Twenty CRM)
   - Gmail OAuth connection
   - Outlook/Microsoft OAuth connection
   - IMAP/SMTP generic connection
   - Full email sync (inbox, sent, drafts)
   - Send emails from the platform
   - Email threading & reply detection
   - Email templates
   - Email tracking (opens, clicks)
   - Email-to-contact auto-linking
   - Blocklist management

4. **Calendar Integration** (from Twenty CRM)
   - Google Calendar sync
   - Outlook Calendar sync
   - Create/edit/delete events
   - Event participants & RSVP
   - Calendar event linking to contacts/deals
   - Scheduling links (Calendly-style)

5. **Message Templates**
   - Create reusable message templates per channel
   - Variable interpolation ({{contact.name}}, {{company.name}}, etc.)
   - Template approval workflow (for WhatsApp Business)
   - Template analytics

---

## MODULE 4: AI & Chatbot System

### Source: Evolution API (primary — most comprehensive bot system)

### Features to Implement

1. **AI Provider Management**
   - Connect multiple AI providers: OpenAI, Anthropic, Google, Dify, Flowise, custom
   - Encrypted API key storage
   - Model selection per provider
   - Provider health monitoring

2. **Chatbot Builder**
   - Create AI-powered chatbots per messaging channel
   - Bot types:
     - **Chat Completion**: Direct LLM conversation
     - **Assistant**: OpenAI Assistant API with tools
     - **Agent**: Multi-step reasoning (Dify/LangChain agent)
     - **Workflow Bot**: Trigger n8n workflows from chat
     - **Typebot**: Visual conversation flow builder
   - Custom system prompts
   - Max tokens & temperature configuration
   - Response splitting for long messages
   - Typing simulation (time per character delay)

3. **Bot Trigger Configuration**
   - Trigger types: all messages, keyword-based, advanced regex
   - Trigger operators: contains, equals, startsWith, endsWith, regex
   - Ignore specific JIDs/contacts
   - Listen from self messages option
   - Stop bot when user sends message
   - Debounce time to group messages

4. **Bot Session Management**
   - Active session tracking per contact
   - Session context persistence (JSONB)
   - Session expiration (configurable minutes)
   - Keyword-based session termination
   - Unknown message fallback responses
   - Session pause/resume
   - Fallback bot configuration

5. **Speech-to-Text**
   - Audio message to text conversion (from OpenAI integration)
   - Auto-processing in bot conversations

---

## MODULE 5: Workflow Automation Engine

### Source: n8n (primary) + Twenty CRM (trigger system)

### Features to Implement

1. **Visual Workflow Builder**
   - Drag-and-drop node-based canvas — from n8n
   - Node types:
     - **Triggers**: Webhook, Schedule (cron), Event (record created/updated/deleted)
     - **Actions**: Send email, Send WhatsApp, Create record, Update record, HTTP request
     - **Logic**: If/Else, Switch, Merge, Split, Loop
     - **Code**: JavaScript/Python code execution
     - **AI**: LLM call, classification, extraction
   - Node connections with data mapping
   - Pin data for testing

2. **Workflow Execution**
   - Manual execution with test data
   - Automatic execution via triggers
   - Sub-workflow execution
   - Retry on failure
   - Execution history with full data inspection
   - Wait/pause nodes for human-in-the-loop
   - Error handling nodes

3. **Credential Management** (from n8n)
   - Encrypted credential storage
   - Credential types per integration
   - Shared credentials across workflows
   - External secrets provider support (Vault, etc.)

4. **Workflow Organization**
   - Folder hierarchy — from n8n
   - Tags & labels
   - Search & filter
   - Workflow versioning with history
   - Archive/restore
   - Import/export

5. **Workflow Triggers from CRM** (from Twenty)
   - Record created trigger
   - Record updated trigger (with field-level change detection)
   - Record deleted trigger
   - Stage change trigger (pipeline movement)
   - Scheduled triggers (daily/weekly/monthly)

6. **Built-in Workflow Templates**
   - Lead assignment automation
   - Follow-up reminder emails
   - Deal won → Create invoice
   - WhatsApp auto-reply
   - Customer onboarding sequence
   - Ticket escalation

---

## MODULE 6: Accounting & Finance

### Source: ERPNext (primary — most complete accounting system)

### Features to Implement

1. **Chart of Accounts**
   - Hierarchical account tree
   - Standard account types (Asset, Liability, Equity, Income, Expense)
   - Account categorization (Bank, Cash, Receivable, Payable, Stock, Tax)
   - Multi-currency support
   - Import standard chart of accounts by country

2. **General Ledger**
   - Double-entry bookkeeping
   - Automatic GL entries from transactions
   - GL entry reversals
   - Period closing vouchers
   - Ledger reports with filters

3. **Invoicing**
   - Sales invoice creation (from quotation/sales order)
   - Purchase invoice creation (from purchase order)
   - Line item management with taxes
   - Invoice numbering (auto/manual)
   - Invoice PDF generation
   - Email invoices directly
   - Recurring invoices (from subscriptions)
   - Credit notes & debit notes
   - Multi-currency invoices

4. **Payments**
   - Payment entry recording
   - Payment against invoices (partial/full)
   - Bank reconciliation
   - Payment methods (cash, bank transfer, card, online)
   - Payment terms & schedules
   - Outstanding amount tracking
   - Payment reminders (dunning)

5. **Tax Management**
   - Tax categories & rules
   - Tax templates per item/region
   - GST/VAT support
   - Tax withholding
   - Tax reports

6. **Financial Reports**
   - Profit & Loss statement
   - Balance Sheet
   - Cash Flow Statement
   - Trial Balance
   - Aged Receivables/Payables
   - Budget vs Actual
   - Custom financial report templates

---

## MODULE 7: Inventory & Stock Management

### Source: ERPNext (only source)

### Features to Implement

1. **Item Master**
   - Item creation with variants
   - Item groups/categories
   - Barcodes (EAN, UPC, etc.)
   - Multiple units of measure
   - Item images
   - Stock vs non-stock vs service items
   - Item price lists (buying/selling prices)

2. **Warehouse Management**
   - Multi-warehouse support
   - Warehouse hierarchy
   - Warehouse-wise stock tracking
   - Putaway rules for receiving
   - Inventory dimensions

3. **Stock Transactions**
   - Material Receipt (Purchase Receipt)
   - Material Issue
   - Material Transfer
   - Stock Entry types (manufacture, repack, send to subcontractor)
   - Stock reconciliation

4. **Serial & Batch Tracking**
   - Serial number per item unit
   - Batch numbers with expiry dates
   - Serial/batch tracking through entire lifecycle

5. **Stock Valuation**
   - FIFO / Moving Average / LIFO valuation
   - Landed cost calculation
   - Stock value reports
   - Reposting item valuation

6. **Order Fulfillment**
   - Pick list generation
   - Packing slips
   - Delivery notes with tracking
   - Shipment management

---

## MODULE 8: Manufacturing

### Source: ERPNext (only source)

### Features to Implement

1. **Bill of Materials (BOM)**
   - Multi-level BOM creation
   - BOM operations with time/cost
   - Scrap items definition
   - BOM costing (raw material + operation cost)
   - BOM comparison and versioning

2. **Work Orders**
   - Work order from sales order or production plan
   - Material requirement calculation
   - WIP warehouse tracking
   - Production quantity tracking
   - Work order operations with time

3. **Job Cards**
   - Job card per operation
   - Time logging (start/stop)
   - Job card items consumed
   - Quality inspection integration
   - Job card scheduling

4. **Production Planning**
   - Production plan from sales orders
   - Master production schedule
   - Material request generation
   - Capacity planning
   - Sales forecasting

5. **Workstation Management**
   - Workstation definitions
   - Operating costs per workstation
   - Working hours configuration
   - Downtime tracking

---

## MODULE 9: Projects & Task Management

### Source: ERPNext (project depth) + Twenty CRM (modern task UI)

### Features to Implement

1. **Project Management**
   - Project CRUD with status lifecycle
   - Project templates for quick creation
   - Gantt chart view
   - Project costing (estimated vs actual)
   - Project members & roles
   - Project linked to opportunities/companies
   - Percent completion tracking

2. **Task Management**
   - Task CRUD with priorities
   - Task dependencies (from ERPNext dependent tasks)
   - Subtasks (parent/child)
   - Kanban board for tasks — from Twenty
   - Task assignments
   - Due date tracking with overdue alerts
   - Task linking to contacts/companies/opportunities — from Twenty

3. **Time Tracking**
   - Timesheet entries per task
   - Billable vs non-billable hours
   - Billing rate per activity type
   - Timer start/stop
   - Timesheet reports
   - Invoice generation from timesheets

---

## MODULE 10: Support & Ticketing

### Source: ERPNext (SLA system) + Evolution API (Chatwoot concepts)

### Features to Implement

1. **Ticket Management**
   - Ticket creation from multiple sources (email, WhatsApp, web form, API)
   - Ticket types & priorities
   - Status lifecycle: Open → In Progress → Replied → Resolved → Closed
   - Auto-assign rules
   - Ticket linking to conversations (unified inbox)

2. **SLA Management** (from ERPNext)
   - SLA definitions with response & resolution times
   - Priority-based SLA times
   - SLA pause on specific statuses
   - SLA fulfillment tracking
   - SLA breach alerts

3. **Ticket Routing**
   - Auto-assignment based on rules (round-robin, skill-based)
   - Escalation rules
   - Group/team assignment

4. **Customer Portal**
   - Customer-facing ticket submission
   - Ticket status tracking
   - Knowledge base integration
   - Self-service FAQ

---

## MODULE 11: Buying & Procurement

### Source: ERPNext (only source)

### Features to Implement

1. **Supplier Management**
   - Supplier profiles with banking details
   - Supplier scorecard system
   - Supplier groups/categories
   - Approved supplier lists per item

2. **Purchase Orders**
   - PO creation from request for quotation
   - PO approval workflow
   - Partial/complete receipt tracking
   - PO to purchase invoice flow

3. **Request for Quotation**
   - Send RFQ to multiple suppliers
   - Supplier quotation comparison
   - Best price selection
   - RFQ to PO conversion

---

## MODULE 12: Asset Management

### Source: ERPNext (only source)

### Features to Implement

1. **Asset Lifecycle**
   - Asset registration from purchase
   - Location & custodian tracking
   - Asset movement between locations
   - Asset value adjustments
   - Asset disposal/scrapping

2. **Depreciation**
   - Multiple depreciation methods (straight line, diminishing balance, etc.)
   - Automatic depreciation schedule generation
   - Finance book support
   - Depreciation posting

3. **Maintenance**
   - Preventive maintenance scheduling
   - Maintenance team management
   - Maintenance logs
   - Asset repair tracking
   - Maintenance cost tracking

---

## MODULE 13: Event Streaming & Webhooks

### Source: Evolution API (event streaming) + n8n (webhook system)

### Features to Implement

1. **Webhook System**
   - Register webhook URLs for events
   - Event filtering (subscribe to specific events)
   - Custom headers & authentication
   - Retry on failure (exponential backoff)
   - Webhook delivery logs
   - Webhook secret signing (HMAC)

2. **Event Streaming**
   - RabbitMQ producer
   - Apache Kafka producer
   - Amazon SQS producer
   - NATS producer
   - WebSocket real-time events
   - Pusher integration
   - Event type configuration per stream

3. **Supported Events**
   - Contact/Company/Lead/Opportunity CRUD events
   - Message sent/received/read events
   - Workflow execution events
   - Invoice/Payment events
   - Ticket status change events
   - User login/activity events

---

## MODULE 14: Billing & Subscription Management

### Source: Twenty CRM (SaaS billing) + ERPNext (subscription plans)

### Features to Implement

1. **Stripe Integration**
   - Customer creation in Stripe
   - Subscription management
   - Payment method management
   - Invoice generation
   - Usage-based metering

2. **Plan Management**
   - Free/starter/pro/enterprise plans
   - Feature entitlements per plan
   - Seat-based pricing
   - Usage limits (workflows, messages, storage)

3. **Billing Portal**
   - Self-service plan changes
   - Payment history
   - Invoice downloads
   - Usage dashboard

---

## MODULE 15: Custom Objects & Metadata System

### Source: Twenty CRM (dynamic schema) + ERPNext (doctype system)

### Features to Implement

1. **Custom Object Creation**
   - Define custom objects with name, label, icon
   - Auto-create database tables
   - REST + GraphQL API auto-generation
   - Standard field types: Text, Number, Date, Select, Boolean, Currency, Email, Phone, URL, Rating, Relation, JSON, Rich Text

2. **Custom Field Builder**
   - Add fields to standard or custom objects
   - Field validation rules
   - Default values
   - Required/optional/unique constraints
   - Field positioning/ordering

3. **View System**
   - Create saved views per object
   - Table, Kanban, Calendar, List view types
   - Filter, sort, group by configuration
   - Shared vs personal views

4. **Navigation Customization**
   - Custom navigation menu items
   - Command palette items
   - Page layouts with tabs and widgets

---

## MODULE 16: AI Agents & Intelligence

### Source: Twenty CRM (AI agent system) + n8n (AI workflow builder, LangChain) + Evolution API (bot engine)

### Features to Implement

1. **AI Agent System** (from Twenty CRM metadata-modules/ai/)
   - AI Agent creation and management
   - Agent execution tracking and monitoring
   - Agent roles and permissions
   - AI billing and usage metering
   - AI Chat interface for agent conversations
   - AI Model configuration (connect multiple LLM providers)

2. **AI Workflow Builder** (from n8n ai-workflow-builder.ee)
   - LLM-powered automatic workflow generation
   - Agent-based workflow construction (chains, subgraphs)
   - Code builder for automated node generation
   - Prompt management and template system
   - Validation of AI-generated workflows

3. **LangChain Integration** (from n8n nodes-langchain)
   - LLM nodes (OpenAI, Anthropic, Google, etc.)
   - Vector store integration (Pinecone, Weaviate, etc.)
   - Document loaders and text splitters
   - Retrieval-Augmented Generation (RAG) chains
   - AI tools and function calling
   - Memory management for conversations

4. **Model Context Protocol (MCP)** (from n8n + Twenty)
   - MCP server implementation for LLM tool access
   - Expose CRM data, workflows, and actions as MCP tools
   - MCP client for connecting to external MCP servers

5. **Voice Processing** (from Evolution API)
   - Speech-to-text for audio messages
   - Voice call handling via WhatsApp
   - Audio transcription in bot conversations

---

## MODULE 17: Analytics & Insights

### Source: n8n (insights module) + Twenty CRM (ClickHouse analytics + dashboards)

### Features to Implement

1. **Dashboard Builder**
   - Custom dashboard creation with widgets
   - Dashboard templates (sales, operations, support)
   - Dashboard data synchronization (from Twenty dashboard-sync)
   - Real-time data refresh

2. **Workflow Analytics** (from n8n insights)
   - Execution success/failure rates
   - Average execution time
   - Node-level performance metrics
   - Trigger frequency analysis
   - Error pattern detection

3. **ClickHouse Analytics** (from Twenty engine/api/clickhouse)
   - High-performance analytical queries
   - Time-series data analysis
   - Aggregation pipelines for business metrics
   - Custom report builder

4. **Business Intelligence**
   - Sales pipeline analytics
   - Revenue forecasting
   - Customer acquisition metrics
   - Support ticket analytics (response time, resolution time)
   - Inventory turnover analysis

5. **Audit Trail** (from Twenty core-modules/audit)
   - Complete activity logging
   - User action tracking
   - Data change history
   - Audit reports and exports
   - Compliance audit support

---

## MODULE 18: Quality Management

### Source: ERPNext (quality_management module — 16 doctypes)

### Features to Implement

1. **Quality Inspection**
   - Incoming/outgoing quality inspections
   - Inspection templates with parameters
   - Pass/fail criteria
   - Integration with stock receipts and deliveries

2. **Quality Goals & Reviews**
   - Quality goal setting with objectives
   - Periodic quality review system
   - Quality procedure documentation
   - Quality feedback from customers/teams

3. **Non-Conformance**
   - Non-conformance recording
   - Quality action tracking (corrective/preventive)
   - Root cause analysis
   - ISO 9001 compliance support

---

## MODULE 19: Subcontracting

### Source: ERPNext (subcontracting module — 13 doctypes)

### Features to Implement

1. **Subcontracting Orders**
   - Subcontracting order creation from BOM
   - Raw material supply tracking to subcontractor
   - Service item costing

2. **Subcontracting Receipts**
   - Receive finished goods from subcontractor
   - Scrap item tracking
   - Quality inspection at receipt
   - Consumed material reconciliation

---

## MODULE 20: Platform Extensions & Marketplace

### Source: Twenty CRM (marketplace, chrome extension, front-components, logic-functions)

### Features to Implement

1. **Marketplace** (from Twenty)
   - Browse and install extensions
   - Extension versioning and updates
   - Extension ratings and reviews
   - Developer SDK for building extensions

2. **Chrome Extension** (from Twenty chrome-extension-sidecar)
   - Browser sidebar showing CRM data
   - Quick contact/company lookup
   - One-click record creation from web pages
   - Email context enrichment

3. **Custom Logic Functions** (from Twenty logic-functions)
   - Write custom TypeScript server-side functions
   - Trigger functions from workflows or UI events
   - Function dependency management (layers)
   - Sandboxed execution environment

4. **Custom Front Components** (from Twenty front-components)
   - Register custom React components
   - Embed components in page layouts
   - Component marketplace distribution

5. **Data Import/Export** (from Twenty spreadsheet-import)
   - CSV/Excel bulk import with field mapping
   - Data validation and error handling
   - Export to CSV/Excel/PDF
   - Scheduled data exports

6. **Geo Map** (from Twenty geo-map module)
   - Location-based data visualization
   - Map view for companies/contacts with addresses
   - Territory mapping

7. **Source Control for Workflows** (from n8n source-control.ee)
   - Git-based workflow version control
   - Branch/merge workflow changes
   - Diff visualization between versions
   - Rollback to previous versions

8. **Log Streaming** (from n8n log-streaming.ee)
   - Forward application logs to external systems
   - Syslog, S3, and custom destinations
   - Log filtering and transformation

---

## MODULE 21: GPS & Fleet Management

### Source: Traccar (primary — complete GPS tracking system)

### Features to Implement

1. **Real-Time GPS Tracking**
   - Live map with device positions (OpenStreetMap, Google, Bing, Mapbox)
   - Device status (online/offline/moving/stopped)
   - Speed, course, altitude display
   - Address resolution via reverse geocoding
   - Position history playback
   - Multi-protocol support (200+ GPS protocols via Traccar decoders)

2. **Geofencing**
   - Create geofences (polygon, circle, polyline)
   - Visual geofence editor on map
   - Geofence enter/exit alerts
   - Calendar-based geofence scheduling (active hours)
   - Assign geofences to devices or groups

3. **Fleet & Device Management**
   - Device CRUD with IMEI/unique ID
   - Device grouping (hierarchical groups)
   - Device categories (car, truck, bus, motorcycle, boat, person)
   - Device accumulators (total distance, engine hours)
   - Device status dashboard (battery, signal, connection)
   - User-to-device assignment (permissions)

4. **Driver Management**
   - Driver profiles with iButton/RFID identification
   - Automatic driver detection from device data
   - Driver-to-device assignment
   - Driver behavior scoring (harsh braking, acceleration, cornering)

5. **Trip & Route Reports** (11 report types)
   - Route report (full position history)
   - Trip report (start/end, distance, duration, avg/max speed)
   - Stop report (location, duration, engine hours)
   - Summary report (daily totals: distance, speed, fuel)
   - Events report (alarms, geofence, overspeed)
   - Geofence report (entry/exit history per zone)
   - Combined report (multi-metric view)
   - Export: CSV, GPX (GPS exchange), KML (Google Earth)

6. **Event & Alarm System** (12 event types)
   - Motion events (start/stop movement)
   - Overspeed alerts (configurable speed limits)
   - Geofence enter/exit events
   - Fuel level events (theft detection, refill)
   - Ignition events (engine on/off)
   - Maintenance alerts (km/hours/time-based scheduling)
   - Device alarms (SOS, tamper, low battery — from device)
   - Driver behavior events (harsh braking, rapid acceleration)
   - Command result events

7. **Notifications** (10 channels from Traccar)
   - Firebase push notifications (mobile)
   - Email notifications (SMTP)
   - SMS alerts
   - Telegram bot messages
   - WhatsApp messages
   - Pushover notifications
   - Web push (in-app WebSocket)
   - Device command as notification action

8. **Device Commands**
   - Send remote commands to GPS devices
   - Command types: position request, engine stop/start, set timezone, custom
   - Queued commands for offline devices
   - Command result tracking

9. **Geocoding & Geolocation**
   - Reverse geocoding (25 providers: Google, Bing, Here, Nominatim, OpenCage, etc.)
   - Cell tower / WiFi geolocation (Google, OpenCellId, Unwired)
   - Speed limit lookup
   - Hemisphere correction

10. **Event Forwarding**
    - Forward positions/events to external systems
    - Channels: JSON/HTTP, AMQP, Apache Kafka, MQTT, Redis
    - Wialon protocol forwarding (fleet management interop)
    - Network forwarding (raw protocol data)

### Implementation Notes
- GPS positions are **high-volume time-series data** — consider TimescaleDB or table partitioning
- Protocol decoders run on Netty (Java) — may need a sidecar service or Node.js port
- WebSocket required for real-time map updates
- Device permissions follow user→device many-to-many pattern (from Traccar)

---

## MODULE 22: Customer Support & Helpdesk

### Source: Chatwoot (primary — complete omnichannel support platform)

### Features to Implement

1. **Omnichannel Inbox**
   - Unified conversation view across all channels
   - Real-time message updates via WebSocket
   - Conversation assignment (manual, auto-assignment, round-robin)
   - Conversation priority, status, SLA tracking
   - Private notes and @mentions for internal team collaboration
   - Participant management

2. **Messaging Channels** (12 from Chatwoot)
   - Web widget (embeddable live chat with pre-chat forms, HMAC auth)
   - Email (IMAP/SMTP with provider config)
   - WhatsApp (Cloud API or custom provider)
   - Facebook Page messaging
   - Instagram DM
   - Twitter DM + tweet replies
   - Telegram bot
   - LINE messaging
   - SMS (generic + Twilio)
   - TikTok business messaging
   - Voice/phone calls (Twilio)
   - Custom API channel

3. **Captain AI Agent** (from Chatwoot)
   - AI assistants with configurable guidelines and guardrails
   - Knowledge base document ingestion
   - pgvector semantic search (1536-dim embeddings)
   - Custom HTTP tools for AI (endpoint URL, auth, param schema)
   - AI scenarios with tool chains
   - Agent Copilot (threads + messages)
   - Article embedding for help center search

4. **Help Center Portal**
   - Public-facing knowledge base portals
   - Articles with categories, folders, slugs, locales
   - Multi-language support
   - Article embeddings for AI-powered search

5. **SLA Policies**
   - Response/resolution time SLAs
   - SLA tracking per conversation
   - SLA status (active, breached, fulfilled)
   - Pause SLA on specific statuses

6. **CSAT Surveys**
   - Customer satisfaction surveys after conversations
   - Rating + feedback message collection
   - CSAT review notes by agents
   - CSAT reporting and analytics

7. **Automation & Productivity**
   - Automation rules (event-driven conditions + actions)
   - Macros (multi-step action playbooks)
   - Canned responses (shortcode-based quick replies)
   - Campaigns (proactive outbound messaging)
   - Labels and custom filters
   - Working hours and auto-responders
   - Agent capacity policies

8. **Teams & Agents**
   - Team management with member assignment
   - Agent bots (webhook-based bots on inboxes)
   - Assignment policies (order, priority, fair distribution)
   - Agent availability tracking

9. **Reporting & Analytics**
   - Conversation reports (by agent, inbox, label, team)
   - CSAT reports
   - Live view of ongoing conversations
   - Reporting events for custom analytics
   - Downloadable reports

### Implementation Notes
- Chatwoot uses Rails + Sidekiq — will need to port to NestJS/Node.js
- pgvector for AI embeddings needs PostgreSQL with vector extension
- Channel integrations need OAuth flows per provider
- Enterprise features (SAML SSO, custom roles) need separate module

---

## MODULE 23: SMS Gateway

### Source: Jasmin (primary — enterprise SMPP gateway)

### Features to Implement

1. **SMPP Protocol Support**
   - SMPP v3.4 client (connect to SMS providers)
   - SMPP server (receive SMS from providers)
   - Connection pooling and bind management
   - TLS/SSL support
   - PDU handling and encoding

2. **HTTP/REST SMS API**
   - Send SMS via HTTP POST/GET
   - Receive SMS via HTTP callbacks
   - REST API for modern integrations
   - Batch SMS sending

3. **Message Routing Engine**
   - Static routes (direct destination mapping)
   - Roundrobin routing (load balancing)
   - Failover routing (automatic fallback)
   - Leastcost routing (cheapest route selection)
   - HLR lookup routing (number portability)
   - Message filters (source, destination, content regex, date/time)

4. **Billing & Rate Management**
   - Per-message rate billing
   - Rate tables per route
   - Billing summaries

5. **DLR (Delivery Receipt) Tracking**
   - Real-time delivery status via Redis
   - DLR callback forwarding
   - Status: delivered, failed, expired, rejected

6. **Message Interception**
   - Modify messages in transit
   - Content transformation
   - Header manipulation
   - Interception tables and rules

7. **Store & Forward**
   - AMQP/RabbitMQ message queuing
   - Reliable delivery with retry
   - Queue management

8. **Special SMS Types**
   - Unicode (UTF-8) multilingual messages
   - Concatenated SMS (long messages)
   - Binary SMS (ringtones, WAP Push, vCards)

### Implementation Notes
- Jasmin is Python/Twisted — will need adapter service or Node.js SMPP library
- AMQP integration aligns with our existing RabbitMQ from Evolution API
- Redis DLR tracking aligns with our existing Redis infrastructure
- Consider using Jasmin as a sidecar service (like Traccar GPS sidecar)

---

## MODULE 24: Self-Hosted Email Suite

### Source: Mailcow (primary — full email backend and groupware)

### Features to Implement

1. **Email Backend (MTA & IMAP)**
   - Postfix SMTP routing and relaying
   - Dovecot IMAP/POP3 storage and indexing
   - Multi-domain hosting with virtual mailboxes
   - Email aliases and forwarding logic
   - IMAP sync tools for migration

2. **Webmail & Groupware (SOGo)**
   - Web application for email, contacts, and calendars
   - CalDAV & CardDAV server
   - ActiveSync (EAS) for native mobile push sync
   - Sharing capabilities for folders and calendars

3. **Security & Anti-Spam**
   - Mandatory TLS, MTA-STS, DANE
   - DKIM, DMARC, ARC checking and signing
   - Rspamd integration for spam scoring
   - ClamAV & olefy for malicious attachments
   - Sieve filters for server-side rules
   - Netfilter (Fail2ban equivalent) for brute-force protection

4. **Administration & Identity**
   - Central-admin UI for domain and mailbox management
   - FIDO2/WebAuthn and TOTP for 2FA
   - App passwords for isolated IMAP/SMTP access
   - Quota management

### Implementation Notes
- Mailcow is heavily Docker-dependent and utilizes many interconnected containers (Postfix, Dovecot, SOGo, PHP, Nginx).
- It's best integrated as a standalone cluster (Docker Compose) that the unified SaaS talks to via API to provision domains and mailboxes, similar to Traccar.
- The SOGo component perfectly fills the groupware void (CalDAV/CardDAV) missing from the other CRM systems.

---

## MODULE 25: HR & Payroll Management

### Source: Frappe HR (HRMS)

### Features to Implement

1. **Employee Lifecycle Management**
   - Full onboarding workflows (tasks, documents, equipment)
   - Employee profiles with personal, professional, and bank details
   - Internal transfers, promotions with auto-update to designation/grade
   - Separation & Exit process with full and final statement automation

2. **Leave & Attendance Management**
   - Flexible leave policies (LWP, carry-forward, continuous day limits)
   - Multi-level leave approval workflows
   - Geolocation-based attendance check-in (from mobile app)
   - **Roster App**: Modern Vite/Vue interface for complex shift scheduling and roster transparency
   - Shift scheduling and auto-assignment based on roster
   - Holiday lists and compensatory leave handling

3. **Payroll & Taxation (India-specific and Global)**
   - Dynamic salary structures and components (Earnings/Deductions)
   - Automatic payroll processing with salary slip generation
   - **Regional Compliance Engines**:
     - **India**: PAN tracking, HRA exemption logic, Professional Tax, Provident Fund (PF)
     - **UAE**: Gratuity rules for limited/unlimited contracts (resignation/termination)
   - Comprehensive tax management (Income tax slabs, exemptions, declarations)
   - Benefit applications and claims (HRA, LTA, etc.)
   - Gratuity and bonus calculations

4. **Performance & Recruitment**
   - KRA and Goal-based appraisal cycles
   - Self, manager, and 360-degree feedback systems
   - Job requisition to offer letter pipeline
   - Interview scheduling and scoring system

5. **Expense Claims & Travel**
   - Multi-currency expense claims with receipt attachments
   - Multi-level approval and JV integration for accounting
   - Travel requests with itinerary and cost tracking

### Implementation Notes
- **Frappe Dependency**: HRMS relies heavily on Frappe's `Employee` and `User` models, which should be mapped to the unified `User` and `hrms_employee` tables.
- **Mobile Access**: The HRMS project includes a dedicated Vue/Ionic PWA which is critical for employee self-service (attendance, leave, payslips).
- **Regional Compliance**: The payroll system features sophisticated India-specific tax and HRA calculation logic which should be preserved.
- **Real-time**: Leverages push notifications for approvals and daily work summaries.

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-4)
1. Core Platform (workspace, auth, users, roles)
2. Database setup with all tables
3. Basic CRM (contacts, companies)
4. API layer (GraphQL + REST)

### Phase 2: CRM & Communication (Weeks 5-8)
5. Leads & Opportunities
6. Pipeline management
7. WhatsApp integration
8. Email integration
9. Unified inbox
10. **Omnichannel support desk (from Chatwoot)**

### Phase 3: Automation & AI (Weeks 9-12)
11. Workflow automation engine
12. AI chatbot system
13. Bot session management
14. Event streaming & webhooks
15. **Captain AI agent (from Chatwoot)**

### Phase 4: Business Operations (Weeks 13-18)
16. Invoicing & payments
17. Inventory management
18. Project & task management
19. Support & ticketing
20. **Help center portal (from Chatwoot)**

### Phase 5: Advanced (Weeks 19-24)
21. Manufacturing
22. Buying & procurement
23. Asset management
24. Custom objects & metadata
25. Billing & subscriptions
26. Calendar integration

### Phase 6: Intelligence, Infrastructure & Comms (Weeks 25-34)
27. AI Agents & Intelligence (AI agent system, LangChain, MCP)
28. Analytics & Insights (dashboards, ClickHouse, audit trail)
29. **GPS & Fleet Management (from Traccar)**
30. **SMS Gateway (from Jasmin)**
31. **Self-Hosted Email & Groupware (from Mailcow)**
32. Quality Management (inspections, goals, non-conformance)
33. Subcontracting (orders, receipts, material tracking)
34. Platform Extensions (marketplace, extensions)

### Phase 7: Polish (Weeks 35-40)
35. Dashboards & reporting
36. Campaign management
37. Data import/export & spreadsheet import
38. Geo Map & visualization
39. Source control for workflows
40. Log streaming & monitoring
41. SLA & CSAT management
42. Mobile responsive
43. Documentation & API docs
