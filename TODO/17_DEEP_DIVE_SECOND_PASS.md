# 🔬 Deep Dive Second Pass — New Findings from All 13 Repos

> **Purpose**: Additional patterns, models, services, and architectural insights discovered in the second deep pass that were not captured in documents 12-16.

---

## 1. OMniLeads — Complete Model Map (160KB, 4071 lines, ~45+ models)

### Models Discovered in Second Pass

| Model | Lines | Purpose | Karan SaaS Equivalent |
|-------|-------|---------|----------------------|
| `User` (AbstractUser) | 89-265 | 6 roles: Administrador, Gerente, Supervisor, Referente, Agente, Cliente Webphone + LDAP auth | ✅ Already have User model |
| `Grupo` | 280-343 | Agent group with 25+ behavioral flags (auto_attend, WhatsApp, call restrictions, timers) | ❌ **NEED**: AgentGroup model with detailed permissions |
| `AgenteProfile` | 403-536 | Agent profile: SIP extension, grupo, estado (OFFLINE/ONLINE/PAUSA), soft delete | 🔧 Partial: Need SIP extension |
| `SupervisorProfile` | 538-606 | Supervisor profile: is_admin, is_customer, campaign assignments | ❌ **NEED**: Supervisor role model |
| `ClienteWebPhoneProfile` | 613-638 | WebPhone client profile with SIP extension | ❌ **NEED**: WebPhone client model |
| `ConjuntoDePausa` | 267-277 | Pause set grouping | ❌ **NEED**: PauseSet model |
| `Pausa` | 1989-2014 | Pause types: Productive vs Recreational with time limits | ❌ **NEED**: PauseType model |
| `ConfiguracionDePausa` | 2017-2028 | Pause configuration with max time (0-28800 sec) | ❌ **NEED**: PauseConfig |
| `Campana` (Campaign) | 1193-1669 | **The core**: 4 types (Manual/Dialer/Entrante/Preview), 7 states, templates, duplication, WhatsApp, videocall | ❌ **NEED**: Full Campaign model |
| `OpcionCalificacion` | 1671-1727 | Call qualification options per campaign (Gestion/No-Action/Agenda) with sub-qualifications | ❌ **NEED**: QualificationOption |
| `Queue` | 1729-1888 | Asterisk queue: 6 strategies, predictive model, AI transcription %, summarize % | ❌ **NEED**: Queue model |
| `QueueMember` | 1919-1975 | Agent-to-Queue membership with penalty and interface | ❌ **NEED**: QueueMember |
| `Formulario` | 661-678 | Dynamic form builder with 6 field types | 🔧 Partial: CustomForm |
| `FieldFormulario` | 692-768 | Form fields: Text/Date/List/TextArea/Number/DynamicList | ❌ **NEED**: FormField |
| `BaseDatosContacto` | 2035-2094 | Contact database management with import/metadata | ❌ **NEED**: ContactDatabase |
| `Contacto` | ~2400-2826 | Contact with dynamic data (JSON), multiple phones, external ID | ✅ Have Contact model |
| `ListasRapidas` | 2832-2859 | Quick contact lists with import | ❌ **NEED**: QuickList |
| `ContactoListaRapida` | 2862-2868 | Quick list contacts | ❌ **NEED**: QuickListContact |
| `CalificacionCliente` | 2966-3087 | Client qualification with history tracking + WhatsApp channel support | ❌ **NEED**: ContactQualification |
| `CalificacionTelefono` | 3089-3106 | Phone-specific qualification | ❌ **NEED**: PhoneQualification |
| `RespuestaFormularioGestion` | 3109-3128 | Form response with history tracking | ❌ **NEED**: FormResponse |
| `AuditoriaCalificacion` | 3130-3175 | QA audit: Approved/Rejected/Observed | ❌ **NEED**: QualificationAudit |
| `GrabacionMarca` | 2871-2883 | Recording bookmarks with description | ❌ **NEED**: RecordingBookmark |
| `AgendaContacto` | 3196+ | Contact scheduling (Personal/Global) | ❌ **NEED**: ContactSchedule |
| `AgenteEnContacto` | 3713-3895 | Preview campaign: agent-contact assignment with states (Initial/Delivered/Assigned/Finalized) | ❌ **NEED**: AgentContactAssignment |
| `ActuacionVigente` | ~3500-3570 | Dialer schedule: day-of-week + hour range | ❌ **NEED**: CampaignSchedule |
| `ReglasIncidencia` | ~3570-3637 | Retry rules: by status (BUSY/NOANSWER/REJECTED/TIMEOUT) with max attempts | ❌ **NEED**: RetryRule |
| `ReglaIncidenciaPorCalificacion` | 3639-3681 | Retry rules by qualification | ❌ **NEED**: QualificationRetryRule |
| `ParametrosCrm` | 3898-4013 | CRM URL parameters: Campaign/Contact/Call/Custom/Dialplan data | ❌ **NEED**: CrmParameter |
| `ConfiguracionDeAgentesDeCampana` | 4016-4034 | Per-campaign agent config overrides | ❌ **NEED**: CampaignAgentConfig |
| `AutenticacionExternaDeUsuario` | 4037-4071 | External auth (LDAP) per-user config | ❌ **NEED**: ExternalAuth |
| `Chat` | 3178-3185 | Internal agent-user chat | ✅ Have messaging |
| `MensajeChat` | 3188-3193 | Chat messages | ✅ Have messaging |

### Key OMniLeads Patterns for Karan SaaS

1. **Preview Campaign Contact Delivery** (lines 3764-3827): Uses `select_for_update(skip_locked=True)` for concurrent contact assignment — PostgreSQL row-level locking pattern. **Must adopt this**.

2. **AI Integration Fields on Queue** (lines 1798-1805):
   - `summarize_percentage` (0-100%): Controls what % of calls get AI summarization
   - `transcription_percentage` (0-100%): Controls what % of calls get transcribed
   - **Brilliant pattern**: Per-campaign AI cost control

3. **Predictive Dialer Model** (lines 1829-1831):
   - `initial_predictive_model`: Boolean (ADAPTIVE vs OFF)
   - `initial_boost_factor`: Decimal (1.0-9.9) — call overshoot multiplier

4. **Agent Group Behavioral Flags** — 25+ granular permissions:
   - `whatsapp_habilitado`: WhatsApp per-group toggle
   - `restringir_tipo_llamadas_manuales`: Restrict manual call types
   - `acceso_grabaciones_agente`: Agent recording access
   - `acceso_dashboard_agente`: Agent dashboard access
   - `show_console_timers`: Show/hide timers
   - `limitar_agendas_personales`: Limit personal schedules

---

## 2. Rocket.Chat — Enterprise & VoIP Architecture

### Enterprise Modules (ee/app/)
| Module | Purpose | Karan SaaS Relevance |
|--------|---------|---------------------|
| `api-enterprise` | Extended API endpoints | Enterprise API tier |
| `authorization` | Advanced RBAC | ✅ Already have RBAC |
| `canned-responses` | Pre-built message templates | ❌ **NEED**: Response Templates |
| `license` | License management system | Future: SaaS licensing |
| `livechat-enterprise` | Advanced livechat | Omnichannel enhancement |
| `message-read-receipt` | Read receipts | ❌ **NEED**: Message receipts |
| `settings` | Enterprise-specific configs | Settings framework |

### RC Package Architecture (55 packages!)
Key packages for Karan SaaS:

| Package | Purpose | Why Important |
|---------|---------|--------------|
| `ui-voip` | VoIP UI components (Widget, Keypad, DevicePicker, PeerInfo, Timer) | **Blueprint for WebRTC softphone UI** |
| `omni-core` | Omnichannel core logic (isDepartmentCreationAvailable) | Core omnichannel patterns |
| `core-services` | 41 service type definitions | **Service architecture blueprint** |
| `livechat` | Livechat widget | Customer-facing chat widget |
| `media-signaling` | WebRTC signaling | VoIP/video call signaling |
| `ui-video-conf` | Video conference UI | Video calling components |
| `apps-engine` | Plugin/apps framework | Module extension system |
| `model-typings` | MongoDB model types | Data model patterns |
| `rest-typings` | REST API type definitions | API contract patterns |

### RC Core Services (41 service interfaces)
Critical services for reference:

| Service | Methods | Karan SaaS Use |
|---------|---------|----------------|
| `IOmnichannelAnalyticsService` | getAgentOverviewData, getAnalyticsChartData, getAnalyticsOverviewData | Dashboard analytics |
| `IVideoConfService` | create, start, join, cancel, createVoIP (17 methods!) | Video/VoIP calling |
| `IOmnichannelService` | Core omnichannel | Unified inbox |
| `IRoomService` | Room CRUD (3.3KB) | Conversation rooms |
| `ITeamService` | Team management (5.7KB) | Team features |
| `IPresence` | Online/offline tracking | Agent presence |
| `IMediaCallService` | Media call handling | Call management |
| `IFederationService` | Cross-server federation | Multi-tenant comm |
| `IQueueWorkerService` | Background job processing | BullMQ equivalent |
| `IPushService` | Push notifications | Mobile push |

### RC VoIP Widget Components
```
Widget/
├── Widget.tsx (1.8KB) — Main softphone widget container
├── WidgetContent.tsx — Call content area
├── WidgetDraggableContext.ts — Draggable positioning
├── WidgetFooter.tsx — Action buttons (mute, hold, etc.)
├── WidgetHandle.tsx — Drag handle
├── WidgetHeader.tsx — Call info header
├── WidgetInfo.tsx — Caller info display
├── Actions/ — Call action buttons
├── Cards/ — Call state cards (ringing, connected, etc.)
├── Keypad/ — DTMF keypad component
└── PeerInfo/ — Remote peer information
```

---

## 3. GOautodial v4 — CRM Integration Layer

### Complete CRM Module (169 PHP files!)

**Key Discoveries**:

1. **Tables Map** (from CRMDefaults.php):
   - `vicidial_list` → Contacts table (shared with VICIdial)
   - `customer_types` → Customer type definitions
   - `messages_inbox/outbox/junk` → Internal messaging
   - `notifications` → Notification system
   - `tasks` → Task management
   - `events` → Calendar events
   - `attachments` → File attachments
   - `settings` → Key-value settings
   - `statistics` → Customer statistics tracking
   - `recording_log` + `call_log` → Call logging
   - `vicidial_call_log` → Outbound call CDR
   - `vicidial_closer_log` → Inbound call CDR
   - `ost_ticket` → Help desk (osTicket integration!)

2. **User Roles**: Admin(0), Supervisor(1), TeamLeader(2), Agent(3) — simple but effective

3. **Integration Points**:
   - `ROCKETCHAT_ENABLE` / `ROCKETCHAT_URL` — Built-in Rocket.Chat integration
   - `OSTICKET_ENABLED` — Built-in osTicket helpdesk
   - `ECCS_BLIND_MODE` — Accessibility mode for blind users
   - Google Sheets integration (`AddGoogleSheet.php`)
   - SMTP email system
   - Slave DB IP for read replicas

4. **UIHandler.php (300KB!)** — Monolithic UI generator with:
   - Dashboard widgets
   - Real-time monitoring
   - Campaign management forms
   - Agent console
   - Call monitoring
   - Lead management
   - Reports (sales, performance, calls)

5. **DbHandler.php (99KB)** — Database operations handler:
   - Lead CRUD
   - Campaign CRUD
   - User management
   - Call log queries
   - Statistics aggregation
   - DNC list management

---

## 4. Chatwoot — Service Architecture Deep Dive

### Service Directories (38 service modules!)

| Service Module | Files | Purpose |
|---------------|-------|---------|
| `whatsapp/` | 24 files | Complete WhatsApp integration (Cloud API, templates, campaigns, phone normalization) |
| `automation_rules/` | 3 files | Rule engine with condition filtering, validation |
| `facebook/` | - | Facebook Messenger integration |
| `instagram/` | - | Instagram DM integration |
| `telegram/` | - | Telegram bot integration |
| `twitter/` | - | Twitter DM integration |
| `line/` | - | LINE messaging integration |
| `sms/` | - | SMS channel integration |
| `twilio/` | - | Twilio voice/SMS |
| `tiktok/` | - | TikTok integration |
| `email/` | - | Email channel |
| `imap/` | - | IMAP email fetching |
| `google/` | - | Google Business Messages |
| `microsoft/` | - | Microsoft Teams integration |
| `linear/` | - | Linear issue tracker |
| `crm/` | - | CRM integration service |
| `llm_formatter/` | - | LLM response formatting |
| `macros/` | - | Macro execution |
| `mfa/` | - | Multi-factor auth |
| `liquid/` | - | Liquid template rendering |
| `data_import/` | - | Data import pipeline |
| `reporting_events/` | - | Reporting event tracking |
| `contacts/` | - | Contact management |
| `conversations/` | - | Conversation lifecycle |
| `messages/` | - | Message handling |
| `notification/` | - | Notification dispatch |
| `labels/` | - | Label management |
| `filters/` | - | Advanced filtering |
| `auto_assignment/` | - | Auto-assignment engine |
| `message_templates/` | - | Message template engine |
| `email_templates/` | - | Email template engine |
| `widget/` | - | Chat widget service |
| `mailbox/` | - | Mailbox management |
| `geocoder/` | - | Location geocoding |
| `internal/` | - | Internal business logic |

### Chatwoot Automation Engine Pattern (Critical for Karan SaaS)

From `conditions_filter_service.rb`:

```
Rule → Conditions[] → each condition:
  ├── conversation_filters (conversations.* columns)
  ├── contact_filters (contacts.* columns, additional_attributes JSONB)
  ├── message_filters (messages.* columns)
  ├── custom_attribute_query (dynamic custom attributes)
  └── attribute_changed filter (before/after value comparison!)

Operators: equal_to, not_equal_to, starts_with, is_present, is_not_present, attribute_changed
Query: AND / OR between conditions
```

**Key Insight**: The `attribute_changed` filter is unique — it compares before/after values (e.g., "status changed FROM open TO resolved"). This enables event-driven automation.

---

## 5. ICTCore — Complete Channel Schema Map

### Channel-Specific Tables

| Channel | Table | Key Fields | Karan SaaS |
|---------|-------|-----------|------------|
| **Voice** | `recording` | name, type, file_name, codec, channel, sample, bitrate, length | ❌ NEED: Recording model |
| **SMS** | `text` | name, data, type (UTF-8), class, encoding, length | ❌ NEED: SmsTemplate model |
| **Fax** | `document` | name, type, file_name, pages, size_x/y, quality (ENUM), resolution | Low priority |
| **Email** | `template` | name, type, subject, body, body_alt, attachment, length | ❌ NEED: EmailTemplate |
| **Tenant** | `tenant` | domain, title, logo_name, footer | ✅ Already have Organization |

### Permission System (granular per entity)
Every entity gets 5 permissions: `{entity}`, `{entity}_create`, `{entity}_list`, `{entity}_read`, `{entity}_update`, `{entity}_delete` — **80+ total permissions**.

---

## 6. Wazo-confd — The 112 Plugin Architecture

### Complete Plugin List (categorized)

**User Management (15 plugins)**:
user, user_agent, user_blocklist, user_call_permission, user_callerid, user_external_app, user_fallback, user_group, user_import, user_line, user_line_associated, user_schedule, user_subscription, user_voicemail

**Queue/Agent (6 plugins)**:
queue, queue_extension, queue_fallback, queue_general, queue_member, queue_schedule

**Routing (12 plugins)**:
incall, incall_extension, incall_schedule, outcall, outcall_call_permission, outcall_extension, outcall_schedule, outcall_trunk, call_filter, call_filter_fallback, call_filter_user, call_permission

**Endpoints (7 plugins)**:
endpoint_sip, endpoint_iax, endpoint_sccp, endpoint_custom, line, line_application, line_device, line_endpoint, line_extension

**PBX Features (15 plugins)**:
ivr, conference, conference_extension, confbridge, paging, paging_user, parking_lot, parking_lot_extension, switchboard, switchboard_fallback, switchboard_member, voicemail, voicemail_general, voicemail_transcription, voicemail_zonemessages

**Skills & Agents (4 plugins)**:
agent, agent_skill, skill, skill_rule

**Device & Provisioning (4 plugins)**:
device, dhcp, provisioning_networking, phone_number

**System (15 plugins)**:
configuration, context, context_context, context_range, extension, extension_feature, features, rtp, pjsip, registrar, register_iax, iax_general, iax_callnumberlimits, sccp_general, hep

**Other (6 plugins)**:
access_feature, application, email, external_app, group, group_extension, group_call_permission, group_fallback, group_member, group_schedule, ha, info, ingress_http, localization, meeting, meeting_authorization, moh, recordings, schedule, sound, sound_language, status, tenant, timezone, trunk, trunk_endpoint, trunk_register, wizard

---

## 7. Updated Gap Count (Post Second-Pass)

### New Tables Identified (from OMniLeads alone)

| # | Table | Priority | Source |
|---|-------|----------|--------|
| 1 | `agent_group` | 🔴 Critical | OMniLeads Grupo (25+ flags) |
| 2 | `pause_type` | 🔴 Critical | OMniLeads Pausa |
| 3 | `pause_config` | 🟡 Important | OMniLeads ConfiguracionDePausa |
| 4 | `pause_set` | 🟡 Important | OMniLeads ConjuntoDePausa |
| 5 | `campaign` | 🔴 Critical | OMniLeads Campana (4 types, 7 states) |
| 6 | `campaign_schedule` | 🔴 Critical | OMniLeads ActuacionVigente |
| 7 | `qualification_option` | 🔴 Critical | OMniLeads OpcionCalificacion |
| 8 | `contact_qualification` | 🔴 Critical | OMniLeads CalificacionCliente |
| 9 | `qualification_audit` | 🟡 Important | OMniLeads AuditoriaCalificacion |
| 10 | `queue` | 🔴 Critical | OMniLeads Queue (6 strategies + AI %) |
| 11 | `queue_member` | 🔴 Critical | OMniLeads QueueMember |
| 12 | `retry_rule` | 🟡 Important | OMniLeads ReglasIncidencia |
| 13 | `agent_contact_assignment` | 🔴 Critical | OMniLeads AgenteEnContacto |
| 14 | `recording_bookmark` | 🟢 Nice | OMniLeads GrabacionMarca |
| 15 | `contact_schedule` | 🟡 Important | OMniLeads AgendaContacto |
| 16 | `quick_list` | 🟢 Nice | OMniLeads ListasRapidas |
| 17 | `form_response` | 🟡 Important | OMniLeads RespuestaFormularioGestion |
| 18 | `crm_parameter` | 🟡 Important | OMniLeads ParametrosCrm |
| 19 | `campaign_agent_config` | 🟢 Nice | OMniLeads ConfiguracionDeAgentesDeCampana |
| 20 | `canned_response` | 🟡 Important | Rocket.Chat EE |
| 21 | `sms_template` | 🟡 Important | ICTCore text |
| 22 | `email_template` | 🟡 Important | ICTCore template |

### Revised Total Tables Target
- Previous target: 174 tables
- New tables from second pass: +22
- **Revised target: ~196 unified tables**

---

## 8. Key Architectural Patterns to Adopt (NEW)

### 1. PostgreSQL Row-Level Locking (from OMniLeads)
```python
# Preview campaign contact delivery — prevents double assignment
qs.select_for_update(skip_locked=True).first()
```
**Prisma equivalent**: `prisma.$queryRaw` with `SELECT ... FOR UPDATE SKIP LOCKED`

### 2. AI Cost Control per Campaign (from OMniLeads)
```
summarize_percentage: 0-100 (% of calls that get AI summary)
transcription_percentage: 0-100 (% of calls that get transcribed)
```
**Adopt in Karan SaaS Queue model**: Per-campaign AI budget allocation.

### 3. Attribute-Changed Automation (from Chatwoot)
```ruby
# Filter: "when status changes FROM open TO resolved"
attribute_changed: { from: ['open'], to: ['resolved'] }
```
**Adopt in Karan SaaS Automation Engine**: Event-driven rule matching with before/after comparison.

### 4. Modular Service Architecture (from Rocket.Chat)
```
41 service interfaces → each with clear contract
IOmnichannelAnalyticsService
IVideoConfService  
IPresence
IQueueWorkerService
```
**Map to NestJS**: Each interface → one NestJS service class.

### 5. Plugin-per-Entity API (from Wazo-confd)
```
112 plugins = 112 API endpoints, each self-contained:
agent/ → resource.py, schema.py, services.py
```
**Map to NestJS**: Each plugin → one NestJS module with controller + service.
