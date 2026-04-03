# 🔍 Missing Features & Gaps — Karan SaaS vs. Open Source Competitors

> **Purpose**: Identify every feature present in the 13 analyzed repos that is MISSING from Karan SaaS  
> **Reference**: Implementation Audit shows ~28% complete (38/152 tables, 31 NestJS modules)

---

## Legend
- 🔴 **CRITICAL** — Core business feature, blocking revenue
- 🟡 **IMPORTANT** — Needed for competitive parity
- 🟢 **NICE-TO-HAVE** — Differentiation, can ship later
- ✅ **EXISTS** — Already built in Karan SaaS
- ❌ **MISSING** — Not started
- 🔧 **PARTIAL** — Started but incomplete

---

## 1. Telephony Engine Layer

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| SIP Trunk Management | 🔧 | FreePBX, FusionPBX, Wazo, ICTCore | 🔴 | Backend module exists, needs full CRUD |
| IVR Builder | ❌ | FreePBX, FusionPBX, Asterisk, Wazo, ICTCore | 🔴 | Need visual drag-drop IVR designer |
| ACD Queue Management | ❌ | Asterisk, Wazo, FusionPBX, OMniLeads | 🔴 | Agent queuing, ring strategies, overflow |
| Call Recording | 🔧 | All telephony repos | 🔴 | Backend exists, needs playback/search UI |
| Skill-Based Routing | ❌ | Wazo (agent_skill, skill_rule) | 🔴 | Agent skills + matching rules engine |
| Predictive Dialer | ❌ | VICIdial, GOautodial, OMniLeads | 🔴 | Statistical pacing algorithm |
| Preview Dialer | ❌ | VICIdial, GOautodial, Callcenter | 🟡 | Agent previews lead before call |
| WebRTC Softphone | ❌ | OMniLeads, GOautodial (JSSIP) | 🔴 | Browser-based agent phone |
| DID Management | ❌ | ICTCore (did, provider_did, user_did) | 🟡 | Phone number assignment per user/campaign |
| Call Parking | ❌ | Wazo (parking_lot), FusionPBX | 🟢 | Park & retrieve calls |
| Call Pickup Groups | ❌ | Wazo, FusionPBX, FreePBX | 🟢 | Pick up ringing phones |
| Boss-Secretary Filter | ❌ | Wazo (call_filter) | 🟢 | Call screening patterns |
| Conference Bridging | ❌ | Asterisk, FusionPBX, Wazo | 🟡 | Multi-party conference rooms |
| Music on Hold | ❌ | All PBX repos | 🟢 | Custom MOH streams |
| Switchboard/Console | ❌ | Wazo (switchboard) | 🟡 | Receptionist operator panel |
| Ring Groups | ❌ | FreePBX, FusionPBX, Wazo | 🟡 | Multi-extension ringing |
| Follow-Me/Find-Me | ❌ | FreePBX, FusionPBX, IssabelPBX | 🟢 | Sequential ring on multiple devices |
| Time-Based Routing | ❌ | FreePBX, FusionPBX, Wazo, OMniLeads | 🔴 | Business hours call routing |
| Voicemail System | ❌ | Asterisk, FreePBX, Wazo | 🟡 | Voicemail boxes with email notification |
| Voicemail Transcription | ❌ | Wazo (voicemail_transcription) | 🟢 | Speech-to-text for voicemail |
| Answering Machine Detection | ❌ | Asterisk (app_amd.c), OMniLeads | 🟡 | Filter out answering machines |
| Fax Server | ❌ | ICTCore, FusionPBX, FreePBX | 🟢 | T.38 fax send/receive |
| Multi-Node Telephony | ❌ | ICTCore (node), VICIdial | 🟡 | Distribute calls across servers |

---

## 2. Omnichannel Communication

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| WhatsApp Business API | ✅ | Chatwoot, OMniLeads | — | Already built |
| Email Channel (IMAP/SMTP) | ❌ | Chatwoot (channel_email — 21 columns!) | 🔴 | Full email inbox integration |
| Facebook Messenger | ❌ | Chatwoot (channel_facebook_pages) | 🟡 | Page-level integration |
| Instagram DMs | ❌ | Chatwoot (channel_instagram) | 🟡 | Business account integration |
| Twitter/X DMs | ❌ | Chatwoot (channel_twitter_profiles) | 🟢 | Tweet + DM monitoring |
| Telegram Bot | ❌ | Chatwoot (channel_telegram) | 🟡 | Bot token integration |
| LINE Messenger | ❌ | Chatwoot (channel_line) | 🟢 | Asian market channel |
| TikTok Business | ❌ | Chatwoot (channel_tiktok) | 🟢 | Latest social channel |
| SMS (Non-WhatsApp) | 🔧 | Chatwoot, ICTCore | 🔴 | Generic SMS gateway |
| Web Live Chat Widget | ❌ | Chatwoot (channel_web_widgets) | 🔴 | Embeddable customer widget |
| Custom API Channel | ❌ | Chatwoot (channel_api) | 🟡 | Webhook-based custom channels |
| Voice Channel | 🔧 | Chatwoot (channel_voice) | 🔴 | Unified voice in omnichannel |
| Unified Inbox | ❌ | Chatwoot (inboxes + conversations) | 🔴 | Single view for all channels |

---

## 3. AI & Intelligence

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| AI Agent/Bot | ❌ | Chatwoot (Captain), Fonoster (Autopilot) | 🔴 | Automated response agent |
| Knowledge Base for AI | ❌ | Chatwoot (captain_documents + embeddings) | 🔴 | Train AI on your docs |
| Vector Search (pgvector) | ❌ | Chatwoot (article_embeddings, vector 1536) | 🔴 | Semantic search for AI responses |
| AI Custom Tools | ❌ | Chatwoot (captain_custom_tools) | 🟡 | Let AI call external APIs |
| AI Scenarios/Workflows | ❌ | Chatwoot (captain_scenarios) | 🟡 | Predefined AI response patterns |
| Agent Copilot | ❌ | Chatwoot (copilot_threads/messages) | 🟡 | AI assistant for human agents |
| Multi-Vendor AI | ❌ | Fonoster (products: Google, OpenAI, Deepgram, etc.) | 🟡 | Support multiple AI providers |
| Text-to-Speech | ❌ | Fonoster (tts_services), IssabelPBX | 🟡 | Dynamic voice prompts |
| Speech-to-Text | ❌ | Fonoster (stt_services) | 🟡 | Call transcription |
| Sentiment Analysis | ❌ | Chatwoot (messages.sentiment JSONB) | 🟢 | Auto-detect customer mood |

---

## 4. Campaign & Automation Engine

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| Outbound Campaigns | 🔧 | ICTCore, GOautodial, VICIdial, Callcenter, OMniLeads | 🔴 | Batch calling/messaging |
| Inbound Campaigns | ❌ | Callcenter, GOautodial, OMniLeads | 🔴 | Inbound call routing by campaign |
| Campaign Progress Tracking | ❌ | ICTCore (contact_total/done triggers) | 🔴 | Real-time campaign metrics |
| Transmission Pipeline | ❌ | ICTCore (transmission → spool → spool_result) | 🔴 | Per-contact communication tracking |
| Automation Rules Engine | ❌ | Chatwoot (automation_rules + conditions/actions) | 🔴 | Event-driven workflow automation |
| Macros (Quick Actions) | ❌ | Chatwoot (macros + JSONB actions) | 🟡 | One-click multi-action |
| Canned Responses | ❌ | Chatwoot (canned_responses) | 🟡 | Quick reply templates |
| Proactive Campaigns | ❌ | Chatwoot (campaigns with audiences) | 🟡 | Outreach with trigger rules |
| Agent Scripts | ❌ | GOautodial, VICIdial | 🟡 | Dynamic call scripts |
| DNC List Management | ❌ | GOautodial, VICIdial, Callcenter, ICTCore | 🔴 | Do-Not-Call compliance |
| Callback Scheduling | ❌ | VICIdial, Callcenter | 🟡 | Agent & auto callbacks |
| Lead Recycling | ❌ | OMniLeads (reciclado_app) | 🟢 | Re-contact failed leads |
| Cross-Channel Campaigns | ❌ | ICTCore (voice + sms + email + fax) | 🟡 | Multi-channel outreach |
| Contact List Import | ❌ | GOautodial, VICIdial, Callcenter | 🔴 | CSV/Excel import for campaigns |

---

## 5. Agent Management & Workforce

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| Agent Console | ❌ | OMniLeads, GOautodial, Callcenter | 🔴 | Unified agent workspace |
| Agent Availability/Status | ❌ | Chatwoot (availability), Wazo (agent) | 🔴 | Online/Busy/Away/Offline |
| Agent Breaks | ❌ | Callcenter (break_administrator, reports_break) | 🟡 | Break time tracking |
| Agent Leave Management | ❌ | Chatwoot (leaves table) | 🟢 | Leave requests & approval |
| Agent Capacity/Workload | ❌ | Chatwoot (agent_capacity_policies) | 🟡 | Max concurrent conversations |
| Assignment Policies | ❌ | Chatwoot (assignment_policies) | 🔴 | Round-robin, fair distribution |
| Agent Monitoring (Live) | ❌ | Callcenter, GOautodial, OMniLeads, VICIdial | 🔴 | Real-time agent dashboard |
| Wallboard | ❌ | FusionPBX, GOautodial, VICIdial | 🟡 | Large-screen metrics display |
| Agent Login/Logout Tracking | ❌ | Callcenter (login_logout module) | 🟡 | Session tracking |
| Agent Performance Reports | ❌ | All call center repos | 🔴 | Calls handled, AHT, etc. |

---

## 6. SLA & Quality Management

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| SLA Policies | ❌ | Chatwoot (sla_policies) | 🔴 | First response & resolution time |
| SLA Tracking per Conversation | ❌ | Chatwoot (applied_slas, sla_events) | 🔴 | Active SLA monitoring |
| CSAT Surveys | ❌ | Chatwoot (csat_survey_responses) | 🟡 | Post-conversation feedback |
| Quality Monitoring | ❌ | VICIdial, GOautodial | 🟡 | Call grading & scoring |
| Call Whispering/Barging | ❌ | Asterisk (app_chanspy.c), GOautodial | 🟡 | Supervisor assists agent |
| Business Hours | ❌ | Chatwoot (working_hours), Wazo (schedule) | 🔴 | Per-inbox/queue scheduling |

---

## 7. Reporting & Analytics

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| CDR Reports | 🔧 | All telephony repos | 🔴 | Call Detail Records |
| Conversation Reports | ❌ | Chatwoot (reporting_events) | 🔴 | Response time, resolution |
| Pre-aggregated Rollups | ❌ | Chatwoot (reporting_events_rollups) | 🟡 | Fast dashboard queries |
| Calls per Hour/Agent | ❌ | Callcenter, GOautodial, VICIdial | 🟡 | Volume distribution |
| Hold Time Analytics | ❌ | Callcenter (hold_time module) | 🟡 | Wait time metrics |
| Trunk Utilization | ❌ | Callcenter (rep_trunks_used_per_hour) | 🟢 | Capacity planning |
| Campaign Performance | ❌ | GOautodial, VICIdial, ICTCore | 🔴 | Campaign success metrics |
| Graphical Dashboards | ❌ | Callcenter (graphic_calls) | 🟡 | Visual analytics |
| Export to CSV/PDF | ❌ | Most repos | 🟡 | Report download |

---

## 8. Configuration & Infrastructure

| Feature | Status | Found In | Priority | Notes |
|---------|--------|----------|----------|-------|
| Phone Device Provisioning | ❌ | FusionPBX (10+ brands), Wazo, FreePBX | 🟢 | Auto-config IP phones |
| Multi-Tenant PBX | ❌ | FusionPBX (domain-based), Wazo (tenant) | 🟡 | Per-tenant telephony |
| Feature Codes (*67, etc.) | ❌ | FreePBX, FusionPBX, IssabelPBX | 🟢 | Dial-from-phone shortcuts |
| Backup/Restore | ❌ | FreePBX, IssabelPBX | 🟡 | System backup |
| Custom Form Builder | ❌ | Callcenter (form_designer) | 🟡 | Agent capture forms |
| External URL/CRM Pop | ❌ | Callcenter (external_url), GOautodial | 🔴 | Screen-pop on answer |
| Webhook System | ❌ | Chatwoot (webhooks with subscriptions) | 🔴 | Event webhook management |
| Platform Apps/Marketplace | ❌ | Rocket.Chat (apps-engine), Chatwoot (platform_apps) | 🟢 | App marketplace |
| OpenAPI Documentation | ❌ | Wazo-confd (auto-generated) | 🟡 | API documentation |
| Audit Trail | ❌ | Chatwoot (audits) | 🟡 | Change tracking |

---

## Summary: Critical Missing Count

| Priority | Count | Key Items |
|----------|-------|-----------|
| 🔴 CRITICAL | **28** | WebRTC, IVR, ACD, Predictive Dialer, Unified Inbox, AI Agent, SLA, Automation, Agent Console, Business Hours |
| 🟡 IMPORTANT | **25** | Conference, Ring Groups, Email Channel, Agent Scripts, CSAT, Voicemail, DID, Wallboard |
| 🟢 NICE-TO-HAVE | **15** | Fax, Call Parking, LINE, TikTok, MOH, Call Pickup, Device Provisioning |
| **TOTAL GAPS** | **68** | — |

---

## Priority Build Order (Next 6 Sprints)

### Sprint 1: Core Agent Experience
- [ ] WebRTC Softphone (JSSIP/SIPjs)
- [ ] Agent Console UI
- [ ] Agent Availability/Status
- [ ] Business Hours

### Sprint 2: Omnichannel Foundation
- [ ] Unified Inbox (conversation model)
- [ ] Web Live Chat Widget
- [ ] Email Channel (IMAP/SMTP)
- [ ] Webhook System

### Sprint 3: Call Center Engine 
- [ ] ACD Queue Management
- [ ] IVR Builder (visual)
- [ ] Time-Based Routing
- [ ] Skill-Based Routing

### Sprint 4: Automation & AI
- [ ] Automation Rules Engine
- [ ] AI Agent (Captain pattern)
- [ ] Knowledge Base + Vector Search
- [ ] SLA Policies & Tracking

### Sprint 5: Campaign Engine
- [ ] Outbound Campaign Manager
- [ ] Predictive/Preview Dialer
- [ ] DNC List Management
- [ ] Campaign Progress Tracking

### Sprint 6: Analytics & Quality
- [ ] CDR Reports (complete)
- [ ] Agent Performance Reports
- [ ] CSAT Surveys
- [ ] Reporting Rollups Dashboard
