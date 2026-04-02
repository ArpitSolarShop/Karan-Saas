# 🏗️ ARCHITECTURE PATTERNS — Worth Adopting

> Design patterns, architecture decisions, and technical approaches extracted from all 17 CRMs.

---

## 1. CUSTOM OBJECTS & METADATA SYSTEM (from Twenty CRM)

**Pattern**: Let users define their own entities at runtime without code changes.

**How Twenty Does It**:
- `ObjectMetadata` — defines custom entities (table name, label, icon, description)
- `FieldMetadata` — defines fields on those entities (name, type, default, validation)
- `RelationMetadata` — defines relationships between objects
- `ViewDefinition` — saved views with columns, filters, sorts
- Each workspace gets its own PostgreSQL schema (multi-tenant via schema isolation)
- GraphQL schema is **dynamically generated** from metadata

**What We Should Build**:
```
ObjectMetadata { id, name, label_singular, label_plural, description, 
  icon, is_active, is_system, tenant_id }
FieldMetadata { id, object_id, name, label, type(text/number/date/select/relation/boolean/json),
  is_required, is_unique, default_value, options(json), position, tenant_id }
RelationMetadata { id, from_object_id, to_object_id, from_field_id, to_field_id,
  relation_type(one_to_one/one_to_many/many_to_many), tenant_id }
```

**Priority**: CRITICAL — This is the #1 differentiator for modern CRMs.

---

## 2. LOW-CODE COMPOSE SYSTEM (from Corteza)

**Pattern**: Namespace-based application building where admins can create structured data apps without coding.

**How Corteza Does It**:
- **Namespaces** — containers for custom applications (like mini-apps)
- **Modules** — define data structures within a namespace
- **Pages** — build UI pages with drag-and-drop blocks
- **Charts** — configurable visualizations
- **Automation** — event-driven workflows attached to modules

**What We Should Build**:
- A "Custom App Builder" where admins define modules (entities), pages (layouts), and charts
- Similar to what Notion does for databases but within CRM context

**Priority**: HIGH — Enables non-dev users to extend the platform.

---

## 3. CHANNEL-BASED ARCHITECTURE (from OroCRM)

**Pattern**: Multi-channel customer acquisition tracking.

**How Oro Does It**:
- Every customer interaction is tagged with a "Channel" (web, phone, email, social, referral)
- `ChannelBundle` tracks which channels are active
- RFM Analytics (Recency, Frequency, Monetary) per channel
- Attribution tracking — which channel drove the most revenue

**What We Should Build**:
```
Channel { id, name, type(web/phone/email/whatsapp/sms/referral/social), 
  is_active, config(json), tenant_id }
LeadChannel { lead_id, channel_id, attribution_weight }
DealChannel { deal_id, channel_id }
```

**Priority**: MEDIUM — Valuable for marketing analytics.

---

## 4. GAMIFICATION ENGINE (from Zurmo)

**Pattern**: Points, badges, leaderboards, and missions to drive CRM adoption.

**How Zurmo Does It**:
- **Points** — users earn points for CRM activities (logging calls, updating records, closing deals)
- **Badges** — milestone achievements (e.g., "100 Calls Badge")
- **Leaderboards** — ranked user performance
- **Missions** — time-boxed challenges ("Close 5 deals this week")
- **Levels** — user progression system

**What We Should Build**:
```
GamificationRule { id, event_type, points, description, tenant_id }
UserPoints { id, user_id, points, reason, source_type, source_id, created_at }
Badge { id, name, description, icon, criteria(json), points_required, tenant_id }
UserBadge { id, user_id, badge_id, earned_at }
Mission { id, name, description, target_metric, target_value, 
  start_date, end_date, reward_points, tenant_id }
UserMission { id, user_id, mission_id, progress, completed_at }
Leaderboard { tenant_id, user_id, period(daily/weekly/monthly), 
  total_points, rank }
```

**Priority**: MEDIUM — Great for user engagement and sales team motivation.

---

## 5. CONFIGURABLE CONTACT PAGE LAYOUT (from Monica)

**Pattern**: Let users customize which sections appear on a contact detail page.

**How Monica Does It**:
- `Module` — defines available sections (notes, reminders, tasks, calls, relationships, goals, etc.)
- `Template` — defines which modules show on contact pages
- `TemplatePage` — pages within a template, with positions
- Users can show/hide modules per contact or globally

**What We Should Build**:
- A layout configuration system for entity detail pages
- Users pick which widgets/sections they see
- Save as templates per role or user

**Priority**: MEDIUM — Improves customization.

---

## 6. MULTI-PIPELINE MANAGEMENT (from EspoCRM + Twenty)

**Pattern**: Multiple sales pipelines for different products/divisions.

**What We Should Build**:
```
Pipeline { id, name, entity_type(deal/lead/ticket), is_default, tenant_id }
PipelineStage { id, pipeline_id, name, color, probability, position, 
  is_won, is_lost }
```
- Each deal belongs to one pipeline
- Different stages per pipeline
- Kanban view per pipeline

**Priority**: HIGH — Essential for companies with multiple products.

---

## 7. DATABASE VIEWS FOR PERFORMANCE (from AtomicCRM)

**Pattern**: Use PostgreSQL views and materialized views for complex aggregated queries.

**How AtomicCRM Does It**:
- `contacts_summary` view — joins contacts with aggregated task counts, deal info
- `companies_summary` view — aggregated company data
- Reduces N+1 queries and HTTP overhead
- Frontend queries views directly via PostgREST

**What We Should Build**:
- Create views for: `lead_summary`, `deal_summary`, `campaign_summary`, `agent_performance`
- Consider materialized views for dashboard data
- Refresh strategies: trigger-based or periodic

**Priority**: HIGH — Performance optimization for dashboards.

---

## 8. AUDIT TRAIL & ACTIVITY TIMELINE (from YetiForce + Twenty)

**Pattern**: Track every change to every record with a unified timeline.

**YetiForce Has**:
- `AuditRegister` — complete change audit
- `ActivityRegister` — activity logging  
- `ModTracker` — module-level modification tracking
- `DataSetRegister` — data change sets

**Twenty Has**:
- `Timeline` module — unified activity feed per entity
- Shows all interactions in chronological order

**What We Should Build**:
```
AuditLog { id, entity_type, entity_id, action(create/update/delete),
  old_values(json), new_values(json), changed_by, changed_at, 
  ip_address, tenant_id }
ActivityTimeline { id, entity_type, entity_id, activity_type(call/email/note/deal_update/etc),
  description, metadata(json), user_id, created_at, tenant_id }
```

**Priority**: HIGH — Critical for compliance and user experience.

---

## 9. RECYCLE BIN / SOFT DELETE RECOVERY (from YetiForce)

**Pattern**: Let users recover accidentally deleted records.

**How YetiForce Does It**:
- `RecycleBin` module — deleted records go here
- Users can restore or permanently delete
- Auto-purge after configurable retention period

**What We Should Build**:
- All entity deletes are soft-deletes (`deleted_at` timestamp)
- Recycle Bin page showing recently deleted items
- Bulk restore and permanent delete
- Auto-purge after 30/60/90 days (configurable per tenant)

**Priority**: MEDIUM — Important for data safety.

---

## 10. MERGE/DEDUPLICATION ENGINE (from CiviCRM + SuiteCRM)

**Pattern**: Find and merge duplicate contacts.

**How CiviCRM Does It**:
- `Dedupe` module — rule-based deduplication
- Configurable matching rules (email, phone, name similarity)
- Side-by-side comparison view
- Merge with field-by-field selection
- Batch deduplication

**SuiteCRM**:
- `MergeRecords` module — manual merge UI

**What We Should Build**:
```
DedupeRule { id, entity_type, name, field_rules(json), threshold, tenant_id }
// field_rules: [{field: "email", weight: 100, match_type: "exact"}, 
//              {field: "name", weight: 80, match_type: "fuzzy"}]
DedupePair { id, entity_type, entity_a_id, entity_b_id, 
  similarity_score, status(pending/merged/dismissed), resolved_by, tenant_id }
```

**Priority**: HIGH — Critical for data quality.

---

## 11. NUMBER SEQUENCE GENERATION (from FreeCRM)

**Pattern**: Auto-generate sequential numbers for invoices, quotes, orders.

**How FreeCRM Does It**:
- `NumberSequence` entity — prefix, suffix, current number
- Auto-incrementing per entity type
- Format: `INV-2026-00001`, `QUO-2026-00001`

**What We Should Build**:
```
NumberSequence { id, entity_type, prefix, suffix, pad_length, 
  current_number, format_pattern, tenant_id }
// format_pattern: "{prefix}-{year}-{number}"
```

**Priority**: HIGH — Essential for invoicing and quotes.

---

## 12. SAVED VIEWS / CUSTOM VIEWS (from SuiteCRM + vTiger + Twenty)

**Pattern**: Let users save filtered/sorted list configurations.

**What We Should Build**:
```
SavedView { id, name, entity_type, filters(json), columns(json), 
  sort(json), is_default, is_shared, user_id, tenant_id }
// filters: [{field: "status", operator: "eq", value: "active"}]
// columns: ["name", "email", "status", "created_at"]
// sort: [{field: "created_at", direction: "desc"}]
```

**Priority**: HIGH — Huge productivity feature.

---

## 13. PORTAL SYSTEM (from EspoCRM + vTiger)

**Pattern**: Customer-facing portal where clients can log in, view their data, submit tickets.

**What We Should Build**:
- Separate authentication for portal users (customer accounts)
- Limited data access — customers see only their own tickets, invoices, documents
- Ticket submission and tracking
- Invoice viewing and payment
- Knowledge base access

**Priority**: MEDIUM — Differentiator for SaaS CRM.

---

## 14. BUSINESS HOURS & WORKING TIME (from EspoCRM + SuiteCRM + DaybydayCRM)

**Pattern**: Define business hours per team/department for SLA calculations and availability.

**What We Should Build**:
```
BusinessHour { id, name, timezone, is_default, tenant_id }
BusinessHourSlot { id, business_hour_id, day_of_week(0-6), 
  is_working_day, start_time, end_time }
Holiday { id, business_hour_id, name, date, is_recurring }
```

**Priority**: HIGH — Required for proper SLA enforcement.

---

## 15. EVENT-DRIVEN ARCHITECTURE (from Twenty + Corteza)

**Pattern**: Decouple services using events.

**Twenty uses**: BullMQ for background jobs, Redis for pub/sub
**Corteza uses**: Event-driven automation with triggers

**What We Should Build**:
- Event bus using BullMQ/Redis
- Standard event types: `entity.created`, `entity.updated`, `entity.deleted`
- Webhook delivery for external consumers
- Event history and replay

**Priority**: HIGH — Foundation for all automation.
