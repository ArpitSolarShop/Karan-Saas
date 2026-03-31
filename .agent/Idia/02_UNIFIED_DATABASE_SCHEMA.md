# 🗄️ Unified Database Schema

> Merged database architecture combining the best features from ERPNext, Evolution API, n8n, Twenty CRM, Traccar, Chatwoot, Jasmin, Mailcow, and HRMS into a single cohesive PostgreSQL schema.

---

## Design Principles

1. **PostgreSQL** as the unified database (supported by all 5 core SaaS projects)
2. **UUID primary keys** everywhere (from Twenty CRM pattern)
3. **Multi-tenant via workspace_id** (from Twenty's workspace isolation)
4. **Soft deletes** with `deleted_at` column (from n8n pattern)
5. **Audit columns** on every table: `created_at`, `updated_at`, `created_by`, `updated_by`
6. **JSONB for flexible data** where schema varies (from Evolution API + n8n pattern)
7. **TypeORM compatible** column naming (camelCase in code, snake_case in DB)

---

## Schema Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    UNIFIED SAAS SCHEMA                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │   CORE      │  │   AUTH &    │  │     BILLING &            │ │
│  │   TENANT    │  │   ACCESS    │  │     SUBSCRIPTIONS        │ │
│  │             │  │             │  │                          │ │
│  │ Workspace   │  │ User        │  │ BillingCustomer          │ │
│  │ WorkspaceMbr│  │ Role        │  │ BillingSubscription      │ │
│  │ Setting     │  │ Permission  │  │ BillingProduct           │ │
│  │ ApiKey      │  │ SsoProvider │  │ BillingPrice             │ │
│  │ AppToken    │  │ AuthIdentity│  │ BillingInvoice           │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │   CRM &     │  │  MESSAGING  │  │   WORKFLOW &             │ │
│  │   SALES     │  │  & COMMS    │  │   AUTOMATION             │ │
│  │             │  │             │  │                          │ │
│  │ Contact     │  │ Channel     │  │ Workflow                 │ │
│  │ Company     │  │ Conversation│  │ WorkflowVersion          │ │
│  │ Lead        │  │ Message     │  │ WorkflowExecution        │ │
│  │ Opportunity │  │ WhatsApp    │  │ WorkflowNode             │ │
│  │ Campaign    │  │ Email       │  │ WorkflowTrigger          │ │
│  │ Pipeline    │  │ Template    │  │ WorkflowCredential       │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │  FINANCE &  │  │  INVENTORY  │  │   MANUFACTURING          │ │
│  │  ACCOUNTING │  │  & STOCK    │  │   & PRODUCTION           │ │
│  │             │  │             │  │                          │ │
│  │ Account     │  │ Item        │  │ BillOfMaterials          │ │
│  │ JournalEntry│  │ Warehouse   │  │ WorkOrder                │ │
│  │ Invoice     │  │ StockEntry  │  │ JobCard                  │ │
│  │ Payment     │  │ StockLedger │  │ Workstation              │ │
│  │ Tax         │  │ Batch       │  │ ProductionPlan           │ │
│  │ Budget      │  │ SerialNo    │  │ Operation                │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │  PROJECTS   │  │  SUPPORT    │  │   AI &                   │ │
│  │  & TASKS    │  │  & TICKETS  │  │   INTEGRATIONS           │ │
│  │             │  │             │  │                          │ │
│  │ Project     │  │ Ticket      │  │ AiProvider               │ │
│  │ Task        │  │ SLA         │  │ AiBot                    │ │
│  │ Timesheet   │  │ TicketReply │  │ AiBotSession             │ │
│  │ Milestone   │  │ KnowBase    │  │ Webhook                  │ │
│  │ Calendar    │  │ WarrantyClm │  │ EventStream              │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │   ASSETS    │  │  BUYING &   │  │   METADATA &             │ │
│  │             │  │  PROCUREMENT│  │   CUSTOM OBJECTS         │ │
│  │             │  │             │  │                          │ │
│  │ Asset       │  │ Supplier    │  │ ObjectMetadata           │ │
│  │ AssetCateg  │  │ PurchOrder  │  │ FieldMetadata            │ │
│  │ Depreciatn  │  │ RFQ         │  │ ViewDefinition           │ │
│  │ Maintenance │  │ SupplierScor│  │ CustomObject             │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Detailed Table Definitions

### 🏢 CORE TENANT SYSTEM

```sql
-- Source: Twenty CRM workspace model (best multi-tenant design)
CREATE TABLE workspace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'trial',
    plan VARCHAR(50) DEFAULT 'free',
    -- From ERPNext: company-level fields
    default_currency VARCHAR(10) DEFAULT 'USD',
    country VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'UTC',
    fiscal_year_start DATE,
    tax_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Source: Twenty CRM (user model) + n8n (MFA fields)
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    -- From n8n: MFA support
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    mfa_recovery_codes TEXT[],
    -- From n8n: activity tracking
    last_active_at TIMESTAMP,
    personalization_data JSONB,
    settings JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- Source: Twenty CRM user_workspace
CREATE TABLE workspace_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role_id UUID REFERENCES role(id),
    status VARCHAR(20) DEFAULT 'active', -- active, invited, deactivated
    invited_at TIMESTAMP,
    joined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

-- Source: Twenty CRM role + n8n role (merged)
CREATE TABLE role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,  -- built-in roles can't be deleted
    permissions JSONB DEFAULT '{}',   -- object/field/row-level permissions (from Twenty)
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (workspace_id, slug)
);

-- Source: n8n api_key + Twenty api_key (merged)
CREATE TABLE api_key (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,  -- first chars for identification
    scopes JSONB DEFAULT '["*"]',
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    revoked_at TIMESTAMP
);

-- Source: Twenty CRM SSO + n8n auth_identity (merged)
CREATE TABLE auth_identity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL,  -- email, google, saml, oidc, ldap
    provider_id VARCHAR(255),
    provider_data JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (provider_type, provider_id)
);

-- Source: Twenty CRM workspace_sso_identity_provider
CREATE TABLE sso_provider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,  -- saml, oidc
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(500),
    sso_url VARCHAR(500),
    certificate TEXT,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 💰 BILLING & SUBSCRIPTIONS

```sql
-- Source: Twenty CRM billing entities + ERPNext subscription (merged)
CREATE TABLE billing_product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stripe_product_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE billing_price (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES billing_product(id),
    stripe_price_id VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD',
    amount DECIMAL(12, 2) NOT NULL,
    interval VARCHAR(20),  -- month, year, one_time
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE billing_customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    email VARCHAR(254),
    name VARCHAR(255),
    -- From ERPNext: accounting fields
    tax_id VARCHAR(50),
    billing_address JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE billing_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES billing_customer(id),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- active, past_due, canceled, trialing
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE billing_subscription_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES billing_subscription(id) ON DELETE CASCADE,
    price_id UUID NOT NULL REFERENCES billing_price(id),
    quantity INT DEFAULT 1,
    stripe_subscription_item_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT now()
);
```

### 👥 CRM & CONTACTS (Merged from ERPNext + Twenty + Evolution API)

```sql
-- UNIFIED CONTACT: Merges Twenty Person + Evolution API Contact + ERPNext Customer
CREATE TABLE contact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    -- From Twenty CRM Person
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(254),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    job_title VARCHAR(100),
    city VARCHAR(100),
    -- From Evolution API Contact
    whatsapp_jid VARCHAR(100),
    whatsapp_push_name VARCHAR(100),
    whatsapp_profile_pic_url VARCHAR(500),
    -- From ERPNext Customer (extended fields)
    customer_type VARCHAR(20), -- Individual, Company
    customer_group VARCHAR(100),
    territory VARCHAR(100),
    industry VARCHAR(100),
    -- Unified fields
    source VARCHAR(50),  -- manual, import, whatsapp, email, web
    status VARCHAR(20) DEFAULT 'active',
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    company_id UUID REFERENCES company(id),
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);
CREATE INDEX idx_contact_workspace ON contact(workspace_id);
CREATE INDEX idx_contact_email ON contact(email);
CREATE INDEX idx_contact_whatsapp ON contact(whatsapp_jid);
CREATE INDEX idx_contact_company ON contact(company_id);

-- UNIFIED COMPANY: From Twenty Company + ERPNext Customer (Company type)
CREATE TABLE company (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    logo_url VARCHAR(500),
    -- From Twenty CRM
    ideal_customer_profile BOOLEAN DEFAULT false,
    position INT,
    -- From ERPNext
    industry VARCHAR(100),
    territory VARCHAR(100),
    annual_revenue DECIMAL(15, 2),
    employee_count INT,
    tax_id VARCHAR(50),
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    -- Unified
    website VARCHAR(500),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- LEAD: From ERPNext Lead + Twenty pipeline approach
CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    -- From ERPNext
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(254),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    source VARCHAR(100),  -- Web, Phone, WhatsApp, Campaign, Referral
    status VARCHAR(50) DEFAULT 'new',  -- new, contacted, qualified, converted, lost
    -- From ERPNext CRM
    market_segment VARCHAR(100),
    industry VARCHAR(100),
    territory VARCHAR(100),
    estimated_revenue DECIMAL(15, 2),
    -- Conversion tracking
    converted_contact_id UUID REFERENCES contact(id),
    converted_company_id UUID REFERENCES company(id),
    converted_at TIMESTAMP,
    -- Unified
    assigned_to UUID REFERENCES "user"(id),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- OPPORTUNITY/DEAL: Merges ERPNext Opportunity + Twenty Opportunity
CREATE TABLE opportunity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    -- From Twenty CRM
    stage VARCHAR(50) NOT NULL,  -- qualification, meeting, proposal, negotiation, won, lost
    close_date DATE,
    probability INT, -- 0-100
    point_of_contact_id UUID REFERENCES contact(id),
    company_id UUID REFERENCES company(id),
    -- From ERPNext
    opportunity_type VARCHAR(50),  -- Sales, Support
    currency VARCHAR(10) DEFAULT 'USD',
    amount DECIMAL(15, 2) DEFAULT 0,
    -- From ERPNext: lost reason tracking
    lost_reason VARCHAR(255),
    competitor VARCHAR(255),
    -- Pipeline
    pipeline_id UUID REFERENCES pipeline(id),
    pipeline_stage_id UUID REFERENCES pipeline_stage(id),
    -- Unified
    assigned_to UUID REFERENCES "user"(id),
    source VARCHAR(100),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- PIPELINE: From ERPNext Sales Stage + Twenty stage approach  
CREATE TABLE pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE pipeline_stage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipeline(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    position INT NOT NULL,
    probability INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- CAMPAIGN: From ERPNext Campaign + Email Campaign
CREATE TABLE campaign (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),  -- email, whatsapp, sms, multi_channel
    status VARCHAR(20) DEFAULT 'draft',  -- draft, running, paused, completed
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    -- From ERPNext
    budget DECIMAL(12, 2),
    expected_revenue DECIMAL(12, 2),
    -- Unified
    target_audience JSONB,  -- filter criteria for contacts
    content JSONB,  -- message templates, email content
    schedule JSONB,  -- sending schedule
    stats JSONB DEFAULT '{}',  -- open rates, click rates, etc.
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 📨 UNIFIED MESSAGING (Merged from Evolution API + Twenty CRM)

```sql
-- MESSAGING CHANNEL: Merges Evolution API Instance + Twenty MessageChannel
CREATE TABLE messaging_channel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,  -- whatsapp_baileys, whatsapp_cloud, email, sms
    name VARCHAR(255) NOT NULL,
    -- From Evolution API Instance
    connection_status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, connecting
    -- WhatsApp specific (from Evolution API)
    wa_owner_jid VARCHAR(100),
    wa_profile_name VARCHAR(100),
    wa_profile_pic_url VARCHAR(500),
    wa_number VARCHAR(100),
    wa_business_id VARCHAR(100),
    wa_session_data JSONB,
    -- Email specific (from Twenty CRM)
    email_provider VARCHAR(20),  -- gmail, outlook, imap
    email_address VARCHAR(254),
    email_access_token TEXT,
    email_refresh_token TEXT,
    email_sync_status VARCHAR(20),
    email_last_sync_at TIMESTAMP,
    -- Unified configuration
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    token VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- CONVERSATION: Merges Evolution API Chat + Twenty MessageThread
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES messaging_channel(id) ON DELETE CASCADE,
    -- From Evolution API Chat
    remote_jid VARCHAR(100),
    -- Unified
    type VARCHAR(20) DEFAULT 'direct',  -- direct, group, email_thread
    subject VARCHAR(500),
    status VARCHAR(20) DEFAULT 'open',  -- open, closed, archived, snoozed
    last_message_at TIMESTAMP,
    unread_count INT DEFAULT 0,
    -- From Evolution API
    labels JSONB DEFAULT '[]',
    -- Assignment & routing
    assigned_to UUID REFERENCES "user"(id),
    -- Link to CRM entities
    contact_id UUID REFERENCES contact(id),
    company_id UUID REFERENCES company(id),
    opportunity_id UUID REFERENCES opportunity(id),
    ticket_id UUID REFERENCES ticket(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- MESSAGE: Merges Evolution API Message + Twenty Message
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    -- From Evolution API Message
    message_type VARCHAR(50) NOT NULL,  -- text, image, video, audio, document, email
    content TEXT,
    content_json JSONB,  -- rich message content
    direction VARCHAR(10) NOT NULL,  -- inbound, outbound
    -- From Evolution API
    source_device VARCHAR(20),  -- ios, android, web, desktop, server
    external_id VARCHAR(255),  -- platform-specific message ID
    -- Status tracking
    status VARCHAR(20) DEFAULT 'sent',  -- sent, delivered, read, failed
    -- From Twenty CRM: email-specific
    email_subject VARCHAR(500),
    email_from VARCHAR(254),
    email_to JSONB,  -- array of recipients
    email_cc JSONB,
    email_bcc JSONB,
    email_headers JSONB,
    -- From Evolution API: Chatwoot bridge
    chatwoot_message_id INT,
    chatwoot_conversation_id INT,
    -- Unified
    sender_id UUID REFERENCES "user"(id),
    contact_id UUID REFERENCES contact(id),
    reply_to_id UUID REFERENCES message(id),
    webhook_url VARCHAR(500),
    sent_at TIMESTAMP DEFAULT now(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE ATTACHMENT: From Evolution API Media
CREATE TABLE message_attachment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES message(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    file_size BIGINT,
    storage_url VARCHAR(500),  -- S3/Minio URL
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE TEMPLATE: From Evolution API Template
CREATE TABLE message_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    channel_type VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    external_template_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🤖 AI & BOT SYSTEM (From Evolution API + n8n)

```sql
-- AI PROVIDER CREDENTIALS: From Evolution API OpenaiCreds
CREATE TABLE ai_provider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,  -- openai, dify, flowise, evolution_bot, evoai, custom
    name VARCHAR(255) NOT NULL,
    api_url VARCHAR(500),
    api_key_encrypted VARCHAR(500),
    model VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- AI BOT: Unified from Evolution API's OpenaiBot, Dify, Flowise, EvolutionBot, Evoai, N8n
CREATE TABLE ai_bot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES ai_provider(id),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    bot_type VARCHAR(30) NOT NULL,  -- assistant, chat_completion, chatbot, agent, workflow, webhook
    is_active BOOLEAN DEFAULT true,
    -- Configuration (unified from all bot types)
    system_prompt TEXT,
    model VARCHAR(100),
    max_tokens INT,
    temperature DECIMAL(3, 2),
    -- Behavior  (common fields from Evolution API pattern)
    expire_minutes INT DEFAULT 0,
    keyword_finish VARCHAR(100),
    delay_message_ms INT,
    unknown_message VARCHAR(500),
    listening_from_me BOOLEAN DEFAULT false,
    stop_bot_from_me BOOLEAN DEFAULT false,
    keep_open BOOLEAN DEFAULT false,
    debounce_time_ms INT,
    split_messages BOOLEAN DEFAULT false,
    time_per_char_ms INT DEFAULT 50,
    -- Trigger configuration
    trigger_type VARCHAR(20),  -- all, keyword, none, advanced
    trigger_operator VARCHAR(20),  -- contains, equals, startsWith, endsWith, regex
    trigger_value TEXT,
    -- Webhook-based bots (n8n integration)
    webhook_url VARCHAR(500),
    webhook_auth_user VARCHAR(255),
    webhook_auth_pass VARCHAR(255),
    -- Ignore list
    ignore_jids JSONB DEFAULT '[]',
    -- Fallback bot
    fallback_bot_id UUID REFERENCES ai_bot(id),
    -- Linked channels
    channel_ids JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- AI BOT SESSION: From Evolution API IntegrationSession
CREATE TABLE ai_bot_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES ai_bot(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversation(id),
    contact_jid VARCHAR(100),
    contact_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',  -- active, paused, closed
    await_user BOOLEAN DEFAULT false,
    context JSONB DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### ⚡ WORKFLOW AUTOMATION (Merged from n8n + Twenty CRM)

```sql
-- WORKFLOW: Merges n8n WorkflowEntity + Twenty Workflow
CREATE TABLE workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'automation',  -- automation, integration, ai_agent
    is_active BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    -- From n8n: visual workflow definition
    nodes JSONB DEFAULT '[]',
    connections JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    static_data JSONB,
    pin_data JSONB,
    -- From n8n: versioning
    version_id VARCHAR(36) NOT NULL,
    active_version_id VARCHAR(36),
    version_counter INT DEFAULT 1,
    -- From n8n: billing
    trigger_count INT DEFAULT 0,
    -- Organization
    folder_id UUID REFERENCES workflow_folder(id),
    tags JSONB DEFAULT '[]',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- WORKFLOW FOLDER: From n8n Folder
CREATE TABLE workflow_folder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES workflow_folder(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- WORKFLOW EXECUTION: Merges n8n ExecutionEntity + Twenty WorkflowRun
CREATE TABLE workflow_execution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow(id),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    mode VARCHAR(30) NOT NULL,  -- manual, trigger, webhook, retry, sub_workflow
    status VARCHAR(20) NOT NULL,  -- new, running, success, error, waiting, canceled
    -- From n8n
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    wait_till TIMESTAMP,
    retry_of UUID REFERENCES workflow_execution(id),
    retry_success_id UUID,
    -- Execution data
    input_data JSONB,
    output_data JSONB,
    error_data JSONB,
    data_storage VARCHAR(10) DEFAULT 'db',  -- db, fs, s3
    -- From n8n: annotation system
    annotation_rating VARCHAR(20),
    annotation_notes TEXT,
    -- Metadata
    triggered_by UUID REFERENCES "user"(id),
    execution_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- WORKFLOW CREDENTIAL: From n8n CredentialsEntity
CREATE TABLE workflow_credential (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(128) NOT NULL,
    data_encrypted TEXT NOT NULL,
    is_managed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- WORKFLOW WEBHOOK: From n8n WebhookEntity
CREATE TABLE workflow_webhook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    node VARCHAR(255) NOT NULL,
    webhook_id VARCHAR(36),
    path_length INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);
```

### 💰 ACCOUNTING & FINANCE (From ERPNext)

```sql
-- CHART OF ACCOUNTS: From ERPNext Account
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50),
    parent_account_id UUID REFERENCES account(id),
    root_type VARCHAR(20) NOT NULL,  -- Asset, Liability, Equity, Income, Expense
    account_type VARCHAR(50),  -- Bank, Cash, Receivable, Payable, Stock, Tax, etc.
    currency VARCHAR(10),
    is_group BOOLEAN DEFAULT false,
    is_frozen BOOLEAN DEFAULT false,
    balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- GENERAL LEDGER: From ERPNext GL Entry
CREATE TABLE gl_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    posting_date DATE NOT NULL,
    account_id UUID NOT NULL REFERENCES account(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    party_type VARCHAR(50),
    party_id UUID,
    voucher_type VARCHAR(50) NOT NULL,
    voucher_id UUID NOT NULL,
    cost_center_id UUID,
    project_id UUID REFERENCES project(id),
    remarks TEXT,
    is_cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- SALES INVOICE: From ERPNext
CREATE TABLE invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE,
    type VARCHAR(20) NOT NULL,  -- sales, purchase
    status VARCHAR(20) DEFAULT 'draft',  -- draft, submitted, paid, overdue, cancelled
    posting_date DATE NOT NULL,
    due_date DATE,
    -- Party
    party_type VARCHAR(20),  -- contact, company, supplier
    party_id UUID,
    -- Amounts
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_total DECIMAL(15, 2) DEFAULT 0,
    discount_total DECIMAL(15, 2) DEFAULT 0,
    grand_total DECIMAL(15, 2) DEFAULT 0,
    outstanding_amount DECIMAL(15, 2) DEFAULT 0,
    -- Payment
    payment_terms JSONB,
    -- Additional
    notes TEXT,
    terms TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    taxes JSONB DEFAULT '[]',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- PAYMENT: From ERPNext Payment Entry
CREATE TABLE payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    payment_number VARCHAR(50),
    type VARCHAR(20) NOT NULL,  -- receive, pay, internal_transfer
    mode VARCHAR(30),  -- cash, bank_transfer, card, check, online
    posting_date DATE NOT NULL,
    party_type VARCHAR(20),
    party_id UUID,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    bank_account_id UUID,
    reference_number VARCHAR(100),
    reference_date DATE,
    -- Allocation to invoices
    allocations JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 📦 INVENTORY & STOCK (From ERPNext)

```sql
-- ITEM: From ERPNext Item
CREATE TABLE item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_group VARCHAR(100),
    description TEXT,
    -- Type
    is_stock_item BOOLEAN DEFAULT true,
    is_fixed_asset BOOLEAN DEFAULT false,
    is_sales_item BOOLEAN DEFAULT true,
    is_purchase_item BOOLEAN DEFAULT true,
    -- Pricing
    standard_rate DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    -- Stock
    default_unit VARCHAR(20) DEFAULT 'Nos',
    min_order_qty DECIMAL(10, 2) DEFAULT 0,
    safety_stock DECIMAL(10, 2) DEFAULT 0,
    -- Dimensions
    weight DECIMAL(10, 3),
    weight_unit VARCHAR(10),
    -- Tracking
    has_serial_no BOOLEAN DEFAULT false,
    has_batch_no BOOLEAN DEFAULT false,
    -- Image
    image_url VARCHAR(500),
    -- Custom
    custom_fields JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- WAREHOUSE: From ERPNext Warehouse
CREATE TABLE warehouse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),  -- stores, manufacturing, transit
    parent_warehouse_id UUID REFERENCES warehouse(id),
    address JSONB,
    is_group BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- STOCK LEDGER: From ERPNext Stock Ledger Entry
CREATE TABLE stock_ledger_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES item(id),
    warehouse_id UUID NOT NULL REFERENCES warehouse(id),
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    qty_change DECIMAL(12, 3) NOT NULL,
    valuation_rate DECIMAL(15, 2),
    stock_value_change DECIMAL(15, 2),
    qty_after DECIMAL(12, 3),
    value_after DECIMAL(15, 2),
    voucher_type VARCHAR(50),
    voucher_id UUID,
    batch_no VARCHAR(100),
    serial_no TEXT,
    created_at TIMESTAMP DEFAULT now()
);
```

### 🏭 MANUFACTURING (From ERPNext)

```sql
-- BOM: From ERPNext Bill of Materials
CREATE TABLE bill_of_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES item(id),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    -- Costing
    operating_cost DECIMAL(15, 2) DEFAULT 0,
    raw_material_cost DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    -- Items and operations stored as JSONB for simplicity
    items JSONB NOT NULL DEFAULT '[]',
    operations JSONB DEFAULT '[]',
    scrap_items JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- WORK ORDER: From ERPNext
CREATE TABLE work_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES item(id),
    bom_id UUID NOT NULL REFERENCES bill_of_materials(id),
    quantity DECIMAL(10, 3) NOT NULL,
    produced_qty DECIMAL(10, 3) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',  -- draft, not_started, in_progress, completed, cancelled
    planned_start DATE,
    planned_end DATE,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    -- Source
    sales_order_id UUID,
    production_plan_id UUID,
    target_warehouse_id UUID REFERENCES warehouse(id),
    wip_warehouse_id UUID REFERENCES warehouse(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 📋 PROJECTS & TASKS (Merged from ERPNext + Twenty CRM)

```sql
-- PROJECT: From ERPNext Project + Twenty organization
CREATE TABLE project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open',  -- open, in_progress, completed, cancelled, on_hold
    type VARCHAR(50),
    -- From ERPNext
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    percent_complete DECIMAL(5, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    -- Links
    company_id UUID REFERENCES company(id),
    opportunity_id UUID REFERENCES opportunity(id),
    -- Team
    project_lead UUID REFERENCES "user"(id),
    members JSONB DEFAULT '[]',
    -- Unified
    priority VARCHAR(20),
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- TASK: Merges ERPNext Task + Twenty Task
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open',  -- open, in_progress, completed, cancelled
    priority VARCHAR(20),  -- urgent, high, medium, low
    -- From ERPNext
    project_id UUID REFERENCES project(id),
    parent_task_id UUID REFERENCES task(id),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP,
    expected_time DECIMAL(8, 2),  -- hours
    actual_time DECIMAL(8, 2),
    -- From Twenty CRM: task targets (link to any entity)
    target_type VARCHAR(30),  -- contact, company, opportunity
    target_id UUID,
    -- Assignment
    assigned_to UUID REFERENCES "user"(id),
    -- Unified
    position INT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

-- TIMESHEET: From ERPNext
CREATE TABLE timesheet_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    task_id UUID REFERENCES task(id),
    project_id UUID REFERENCES project(id),
    user_id UUID NOT NULL REFERENCES "user"(id),
    activity_type VARCHAR(100),
    from_time TIMESTAMP NOT NULL,
    to_time TIMESTAMP NOT NULL,
    hours DECIMAL(8, 2) NOT NULL,
    billing_hours DECIMAL(8, 2),
    billing_rate DECIMAL(10, 2),
    billing_amount DECIMAL(12, 2),
    description TEXT,
    is_billable BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- CALENDAR EVENT: From Twenty CRM
CREATE TABLE calendar_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    is_cancelled BOOLEAN DEFAULT false,
    -- External sync
    external_event_id VARCHAR(255),
    channel_id UUID REFERENCES messaging_channel(id),
    -- Recurrence
    recurrence_rule VARCHAR(500),
    -- Attendees stored as JSONB
    attendees JSONB DEFAULT '[]',
    -- Links
    contact_id UUID REFERENCES contact(id),
    company_id UUID REFERENCES company(id),
    opportunity_id UUID REFERENCES opportunity(id),
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🎫 SUPPORT & TICKETS (ERPNext + Evolution API Chatwoot concepts)

```sql
-- TICKET: From ERPNext Issue + Chatwoot concepts from Evolution API
CREATE TABLE ticket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open',  -- open, replied, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium',
    type VARCHAR(50),
    -- From ERPNext SLA
    sla_id UUID,
    response_by TIMESTAMP,
    resolution_by TIMESTAMP,
    first_responded_at TIMESTAMP,
    resolved_at TIMESTAMP,
    -- Source (unified inbox concept)
    source VARCHAR(30),  -- email, whatsapp, web, phone
    conversation_id UUID REFERENCES conversation(id),
    -- Customer
    contact_id UUID REFERENCES contact(id),
    company_id UUID REFERENCES company(id),
    -- Assignment
    assigned_to UUID REFERENCES "user"(id),
    assigned_group VARCHAR(100),
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🏗️ ASSETS (From ERPNext)

```sql
-- ASSET: From ERPNext Asset
CREATE TABLE asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft',  -- draft, submitted, partially_depreciated, fully_depreciated, sold, scrapped
    -- Valuation
    gross_purchase_amount DECIMAL(15, 2),
    purchase_date DATE,
    available_for_use_date DATE,
    -- Depreciation
    depreciation_method VARCHAR(30),
    total_depreciation DECIMAL(15, 2) DEFAULT 0,
    value_after_depreciation DECIMAL(15, 2),
    useful_life_months INT,
    -- Location
    location VARCHAR(255),
    custodian UUID REFERENCES "user"(id),
    -- Purchase link
    purchase_invoice_id UUID,
    supplier_id UUID,
    -- Maintenance
    next_maintenance_date DATE,
    maintenance_status VARCHAR(30),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🏪 BUYING & PROCUREMENT (From ERPNext)

```sql
-- SUPPLIER: From ERPNext Supplier
CREATE TABLE supplier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    supplier_group VARCHAR(100),
    supplier_type VARCHAR(20),  -- Company, Individual
    tax_id VARCHAR(50),
    -- Contact info
    email VARCHAR(254),
    phone VARCHAR(50),
    website VARCHAR(500),
    address JSONB,
    -- Banking
    bank_details JSONB,
    -- Terms
    default_currency VARCHAR(10),
    payment_terms JSONB,
    -- Scorecard (from ERPNext Supplier Scorecard)
    score DECIMAL(5, 2),
    standing VARCHAR(20),
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- PURCHASE ORDER: From ERPNext
CREATE TABLE purchase_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    po_number VARCHAR(50),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    status VARCHAR(20) DEFAULT 'draft',
    order_date DATE,
    expected_delivery_date DATE,
    currency VARCHAR(10) DEFAULT 'USD',
    total_amount DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    grand_total DECIMAL(15, 2) DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]',
    terms TEXT,
    created_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🌐 EVENT STREAMING & WEBHOOKS (From Evolution API)

```sql
-- WEBHOOK: Unified from Evolution API + n8n + Twenty
CREATE TABLE webhook_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    headers JSONB DEFAULT '{}',
    events JSONB NOT NULL,  -- list of event types to subscribe to
    is_active BOOLEAN DEFAULT true,
    secret VARCHAR(255),
    -- From Evolution API
    send_base64 BOOLEAN DEFAULT false,
    per_event BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- EVENT STREAM: From Evolution API (RabbitMQ, Kafka, SQS, etc.)
CREATE TABLE event_stream_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,  -- rabbitmq, kafka, sqs, nats, websocket, pusher
    is_active BOOLEAN DEFAULT false,
    events JSONB NOT NULL,
    -- Connection config (varies by type)
    connection_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### 🧩 METADATA & CUSTOM OBJECTS (Merged from Twenty + ERPNext Doctype system)

```sql
-- OBJECT METADATA: Defines custom objects (from Twenty + ERPNext Doctype)
CREATE TABLE object_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    label_plural VARCHAR(255),
    description TEXT,
    icon VARCHAR(50),
    -- From Twenty
    is_custom BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    is_remote BOOLEAN DEFAULT false,
    -- From ERPNext Doctype
    is_submittable BOOLEAN DEFAULT false,
    is_tree BOOLEAN DEFAULT false,
    -- Table Name
    db_table_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (workspace_id, name)
);

-- FIELD METADATA: Defines custom fields (from Twenty + ERPNext Custom Field)
CREATE TABLE field_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id UUID NOT NULL REFERENCES object_metadata(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(30) NOT NULL,  -- text, number, date, select, link, relation, json, boolean, currency, email, phone, url, rating
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    is_nullable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_custom BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    default_value TEXT,
    options JSONB,  -- for select fields, relation configs, etc.
    position INT DEFAULT 0,
    db_column_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- VIEW DEFINITION: From Twenty View entity
CREATE TABLE view_definition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    object_id UUID NOT NULL REFERENCES object_metadata(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'table',  -- table, kanban, list, calendar, board
    is_compact BOOLEAN DEFAULT false,
    -- Filter, sort, group config
    filters JSONB DEFAULT '[]',
    sorts JSONB DEFAULT '[]',
    group_by JSONB,
    -- Visible fields
    fields JSONB DEFAULT '[]',
    -- Owner
    user_id UUID REFERENCES "user"(id),
    is_shared BOOLEAN DEFAULT false,
    position INT,
    icon VARCHAR(50),
    kanban_field_id UUID,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

---

### 📍 GPS & FLEET MANAGEMENT (From Traccar)

```sql
-- TRACKING DEVICE: From Traccar tc_devices
CREATE TABLE tracking_device (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unique_id VARCHAR(128) UNIQUE NOT NULL,  -- IMEI or device identifier
    last_update TIMESTAMP,
    last_position_id UUID,
    group_id UUID REFERENCES tracking_group(id),
    phone VARCHAR(50),
    model VARCHAR(128),
    contact_info VARCHAR(512),
    category VARCHAR(50),  -- car, truck, bus, motorcycle, boat, person, etc.
    is_disabled BOOLEAN DEFAULT false,
    -- From Traccar: accumulators
    total_distance DOUBLE PRECISION DEFAULT 0,
    total_hours BIGINT DEFAULT 0,
    -- Extended
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);
CREATE INDEX idx_tracking_device_workspace ON tracking_device(workspace_id);
CREATE INDEX idx_tracking_device_unique ON tracking_device(unique_id);

-- GPS POSITION: From Traccar tc_positions (high-volume table)
CREATE TABLE gps_position (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES tracking_device(id) ON DELETE CASCADE,
    protocol VARCHAR(128),
    server_time TIMESTAMP DEFAULT now(),
    device_time TIMESTAMP NOT NULL,
    fix_time TIMESTAMP NOT NULL,
    valid BOOLEAN NOT NULL,
    -- GPS coordinates
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude REAL DEFAULT 0,
    speed REAL DEFAULT 0,       -- knots
    course REAL DEFAULT 0,      -- degrees
    accuracy DOUBLE PRECISION DEFAULT 0,
    -- From Traccar
    address VARCHAR(512),       -- reverse geocoded address
    network JSONB,              -- cell tower / WiFi data
    attributes JSONB DEFAULT '{}'  -- fuel, battery, io, sensors, etc.
);
CREATE INDEX idx_gps_position_device_time ON gps_position(device_id, device_time);
CREATE INDEX idx_gps_position_server_time ON gps_position(server_time);

-- GEOFENCE: From Traccar tc_geofences
CREATE TABLE geofence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area TEXT NOT NULL,          -- WKT geometry or GeoJSON (polygon/circle)
    calendar_id UUID,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- TRACKING EVENT: From Traccar tc_events
CREATE TABLE tracking_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(128) NOT NULL,  -- alarm, motion, overspeed, geofence, fuel, ignition, maintenance, driver, behavior
    server_time TIMESTAMP DEFAULT now(),
    device_id UUID REFERENCES tracking_device(id) ON DELETE CASCADE,
    position_id UUID REFERENCES gps_position(id),
    geofence_id UUID REFERENCES geofence(id),
    maintenance_id UUID,
    attributes JSONB DEFAULT '{}'
);
CREATE INDEX idx_tracking_event_device ON tracking_event(device_id, server_time);

-- TRACKING DRIVER: From Traccar tc_drivers
CREATE TABLE tracking_driver (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unique_id VARCHAR(128) UNIQUE NOT NULL,  -- iButton / RFID identifier
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- TRACKING GROUP: From Traccar tc_groups (hierarchical)
CREATE TABLE tracking_group (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_group_id UUID REFERENCES tracking_group(id),
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- DEVICE MAINTENANCE: From Traccar tc_maintenances
CREATE TABLE device_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(128) NOT NULL,  -- totalDistance, totalHours, date
    start_value DOUBLE PRECISION DEFAULT 0,
    period DOUBLE PRECISION DEFAULT 0,  -- repeat interval
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- DELIVERY ORDER: From Traccar tc_orders
CREATE TABLE delivery_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    description TEXT,
    from_address VARCHAR(512),
    to_address VARCHAR(512),
    from_lat DOUBLE PRECISION,
    from_lon DOUBLE PRECISION,
    to_lat DOUBLE PRECISION,
    to_lon DOUBLE PRECISION,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now()
);

-- JUNCTION TABLES for GPS module
CREATE TABLE device_geofence (
    device_id UUID NOT NULL REFERENCES tracking_device(id) ON DELETE CASCADE,
    geofence_id UUID NOT NULL REFERENCES geofence(id) ON DELETE CASCADE,
    PRIMARY KEY (device_id, geofence_id)
);

CREATE TABLE device_driver (
    device_id UUID NOT NULL REFERENCES tracking_device(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES tracking_driver(id) ON DELETE CASCADE,
    PRIMARY KEY (device_id, driver_id)
);

CREATE TABLE user_device (
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES tracking_device(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, device_id)
);
```

---

## Relationship Diagram

```
                    ┌──────────────┐
                    │  Workspace   │
                    └──────┬───────┘
           ┌───────────────┼───────────────────┐
           ▼               ▼                   ▼
    ┌──────────┐    ┌──────────┐         ┌──────────┐
    │   User   │    │   Role   │         │ ApiKey   │
    └────┬─────┘    └──────────┘         └──────────┘
         │
    ┌────┴─────────────────────────────────────────┐
    ▼              ▼              ▼                ▼
┌────────┐   ┌──────────┐   ┌──────────┐    ┌──────────┐
│Contact │   │ Company  │   │  Lead    │    │ Supplier │
└───┬────┘   └────┬─────┘   └────┬─────┘   └──────────┘
    │             │              │
    └──────┬──────┘              │
           ▼                     ▼
    ┌──────────────┐     ┌──────────────┐
    │ Opportunity  │     │  Campaign    │
    └──────┬───────┘     └─────────────-┘
           │
    ┌──────┴───────┐
    ▼              ▼
┌────────┐   ┌──────────┐
│Invoice │   │ Project  │──▶ Task ──▶ Timesheet
└────┬───┘   └──────────┘
     ▼
┌────────┐
│Payment │
└────────┘

         ┌──────────────────┐
         │ MessagingChannel │
         └────────┬─────────┘
                  ▼
         ┌───────────────┐
         │ Conversation  │──▶ Message ──▶ Attachment
         └───────┬───────┘
                 │
         ┌───────┴──────┐
         ▼              ▼
    ┌─────────┐   ┌──────────┐
    │ AiBot   │   │  Ticket  │
    └────┬────┘   └──────────┘
         ▼
    ┌──────────┐
    │BotSession│
    └──────────┘

    ┌──────────┐
    │ Workflow │──▶ Execution ──▶ ExecutionData
    └────┬─────┘
         ▼
    ┌──────────┐
    │Credential│
    └──────────┘

    ┌──────────┐
    │   Item   │──▶ StockLedger ──▶ Warehouse
    └────┬─────┘
         ▼
    ┌──────────┐
    │   BOM    │──▶ WorkOrder ──▶ JobCard
    └──────────┘
```

---

## Total Table Count: ~120 Core Tables

| Category | Tables | Source |
|----------|--------|--------|
| Core Tenant | 7 | Twenty + n8n |
| Billing | 5 | Twenty + ERPNext |
| CRM & Contacts | 6 | ERPNext + Twenty + Evolution |
| Messaging | 5 | Evolution API + Twenty |
| AI & Bots | 3 | Evolution API |
| Workflows | 5 | n8n + Twenty |
| Finance | 4 | ERPNext |
| Inventory | 3 | ERPNext |
| Manufacturing | 2 | ERPNext |
| Projects & Tasks | 4 | ERPNext + Twenty |
| Support | 1 | ERPNext + Evolution |
| Assets | 1 | ERPNext |
| Procurement | 2 | ERPNext |
| Webhooks/Events | 2 | Evolution API + n8n |
| Metadata/Custom | 3 | Twenty + ERPNext |
| **GPS & Fleet** | **8** | **Traccar** |
| **Junction Tables** | **3** | **Traccar** |
| **Customer Support** | **10** | **Chatwoot** |
| **SMS Gateway** | **4** | **Jasmin** |
| **Email & Groupware**| **~40**| **Mailcow** |
| **HR & Payroll** | **32** | **HRMS** |
| **TOTAL** | **~152** | **All 10 projects merged** |

---

## 📞 CUSTOMER SUPPORT & HELPDESK (from Chatwoot)

> These tables power the omnichannel customer support system with 12 messaging channels, AI agent, help center, SLA, and CSAT.

### `conversation` — Support Conversations

```sql
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    inbox_id UUID NOT NULL REFERENCES support_inbox(id),
    contact_id UUID REFERENCES contact(id),
    assignee_id UUID REFERENCES "user"(id),
    team_id UUID REFERENCES team(id),
    campaign_id UUID,
    display_id INTEGER NOT NULL,
    status INTEGER DEFAULT 0 NOT NULL,        -- 0=open, 1=resolved, 2=pending, 3=snoozed
    priority INTEGER,                          -- 0=none, 1=low, 2=medium, 3=high, 4=urgent
    sla_policy_id UUID,
    waiting_since TIMESTAMPTZ,
    first_reply_created_at TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,
    additional_attributes JSONB DEFAULT '{}',
    custom_attributes JSONB DEFAULT '{}',
    cached_label_list TEXT,
    uuid UUID UNIQUE DEFAULT gen_random_uuid(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### `support_message` — Conversation Messages

```sql
CREATE TABLE support_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    conversation_id UUID NOT NULL REFERENCES conversation(id),
    sender_id UUID,
    sender_type VARCHAR(50),                   -- 'User', 'Contact', 'AgentBot'
    content TEXT,
    content_type INTEGER DEFAULT 0,            -- 0=text, 1=input_text, 2=input_textarea, 3=input_email, etc.
    message_type INTEGER DEFAULT 0,            -- 0=incoming, 1=outgoing, 2=activity, 3=template
    status INTEGER DEFAULT 0,                  -- 0=sent, 1=delivered, 2=read, 3=failed
    private BOOLEAN DEFAULT FALSE,             -- true = internal note
    source_id VARCHAR(255),                    -- external message ID
    content_attributes JSONB DEFAULT '{}',
    external_source_ids JSONB DEFAULT '{}',
    additional_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `support_inbox` — Channel Inboxes

```sql
CREATE TABLE support_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(100) NOT NULL,        -- 'Channel::WebWidget', 'Channel::Email', 'Channel::Whatsapp', etc.
    channel_id UUID NOT NULL,
    greeting_enabled BOOLEAN DEFAULT FALSE,
    greeting_message TEXT,
    enable_auto_assignment BOOLEAN DEFAULT TRUE,
    enable_email_collect BOOLEAN DEFAULT TRUE,
    business_name VARCHAR(255),
    out_of_office_message TEXT,
    working_hours_enabled BOOLEAN DEFAULT FALSE,
    csat_survey_enabled BOOLEAN DEFAULT FALSE,
    allow_messages_after_resolved BOOLEAN DEFAULT TRUE,
    lock_to_single_conversation BOOLEAN DEFAULT FALSE,
    sender_name_type INTEGER DEFAULT 0,        -- 0=friendly, 1=professional
    auto_assignment_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `channel_config` — Channel Provider Configurations

```sql
CREATE TABLE channel_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    channel_type VARCHAR(100) NOT NULL,        -- 'web_widget', 'email', 'whatsapp', 'facebook', 'instagram', 'twitter', 'telegram', 'line', 'sms', 'twilio_sms', 'tiktok', 'voice', 'api'
    provider VARCHAR(100),
    provider_config JSONB DEFAULT '{}',        -- provider-specific settings (tokens, keys, etc.)
    phone_number VARCHAR(50),
    email VARCHAR(255),
    website_url VARCHAR(500),
    webhook_url VARCHAR(500),
    widget_color VARCHAR(10) DEFAULT '#1f93ff',
    welcome_title VARCHAR(255),
    welcome_tagline VARCHAR(255),
    hmac_token VARCHAR(255),
    hmac_mandatory BOOLEAN DEFAULT FALSE,
    pre_chat_form_enabled BOOLEAN DEFAULT FALSE,
    pre_chat_form_options JSONB DEFAULT '{}',
    feature_flags INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `help_article` — Knowledge Base Articles

```sql
CREATE TABLE help_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    portal_id UUID NOT NULL,
    category_id UUID,
    folder_id UUID,
    author_id UUID REFERENCES "user"(id),
    title VARCHAR(500),
    description TEXT,
    content TEXT,
    slug VARCHAR(500) NOT NULL UNIQUE,
    locale VARCHAR(10) DEFAULT 'en',
    status INTEGER,                            -- 0=draft, 1=published, 2=archived
    views INTEGER DEFAULT 0,
    position INTEGER,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `sla_policy` — SLA Policies

```sql
CREATE TABLE sla_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    first_response_time_threshold REAL,        -- seconds
    next_response_time_threshold REAL,
    resolution_time_threshold REAL,
    only_during_business_hours BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `csat_response` — Customer Satisfaction Surveys

```sql
CREATE TABLE csat_response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    conversation_id UUID NOT NULL REFERENCES conversation(id),
    message_id UUID NOT NULL,
    contact_id UUID NOT NULL REFERENCES contact(id),
    assigned_agent_id UUID REFERENCES "user"(id),
    rating INTEGER NOT NULL,                   -- 1-5 rating scale
    feedback_message TEXT,
    csat_review_notes TEXT,
    review_notes_updated_at TIMESTAMPTZ,
    review_notes_updated_by_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `automation_rule` — Automation Rules

```sql
CREATE TABLE automation_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_name VARCHAR(255) NOT NULL,          -- 'conversation_created', 'message_created', etc.
    conditions JSONB NOT NULL DEFAULT '{}',    -- rule conditions
    actions JSONB NOT NULL DEFAULT '{}',       -- actions to execute
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `agent_bot` — Chatbot Agents

```sql
CREATE TABLE agent_bot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID,
    name VARCHAR(255),
    description TEXT,
    outgoing_url VARCHAR(500),                 -- webhook URL for bot
    bot_type INTEGER DEFAULT 0,                -- 0=outgoing_webhook, 1=captain
    bot_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `canned_response` — Quick Reply Templates

```sql
CREATE TABLE canned_response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    short_code VARCHAR(100),
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📱 SMS GATEWAY (from Jasmin)

> These tables support the enterprise SMS gateway with SMPP protocol, advanced routing, billing, and delivery tracking.

### `sms_route` — SMS Routing Rules

```sql
CREATE TABLE sms_route (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    name VARCHAR(255) NOT NULL,
    route_type VARCHAR(50) NOT NULL,           -- 'static', 'roundrobin', 'failover', 'leastcost', 'hlr'
    connector_id UUID NOT NULL REFERENCES smpp_connector(id),
    filters JSONB DEFAULT '{}',                -- source/dest regex, date/time filters
    rate DECIMAL(10,4) DEFAULT 0,              -- per-message rate for billing
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `sms_message_log` — SMS Message History

```sql
CREATE TABLE sms_message_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    route_id UUID REFERENCES sms_route(id),
    connector_id UUID REFERENCES smpp_connector(id),
    direction VARCHAR(10) NOT NULL,            -- 'MT' (mobile-terminated) or 'MO' (mobile-originated)
    source_addr VARCHAR(50),
    destination_addr VARCHAR(50) NOT NULL,
    content TEXT,
    encoding VARCHAR(20) DEFAULT 'GSM',        -- 'GSM', 'UCS2' (unicode), 'binary'
    priority INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'queued',       -- 'queued', 'sent', 'delivered', 'failed', 'expired', 'rejected'
    dlr_status VARCHAR(30),                    -- delivery receipt status
    dlr_received_at TIMESTAMPTZ,
    message_id VARCHAR(255),                   -- SMPP message ID
    submit_sm_resp_status INTEGER,             -- SMPP response status code
    parts_count INTEGER DEFAULT 1,             -- concatenated SMS parts
    rate DECIMAL(10,4),
    billed_amount DECIMAL(10,4),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `sms_billing_record` — SMS Billing Records

```sql
CREATE TABLE sms_billing_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    route_id UUID REFERENCES sms_route(id),
    message_log_id UUID REFERENCES sms_message_log(id),
    amount DECIMAL(10,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_type VARCHAR(20) DEFAULT 'per_msg', -- 'per_msg', 'per_part', 'flat'
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `smpp_connector` — SMPP Provider Connections

```sql
CREATE TABLE smpp_connector (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 2775,
    system_id VARCHAR(100) NOT NULL,           -- SMPP username
    password VARCHAR(255) NOT NULL,            -- SMPP password (encrypted)
    system_type VARCHAR(50),
    bind_type VARCHAR(20) DEFAULT 'transceiver', -- 'transmitter', 'receiver', 'transceiver'
    source_addr VARCHAR(50),
    source_addr_ton INTEGER DEFAULT 1,
    source_addr_npi INTEGER DEFAULT 1,
    dest_addr_ton INTEGER DEFAULT 1,
    dest_addr_npi INTEGER DEFAULT 1,
    max_connections INTEGER DEFAULT 1,
    throughput INTEGER DEFAULT 100,            -- messages per second
    use_tls BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    health_status VARCHAR(20) DEFAULT 'unknown', -- 'connected', 'disconnected', 'error'
    last_connected_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📧 EMAIL & GROUPWARE (from Mailcow)

> These tables power the self-hosted email backend (Postfix/Dovecot), Webmail/ActiveSync (SOGo), and anti-spam (Rspamd) configuration.

### `mail_domain` — Email Domains

```sql
CREATE TABLE mail_domain (
    domain VARCHAR(255) PRIMARY KEY,
    workspace_id UUID REFERENCES workspace(id),
    description VARCHAR(255),
    aliases INTEGER NOT NULL DEFAULT 0,
    mailboxes INTEGER NOT NULL DEFAULT 0,
    defquota BIGINT NOT NULL DEFAULT 3072,
    maxquota BIGINT NOT NULL DEFAULT 102400,
    quota BIGINT NOT NULL DEFAULT 102400,
    relayhost VARCHAR(255) NOT NULL DEFAULT '0',
    backupmx BOOLEAN NOT NULL DEFAULT FALSE,
    gal BOOLEAN NOT NULL DEFAULT TRUE,         -- Global Address List
    relay_all_recipients BOOLEAN NOT NULL DEFAULT FALSE,
    relay_unknown_only BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `mailbox` — Email Accounts

```sql
CREATE TABLE mailbox (
    username VARCHAR(255) PRIMARY KEY,         -- full email address
    workspace_id UUID REFERENCES workspace(id),
    domain VARCHAR(255) NOT NULL REFERENCES mail_domain(domain),
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description VARCHAR(255),
    mailbox_path_prefix VARCHAR(150) DEFAULT '/var/vmail/',
    quota BIGINT NOT NULL DEFAULT 102400,      -- MB storage limit
    local_part VARCHAR(255) NOT NULL,
    attributes JSONB,
    custom_attributes JSONB DEFAULT '{}',
    kind VARCHAR(100) DEFAULT '',              -- e.g., 'shared', 'resource'
    multiple_bookings INTEGER DEFAULT -1,
    authsource VARCHAR(50) DEFAULT 'mailcow',  -- 'mailcow', 'keycloak', 'ldap'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `mail_alias` — Email Forwarding / Distribution Lists

```sql
CREATE TABLE mail_alias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(255) NOT NULL UNIQUE,      -- incoming alias address
    goto TEXT NOT NULL,                        -- comma-separated destinations
    domain VARCHAR(255) NOT NULL REFERENCES mail_domain(domain),
    private_comment TEXT,
    public_comment TEXT,
    sogo_visible BOOLEAN NOT NULL DEFAULT TRUE,
    internal BOOLEAN NOT NULL DEFAULT FALSE,
    sender_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `mail_user_acl` — Feature Toggles per Mailbox

```sql
CREATE TABLE mail_user_acl (
    username VARCHAR(255) PRIMARY KEY REFERENCES mailbox(username) ON DELETE CASCADE,
    spam_alias BOOLEAN NOT NULL DEFAULT TRUE,
    tls_policy BOOLEAN NOT NULL DEFAULT TRUE,
    spam_score BOOLEAN NOT NULL DEFAULT TRUE,
    spam_policy BOOLEAN NOT NULL DEFAULT TRUE,
    delimiter_action BOOLEAN NOT NULL DEFAULT TRUE,
    syncjobs BOOLEAN NOT NULL DEFAULT FALSE,
    eas_reset BOOLEAN NOT NULL DEFAULT TRUE,
    sogo_profile_reset BOOLEAN NOT NULL DEFAULT FALSE,
    pushover BOOLEAN NOT NULL DEFAULT TRUE,
    quarantine BOOLEAN NOT NULL DEFAULT TRUE,
    quarantine_attachments BOOLEAN NOT NULL DEFAULT TRUE,
    quarantine_notification BOOLEAN NOT NULL DEFAULT TRUE,
    quarantine_category BOOLEAN NOT NULL DEFAULT TRUE,
    app_passwds BOOLEAN NOT NULL DEFAULT TRUE,
    pw_reset BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `sieve_filters` — Server-side Mail Rules

```sql
CREATE TABLE sieve_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL REFERENCES mailbox(username) ON DELETE CASCADE,
    script_desc VARCHAR(255) NOT NULL,
    script_name VARCHAR(50),                   -- 'active' or 'inactive'
    script_data TEXT NOT NULL,                 -- Sieve script content
    filter_type VARCHAR(20),                   -- 'postfilter', 'prefilter'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🧑‍💼 HUMAN RESOURCES & PAYROLL (from HRMS)

### 👥 HR Core & Lifecycle

```sql
-- Employee Master (Extended from ERPNext)
CREATE TABLE hrms_employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(20),
    date_of_birth DATE,
    date_of_joining DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Left', 'Suspended'
    department_id UUID,
    designation_id UUID,
    grade_id UUID,
    branch_id UUID,
    reports_to UUID REFERENCES hrms_employee(id),
    employment_type VARCHAR(50), -- 'Full-time', 'Part-time', 'Contract', 'Intern'
    personal_email VARCHAR(255),
    company_email VARCHAR(255),
    phone_number VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    current_address TEXT,
    permanent_address TEXT,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Leave Management
CREATE TABLE hrms_leave_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_lwp BOOLEAN DEFAULT FALSE,
    is_carry_forward BOOLEAN DEFAULT FALSE,
    max_continuous_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_leave_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    leave_type_id UUID NOT NULL REFERENCES hrms_leave_type(id),
    total_leaves DECIMAL(5,2) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_leave_application (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    leave_type_id UUID NOT NULL REFERENCES hrms_leave_type(id),
    from_date DATE NOT NULL,
    half_day BOOLEAN DEFAULT FALSE,
    to_date DATE NOT NULL,
    total_leave_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'Approved', 'Rejected', 'Cancelled'
    approved_by UUID REFERENCES hrms_employee(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance & Shifts
CREATE TABLE hrms_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'Present', 'Absent', 'Half Day', 'On Leave'
    shift_id UUID,
    late_entry BOOLEAN DEFAULT FALSE,
    early_exit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_shift_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    holiday_list_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance & Appraisals
CREATE TABLE hrms_appraisal_cycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_appraisal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    appraisal_cycle_id UUID NOT NULL REFERENCES hrms_appraisal_cycle(id),
    status VARCHAR(20) DEFAULT 'Draft',
    total_score DECIMAL(5,2),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recruitment
CREATE TABLE hrms_job_opening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    designation_id UUID,
    department_id UUID,
    status VARCHAR(20) DEFAULT 'Open',
    posted_on DATE NOT NULL,
    closed_on DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_job_applicant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    job_opening_id UUID NOT NULL REFERENCES hrms_job_opening(id),
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Applied', -- 'Applied', 'Shortlisted', 'Interview', 'Rejected', 'Accepted'
    resume_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Salary Components and Structures
CREATE TABLE hrms_salary_component (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'Earning', 'Deduction'
    is_tax_applicable BOOLEAN DEFAULT FALSE,
    is_flexible_benefit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_salary_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    currency VARCHAR(10) DEFAULT 'USD',
    payroll_frequency VARCHAR(20), -- 'Monthly', 'Fortnightly', 'Weekly'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_salary_structure_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    salary_structure_id UUID NOT NULL REFERENCES hrms_salary_structure(id),
    from_date DATE NOT NULL,
    base_amount DECIMAL(15,2) NOT NULL,
    variable_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payroll Processing
CREATE TABLE hrms_salary_slip (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES hrms_employee(id),
    payroll_entry_id UUID,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    gross_pay DECIMAL(15,2) NOT NULL,
    total_deductions DECIMAL(15,2) NOT NULL,
    net_pay DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Paid', 'Cancelled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hrms_payroll_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    posting_date DATE NOT NULL,
    payroll_frequency VARCHAR(20),
    company VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Taxation
CREATE TABLE hrms_income_tax_slab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    effective_from DATE NOT NULL,
    allow_tax_exemption BOOLEAN DEFAULT TRUE,
    standard_deduction DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

