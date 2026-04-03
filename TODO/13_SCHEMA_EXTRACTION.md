# 🗄️ Schema Extraction — All 13 Tele CRM Repos

> **Purpose**: Extract every database table, schema, and data model from all 13 repositories.  
> **Target**: Map to Karan SaaS unified PostgreSQL schema (~152+ tables planned)

---

## 1. Chatwoot — PostgreSQL Schema (65+ tables)

> Source: `chatwoot/db/schema.rb` (1322 lines, 59KB)  
> DB: PostgreSQL with pg_trgm, pgcrypto, vector extensions

### Core Entity Tables
| # | Table | Columns | Key Fields | Notes |
|---|-------|---------|------------|-------|
| 1 | `accounts` | 12 | name, domain, locale, feature_flags, limits (JSONB), settings (JSONB) | Multi-tenant root |
| 2 | `users` | 22 | name, email, provider/uid (Devise), tokens (JSON), pubsub_token, 2FA (otp_secret) | Agents & admins |
| 3 | `account_users` | 9 | role, availability, auto_offline, custom_role_id, agent_capacity_policy_id | Account↔User join |
| 4 | `contacts` | 16 | name, email, phone, identifier, custom_attributes (JSONB), company_id, blocked | Customers |
| 5 | `companies` | 6 | name, domain, description, contacts_count | B2B entities |
| 6 | `conversations` | 24 | status, assignee_id, contact_id, inbox_id, team_id, priority, uuid, sla_policy_id, waiting_since | Core tickets |
| 7 | `messages` | 16 | content, message_type, private, content_type, sentiment (JSONB), processed_content | Chat messages |
| 8 | `inboxes` | 18 | channel_type, channel_id, auto_assignment, greeting, working_hours, csat_config | Channel containers |
| 9 | `teams` | 5 | name, allow_auto_assign | Agent teams |
| 10 | `team_members` | 4 | team_id, user_id | Team↔User join |
| 11 | `inbox_members` | 4 | inbox_id, user_id | Inbox↔Agent join |
| 12 | `contact_inboxes` | 6 | contact_id, inbox_id, source_id, hmac_verified | Contact↔Inbox mapping |
| 13 | `conversation_participants` | 5 | user_id, conversation_id, account_id | Multi-agent conversations |

### Channel Tables (13 types!)
| # | Table | Columns | Protocol |
|---|-------|---------|----------|
| 14 | `channel_web_widgets` | 17 | Website live chat |
| 15 | `channel_facebook_pages` | 7 | Facebook Messenger |
| 16 | `channel_instagram` | 6 | Instagram DMs |
| 17 | `channel_twitter_profiles` | 7 | Twitter/X |
| 18 | `channel_whatsapp` | 7 | WhatsApp Business |
| 19 | `channel_telegram` | 5 | Telegram Bot |
| 20 | `channel_email` | 21 | Email IMAP/SMTP |
| 21 | `channel_sms` | 6 | SMS (generic) |
| 22 | `channel_twilio_sms` | 9 | Twilio SMS/WhatsApp |
| 23 | `channel_line` | 6 | LINE |
| 24 | `channel_api` | 8 | Custom API |
| 25 | `channel_voice` | 7 | Voice/Phone (provider_config JSONB) |
| 26 | `channel_tiktok` | 7 | TikTok Business |

### AI / Captain Tables
| # | Table | Key Fields |
|---|-------|------------|
| 27 | `captain_assistants` | name, config (JSONB), response_guidelines, guardrails |
| 28 | `captain_documents` | name, external_link, content, status, metadata (JSONB) |
| 29 | `captain_assistant_responses` | question, answer, embedding (vector 1536), status |
| 30 | `captain_scenarios` | title, instruction, tools (JSONB), enabled |
| 31 | `captain_custom_tools` | slug, http_method, endpoint_url, auth_type, param_schema |
| 32 | `captain_inboxes` | captain_assistant_id, inbox_id |
| 33 | `article_embeddings` | article_id, term, embedding (vector 1536) |
| 34 | `copilot_threads` | title, user_id, assistant_id |
| 35 | `copilot_messages` | message (JSONB), message_type |

### Automation & Campaign Tables
| # | Table | Key Fields |
|---|-------|------------|
| 36 | `automation_rules` | event_name, conditions (JSONB), actions (JSONB), active |
| 37 | `campaigns` | title, message, trigger_rules (JSONB), audience, scheduled_at, campaign_type |
| 38 | `macros` | name, actions (JSONB), visibility, created_by |

### SLA & Assignment Tables
| # | Table | Key Fields |
|---|-------|------------|
| 39 | `sla_policies` | first_response_time, next_response_time, resolution_time, business_hours |
| 40 | `applied_slas` | sla_policy_id, conversation_id, sla_status |
| 41 | `sla_events` | applied_sla_id, event_type, meta (JSONB) |
| 42 | `assignment_policies` | assignment_order, fair_distribution_limit/window |
| 43 | `agent_capacity_policies` | name, exclusion_rules (JSONB) |
| 44 | `inbox_capacity_limits` | conversation_limit per inbox per policy |
| 45 | `inbox_assignment_policies` | inbox_id, assignment_policy_id |

### Reporting & Analytics Tables
| # | Table | Key Fields |
|---|-------|------------|
| 46 | `reporting_events` | name, value, value_in_business_hours, event_start/end_time |
| 47 | `reporting_events_rollups` | date, dimension_type/id, metric, count, sum_value |
| 48 | `csat_survey_responses` | rating, feedback_message, assigned_agent_id, review_notes |

### Supporting Tables
| # | Table | Purpose |
|---|-------|---------|
| 49 | `labels` | Conversation/contact tagging |
| 50 | `tags` + `taggings` | Polymorphic tagging system |
| 51 | `custom_attribute_definitions` | Dynamic field definitions |
| 52 | `custom_filters` | Saved query filters |
| 53 | `custom_roles` | Fine-grained RBAC |
| 54 | `canned_responses` | Quick reply templates |
| 55 | `working_hours` | Per-inbox business hours |
| 56 | `notes` | Contact notes |
| 57 | `mentions` | @mention tracking |
| 58 | `notifications` | In-app notifications |
| 59 | `notification_settings` | Per-user notification prefs |
| 60 | `webhooks` | Event webhook URLs |
| 61 | `attachments` | File attachments |
| 62 | `data_imports` | CSV/file import tracking |
| 63 | `email_templates` | Email templates |
| 64 | `agent_bots` + `agent_bot_inboxes` | Bot integrations |
| 65 | `portals` | Help center portals |
| 66 | `articles` + `categories` + `folders` | Knowledge base |
| 67 | `leaves` | Agent leave management |
| 68 | `dashboard_apps` | Custom dashboard widgets |
| 69 | `platform_apps` + `platform_app_permissibles` | Platform integrations |
| 70 | `integrations_hooks` | Third-party hooks |
| 71 | `installation_configs` | System configuration |
| 72 | `audits` | Audit trail |
| 73 | `account_saml_settings` | SAML SSO config |
| 74 | `access_tokens` | API tokens |

---

## 2. ICTCore — MySQL Schema (30+ tables)

> Source: `ictcore/db/database.sql` (1833 lines, 118KB)  
> DB: MySQL (InnoDB) with triggers and scheduled events

### Core Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `account` | SIP/communication accounts | account_id, type, username, passwd, passwd_pin, settings (text) |
| `usr` | System users | usr_id, role_id, username, company, country_id, timezone_id |
| `role` | User roles | role_id, name, description |
| `permission` | ~80 granular permissions | permission_id, name |
| `user_permission` | User↔Permission join | usr_id, permission_id |
| `role_permission` | Role↔Permission join | role_id, permission_id |
| `user_role` | User↔Role join | role_id, usr_id |
| `resource` | System resources | name, description, data |
| `user_resource` | User resource quotas | resource_id, usr_id, data |
| `role_resource` | Role resource limits | resource_id, role_id, data |

### Communication Pipeline Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `transmission` | Communication instance | service_flag, contact_id, program_id, origin, direction, status, try_allowed/done, campaign_id |
| `spool` | Active call tracking | call_id, status, response, amount, transmission_id, provider_id, node_id |
| `spool_result` | Call outcome data | application_id, type, name, data, spool_id |
| `campaign` | Batch campaigns | program_id, group_id, cpm, contact_total/done, status, pid |
| `program` | Communication workflows | name, type, data (JSON), parent_id |
| `application` | Program steps | name, type, weight, program_id |
| `action` | Application actions | type, action, data, is_default, application_id |

### Contact Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `contact` | Contact directory | first_name, last_name, phone, email, address, custom1-3 |
| `contact_group` | Contact groups | name, description, contact_total |
| `contact_link` | Group↔Contact join | group_id, contact_id |

### Infrastructure Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `gateway` | Telephony gateways | gateway_flag, name, service_flag (voice=1,fax=2,sms=4,email=8) |
| `node` | Server nodes | api_host/port, ssh_host/port, gateway_flag, channel, cps |
| `provider` | Trunk providers | (linked from spool) |
| `config` / `config_data` | Gateway configuration | file_name, data, gateway_flag |
| `config_node` | Config per server | config_id, node_id, version |
| `configuration` / `configuration_data` | System settings | type, name, data, permission_flag |

### Scheduling Tables
| Table | Purpose | Key Columns |
|-------|---------|------------|
| `task` | Scheduled jobs | type, action, data, weight, status, is_recurring, due_at, expiry |
| `schedule` | Cron-like schedule | year, month, day, hour, minute, task_id |
| `session` | Session data | session_id, time_start, data |
| `ivr` | IVR trees | name, description, data (JSON) |

### Service-Specific Tables (from separate .sql files)
| File | Tables | Purpose |
|------|--------|---------|
| `voice.sql` | `recording`, `tts`, `did`, `provider_did`, `user_did` | Voice service |
| `fax.sql` | `document`, `template`, `fax_activity` | Fax service |
| `sms.sql` | `text`, `provider_sms` | SMS service |
| `email.sql` | `template_email`, `provider_email` | Email service |
| `tenant.sql` | Tenant config tables | Multi-tenancy |

---

## 3. Fonoster — Prisma/PostgreSQL Schema (6 tables)

> Source: `fonoster/mods/apiserver/schema.prisma`

| Table | Columns | Purpose |
|-------|---------|---------|
| `applications` | ref (UUID), access_key_id, name, type (EXTERNAL/AUTOPILOT), endpoint | Voice application definitions |
| `tts_services` | ref, config (JSON), credentials_hash, application_ref, product_ref | Text-to-Speech configs |
| `stt_services` | ref, config (JSON), credentials_hash, application_ref, product_ref | Speech-to-Text configs |
| `intelligence_services` | ref, config (JSON), credentials_hash, application_ref, product_ref | LLM/AI configs |
| `products` | ref, name, vendor (11 vendors), type (TTS/STT/LLM) | AI product catalog |
| `secrets` | ref, access_key_id, name, secret_hash | Encrypted secrets |

---

## 4. Asterisk — Realtime SQL Tables (when using DB backend)

| Table | Purpose |
|-------|---------|
| `sippeers` | SIP endpoint registration |
| `sipregistration` | SIP registration state |
| `iaxfriends` | IAX2 endpoints |
| `voicemail` | Voicemail boxes |
| `queue_members` | Queue agent membership |
| `queues` | ACD queue definitions |
| `extensions` | Dialplan extensions |
| `meetme` | Conference rooms |
| `musiconhold` | Music on Hold settings |
| `cdr` | Call Detail Records |
| `cel` | Channel Event Logging |

---

## 5. Wazo-confd — SQLAlchemy Models (inferred from 112 plugins)

| Domain | Tables/Entities |
|--------|-----------------|
| **Users** | user, user_line, user_voicemail, user_agent, user_group, user_schedule |
| **Lines** | line, line_extension, line_endpoint, line_device, line_application |
| **Extensions** | extension, extension_feature |
| **Endpoints** | endpoint_sip, endpoint_iax, endpoint_sccp, endpoint_custom |
| **Trunks** | trunk, trunk_endpoint, trunk_register |
| **Routing** | incall, incall_extension, outcall, outcall_extension, outcall_trunk |
| **Queue/ACD** | queue, queue_member, queue_extension, queue_fallback, queue_schedule |
| **Agents** | agent, agent_skill, skill, skill_rule |
| **Groups** | group, group_member, group_extension, group_fallback, group_schedule |
| **Conference** | conference, conference_extension, confbridge |
| **IVR** | ivr |
| **Switchboard** | switchboard, switchboard_member, switchboard_fallback |
| **Call Features** | call_filter, call_filter_user, call_filter_fallback, call_permission, call_pickup, call_pickup_member |
| **Parking** | parking_lot, parking_lot_extension |
| **Voicemail** | voicemail, voicemail_general, voicemail_zonemessages, voicemail_transcription |
| **Paging** | paging, paging_user |
| **Devices** | device |
| **Sounds** | sound, sound_language, moh |
| **Scheduling** | schedule |
| **Meetings** | meeting, meeting_authorization |
| **Context** | context, context_context, context_range |
| **Tenant** | tenant |
| **Apps** | external_app, user_external_app |
| **Config** | features, rtp, pjsip, configuration, provisioning_networking |

---

## 6. Mapping to Karan SaaS Unified Schema

### NEW Tables to Add (from this analysis)

| Priority | Table | Source | Why |
|----------|-------|--------|-----|
| P0 | `sla_policies` | Chatwoot | Customer SLA tracking |
| P0 | `applied_slas` | Chatwoot | SLA per conversation |
| P0 | `automation_rules` | Chatwoot | Workflow engine |
| P0 | `captain_assistants` | Chatwoot | AI agent config |
| P0 | `ai_knowledge_documents` | Chatwoot | Knowledge base for AI |
| P0 | `agent_skills` | Wazo | Skill-based routing |
| P0 | `skill_rules` | Wazo | Routing rule engine |
| P1 | `channel_configs` | Chatwoot | Unified channel config (JSONB) |
| P1 | `campaign_transmissions` | ICTCore | Campaign execution tracking |
| P1 | `call_spools` | ICTCore | Active call tracking |
| P1 | `ivr_trees` | ICTCore/Wazo | IVR flow storage |
| P1 | `telephony_nodes` | ICTCore | Multi-server management |
| P1 | `gateway_configs` | ICTCore | Trunk/gateway setup |
| P1 | `agent_capacity_configs` | Chatwoot | Workload balancing |
| P2 | `csat_responses` | Chatwoot | Customer satisfaction |
| P2 | `reporting_rollups` | Chatwoot | Pre-aggregated analytics |
| P2 | `custom_attribute_defs` | Chatwoot | Dynamic field system |
| P2 | `switchboard_configs` | Wazo | Receptionist console |
| P2 | `parking_lots` | Wazo | Call parking |
| P3 | `ai_products` | Fonoster | Multi-vendor AI catalog |
| P3 | `voice_applications` | Fonoster | Programmable voice flows |
| P3 | `article_embeddings` | Chatwoot | Vector search for KB |

### Total Schema Impact
- **Current Karan SaaS**: ~38 tables implemented, ~152 planned
- **New tables from this analysis**: +22 high-priority tables
- **Revised target**: ~174 unified tables
