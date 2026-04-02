# ✅ THE BIG TODO — Every Feature We Must Build

> Prioritized list of ALL features extracted from 17 CRMs that we need to implement.
> Based on: frequency across CRMs, business value, and gap in our current platform.

---

## 🔴 PRIORITY 1: CRITICAL (Must Have — Found in 10+ CRMs)

### 1.1 Company/Account Entity (Standalone)
- **Source**: ALL 17 CRMs have standalone Company/Account entity
- **Current**: We have company_name on Lead but NO standalone Company model
- **TODO**:
  - [ ] Create `Company` Prisma model (name, industry, website, phone, email, address, city, state, country, size, revenue, description, logo, linkedin_url, tax_identifier, tenantId)
  - [ ] Create NestJS `companies` module (CRUD controller + service)
  - [ ] Create Companies list page (frontend)
  - [ ] Create Company detail page with linked Leads, Deals, Contacts
  - [ ] Add company-to-lead linking (FK)
  - [ ] Add company-to-deal linking (FK)

### 1.2 Product Catalog
- **Source**: SuiteCRM, vTiger, Krayin, X2CRM, YetiForce, FreeCRM, Django, DaybydayCRM, Zurmo (9/17)
- **Current**: ❌ No product entity
- **TODO**:
  - [ ] Create `Product` model (name, sku, description, price, currency, type[goods/service], category_id, unit_of_measure, on_sale, tenantId)
  - [ ] Create `ProductCategory` model (name, description, parent_id, tenantId)
  - [ ] Create NestJS `products` module
  - [ ] Create Products list + detail pages
  - [ ] Link products to quotes/deals

### 1.3 Invoicing System
- **Source**: SuiteCRM, DaybydayCRM, FreeCRM, vTiger, YetiForce, CiviCRM (6/17)
- **Current**: ❌ No invoice entity
- **TODO**:
  - [ ] Create `Invoice` model (number, status[draft/sent/paid/overdue/cancelled], issue_date, due_date, subtotal, tax_amount, discount_amount, total, notes, client_id, deal_id, tenantId)
  - [ ] Create `InvoiceLine` model (invoice_id, product_id, description, quantity, unit_price, tax_rate, total)
  - [ ] Create NumberSequence model for auto-numbering (INV-2026-00001)
  - [ ] Create NestJS `invoices` module
  - [ ] Create Invoice list + detail + PDF generation pages
  - [ ] Create Invoice PDF template (reuse existing PDF logic if any)
  - [ ] Add invoice status workflow (draft → sent → paid → overdue)

### 1.4 Payment Tracking
- **Source**: DaybydayCRM, Django-CRM, YetiForce, CiviCRM (4/17 + essential for invoicing)
- **Current**: ❌ No payment entity
- **TODO**:
  - [ ] Create `Payment` model (invoice_id, amount, currency, payment_date, payment_method[cash/bank/card/online], status[received/pending/failed], reference, notes, tenantId)
  - [ ] Create NestJS `payments` module
  - [ ] Create Payment list + recording pages
  - [ ] Link payments to invoices (auto-update invoice status when fully paid)
  - [ ] Payment summary dashboard widget

### 1.5 Calendar & Meetings
- **Source**: EspoCRM, SuiteCRM, vTiger, DaybydayCRM, Corteza, Twenty, Zurmo, X2CRM, Monica, YetiForce (10/17)
- **Current**: ❌ No calendar entity
- **TODO**:
  - [ ] Create `CalendarEvent` model (title, description, start_datetime, end_datetime, all_day, location, event_type[meeting/call/task/reminder], color, recurrence_rule, user_id, tenantId)
  - [ ] Create `EventAttendee` model (event_id, user_id, contact_id, status[pending/accepted/declined])
  - [ ] Create NestJS `calendar` module
  - [ ] Create Calendar page (month/week/day views)
  - [ ] Create Event creation/edit modal
  - [ ] Integrate with existing Call and Task entities
  - [ ] Add iCal export support

### 1.6 Email Templates
- **Source**: EspoCRM, SuiteCRM, Krayin, YetiForce, X2CRM, Zurmo (6/17)
- **Current**: ❌ No email template entity
- **TODO**:
  - [ ] Create `EmailTemplate` model (name, subject, body_html, body_text, category, variables[json], is_active, tenantId)
  - [ ] Create NestJS `email-templates` module
  - [ ] Create Template editor page (rich text with variable insertion)
  - [ ] Create template preview
  - [ ] Variable replacement engine ({{lead.name}}, {{deal.amount}}, etc.)

### 1.7 Custom Fields System
- **Source**: Twenty, EspoCRM, SuiteCRM, Corteza, Krayin, Monica, CiviCRM, X2CRM, YetiForce, vTiger, FatFree (11/17)
- **Current**: ❌ No custom fields
- **TODO**:
  - [ ] Create `CustomField` model (entity_type, name, label, field_type[text/number/date/select/multiselect/boolean/url/email/phone], options[json], is_required, default_value, position, tenantId)
  - [ ] Create `CustomFieldValue` model (custom_field_id, entity_type, entity_id, value[json])
  - [ ] Create NestJS `custom-fields` module
  - [ ] Create Custom Fields settings page (add/edit/delete fields per entity)
  - [ ] Render custom fields dynamically on entity detail pages
  - [ ] Include custom fields in search and filters

### 1.8 Business Hours
- **Source**: EspoCRM, SuiteCRM, DaybydayCRM, YetiForce (4/17 + essential for SLA)
- **Current**: ❌ No business hours
- **TODO**:
  - [ ] Create `BusinessHours` model (name, timezone, is_default, tenantId)
  - [ ] Create `BusinessHourSlot` model (business_hours_id, day_of_week, is_working_day, open_time, close_time)
  - [ ] Create `Holiday` model (business_hours_id, name, date, is_recurring_annually)
  - [ ] Create Settings page for business hours configuration
  - [ ] Integrate with SLA due date calculation

---

## 🟠 PRIORITY 2: HIGH (Should Have — Found in 5-9 CRMs)

### 2.1 Document Management
- **Source**: EspoCRM, SuiteCRM, DaybydayCRM, vTiger, YetiForce (5/17)
- **Current**: ❌ No document entity (only MinIO storage service exists)
- **TODO**:
  - [ ] Create `Document` model (name, description, file_path, file_size, mime_type, file_url, source_type, source_id, folder_id, uploaded_by, tenantId)
  - [ ] Create `DocumentFolder` model (name, parent_id, tenantId)
  - [ ] Create NestJS `documents` module
  - [ ] Create Documents page with folder tree
  - [ ] Create upload UI with drag-and-drop
  - [ ] Link documents to leads, deals, contacts
  - [ ] Integrate with MinIO for actual storage

### 2.2 Saved Views / Custom Views
- **Source**: SuiteCRM, vTiger, Twenty, YetiForce (4/17, but highly valuable)
- **Current**: ❌ No saved views
- **TODO**:
  - [ ] Create `SavedView` model (name, entity_type, filters[json], columns[json], sort_by[json], is_default, is_shared, created_by, tenantId)
  - [ ] Create backend API for CRUD
  - [ ] Create View selector dropdown on all list pages
  - [ ] Create "Save Current View" button
  - [ ] Create "Share View" functionality
  - [ ] Make default views configurable per user + per team

### 2.3 Sales Orders 
- **Source**: vTiger, FreeCRM, YetiForce (3/17 but critical for commerce)
- **TODO**:
  - [ ] Create `SalesOrder` model (number, status, customer_id, order_date, delivery_date, subtotal, tax, discount, total, notes, tenantId)
  - [ ] Create `SalesOrderItem` model (order_id, product_id, description, quantity, unit_price, discount, tax_rate, total)
  - [ ] Create NestJS `sales-orders` module
  - [ ] Create Sales Order pages

### 2.4 Purchase Orders
- **Source**: vTiger, FreeCRM, YetiForce (3/17)
- **TODO**:
  - [ ] Create `PurchaseOrder` model (number, status, vendor_id, order_date, expected_date, subtotal, tax, total, notes, tenantId)
  - [ ] Create `PurchaseOrderItem` model (order_id, product_id, description, quantity, unit_price, total)
  - [ ] Create NestJS `purchase-orders` module
  - [ ] Create Purchase Order pages

### 2.5 Vendor Management
- **Source**: vTiger, FreeCRM, YetiForce (3/17)
- **TODO**:
  - [ ] Create `Vendor` model (name, email, phone, website, address, category, payment_terms, notes, tenantId)
  - [ ] Create NestJS `vendors` module
  - [ ] Create Vendor list + detail pages
  - [ ] Link vendors to purchase orders

### 2.6 Contracts Module
- **Source**: SuiteCRM, YetiForce (2/17)
- **TODO**:
  - [ ] Create `Contract` model (name, number, type, status[draft/active/expired/terminated], start_date, end_date, value, renewal_date, auto_renew, customer_id, tenantId)
  - [ ] Create NestJS `contracts` module
  - [ ] Create Contract pages with renewal alerts

### 2.7 Project Management (Full)
- **Source**: SuiteCRM, DaybydayCRM, YetiForce (3/17)
- **Current**: ❌ No Project model (Task exists standalone)
- **TODO**:
  - [ ] Create `Project` model (name, description, status[not_started/in_progress/on_hold/completed/cancelled], start_date, end_date, client_id, budget, actual_cost, tenantId)
  - [ ] Create `ProjectMilestone` model (project_id, name, due_date, status)
  - [ ] Update existing Task model to optionally link to Project
  - [ ] Create Project list/detail/kanban pages
  - [ ] Create Gantt chart view (library: frappe-gantt or similar)
  - [ ] Create Project Templates (from SuiteCRM: AM_ProjectTemplates)

### 2.8 Merge / Deduplication
- **Source**: CiviCRM, SuiteCRM, AtomicCRM (3/17 but critical)
- **Current**: ❌ No dedup
- **TODO**:
  - [ ] Create `DedupeRule` model (entity_type, name, field_rules[json], threshold, tenantId)
  - [ ] Create `DedupePair` model (entity_type, entity_a_id, entity_b_id, similarity_score, status, resolved_by, tenantId)
  - [ ] Create deduplication service (fuzzy matching on name, exact on email/phone)
  - [ ] Create side-by-side merge UI
  - [ ] Create scheduled dedup scan job

### 2.9 Multi-Pipeline
- **Source**: EspoCRM, Twenty, Krayin (3/17 but essential)
- **Current**: ❌ Single pipeline only
- **TODO**:
  - [ ] Create `Pipeline` model (name, entity_type, is_default, tenantId)
  - [ ] Create `PipelineStage` model (pipeline_id, name, color, probability, position, is_won, is_lost)
  - [ ] Update Deal model to reference Pipeline
  - [ ] Create Pipeline settings page
  - [ ] Update Kanban board to support pipeline switching

### 2.10 Audit Trail
- **Source**: YetiForce, SuiteCRM, Twenty (3/17 but critical for compliance)
- **Current**: ❌ No audit logging
- **TODO**:
  - [ ] Create `AuditLog` model (entity_type, entity_id, action[create/update/delete], old_values[json], new_values[json], user_id, ip_address, user_agent, created_at, tenantId)
  - [ ] Create AuditLog interceptor/middleware in NestJS
  - [ ] Create Audit log viewer page (filterable by entity, user, date)
  - [ ] Create entity-level audit tab (show history of changes)

### 2.11 Closing Reasons (Win/Loss Analysis)
- **Source**: Django-CRM, SuiteCRM (2/17 but high value)
- **Current**: ❌ No closing reasons
- **TODO**:
  - [ ] Create `ClosingReason` model (name, is_success, sort_order, tenantId)
  - [ ] Add closing_reason_id FK to Deal model
  - [ ] Create closing reason prompt when deal is won/lost
  - [ ] Create Win/Loss analysis report

---

## 🟡 PRIORITY 3: MEDIUM (Differentiating Features)

### 3.1 Gamification Engine
- **Source**: Zurmo
- **TODO**:
  - [ ] Create gamification models (GamificationRule, UserPoints, Badge, UserBadge, Mission, UserMission)
  - [ ] Create points engine (award points on CRM actions)
  - [ ] Create Badge system
  - [ ] Create Leaderboard page
  - [ ] Create Mission/Challenge system

### 3.2 Web Forms (Lead Capture)
- **Source**: EspoCRM, Krayin, Django-CRM, Zurmo (4/17)
- **Current**: ❌ (we have landing pages but no embeddable forms)
- **TODO**:
  - [ ] Create `WebForm` model (name, entity_type, fields[json], redirect_url, notify_users, tenantId)
  - [ ] Create embeddable form generator (HTML/JS snippet)
  - [ ] Create form submission API endpoint
  - [ ] Auto-create lead from form submission
  - [ ] Create form builder UI

### 3.3 Customer Portal
- **Source**: EspoCRM, vTiger (2/17)
- **TODO**:
  - [ ] Create portal user model (separate from internal users)
  - [ ] Create portal login page
  - [ ] Create portal dashboard (my tickets, invoices, documents)
  - [ ] Create portal ticket submission
  - [ ] Create portal API with limited access scopes

### 3.4 Service Level Agreements (SLA)
- **Source**: YetiForce, EspoCRM (2/17)
- **Current**: 🟡 slaDueAt field exists but no engine
- **TODO**:
  - [ ] Create `SlaPolicy` model (name, priority_rules[json], tenantId)
  - [ ] Create `SlaRule` model (sla_policy_id, priority, first_response_time_minutes, resolution_time_minutes)
  - [ ] Create SLA calculation engine (respects business hours)
  - [ ] Create SLA breach alerts/notifications
  - [ ] Create SLA compliance report

### 3.5 Announcements
- **Source**: YetiForce
- **TODO**:
  - [ ] Create `Announcement` model (title, body, status, publish_date, expire_date, priority, created_by, tenantId)
  - [ ] Create announcement banner on dashboard
  - [ ] Create announcement management page (admin)
  - [ ] Create read tracking (mark as read)

### 3.6 Competition Tracking
- **Source**: YetiForce
- **TODO**:
  - [ ] Create `Competitor` model (name, website, strengths, weaknesses, market_share, notes, tenantId)
  - [ ] Create `DealCompetitor` model (deal_id, competitor_id, notes)
  - [ ] Create competitor list + profile pages
  - [ ] Link competitors to deals (competitive analysis per deal)

### 3.7 Import/Export Engine (Advanced)
- **Source**: ALL CRMs have import, most have export
- **Current**: ✅ Basic lead import exists
- **TODO**:
  - [ ] Create universal import engine for ALL entities (contacts, companies, deals, products)
  - [ ] CSV and Excel file support
  - [ ] Field mapping UI (drag-and-drop source → target)
  - [ ] Duplicate detection during import
  - [ ] Import preview and validation
  - [ ] Bulk export for all entities (CSV, Excel, PDF)
  - [ ] Scheduled data exports (daily/weekly)

### 3.8 Mass Email System
- **Source**: EspoCRM, SuiteCRM, CiviCRM, Django-CRM (4/17)
- **Current**: ❌
- **TODO**:
  - [ ] Create `MassEmailCampaign` model (name, subject, template_id, recipient_list_id, status, scheduled_at, sent_at, tenantId)
  - [ ] Create `EmailRecipientList` model (name, filters[json], tenantId)
  - [ ] Create `EmailSendLog` model (campaign_id, recipient_id, status[sent/delivered/opened/clicked/bounced], sent_at)
  - [ ] Create email campaign builder page
  - [ ] Create email analytics (open rates, click rates, bounce rates)
  - [ ] Integrate with email service (SendGrid/SES/SMTP)

### 3.9 Recycle Bin
- **Source**: YetiForce
- **TODO**:
  - [ ] Ensure all entity deletes are soft-deletes
  - [ ] Create Recycle Bin page showing deleted items
  - [ ] Create restore functionality
  - [ ] Create auto-purge scheduled job (configurable retention)

### 3.10 Relationship Types (Contact-to-Contact)
- **Source**: Monica
- **TODO**:
  - [ ] Create `RelationshipType` model (name, reverse_name, category[family/friend/work/other], tenantId)
  - [ ] Create `ContactRelationship` model (contact_a_id, contact_b_id, relationship_type_id)
  - [ ] Create relationship visualization on contact pages

---

## 🟢 PRIORITY 4: NICE TO HAVE (Unique Features from Individual CRMs)

### 4.1 Survey Engine (SuiteCRM)
- [ ] Create Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse models
- [ ] Create survey builder UI
- [ ] Create survey sharing (links, email embed)
- [ ] Create response analytics

### 4.2 Event Management (SuiteCRM + CiviCRM)
- [ ] Create Event model (name, type, start, end, location, capacity, registration_url)
- [ ] Create EventRegistration model
- [ ] Create event management pages

### 4.3 Geo Maps (SuiteCRM + YetiForce + Zurmo)
- [ ] Create map visualization for contacts/accounts by location
- [ ] Use OpenStreetMap/Mapbox
- [ ] Create trip routing for field sales

### 4.4 RSS/News Feed (YetiForce + Zurmo)
- [ ] Create RSS reader widget for dashboard
- [ ] Industry news feeds

### 4.5 Mileage Logbook (YetiForce)
- [ ] Create MileageLog model for field agents
- [ ] GPS-based auto-tracking

### 4.6 Reservations (YetiForce)
- [ ] Create Reservation model for meeting rooms, equipment, vehicles

### 4.7 Absence/Leave Management (DaybydayCRM + YetiForce)
- [ ] Create Absence model (user_id, type, start_date, end_date, reason, status[pending/approved/rejected])
- [ ] Create leave request/approval flow
- [ ] Calendar integration

### 4.8 Appointment Scheduling (DaybydayCRM)
- [ ] Create Appointment model with external booking link
- [ ] Availability detection based on calendar
- [ ] Scheduling page (like Calendly)

---

## 📊 SUMMARY COUNTS

| Priority | Feature Count | Estimated Tables |
|----------|--------------|-----------------|
| 🔴 Critical (P1) | 8 features | ~20 tables |
| 🟠 High (P2) | 11 features | ~25 tables |
| 🟡 Medium (P3) | 10 features | ~15 tables |
| 🟢 Nice to Have (P4) | 8 features | ~10 tables |
| **TOTAL** | **37 features** | **~70 tables** |

Combined with our existing 38 tables = **~108 tables** total (vs 152 planned).
The remaining ~44 tables come from Phase 5-7 (HR, Manufacturing, GPS, Email Server, SMS Gateway).
