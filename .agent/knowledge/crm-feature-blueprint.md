# CRM Master Feature Blueprint
> Complete reference for implementation. Three layers — Core CRM → General CRM → Telecalling CRM.
> **Rule**: Nothing is built without checking this first. Nothing gets skipped.

---

## Layer 1 — Core CRM (Foundation, 25 Features)
*Present in every CRM. Must be 100% implemented.*

### 1. Contact & Lead Management
- Contact records (name, phone, email, company, address, tags)
- Lead capture (manual, import, web form, API)
- Lead deduplication & merge
- Lead ownership & assignment
- Lead source tracking (web, referral, campaign, inbound call, etc.)
- Contact timeline (all interactions in chronological order)
- Custom fields per contact/lead

### 2. Pipeline & Deal Management
- Multiple sales pipelines
- Drag-and-drop kanban stage board
- Deal value, expected close date, probability
- Won / Lost / Disqualified tracking
- Deal history and audit trail

### 3. Tasks & Activities
- Task creation (call, email, meeting, follow-up)
- Due date, priority, assignee
- Task reminders (in-app, email)
- Activity feed per lead/contact

### 4. Notes & Attachments
- Rich-text notes per lead/deal/contact
- File attachments (PDF, images, docs)
- Note visibility (private vs team)

### 5. Email Logging
- BCC-to-CRM email capture
- Sent/received email thread view per contact
- Email open/click tracking

### 6. Import / Export
- CSV/Excel import with field mapping
- Bulk export of any dataset
- Duplicate handling on import

### 7. Search & Filter
- Global full-text search
- Saved filter views
- Advanced multi-condition filters

### 8. Roles & Permissions
- Role-based access control (RBAC)
- Field-level permissions
- Team hierarchy (admin, manager, agent)

### 9. Mobile Access
- Mobile-responsive web or native app
- Click-to-call from mobile

### 10. Basic Reporting
- Lead count, deal count, conversion rate
- Activity summary per agent
- Pipeline value report

---

## Layer 2 — General CRM (Full Business Platform, 60+ Features)
*Built on top of Core CRM. Covers sales automation, marketing, support, AI, and admin.*

### A. Sales Automation
| Feature | Description |
|---|---|
| Workflow automation | Trigger actions on lead stage change, form fill, time-based rules |
| Lead scoring | Point-based scoring from demographics + behavior |
| Lead assignment rules | Round-robin, load-balanced, or territory-based auto-assign |
| Sales sequences | Automated multi-step email/call/task cadences |
| Blueprint / SOP enforcement | Stage-gated checklists — can't move stage without completing steps |
| Approval workflows | Discount request, deal close — manager approval flows |
| Territory management | Assign leads/deals by geography, company size, or product |
| Forecasting | Pipeline-based revenue forecast with confidence scoring |
| Quota management | Set and track individual and team quotas |
| CPQ (Configure, Price, Quote) | Product catalog, pricing rules, discount tiers, quote generation |
| Competitive tracking | Log competitors per deal, win/loss analysis |
| Account management | B2B account records linking contacts + deals under one company |

### B. Marketing Automation
| Feature | Description |
|---|---|
| Email campaigns | Bulk email to segments, schedule, A/B test |
| Drip campaigns | Time/event triggered email sequences |
| Landing pages & forms | Drag-and-drop builder, embed on website |
| Lead capture widgets | Pop-ups, chat widgets, exit-intent forms |
| WhatsApp / SMS campaigns | Broadcast messages to lead segments |
| Social media capture | Pull leads from Facebook/Instagram/LinkedIn ads |
| UTM tracking | Source, medium, campaign attribution per lead |
| Journey orchestration | Multi-channel automated journeys (email → SMS → call) |
| Audience segmentation | Dynamic lists based on behavior, attributes, tags |
| Campaign ROI reporting | Cost per lead, cost per conversion, revenue attribution |

### C. Customer Support
| Feature | Description |
|---|---|
| Ticketing system | Create, assign, escalate support tickets |
| SLA management | Response/resolution time targets with alerts |
| Omnichannel inbox | Email, WhatsApp, chat, social in one view |
| Knowledge base | Internal and customer-facing help articles |
| CSAT / NPS surveys | Post-interaction satisfaction surveys |
| Customer portal | Self-service portal for ticket tracking |
| Chatbot | Rule-based or AI chatbot for first-response |
| Escalation matrix | Auto-escalate breached SLAs to manager |

### D. AI & Predictive Analytics
| Feature | Description |
|---|---|
| AI lead scoring | ML-based lead quality prediction |
| Predictive deal close | Probability score from historical patterns |
| Anomaly detection | Alert when conversion drops or activity spikes |
| Sentiment analysis | Detect positive/negative sentiment in emails/calls |
| Next best action | AI recommends what to do next for each lead |
| AI email writer | GPT-based email draft suggestions |
| Data storytelling | Natural language dashboards ("Revenue dropped 12% vs last week") |

### E. Analytics & Reporting
| Feature | Description |
|---|---|
| Custom dashboards | Drag-and-drop KPI widgets |
| Funnel analysis | Conversion at each pipeline stage |
| Cohort analysis | Lead behavior over time by acquisition period |
| Activity reports | Calls made, emails sent, tasks done per agent |
| Revenue reports | Deals won, avg deal size, revenue by team/product |
| Leaderboard | Agent ranking by any metric |
| Scheduled reports | Auto-send reports to email at set intervals |
| Data export to BI | Connector to Tableau, Power BI, Looker |

### F. Admin & Customisation
| Feature | Description |
|---|---|
| Custom modules | Create your own CRM objects beyond leads/contacts/deals |
| Custom layouts | Control field visibility by role |
| Multi-currency | Set deal values in any currency with auto-conversion |
| Multi-language | UI in multiple languages |
| Multi-timezone | Per-agent timezone for timestamps |
| Sandbox environment | Test changes before pushing to production |
| API access | REST + Webhook API for external integrations |
| Marketplace / plugins | App integrations (Zapier, Slack, Google Workspace) |
| SSO / OAuth | Login via Google, Microsoft, SAML |
| 2FA | Two-factor authentication |
| Audit logs | Every action logged with user, timestamp, change |
| Data retention policies | GDPR-compliant data expiry rules |
| Backup & restore | Scheduled database backup with point-in-time restore |
| White-labelling | Custom domain, logo, brand name |
| IP whitelisting | Restrict CRM access to specific IP ranges |

---

## Layer 3 — Telecalling CRM (55+ Features)
*The specialist calling layer. This is what differentiates this product.*

### A. Dialling Modes (10 Modes)
| Mode | Description |
|---|---|
| Auto dialer | Automatically calls next lead when agent is free |
| Power dialer | Calls multiple numbers per agent slot, connects first answer |
| Predictive dialer | ML-predicts agent availability, dials ahead of time |
| Progressive dialer | One call at a time, auto-advances on completion |
| Preview dialer | Agent sees lead info before manually confirming dial |
| Click-to-call | Agent clicks a button to dial from the CRM UI |
| Deep-link dialer | Opens phone app via deep link (mobile CRM) |
| SIM-based dialer | Routes calls through agent's SIM card (no VoIP needed) |
| Browser dialer | WebRTC calls directly from browser tab |
| Robocall / IVR blast | Pre-recorded message blasted to lead list, key-press to connect agent |

### B. Call Management (12 Features)
| Feature | Description |
|---|---|
| Call recording | Automatic recording of all calls, stored & searchable |
| Call notes (mid-call) | Agent can type notes while on call |
| Disposition tagging | Post-call outcome: Interested, Not Interested, Callback, DNC, etc. |
| Voicemail drop | Pre-recorded voicemail auto-dropped when call hits voicemail |
| DND / Do Not Call management | Block numbers flagged as DNC, compliance enforcement |
| Call queue | Incoming calls queued when all agents are busy |
| Call pop-up (screen pop) | Lead record auto-opens when call connects |
| Call script display | Script shown to agent during live call |
| Callback scheduling | Schedule a callback from disposition screen |
| Lead history on call | Full lead history visible during active call |
| Call hold & resume | Standard hold with music |
| Conference call | Add second agent or supervisor to active call |

### C. Telephony & IVR (15 Features)
| Feature | Description |
|---|---|
| Multi-level IVR | Tree-based menu routing for inbound calls |
| Virtual phone numbers | Local/national numbers without hardware |
| Number masking | Hide real agent/customer number from each other |
| PBX integration | Connect to on-premise PBX (Asterisk, FreePBX) |
| Warm transfer | Agent speaks to next agent before handing call |
| Cold transfer | Blind transfer to another agent/queue |
| Sticky agent routing | Repeat caller connected to same agent |
| Time-based routing | Route to different teams/numbers by time of day |
| Geographic routing | Route inbound calls based on caller location |
| Skill-based routing | Route to agent with specific skill/language |
| Missed call auto-callback | Auto-trigger callback attempt on missed inbound |
| SMS auto-send post-call | Auto-SMS after call with summary or link |
| WhatsApp auto-send post-call | Same as SMS but over WhatsApp |
| Caller ID management | Display custom caller ID per campaign |
| DTMF / keypress capture | Capture keypress responses in IVR flows |

### D. Agent Monitoring & Quality (14 Features)
| Feature | Description |
|---|---|
| Live call dashboard | See all active calls in real time |
| Listen / Silent monitoring | Supervisor listens to live call without agent knowing |
| Whisper coaching | Supervisor speaks to agent only, caller can't hear |
| Barge-in | Supervisor joins live call (three-way) |
| Forced call end | Supervisor can disconnect any active call |
| Call quality scoring | Manual or AI score per call (0–10) |
| AI transcription | Real-time or post-call speech-to-text |
| Sentiment analysis | Live or post-call emotional tone detection |
| Keyword spotting | Alert when specific words spoken on call |
| Talk/listen ratio | % of call time agent vs customer spoke |
| Agent availability status | Available, On Call, Break, Offline |
| Break tracking | Log break start/end, total break time per day |
| Login/logout tracking | Agent clock-in time, total productive hours |
| Call coaching notes | Supervisor annotations on recordings for training |

### E. Campaign Management (12 Features)
| Feature | Description |
|---|---|
| Campaign creation | Name, list, script, dialler mode, schedule |
| Lead list upload | Assign CSV lists to campaigns |
| Campaign scheduling | Set start/end time and active calling hours |
| Calling hours restriction | Only dial between configured hours (compliance) |
| Campaign pause/resume | Pause campaign mid-run |
| Retry logic | Auto-retry unanswered/busy/failed calls (configurable attempts) |
| Priority dialling | Prioritise high-score leads in queue |
| Campaign cloning | Duplicate campaign config for fast setup |
| Multi-agent campaign | Assign multiple agents to one campaign pool |
| Campaign-level scripts | Different scripts per campaign |
| WhatsApp campaign post-call | Auto-send WhatsApp to all leads called in campaign |
| Campaign archiving | Archive completed campaigns, preserve data |

### F. Reporting & Analytics — Telecalling (12 Features)
| Feature | Description |
|---|---|
| Real-time call dashboard | Live calls, queue depth, agents online |
| Hourly call volume breakdown | Calls made/received per hour of day |
| Agent performance report | Calls, talk time, conversions, avg handle time per agent |
| Disposition report | Count & % of each outcome (transferred, DNC, callback, etc.) |
| Campaign performance report | Calls, connects, conversion per campaign |
| Attendance & login report | Login time, logout, total hours, breaks per agent |
| Missed call report | Inbound missed calls with callbacks status |
| Call leakage analysis | Leads contacted vs not contacted in a list |
| Conversion funnel | Lead → Contacted → Interested → Converted |
| Recording audit | Search, filter, and play recordings with timestamps |
| Callback adherence | Scheduled callbacks attempted on time vs missed |
| Field agent GPS tracking | Location check-in/out for on-ground agents |

---

## Priority Implementation Order

```
Phase 1 (Core — MVP):        Layer 1 fully implemented ✅
Phase 2 (Telecalling — USP): Layer 3A + 3B + 3C + 3D (dialler, call mgmt, IVR, monitoring)
Phase 3 (General — Scale):   Layer 2A + 2E (sales automation + reporting)
Phase 4 (Full Platform):     Layer 2B + 2C + 2D (marketing, support, AI)
Phase 5 (Extreme Scale):     Layer 4 from realtime-architecture.md (Redis Streams, Ably)
```

---

*Stored: 2026-03-20 | Author: Arpit | Reference: NeoDove, TeleCRM, Zoho, Salesforce, HubSpot feature sets*
