# 📊 SCHEMA EXTRACTION — ALL 17 CRMs

> Every entity, table, model extracted and mapped to unified schema recommendations.

---

## COMBINED ENTITY MAP — All 17 CRMs

### Core CRM Entities (Present in 10+ CRMs)

| Entity | Present In | Our Status | Priority |
|--------|-----------|------------|----------|
| **Contact** | ALL 17 | ✅ Built | — |
| **Company/Account** | 16/17 | ✅ Built (Lead has company) | — |
| **Lead** | 15/17 | ✅ Built | — |
| **Deal/Opportunity** | 15/17 | ✅ Built | — |
| **Task** | 14/17 | ✅ Built | — |
| **Note** | 13/17 | ✅ Built | — |
| **Campaign** | 13/17 | ✅ Built | — |
| **Email** | 12/17 | 🟡 Partial | HIGH |
| **User/Team** | ALL 17 | ✅ Built | — |
| **Tag** | 10/17 | ✅ Built (on Lead) | — |
| **Document/Attachment** | 12/17 | 🟡 Partial | MEDIUM |
| **Calendar/Meeting** | 11/17 | ❌ Missing | HIGH |
| **Call** | 8/17 | ✅ Built | — |

### Business Operations (Present in 5-9 CRMs)

| Entity | Present In | Our Status | Priority |
|--------|-----------|------------|----------|
| **Invoice** | SuiteCRM, DaybydayCRM, FreeCRM, vTiger, YetiForce | ❌ Missing | HIGH |
| **Quote/Proposal** | SuiteCRM, vTiger, Krayin, X2CRM, YetiForce, FreeCRM | ✅ Built | — |
| **Product** | SuiteCRM, vTiger, Krayin, X2CRM, YetiForce, FreeCRM, Django, DaybydayCRM, Zurmo | ❌ Missing entity | HIGH |
| **Payment** | DaybydayCRM, Django, YetiForce | ❌ Missing | HIGH |
| **Sales Order** | vTiger, FreeCRM, YetiForce | ❌ Missing | MEDIUM |
| **Purchase Order** | vTiger, FreeCRM, YetiForce | ❌ Missing | MEDIUM |
| **Vendor/Supplier** | vTiger, FreeCRM, YetiForce | ❌ Missing | MEDIUM |
| **Contract** | SuiteCRM, YetiForce | ❌ Missing | MEDIUM |
| **Project** | SuiteCRM, DaybydayCRM, YetiForce | ❌ Missing entity | MEDIUM |
| **Knowledge Base/FAQ** | EspoCRM, SuiteCRM, YetiForce, vTiger | ✅ Built | — |
| **Case/Ticket** | EspoCRM, SuiteCRM, OroCRM, CiviCRM | ✅ Built | — |
| **Report** | SuiteCRM, vTiger, X2CRM, Zurmo, OroCRM | 🟡 Built basic | MEDIUM |

### Advanced/Niche Entities (Present in 1-4 CRMs)

| Entity | Found In | Our Status | Value |
|--------|----------|------------|-------|
| **Inventory (Goods Receipt/Dispatch/Storage)** | YetiForce | ❌ Missing | HIGH |
| **Bookkeeping/GL** | YetiForce | ❌ Missing | HIGH |
| **PriceBook** | vTiger, YetiForce | ❌ Missing | MEDIUM |
| **Service Contract/SLA** | YetiForce | ❌ Missing | MEDIUM |
| **Budget** | FreeCRM | ❌ Missing | MEDIUM |
| **Expense** | FreeCRM | ❌ Missing | MEDIUM |
| **Absence/Leave** | DaybydayCRM, YetiForce | ❌ Missing | MEDIUM |
| **Appointment** | DaybydayCRM | ❌ Missing | MEDIUM |
| **Business Hours** | EspoCRM, SuiteCRM, DaybydayCRM | ❌ Missing | HIGH |
| **Survey** | SuiteCRM | ❌ Missing | LOW |
| **Membership** | CiviCRM | ❌ Missing | LOW |
| **Pledge/Contribution** | CiviCRM | ❌ Missing | LOW |
| **Event (physical)** | SuiteCRM, CiviCRM | ❌ Missing | MEDIUM |
| **Relationship Types** | Monica | ❌ Missing | MEDIUM |
| **Life Events** | Monica | ❌ Missing | LOW |
| **Gamification** | Zurmo | ❌ Missing | MEDIUM |
| **Competition** | YetiForce | ❌ Missing | MEDIUM |
| **Multi-Company** | YetiForce | ❌ Missing | HIGH |
| **Mileage Logbook** | YetiForce | ❌ Missing | LOW |
| **Letters In/Out** | YetiForce | ❌ Missing | LOW |
| **Reservation** | YetiForce | ❌ Missing | LOW |
| **Custom Objects** | Twenty | ❌ Missing | CRITICAL |

---

## ATOMIC CRM — Supabase Schema (Complete)

```sql
-- companies (17 columns)
companies: id, created_at, name, sector, size, linkedin_url, website, 
  phone_number, address, zipcode, city, state_abbr, sales_id, 
  context_links(json), country, description, revenue, tax_identifier, logo(jsonb)

-- contacts (17 columns)  
contacts: id, first_name, last_name, gender, title, background, avatar(jsonb),
  first_seen, last_seen, has_newsletter, status, tags(bigint[]), company_id,
  sales_id, linkedin_url, email_jsonb(jsonb), phone_jsonb(jsonb)

-- contact_notes
contact_notes: id, contact_id, text, date, sales_id, status, attachments(jsonb[])

-- deals (14 columns)
deals: id, name, company_id, contact_ids(bigint[]), category, stage, 
  description, amount, created_at, updated_at, archived_at,
  expected_closing_date, sales_id, index

-- deal_notes
deal_notes: id, deal_id, type, text, date, sales_id, attachments(jsonb[])

-- sales (users)
sales: id, first_name, last_name, email, administrator, user_id(uuid), 
  avatar(jsonb), disabled

-- tags
tags: id, name, color

-- tasks
tasks: id, contact_id, type, text, due_date, done_date, sales_id

-- configuration (singleton)
configuration: id(=1), config(jsonb)

-- Database Views used:
-- contacts_summary: aggregated contact + task counts
-- companies_summary: aggregated company data

-- Triggers:
-- auth.users → sales table sync
```

---

## TWENTY CRM — Server Module Entities

```
Core Workspace:
  workspace, workspace_member, api_key, connected_account

CRM:
  company, person, opportunity (with pipeline stages)
  
Communication:
  messaging (threads, messages, participants)
  calendar (events, attendees, channels)
  
Organization:
  favorite, favorite_folder
  note, attachment, task
  
Metadata System:
  object_metadata, field_metadata, relation_metadata
  view, view_field, view_filter, view_sort
  
Analytics:
  timeline (events), dashboard
  
Automation:
  workflow (triggers, actions, conditions)
  
Security:
  blocklist
  contact_creation_manager
```

---

## FREE-CRM — .NET Domain Entities (Clean Architecture)

```csharp
// Core Entities
Company { Id, Name, /* details */ }
Customer { Id, Name, CustomerCategory, CustomerGroup, CustomerContacts[] }
Lead { Id, Name, LeadContacts[], LeadActivities[] }
Vendor { Id, Name, VendorCategory, VendorGroup, VendorContacts[] }

// Sales
SalesOrder { Id, Number, Customer, SalesOrderItems[] }
SalesOrderItem { Id, Product, Quantity, UnitPrice, Total }
SalesRepresentative { Id, Name, SalesTeam }
SalesTeam { Id, Name, Members[] }

// Purchasing
PurchaseOrder { Id, Number, Vendor, PurchaseOrderItems[] }
PurchaseOrderItem { Id, Product, Quantity, UnitPrice, Total }

// Product & Inventory  
Product { Id, Name, Price, ProductGroup, UnitMeasure }
ProductGroup { Id, Name }
UnitMeasure { Id, Name }

// Finance
Budget { Id, Name, Amount }
Expense { Id, Name, Amount, Category }
Tax { Id, Name, Rate }
NumberSequence { Id, Prefix, NextNumber } // auto-numbering

// Files
FileDocument { Id, Name, FilePath }
FileImage { Id, Name, ImagePath }

// Tasks
Todo { Id, Title, TodoItems[] }
TodoItem { Id, Description, Done }
```

---

## DJANGO-CRM — Models (Comprehensive Deal Tracking)

```python
# Deal with rich stage tracking
Deal:
  name, next_step, next_step_date, description, workflow
  stage (FK → Stage), stages_dates (text log)
  closing_date, win_closing_date
  amount, currency (FK), probability
  ticket (unique), city, country
  lead (FK), contact (FK), request (FK), company (FK)
  partner_contact (FK), co_owner (FK)
  relevant, active, important, is_new, remind_me
  tags (M2M)

# Stage with workflow flags
Stage:
  name, default, second_default, success_stage
  conditional_success_stage, goods_shipped

# Payment tracking  
Payment:
  deal (FK), amount, currency, payment_date
  status (received/guaranteed/high_prob/low_prob)
  contract_number, invoice_number, order_number
  through_representation

# Currency with exchange rates
Currency:
  name, rate_to_state_currency, rate_to_marketing_currency
  is_state_currency, is_marketing_currency, auto_update

Rate:
  currency (FK), payment_date
  rate_to_state_currency, rate_to_marketing_currency
  rate_type (approximate/official)

# Closing Reason
ClosingReason:
  name, index_number, success_reason

# Lead Source with web forms
LeadSource:
  name, department, email, uuid
  form_template, success_template
```

---

## DAYBYDAYCRM — Key Models

```
Client: name, company_name, vat, email, phone, address, industry, 
        primary_number, secondary_number, user_id

Invoice: status, sent_at, due_date, client_id, source_type/id
InvoiceLine: title, comment, quantity, price, type, invoice_id
CreditNote/CreditLine: reverse of invoice

Payment: payment_date, amount, payment_source, description, invoice_id

Project: title, description, status, deadline, client_id, user_id
Task: title, description, status, deadline, user_id, client_id, project_id

Appointment: title, start_date, end_date, color, user_id, client_id, source_type/id
BusinessHour: day_of_week, open_time, close_time

Absence: reason, start_date, end_date, user_id, comment

Lead: title, description, status, user_id, client_id, deadline, 
      qualified (boolean)

Offer: title, description, status, client_id, amount

Product: name, description, price, external_invoice_id

Document: name, size, path, source_type/id

Activity: text, user_id, source_type/id (polymorphic activity feed)
Comment: description, user_id, source_type/id (polymorphic comments)
```

---

## MONICA — Unique Models (Relationship CRM)

```
Contact: first_name, last_name, can_be_deleted, vault_id, gender_id, pronoun_id, etc.
ContactImportantDate: contact_id, type_id, label, day, month, year
ContactInformation: contact_id, type_id, data (phone/email/social)
ContactReminder: contact_id, label, day, month, year, type, frequency_number, frequency_type
ContactTask: contact_id, label, description, completed, completed_at, due_at

RelationshipType: name, name_reverse_relationship, type
RelationshipGroupType: name, type (love, family, friend, work)

LifeEvent: contact_id, life_event_type_id, summary, description, happened_at, costs
LifeEventCategory: label (eg: Hobbies, Education, Home, Health)
LifeEventType: life_event_category_id, label, position

Journal: vault_id, title, description, date, slice_of_life_id
JournalMetric: vault_id, label, unit (eg: "Weight", "kg")
PostMetric: journal_metric_id, post_id, value

Goal: contact_id, name, active
Streak: contact_id, label, streak_count, last_activity_at

MoodTrackingEvent: vault_id, mood_tracking_parameter_id, rated_at, note, number_of_hours_slept
MoodTrackingParameter: vault_id, label, hex_color

Loan: contact_id, type(loan_to/loan_from), name, description, amount_lent, currency_id
Pet: contact_id, pet_category_id, name
Gift: contact_id, occasion_id, name, url, amount, currency_id, state(idea/searching/bought/offered)

Module: account_id, type (notes, feed, reminders, loans, relationships, tasks, calls, pets, goals, groups, addresses, contact_information)
Template: account_id, name (defines which modules show on contact pages)
TemplatePage: template_id, name, position, type, can_be_deleted
```

---

## YETIFORCE — Inventory System Tables

```
IStorages: warehouse/storage locations
IGRN: Internal Goods Received Note (inbound)
IGDN: Internal Goods Dispatched Note (outbound)  
IGIN: Internal Goods Issue Note
IGRNC: Goods Received Note Correction
IGDNC: Goods Dispatched Note Correction
IIDN: Internal Delivery Note
IPreOrder: Pre-Order management
ISTDN: Sub-Transfer Dispatch Note
ISTN: Sub-Transfer Note
ISTRN: Sub-Transfer Receipt Note
```

---

## YETIFORCE — Finance System Tables

```
FBookkeeping: General bookkeeping entries
FInvoice: Standard invoices
FInvoiceCost: Cost invoices (expenses)
FInvoiceProforma: Proforma invoices
FCorectingInvoice: Correcting/credit invoices
PaymentsIn: Incoming payments
PaymentsOut: Outgoing payments
BankAccounts: Bank account management
```

---

## CIVICRM — Financial/Membership Tables

```
Membership: contact_id, membership_type_id, start_date, end_date, status
MembershipType: name, duration_unit, duration_interval, period_type, auto_renew
MembershipPayment: membership_id, contribution_id

Contribution: contact_id, financial_type_id, payment_instrument_id, 
  total_amount, fee_amount, net_amount, receipt_date, is_test, is_pay_later

Pledge: contact_id, amount, currency, frequency_unit, frequency_interval,
  start_date, create_date, original_installment_amount, installments

Event: title, summary, description, event_type_id, start_date, end_date,
  max_participants, registration_link_text, is_monetary, financial_type_id

Participant: contact_id, event_id, status_id, role_id, register_date, 
  fee_level, fee_amount, fee_currency
```

---

## RECOMMENDED NEW TABLES FOR KARAN SAAS

Based on analysis of all 17 CRMs, these are the tables we should ADD to our Prisma schema:

### Priority 1 (Critical — Found in 8+ CRMs)
```
Product { id, name, description, sku, price, currency, type(goods/service), 
  category_id, unit_of_measure, on_sale, tenant_id }
ProductCategory { id, name, description, tenant_id }
Invoice { id, number, status, issue_date, due_date, total, tax, discount,
  client_id, deal_id, tenant_id }
InvoiceLine { id, invoice_id, product_id, description, quantity, unit_price, 
  total, tax_rate }
Payment { id, invoice_id, amount, currency, payment_date, payment_method,
  status(received/pending/failed), reference, tenant_id }
CalendarEvent { id, title, start, end, all_day, location, description,
  event_type, recurrence, user_id, tenant_id }
Meeting { id, title, start, end, location, description, status, 
  organizer_id, call_id, tenant_id }
MeetingParticipant { id, meeting_id, user_id, contact_id, status }
BusinessHour { id, day_of_week, open_time, close_time, timezone, tenant_id }
Company { id, name, industry, website, phone, email, address, city, state,
  country, size, revenue, description, logo, tenant_id }
```

### Priority 2 (High — Found in 5+ CRMs) 
```
SalesOrder { id, number, status, customer_id, total, tax, discount, 
  order_date, delivery_date, tenant_id }
SalesOrderItem { id, order_id, product_id, quantity, unit_price, total }
PurchaseOrder { id, number, status, vendor_id, total, order_date, tenant_id }
PurchaseOrderItem { id, order_id, product_id, quantity, unit_price, total }
Vendor { id, name, email, phone, address, category, tenant_id }
Contract { id, name, status, start_date, end_date, value, 
  customer_id, renewal_date, auto_renew, tenant_id }
Project { id, name, description, status, start_date, end_date, 
  client_id, budget, tenant_id }
ProjectMilestone { id, project_id, name, due_date, status }
Document { id, name, file_path, file_size, mime_type, source_type, 
  source_id, uploaded_by, tenant_id }
EmailTemplate { id, name, subject, body_html, body_text, variables, tenant_id }
CustomView { id, name, entity_type, filters(json), columns(json), 
  sort(json), user_id, is_default, tenant_id }
```

### Priority 3 (Medium — Differentiating Features)
```
Announcement { id, title, body, status, publish_date, expire_date, tenant_id }
Competitor { id, name, website, strengths, weaknesses, notes, tenant_id }
Appointment { id, title, start_date, end_date, status, color, 
  user_id, contact_id, tenant_id }
Absence { id, user_id, type, start_date, end_date, reason, status, tenant_id }
ClosingReason { id, name, is_success, sort_order, tenant_id }
LeadSource { id, name, uuid, form_template, department_id, tenant_id }
NumberSequence { id, entity_type, prefix, next_number, tenant_id }
GamificationPoint { id, user_id, points, reason, created_at }
GamificationBadge { id, name, description, icon, criteria, points_required }
UserBadge { id, user_id, badge_id, earned_at }
Reservation { id, resource_type, resource_id, start_date, end_date, 
  user_id, status, tenant_id }
```
