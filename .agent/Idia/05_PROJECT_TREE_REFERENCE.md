# 🌳 Complete Project Tree Reference

> Full directory tree of every project in `C:\Users\arpit\OneDrive\Desktop\Saas` with descriptions, roles, and purposes of each file/folder. This is the definitive reference for understanding what exists in each project.

---

## Table of Contents

1. [ERPNext — Full ERP System](#1-erpnext)
2. [Evolution API — Messaging Platform](#2-evolution-api)
3. [n8n — Workflow Automation](#3-n8n)
4. [Twenty CRM — Open-Source CRM](#4-twenty-crm)
5. [Frappe Docker — Deployment Infrastructure](#5-frappe-docker)
6. [Traccar — GPS Tracking System](#6-traccar)
7. [Chatwoot — Customer Support Platform](#7-chatwoot)
8. [Jasmin — SMS Gateway](#8-jasmin)
9. [Frappe HR (HRMS) — HR & Payroll Platform](#9-frappe-hr-hrms)

---

## 1. ERPNext

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\erpnext`
**Tech**: Python (Frappe Framework), JavaScript, Vue.js | MariaDB/PostgreSQL
**Role**: Full enterprise resource planning — accounting, inventory, manufacturing, CRM, HR, projects, support, and more.

### Root Files

| File | Purpose |
|------|---------|
| `pyproject.toml` | Python project configuration, dependencies, build settings |
| `package.json` | Node.js dependencies for frontend build tools |
| `yarn.lock` | Locked dependency versions |
| `.eslintrc` | JavaScript linting rules |
| `.flake8` | Python linting (flake8) configuration |
| `.editorconfig` | Cross-editor formatting settings |
| `.pre-commit-config.yaml` | Git pre-commit hooks (linting, formatting before commit) |
| `.releaserc` | Semantic release configuration for versioning |
| `.mergify.yml` | Mergify bot config for auto-merging PRs |
| `codecov.yml` | Code coverage reporting configuration |
| `commitlint.config.js` | Commit message format enforcement |
| `crowdin.yml` | Crowdin translation sync configuration |
| `babel_extractors.csv` | Babel translation string extraction config |
| `CODEOWNERS` | GitHub code ownership for PR review |
| `README.md` | Project overview and setup instructions |
| `license.txt` | GPLv3 license |
| `SECURITY.md` | Security vulnerability reporting policy |
| `TRADEMARK_POLICY.md` | Logo and trademark usage rules |

### Module Structure: `erpnext/erpnext/`

Each module follows the Frappe convention:
```
module_name/
├── doctype/           # Data models (tables) — each has .json schema + .py logic + .js frontend
├── report/            # Custom reports (SQL, script, or query reports)
├── page/              # Custom full-page views
├── workspace/         # Workspace/sidebar navigation configs
├── dashboard_chart/   # Dashboard chart definitions
├── number_card/       # Dashboard number card definitions
├── module_onboarding/ # Guided onboarding steps for new users
├── onboarding_step/   # Individual onboarding step definitions
├── print_format/      # PDF/print templates for documents
├── frontend/               # HRMS PWA (Vue/Ionic/Vite)
├── roster/                 # Shift Scheduling App (Vue/Vite)
├── hrms/
│   ├── hr/                 # Core HR modules
│   ├── payroll/            # Core Payroll modules
│   ├── overrides/          # ERPNext master overrides (Employee, Project, etc.)
│   ├── regional/           # Compliance: India (IT/PF), UAE (Gratuity)
│   └── hooks.py            # Lifecycle hooks & integrations
├── notification/      # Automated email/notification triggers
├── web_form/          # Public-facing web forms
├── __init__.py        # Python module init
└── utils.py           # Shared utility functions
```

#### 💰 `accounts/` — Accounting & Finance Module (186 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/account/` | **Chart of Accounts** — hierarchical account tree (Asset, Liability, Equity, Income, Expense) |
| `doctype/gl_entry/` | **General Ledger Entry** — double-entry bookkeeping records, every transaction creates GL entries |
| `doctype/journal_entry/` | **Journal Entry** — manual accounting entries for adjustments, opening balances |
| `doctype/journal_entry_account/` | Line items within a journal entry |
| `doctype/journal_entry_template/` | Reusable templates for recurring journal entries |
| `doctype/sales_invoice/` | **Sales Invoice** — billing customers for goods/services, calculates taxes, creates GL |
| `doctype/sales_invoice_item/` | Line items on a sales invoice |
| `doctype/sales_invoice_payment/` | Payment records linked to sales invoices |
| `doctype/sales_invoice_advance/` | Advance payment adjustments against sales invoices |
| `doctype/sales_invoice_timesheet/` | Timesheet billing linked to sales invoices |
| `doctype/purchase_invoice/` | **Purchase Invoice** — recording bills from suppliers |
| `doctype/purchase_invoice_item/` | Line items on purchase invoices |
| `doctype/purchase_invoice_advance/` | Advance payment adjustments against purchase invoices |
| `doctype/payment_entry/` | **Payment Entry** — recording incoming/outgoing payments |
| `doctype/payment_entry_reference/` | Links payment to specific invoices |
| `doctype/payment_entry_deduction/` | Tax deductions in payments (TDS, withholding) |
| `doctype/payment_request/` | **Payment Request** — online payment link generation |
| `doctype/payment_order/` | Batch payment processing |
| `doctype/payment_reconciliation/` | **Bank Reconciliation** — matching payments to invoices |
| `doctype/payment_reconciliation_allocation/` | Allocation details in reconciliation |
| `doctype/payment_reconciliation_invoice/` | Invoice side of reconciliation |
| `doctype/payment_reconciliation_payment/` | Payment side of reconciliation |
| `doctype/payment_schedule/` | Installment payment schedules |
| `doctype/payment_term/` | Payment terms (Net 30, Net 60, etc.) |
| `doctype/payment_terms_template/` | Reusable payment terms templates |
| `doctype/payment_ledger_entry/` | **Payment Ledger** — tracks outstanding amounts |
| `doctype/payment_gateway_account/` | Online payment gateway configs (Stripe, PayPal, etc.) |
| `doctype/bank/` | **Bank master** — bank definitions |
| `doctype/bank_account/` | **Bank Account** — company bank accounts |
| `doctype/bank_account_type/` | Bank account type categorization |
| `doctype/bank_account_subtype/` | Further bank account categorization |
| `doctype/bank_transaction/` | **Bank Transaction** — imported bank statement lines |
| `doctype/bank_transaction_mapping/` | Rules for auto-matching bank transactions |
| `doctype/bank_transaction_payments/` | Links bank transactions to payments |
| `doctype/bank_clearance/` | Bank clearance (check clearing) |
| `doctype/bank_reconciliation_tool/` | Interactive bank reconciliation wizard |
| `doctype/bank_statement_import/` | CSV/OFX bank statement import |
| `doctype/bank_guarantee/` | Bank guarantee documents |
| `doctype/budget/` | **Budget** — departmental/project budget tracking |
| `doctype/budget_account/` | Budget line items per account |
| `doctype/budget_distribution/` | Monthly budget distribution percentages |
| `doctype/cost_center/` | **Cost Center** — profit center tracking |
| `doctype/cost_center_allocation/` | Cost center allocation rules |
| `doctype/fiscal_year/` | **Fiscal Year** — accounting period definitions |
| `doctype/fiscal_year_company/` | Multi-company fiscal year mapping |
| `doctype/finance_book/` | **Finance Book** — multiple depreciation/reporting books |
| `doctype/accounting_dimension/` | **Custom Accounting Dimensions** — flexible analytics dimensions |
| `doctype/accounting_period/` | Closed accounting periods (prevent backdating) |
| `doctype/pos_profile/` | **POS Profile** — point of sale terminal configs |
| `doctype/pos_invoice/` | **POS Invoice** — point of sale transactions |
| `doctype/pos_opening_entry/` | Cash register opening |
| `doctype/pos_closing_entry/` | Cash register closing & reconciliation |
| `doctype/pos_settings/` | Global POS configuration |
| `doctype/pricing_rule/` | **Pricing Rule** — conditional discounts (buy X get Y, volume discounts) |
| `doctype/promotional_scheme/` | Campaign-based pricing and product discount schemes |
| `doctype/coupon_code/` | **Coupon codes** for promotional discounts |
| `doctype/subscription/` | **Subscription** — recurring billing (auto-create invoices) |
| `doctype/subscription_plan/` | Subscription plan definitions |
| `doctype/subscription_settings/` | Global subscription configuration |
| `doctype/loyalty_program/` | **Loyalty Program** — reward points system |
| `doctype/loyalty_point_entry/` | Points earned/redeemed records |
| `doctype/dunning/` | **Dunning** — overdue payment reminder letters |
| `doctype/dunning_type/` | Dunning escalation types |
| `doctype/tax_category/` | Tax categorization |
| `doctype/tax_rule/` | Tax determination rules (which tax for which item/region) |
| `doctype/tax_withholding_category/` | **Tax Withholding (TDS)** — deducted at source |
| `doctype/item_tax_template/` | Per-item tax rate templates |
| `doctype/sales_taxes_and_charges/` | Sales tax line items |
| `doctype/sales_taxes_and_charges_template/` | Reusable sales tax templates |
| `doctype/purchase_taxes_and_charges/` | Purchase tax line items |
| `doctype/purchase_taxes_and_charges_template/` | Reusable purchase tax templates |
| `doctype/shipping_rule/` | **Shipping Rule** — shipping cost calculation rules |
| `doctype/invoice_discounting/` | Invoice factoring/discounting |
| `doctype/exchange_rate_revaluation/` | Multi-currency exchange rate adjustments |
| `doctype/period_closing_voucher/` | Year-end closing vouchers |
| `doctype/shareholder/` | Shareholder registry |
| `doctype/share_transfer/` | Share transfer records |
| `doctype/mode_of_payment/` | Payment mode definitions (Cash, Card, Bank Transfer) |
| `doctype/chart_of_accounts_importer/` | Import COA from CSV/standard templates |
| `doctype/cheque_print_template/` | Check/cheque printing templates |
| `doctype/process_deferred_accounting/` | Deferred revenue/expense recognition |
| `doctype/process_statement_of_accounts/` | Auto-email customer statements |
| `doctype/repost_accounting_ledger/` | Fix accounting ledger reposting |
| `doctype/repost_payment_ledger/` | Fix payment ledger reposting |
| `doctype/ledger_health/` | Accounting ledger health monitoring |
| `doctype/unreconcile_payment/` | Undo payment reconciliation |
| `doctype/currency_exchange_settings/` | Auto-fetch exchange rate settings |
| `doctype/cashier_closing/` | Cashier shift closing |
| `doctype/pegged_currencies/` | Fixed exchange rate currencies |
| `report/` | **50+ accounting reports**: Profit & Loss, Balance Sheet, Cash Flow, Trial Balance, General Ledger, Accounts Receivable/Payable, Budget Variance, Tax reports, POS Register, Sales/Purchase Register, etc. |
| `financial_report_template/` | Pre-built IFRS-standard financial report templates |
| `print_format/` | 17 print formats for invoices, journal vouchers, POS receipts |

#### 👥 `crm/` — Customer Relationship Management (27 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/lead/` | **Lead** — initial sales inquiry/prospect, source tracking, lead scoring |
| `doctype/opportunity/` | **Opportunity** — qualified sales deal with items, amount, stage tracking |
| `doctype/opportunity_item/` | Products/services being considered in an opportunity |
| `doctype/opportunity_lost_reason/` | Master list of reasons deals are lost |
| `doctype/opportunity_lost_reason_detail/` | Links lost reasons to specific opportunities |
| `doctype/opportunity_type/` | Opportunity categorization (sales, support, etc.) |
| `doctype/sales_stage/` | **Sales Stages** — pipeline stage definitions (Qualification → Proposal → Negotiation → Won) |
| `doctype/prospect/` | **Prospect** — company-level prospect (can have multiple leads) |
| `doctype/prospect_lead/` | Links leads to prospects |
| `doctype/prospect_opportunity/` | Links opportunities to prospects |
| `doctype/campaign/` | **Campaign** — marketing campaign master |
| `doctype/email_campaign/` | Automated email campaign execution |
| `doctype/campaign_email_schedule/` | Email sending schedule within campaigns |
| `doctype/contract/` | **Contract** — customer/supplier contracts with terms |
| `doctype/contract_template/` | Reusable contract templates |
| `doctype/contract_fulfilment_checklist/` | Contract milestone/deliverable tracking |
| `doctype/appointment/` | **Appointment** — customer meeting scheduling |
| `doctype/appointment_booking_settings/` | Online appointment booking configuration |
| `doctype/appointment_booking_slots/` | Available time slots for booking |
| `doctype/competitor/` | **Competitor** tracking |
| `doctype/competitor_detail/` | Competitor association in deals |
| `doctype/crm_note/` | Notes on CRM records |
| `doctype/crm_settings/` | Global CRM configuration |
| `doctype/market_segment/` | Market segment categorization |
| `report/` | **9 CRM reports**: Lead Details, Lead Conversion Time, Campaign Efficiency, Sales Pipeline Analytics, Opportunity Summary, Lost Opportunity, etc. |

#### 📦 `stock/` — Inventory & Stock Management (77 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/item/` | **Item Master** — product/service/asset definition with attributes, variants, pricing |
| `doctype/item_attribute/` | Item variant attributes (Color, Size, etc.) |
| `doctype/item_variant/` | Variant records per attribute combination |
| `doctype/item_barcode/` | Barcode assignments (EAN, UPC, etc.) |
| `doctype/item_price/` | **Item Price** — price records per price list (buying/selling) |
| `doctype/item_default/` | Default warehouse, expense account per item |
| `doctype/item_supplier/` | Preferred suppliers per item |
| `doctype/item_manufacturer/` | Item manufacturer info |
| `doctype/item_reorder/` | Auto reorder rules (min qty, reorder qty, warehouse) |
| `doctype/item_quality_inspection_parameter/` | Quality check parameters |
| `doctype/warehouse/` | **Warehouse** — stock storage locations (hierarchical tree) |
| `doctype/warehouse_type/` | Warehouse categorization (Stores, Transit, Manufacturing) |
| `doctype/batch/` | **Batch** — batch tracking with manufacture/expiry dates |
| `doctype/serial_no/` | **Serial Number** — individual unit tracking throughout lifecycle |
| `doctype/serial_and_batch_bundle/` | Bundled serial/batch selection for transactions |
| `doctype/stock_entry/` | **Stock Entry** — material movements (receipt, issue, transfer, manufacture) |
| `doctype/stock_entry_type/` | Stock entry categorization |
| `doctype/stock_ledger_entry/` | **Stock Ledger** — perpetual inventory ledger (qty, valuation for every movement) |
| `doctype/material_request/` | **Material Request** — internal requisition for stock/purchase |
| `doctype/delivery_note/` | **Delivery Note** — goods dispatched to customer |
| `doctype/delivery_trip/` | Delivery route planning with multiple stops |
| `doctype/purchase_receipt/` | **Purchase Receipt** — goods received from supplier |
| `doctype/shipment/` | Shipment tracking with parcel details |
| `doctype/packing_slip/` | Packing slip for shipments |
| `doctype/pick_list/` | **Pick List** — warehouse picking instructions for orders |
| `doctype/landed_cost_voucher/` | **Landed Cost** — distribute freight/duties to item cost |
| `doctype/price_list/` | **Price List** — buying/selling price lists per currency/region |
| `doctype/quality_inspection/` | **Quality Inspection** — incoming/outgoing quality checks |
| `doctype/quality_inspection_template/` | Reusable QC templates |
| `doctype/stock_reconciliation/` | **Stock Reconciliation** — physical stock count adjustment |
| `doctype/stock_reservation_entry/` | Reserve stock for specific sales orders |
| `doctype/putaway_rule/` | Automated put-away rules for receiving |
| `doctype/inventory_dimension/` | Custom inventory tracking dimensions |
| `doctype/stock_settings/` | Global stock configuration |
| `doctype/repost_item_valuation/` | Fix historical stock valuation |
| `doctype/stock_closing_entry/` | Period stock closing |
| `report/` | **35+ stock reports**: Stock Balance, Stock Ledger, Stock Ageing, Stock Projected, Serial/Batch Traceability, Warehouse Balance, Stock Analytics, etc. |

#### 🏭 `manufacturing/` — Manufacturing Module (47 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/bom/` | **Bill of Materials** — raw materials + operations to produce a finished good |
| `doctype/bom_item/` | Raw material line items in BOM |
| `doctype/bom_operation/` | Manufacturing operations in BOM (with time/cost) |
| `doctype/bom_scrap_item/` | Expected scrap/waste from production |
| `doctype/bom_creator/` | Visual BOM creation tool |
| `doctype/bom_update_tool/` | Bulk update BOM prices |
| `doctype/work_order/` | **Work Order** — production instruction to manufacture items |
| `doctype/work_order_item/` | Required raw materials for work order |
| `doctype/work_order_operation/` | Operations to perform in work order |
| `doctype/job_card/` | **Job Card** — individual operation execution on factory floor |
| `doctype/job_card_time_log/` | Time tracking per job card (start/stop times) |
| `doctype/job_card_item/` | Materials consumed during operation |
| `doctype/job_card_scheduled_time/` | Scheduled time for job cards |
| `doctype/production_plan/` | **Production Plan** — aggregate planning from sales orders |
| `doctype/master_production_schedule/` | Long-term production scheduling |
| `doctype/sales_forecast/` | Sales demand forecasting for planning |
| `doctype/workstation/` | **Workstation** — machines/stations on factory floor |
| `doctype/workstation_type/` | Workstation categorization |
| `doctype/workstation_cost/` | Operating cost per workstation |
| `doctype/operation/` | **Operation** master — defines manufacturing operations |
| `doctype/routing/` | Operation sequences (routing) |
| `doctype/manufacturing_settings/` | Global manufacturing configuration |
| `doctype/plant_floor/` | Visual plant floor layout |
| `doctype/downtime_entry/` | Machine/workstation downtime tracking |
| `doctype/blanket_order/` | Long-term blanket order agreements |
| `page/bom_comparison_tool/` | Interactive BOM comparison view |
| `page/visual_plant_floor/` | Visual factory floor management |
| `report/` | **20+ reports**: BOM Stock, Work Order Summary, Job Card Summary, Material Requirements, Production Analytics, etc. |

#### 🛒 `selling/` — Sales Module (18 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/customer/` | **Customer** — customer master with credit limits, territory, group |
| `doctype/customer_credit_limit/` | Per-company credit limit for customers |
| `doctype/quotation/` | **Quotation** — sales proposal/price quote to customers |
| `doctype/quotation_item/` | Line items with pricing on quotation |
| `doctype/sales_order/` | **Sales Order** — confirmed customer order |
| `doctype/sales_order_item/` | Ordered items with delivery schedule |
| `doctype/sales_team/` | Sales team member commission assignment |
| `doctype/product_bundle/` | **Product Bundle** — bundles/kits of items sold together |
| `doctype/installation_note/` | Post-delivery installation records |
| `doctype/selling_settings/` | Global selling configuration |
| `doctype/sms_center/` | SMS sending to customers |
| `page/point_of_sale/` | **Point of Sale** — retail checkout interface |
| `report/` | Sales funnel, quotation trends, sales analytics reports |

#### 🛍️ `buying/` — Procurement Module (20 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/supplier/` | **Supplier** — vendor/supplier master |
| `doctype/supplier_scorecard/` | **Supplier Scorecard** — evaluate supplier performance |
| `doctype/supplier_quotation/` | Supplier price quotations received |
| `doctype/purchase_order/` | **Purchase Order** — confirmed order to supplier |
| `doctype/purchase_order_item/` | Ordered items on PO |
| `doctype/request_for_quotation/` | **RFQ** — send quote requests to multiple suppliers |
| `doctype/buying_settings/` | Global buying configuration |
| `report/` | Purchase analytics, procurement tracker, supplier quotation comparison reports |

#### 📋 `projects/` — Project & Task Management (15 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/project/` | **Project** — project with cost tracking, % complete, status |
| `doctype/project_template/` | Project templates for quick creation with predefined tasks |
| `doctype/project_type/` | Project categorization |
| `doctype/project_update/` | Project status updates/notes |
| `doctype/project_user/` | Project team member assignments |
| `doctype/task/` | **Task** — individual work items with dependencies |
| `doctype/task_depends_on/` | Task dependency relationships |
| `doctype/task_type/` | Task categorization |
| `doctype/dependent_task/` | Reverse dependency tracking |
| `doctype/timesheet/` | **Timesheet** — time tracking against projects/tasks |
| `doctype/timesheet_detail/` | Individual time log entries |
| `doctype/activity_cost/` | Billing rates per activity type per employee |
| `doctype/activity_type/` | Activity categorization (development, design, meeting) |
| `doctype/projects_settings/` | Global project configuration |
| `report/` | Daily timesheet summary, delayed tasks, project summary reports |

#### 🔧 `support/` — Support & Helpdesk (11 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/issue/` | **Issue/Ticket** — customer support tickets |
| `doctype/issue_type/` | Issue categorization |
| `doctype/issue_priority/` | Priority levels (Urgent, High, Medium, Low) |
| `doctype/service_level_agreement/` | **SLA** — response/resolution time agreements |
| `doctype/service_level_priority/` | SLA times per priority level |
| `doctype/service_day/` | Working days for SLA calculation |
| `doctype/pause_sla_on_status/` | Statuses that pause SLA clock |
| `doctype/sla_fulfilled_on_status/` | Statuses that mark SLA as fulfilled |
| `doctype/warranty_claim/` | **Warranty Claim** — post-sale warranty requests |
| `doctype/support_settings/` | Global support configuration |
| `doctype/support_search_source/` | Knowledge base search sources |

#### 🏢 `assets/` — Asset Management (26 doctypes)

| Folder | Role & Purpose |
|--------|----------------|
| `doctype/asset/` | **Asset** — fixed asset with purchase info, depreciation, location |
| `doctype/asset_category/` | Asset categorization with depreciation rules |
| `doctype/asset_depreciation_schedule/` | Auto-generated depreciation schedule |
| `doctype/asset_finance_book/` | Multiple depreciation books per asset |
| `doctype/asset_maintenance/` | **Asset Maintenance** — preventive maintenance plans |
| `doctype/asset_maintenance_log/` | Maintenance activity logs |
| `doctype/asset_maintenance_team/` | Maintenance team assignments |
| `doctype/asset_movement/` | Asset movements between locations/custodians |
| `doctype/asset_repair/` | Asset repair records with cost tracking |
| `doctype/asset_value_adjustment/` | Manual asset value adjustments |
| `doctype/asset_capitalization/` | Asset capitalization from stock/services |
| `doctype/asset_shift_allocation/` | Shift-based depreciation allocation |
| `doctype/asset_activity/` | Asset activity audit trail |
| `doctype/location/` | Physical location master |
| `report/` | Fixed asset register, depreciation ledger, maintenance reports |

#### 🔄 Other ERPNext Modules

| Module | Doctypes | Purpose |
|--------|----------|---------|
| `subcontracting/` | 13 | Subcontracting orders/receipts — outsourced manufacturing |
| `quality_management/` | 16 | Quality goals, procedures, reviews, feedback, non-conformance — ISO compliance |
| `communication/` | 2 | Communication medium/channel definitions |
| `telephony/` | 2 | Call log, incoming call settings for VoIP/telephony |
| `edi/` | 2 | Electronic Data Interchange — code list, common codes |
| `bulk_transaction/` | 2 | Bulk transaction processing logs |
| `regional/` | 15+ | Country-specific tax/compliance (India GST, UAE VAT, US IRS 1099, South Africa VAT, Italy e-invoicing) |
| `setup/` | 50+ | System setup — company, email, print, naming, currency, territory, designation setup |
| `portal/` | 2 | Website portal for customers (website attributes, filter fields) |
| `shopping_cart/` | 5+ | E-commerce shopping cart integration |
| `maintenance/` | 5 | Maintenance visits, schedules for equipment servicing |
| `domains/` | — | Domain-specific setup (manufacturing, services, retail) |
| `erpnext_integrations/` | 3 | Third-party integrations (Plaid banking) |
| `patches/` | 200+ | Database migration patches organized by version (v4 to v16) |
| `public/` | — | Frontend assets: JS controllers, SCSS, icons, images, sounds |
| `templates/` | — | Web page templates |
| `controllers/` | — | Shared business logic controllers (taxes, stock, accounts) |
| `config/` | — | Module configuration files |
| `utilities/` | — | General utility functions |
| `change_log/` | — | Version changelog entries (release notes per version) |
| `commands/` | — | Custom Bench CLI commands for ERPNext operations |
| `desktop_icon/` | — | Desktop shortcut/icon definitions for modules |
| `locale/` | — | Translation locale files (multi-language support) |
| `gettext/` | — | GNU gettext translation extraction utilities |
| `report_center/` | — | Centralized report center configuration |
| `startup/` | — | Application startup hooks and initialization |
| `workspace_sidebar/` | — | Workspace sidebar navigation configurations |
| `tests/` | — | Unit and integration test suite |
| `www/` | — | Public website pages (web routes, portal pages) |

---

## 2. Evolution API

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\evolution-api`
**Tech**: TypeScript, Node.js | PostgreSQL/MySQL (Prisma ORM)
**Role**: Multi-channel messaging platform (WhatsApp), AI chatbot integrations, event streaming.

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies & scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `tsup.config.ts` | Fast TypeScript bundler config |
| `Dockerfile` | Main Docker image build |
| `Dockerfile.metrics` | Metrics exporter Docker image |
| `docker-compose.yaml` | Production Docker Compose setup |
| `docker-compose.dev.yaml` | Development Docker Compose setup |
| `.env.example` / `env.example` | Environment variable templates |
| `local_install.sh` | Local installation script |
| `runWithProvider.js` | Dynamic provider loading for different database backends |
| `AGENTS.md` | AI agent guidelines for the codebase |
| `CLAUDE.md` | Claude AI guidelines for the codebase |
| `prometheus.yml.example` | Prometheus monitoring configuration |
| `grafana-dashboard.json.example` | Grafana monitoring dashboard |
| `CHANGELOG.md` | Version changelog |

### Database: `prisma/`

| File | Purpose |
|------|---------|
| `postgresql-schema.prisma` | **Full PostgreSQL schema** — 35+ models (Instance, Chat, Contact, Message, all bot integrations, event streaming) |
| `mysql-schema.prisma` | MySQL variant of the schema |
| `psql_bouncer-schema.prisma` | PgBouncer-compatible schema (connection pooling) |
| `postgresql-migrations/` | PostgreSQL migration history |
| `mysql-migrations/` | MySQL migration history |

### Source: `src/`

| Folder | Role & Purpose |
|--------|----------------|
| `@types/` | TypeScript type definitions |
| `api/abstract/` | Abstract base classes for controllers/services |
| `api/controllers/` | Main API route handlers |
| `api/dto/` | Data Transfer Objects (request/response validation) |
| `api/guards/` | Authentication & authorization middleware |
| `api/provider/` | Database provider abstraction (PostgreSQL/MySQL) |
| `api/repository/` | Data access layer (Prisma queries) |
| `api/routes/` | Express route definitions |
| `api/services/` | Core business logic services |
| `api/types/` | Shared TypeScript types |

#### `api/integrations/channel/` — Messaging Channels

| Folder | Purpose |
|--------|---------|
| `evolution/` | Evolution's native WhatsApp Web engine |
| `meta/` | Official WhatsApp Cloud API (Meta) integration |
| `whatsapp/` | Shared WhatsApp utilities |
| `whatsapp/voiceCalls/` | Voice call handling via WhatsApp |

#### `api/integrations/chatbot/` — AI Bot Integrations

Each bot integration follows the same pattern: `controllers/`, `dto/`, `routes/`, `services/`, `validate/`

| Folder | Purpose |
|--------|---------|
| `chatwoot/` | **Chatwoot** — customer support platform integration (+ `libs/`, `utils/`) |
| `dify/` | **Dify AI** — chatbot, text generator, agent, workflow bots |
| `evoai/` | **EvoAI** — custom AI agent integration |
| `evolutionBot/` | **Evolution Bot** — custom self-hosted bot |
| `flowise/` | **Flowise** — no-code AI flow builder integration |
| `n8n/` | **n8n** — workflow automation webhook-based bot |
| `openai/` | **OpenAI** — GPT assistant & chat completion bots |
| `typebot/` | **Typebot** — visual conversational flow builder |

#### `api/integrations/event/` — Event Streaming

| Folder | Purpose |
|--------|---------|
| `kafka/` | Apache Kafka producer — send events to Kafka topics |
| `nats/` | NATS messaging — lightweight event streaming |
| `pusher/` | Pusher — real-time event broadcasting (WebSocket alternative) |
| `rabbitmq/` | RabbitMQ — AMQP message queue events |
| `sqs/` | Amazon SQS — cloud message queue events |
| `webhook/` | HTTP Webhook — POST events to external URLs |
| `websocket/` | Socket.io — real-time WebSocket event streaming |

#### `api/integrations/storage/`

| Folder | Purpose |
|--------|---------|
| `s3/` | **S3/Minio storage** — store media files (images, audio, video, documents) in S3-compatible storage |

#### Other `src/` Folders

| Folder | Purpose |
|--------|---------|
| `cache/` | Redis caching layer |
| `config/` | Application configuration loading |
| `exceptions/` | Custom error/exception classes |
| `utils/` | Shared utility functions |
| `utils/translations/` | Multi-language translation files |
| `validate/` | Input validation schemas |

### Other Root Folders

| Folder | Purpose |
|--------|---------|
| `Docker/` | Additional Docker configuration |
| `Extras/` | Extra resources and tools |
| `evolution-manager-v2/` | **Evolution Manager** — web-based admin UI (Vue.js) for managing instances |
| `manager/` | Legacy admin manager |
| `public/` | Static assets (images, logos) |

---

## 3. n8n

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\n8n`
**Tech**: TypeScript, Node.js, Vue.js | PostgreSQL/SQLite (TypeORM)
**Role**: Visual workflow automation platform with 400+ integrations, AI capabilities, and enterprise features.

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo package config |
| `pnpm-workspace.yaml` | PNPM workspace package definitions |
| `pnpm-lock.yaml` | Locked dependency versions |
| `turbo.json` | Turborepo build orchestration |
| `biome.jsonc` | Biome formatter/linter config (replaces ESLint/Prettier) |
| `jest.config.js` | Jest test configuration |
| `vitest.workspace.ts` | Vitest workspace test config |
| `lefthook.yml` | Git hooks configuration |
| `renovate.json` | Automated dependency updates |
| `AGENTS.md` / `CLAUDE.md` | AI coding assistant guidelines |
| `CONTRIBUTING.md` | Contribution guidelines |
| `cubic.yaml` | Infrastructure config |

### Internal Packages: `packages/@n8n/` (38 packages)

| Package | Purpose |
|---------|---------|
| `ai-node-sdk/` | SDK for building AI-powered nodes |
| `ai-utilities/` | AI helper functions — chat model adapters, memory management, converters, suppliers |
| `ai-workflow-builder.ee/` | **AI Workflow Builder (Enterprise)** — LLM-powered automatic workflow generation with agents, chains, code-builder, prompts, subgraphs, tools, validation |
| `api-types/` | Shared API type definitions (DTOs, push types, schemas) |
| `backend-common/` | Common backend utilities (logging) |
| `backend-test-utils/` | Testing utilities for backend |
| `benchmark/` | Performance benchmarking tools |
| `chat-hub/` | **Chat Hub** — centralized chat/messaging infrastructure |
| `client-oauth2/` | OAuth2 client implementation |
| `codemirror-lang/` | Custom CodeMirror language for n8n expressions |
| `codemirror-lang-html/` | HTML CodeMirror support |
| `codemirror-lang-sql/` | SQL CodeMirror support |
| `config/` | Configuration management system |
| `constants/` | Shared constants |
| `crdt/` | **CRDT** — Conflict-free Replicated Data Types for real-time collaboration |
| `create-node/` | CLI tool for scaffolding new integration nodes |
| `db/` | **Database layer** — all TypeORM entity definitions (30+ entities), migrations, utilities |
| `decorators/` | Custom TypeScript decorators |
| `di/` | Dependency injection container |
| `errors/` | Centralized error definitions |
| `eslint-config/` | Shared ESLint configuration |
| `eslint-plugin-community-nodes/` | ESLint rules for community node development |
| `expression-runtime/` | Expression evaluation engine ({{$json.field}} syntax) |
| `extension-sdk/` | **Extension SDK** — develop custom extensions/plugins |
| `imap/` | **IMAP** — email receiving via IMAP protocol |
| `json-schema-to-zod/` | Convert JSON Schema to Zod validation schemas |
| `node-cli/` | Node.js CLI utilities |
| `nodes-langchain/` | **LangChain Nodes** — AI agent nodes using LangChain (LLMs, tools, memory, retrieval) |
| `permissions/` | Role-based access control system |
| `scan-community-package/` | Security scanner for community packages |
| `stylelint-config/` | Shared CSS linting config |
| `syslog-client/` | Syslog logging client |
| `task-runner/` | **Task Runner** — sandboxed code execution (JavaScript) |
| `task-runner-python/` | **Python Task Runner** — sandboxed Python code execution |
| `typescript-config/` | Shared TypeScript configs |
| `utils/` | Shared utility functions |
| `vitest-config/` | Shared Vitest test config |
| `workflow-sdk/` | **Workflow SDK** — programmatic workflow creation and execution |

### Core Packages

| Package | Purpose |
|---------|---------|
| `cli/` | **CLI Package** — main application entry point, HTTP server, commands |
| `core/` | **Core Engine** — workflow execution engine, binary data handling, node testing |
| `workflow/` | **Workflow Package** — workflow data structures, expression resolution, node types |
| `node-dev/` | Development tools for building custom nodes |
| `nodes-base/` | **400+ Built-in Nodes** — integration connectors (Google, Slack, AWS, databases, etc.) |
| `frontend/` | **Frontend** — Vue.js web application (workflow editor, execution viewer, settings) |
| `extensions/` | Extension modules |
| `testing/` | Testing infrastructure |

### CLI Modules: `packages/cli/src/modules/` (14+ modules)

| Module | Purpose |
|--------|---------|
| `chat-hub/` | Real-time chat functionality |
| `mcp/` | **Model Context Protocol** — LLM tool integration protocol, database entities, tools |
| `insights/` | **Analytics & Insights** — workflow execution analytics |
| `ldap.ee/` | **LDAP (Enterprise)** — LDAP/Active Directory authentication |
| `log-streaming.ee/` | **Log Streaming (Enterprise)** — send logs to external destinations (Syslog, S3, etc.) |
| `source-control.ee/` | **Source Control (Enterprise)** — Git-based workflow version control |
| `external-secrets.ee/` | **External Secrets (Enterprise)** — HashiCorp Vault, AWS Secrets Manager integration |
| `dynamic-credentials.ee/` | **Dynamic Credentials (Enterprise)** — runtime credential resolution |
| `provisioning.ee/` | **Provisioning (Enterprise)** — automated workspace/user provisioning |
| `data-table/` | Data table views and middleware |
| `community-packages/` | Community node package management |
| `quick-connect/` | Quick connection setup handlers |
| `redaction/` | **Data Redaction** — execute data masking for security |
| `breaking-changes/` | Breaking change detection between versions |

### Database Entities: `packages/@n8n/db/src/entities/` (30+ entities)

| Entity | Purpose |
|--------|---------|
| `workflow-entity.ts` | Workflow definitions (nodes, connections, settings, versioning) |
| `workflow-history.ts` | Workflow version history |
| `workflow-publish-history.ts` | Publish event history |
| `workflow-statistics.ts` | Execution statistics per workflow |
| `workflow-dependency-entity.ts` | Sub-workflow dependencies |
| `workflow-tag-mapping.ts` | Workflow ↔ tag associations |
| `execution-entity.ts` | Workflow executions (status, timing, retry info) |
| `execution-data.ts` | Execution input/output data |
| `execution-metadata.ts` | Execution key-value metadata |
| `execution-annotation.ee.ts` | Human annotations on executions |
| `test-run.ee.ts` | Test run results |
| `test-case-execution.ee.ts` | Individual test case results |
| `user.ts` | Users (email, password, MFA, settings, roles) |
| `role.ts` | Roles (slug, scope, permissions) |
| `api-key.ts` | API key authentication |
| `auth-identity.ts` | External auth providers (SAML, OIDC, LDAP) |
| `auth-provider-sync-history.ts` | Auth provider sync tracking |
| `credentials-entity.ts` | Encrypted credential storage |
| `shared-credentials.ts` | Credential sharing (user ↔ credential) |
| `shared-workflow.ts` | Workflow sharing (user ↔ workflow) |
| `project.ts` | Projects/workspaces |
| `project-relation.ts` | User ↔ project membership |
| `folder.ts` | Folder hierarchy |
| `folder-tag-mapping.ts` | Folder ↔ tag associations |
| `tag-entity.ts` | Tags for organization |
| `webhook-entity.ts` | Registered webhook endpoints |
| `variables.ts` | Environment variables |
| `settings.ts` | Global settings (key-value) |
| `processed-data.ts` | Deduplication tracking (polling triggers) |
| `binary-data-file.ts` | Binary data file references |
| `invalid-auth-token.ts` | Revoked/invalid tokens |
| `secrets-provider-connection.ts` | External secrets provider connections |
| `project-secrets-provider-access.ts` | Project access to secrets providers |
| `scope.ts` | Permission scope definitions |
| `annotation-tag-entity.ee.ts` | Annotation tags |
| `annotation-tag-mapping.ee.ts` | Annotation ↔ tag links |

---

## 4. Twenty CRM

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\twenty`
**Tech**: TypeScript, React, NestJS, GraphQL | PostgreSQL, Redis, BullMQ
**Role**: Modern open-source CRM with customizable data model, workflow automation, email/calendar integration, AI agents, and fine-grained permissions.

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Yarn monorepo package config |
| `nx.json` | Nx build system configuration |
| `tsconfig.base.json` | Base TypeScript config |
| `eslint.config.mjs` | ESLint configuration |
| `jest.preset.js` | Jest test presets |
| `.yarnrc.yml` | Yarn configuration |
| `yarn.config.cjs` | Yarn constraints |
| `CLAUDE.md` | AI assistant guidelines for codebase |

### Packages: `packages/` (16 packages)

| Package | Purpose |
|---------|---------|
| `twenty-front/` | **React Frontend** — complete SPA with 62+ feature modules |
| `twenty-server/` | **NestJS Backend** — API server, business logic, database |
| `twenty-ui/` | **UI Component Library** — reusable React components/design system |
| `twenty-shared/` | Shared types and utilities between frontend/backend |
| `twenty-utils/` | General-purpose utility functions |
| `twenty-emails/` | Email templates (React Email) |
| `twenty-sdk/` | **API SDK** — TypeScript SDK for REST/GraphQL API |
| `twenty-zapier/` | **Zapier Integration** — connect Twenty to Zapier ecosystem |
| `twenty-cli/` | **CLI** — command-line tools for development/deployment |
| `twenty-docs/` | **Documentation Site** — Docusaurus documentation |
| `twenty-docker/` | Docker configuration for self-hosting |
| `twenty-e2e-testing/` | End-to-end Playwright tests |
| `twenty-eslint-rules/` | Custom ESLint rules |
| `twenty-apps/` | Custom apps/extensions |
| `twenty-website/` | Marketing website |
| `create-twenty-app/` | App scaffolding CLI |

### Server Engine: `packages/twenty-server/src/engine/`

#### API Layer

| Folder | Purpose |
|--------|---------|
| `api/graphql/` | **GraphQL API** — schema builder, query runner, workspace resolver/query builders |
| `api/rest/` | **REST API** — core REST endpoints, input parsers, error handling |
| `api/mcp/` | **Model Context Protocol API** — LLM tool integration (controllers, decorators, DTOs, services) |
| `api/clickhouse-query-runners/` | **ClickHouse Analytics** — analytical query execution against ClickHouse |
| `api/common/` | Shared API utilities (args processors, query runners, select fields) |
| `api/utils/` | API helper utilities |

#### Core Modules: `engine/core-modules/` (220+ directories)

| Module | Purpose |
|--------|---------|
| `auth/` | **Authentication** — controllers, DTOs, OAuth, SSO, SAML, 2FA, sessions |
| `user/` | User management |
| `workspace/` | Workspace/tenant management |
| `user-workspace/` | User ↔ workspace membership |
| `billing/` | **Billing** — Stripe integration (customer, subscription, product, price, meter, entitlement) |
| `api-key/` | API key CRUD and validation |
| `app-token/` | Application token management |
| `application/` | OAuth application registration |
| `applicationVariable/` | Application-level variable management |
| `approved-access-domain/` | SSO domain whitelisting |
| `sso/` | SSO identity provider configuration |
| `two-factor-authentication/` | 2FA (TOTP, recovery codes) |
| `audit/` | **Audit Trail** — activity logging (jobs, services, event types) |
| `admin-panel/` | **Admin Panel** — system administration (constants, DTOs, enums, indicators) |
| `actor/` | Actor system — per-request context, query hooks |
| `file/` | File upload/download management |
| `feature-flag/` | Feature flag management |
| `key-value-pair/` | Generic key-value storage |
| `client-config/` | Frontend configuration delivery |
| `postgres-credentials/` | PostgreSQL connection credential management |
| `public-domain/` | Public domain management |
| `emailing-domain/` | Custom email domain management |

#### Metadata Modules: `engine/metadata-modules/` (165+ directories)

| Module | Purpose |
|--------|---------|
| `ai/` | **AI System** — agents, agent execution, agent monitoring, agent roles, AI billing, AI chat, AI models |
| `object-metadata/` | **Custom Object Definitions** — define new data objects dynamically |
| `field-metadata/` | **Custom Field Definitions** — add fields to objects (constants, validators, tools, types) |
| `data-source/` | External data source connections |
| `index-metadata/` | Database index management |
| `search-field-metadata/` | Search index configuration |
| `view/` | **View Definitions** — saved table/kanban/calendar views |
| `view-field/` | View column configuration |
| `view-field-group/` | Field grouping in views |
| `role/` | Custom role definitions |
| `role-target/` | Role assignment targets |
| `object-permission/` | Per-object CRUD permissions |
| `field-permission/` | Per-field visibility permissions |
| `permission-flag/` | Feature flags for permissions |
| `row-level-permission-predicate/` | Row-level security predicates and groups |
| `page-layout/` | **Page Layout** — custom detail page layouts |
| `page-layout-tab/` | Tabbed sections in layouts |
| `page-layout-widget/` | Widget blocks in layouts |
| `navigation-menu-item/` | **Navigation** — sidebar menu customization |
| `command-menu-item/` | **Command Palette** — Cmd+K quick actions |
| `skill/` | **Skills** — reusable AI/automation capabilities |
| `logic-function/` | **Logic Functions** — custom server-side TypeScript functions |
| `logic-function-layer/` | Logic function dependency management |
| `front-component/` | **Front Components** — custom React components registereable by plugins |
| `flat-agent/` | Flattened agent metadata |
| `flat-entity/` | Flattened entity metadata utilities |
| `flat-field-metadata/` | Flattened field metadata |
| `flat-command-menu-item/` | Flattened command menu items |
| `flat-front-component/` | Flattened front component metadata |

#### Other Engine Modules

| Module | Purpose |
|--------|---------|
| `twenty-orm/` | Custom ORM extensions (workspace entity manager, base entities) |
| `workspace-manager/` | Workspace lifecycle management, migrations, prefill data |
| `workspace-cache/` | Per-workspace caching layer |
| `workspace-cache-storage/` | Cache storage backend |
| `workspace-datasource/` | Per-workspace database connection management |
| `workspace-event-emitter/` | Event emission within workspaces |
| `metadata-event-emitter/` | Metadata change events |
| `object-metadata-repository/` | Object metadata data access |
| `decorators/` | Custom NestJS decorators |
| `guards/` | Authentication/authorization guards |
| `middlewares/` | Request middleware |
| `subscriptions/` | GraphQL subscriptions (real-time updates) |
| `trash-cleanup/` | Soft-deleted record cleanup |

### Server Business Modules: `packages/twenty-server/src/modules/` (130+ directories)

| Module | Purpose |
|--------|---------|
| `company/` | **Company** — company records, standard objects |
| `person/` | **Person** — individual contact records |
| `opportunity/` | **Opportunity** — sales deals/pipeline |
| `messaging/` | **Email Messaging** — full email system (channels, messages, threads, participants, folders) |
| `calendar/` | **Calendar** — calendar event sync, import, participant management, blocklist |
| `task/` | **Task** — task items with target associations |
| `note/` | **Note** — notes with target associations |
| `workflow/` | **Workflow Automation** — workflow definitions, versions, runs, automated triggers |
| `attachment/` | File attachments |
| `dashboard/` | Custom dashboards |
| `dashboard-sync/` | Dashboard data synchronization |
| `favorite/` | User favorites |
| `favorite-folder/` | Favorite organization |
| `workspace-member/` | Workspace member management |
| `connected-account/` | **Connected Accounts** — OAuth email/calendar connections, IMAP, channel sync |
| `contact-creation-manager/` | Auto-create contacts from email/calendar interactions |
| `match-participant/` | Match email participants to existing contacts |
| `blocklist/` | Email blocklist management |
| `timeline/` | Activity timeline (chronological feed) |

### Frontend Modules: `packages/twenty-front/src/modules/` (62+ modules)

| Module | Purpose |
|--------|---------|
| `accounts/` | Account management UI |
| `activities/` | Activity feed/timeline |
| `ai/` | **AI Interface** — AI assistant, chat, agent interactions |
| `analytics/` | Analytics tracking |
| `apollo/` | Apollo Client GraphQL configuration |
| `app/` | Core app layout and routing |
| `application-variables/` | App variable management |
| `applications/` | Application/extension management |
| `attachments/` | File attachment components |
| `auth/` | Login, signup, SSO, 2FA UI |
| `billing/` | Billing/subscription management UI |
| `blocknote-editor/` | **Rich Text Editor** — BlockNote-based document editing |
| `browser-event/` | Browser event handling |
| `captcha/` | CAPTCHA verification |
| `chrome-extension-sidecar/` | **Chrome Extension** — CRM data in browser sidebar |
| `client-config/` | Client configuration management |
| `command-menu/` | **Command Palette** (Cmd+K) UI |
| `command-menu-item/` | Command palette item configuration |
| `companies/` | Company list/detail views |
| `context-store/` | Context state management |
| `dashboards/` | Dashboard views |
| `debug/` | Debug tools |
| `domain-manager/` | Custom domain management |
| `dropdown-context-state-management/` | Dropdown state utilities |
| `error-handler/` | Error handling and display |
| `favorites/` | Favorites management |
| `file/` | File handling |
| `file-upload/` | File upload components |
| `front-components/` | Custom component rendering |
| `geo-map/` | **Geo Map** — location/map visualization |
| `information-banner/` | Notification banners |
| `keyboard-shortcut-menu/` | Keyboard shortcut help |
| `localization/` | i18n / language selection |
| `logic-functions/` | Logic function management UI |
| `marketplace/` | **Marketplace** — browse/install extensions and integrations |
| `mention/` | @mention system |
| `metadata-error-handler/` | Metadata error handling |
| `metadata-store/` | Metadata state management |
| `navigation/` | Sidebar navigation |
| `navigation-menu-item/` | Navigation customization |
| `object-metadata/` | Object/field configuration UI |
| `object-record/` | Record CRUD, list, detail views |
| `onboarding/` | User onboarding flow |
| `opportunities/` | Opportunity/deal views |
| `page-layout/` | Page layout customization |
| `people/` | Person/contact views |
| `prefetch/` | Data prefetching |
| `settings/` | Settings pages |
| `sign-in-background-mock/` | Login page background |
| `spreadsheet-import/` | **Spreadsheet Import** — CSV/Excel data import |
| `support/` | Support/help integration |
| `theme/` | Theme/styling |
| `ui/` | UI utilities and primitives |
| `views/` | View management (table, kanban, filters, sorts) |
| `workspace/` | Workspace management |
| `workflow/` | Workflow builder UI |

---

## 5. Frappe Docker

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\frappe_docker`
**Tech**: Docker, Shell scripts, Python
**Role**: Docker containerization and orchestration for Frappe/ERPNext applications. Deployment infrastructure only.

### Root Files

| File | Purpose |
|------|---------|
| `compose.yaml` | **Production Compose** — base Docker Compose for production deployment |
| `docker-compose-prod.yml` | Full production configuration with all services |
| `pwd.yml` | Quick disposable demo environment (Play with Docker) |
| `docker-bake.hcl` | Docker Buildx bake configuration for multi-platform builds |
| `.env` / `example.env` | Environment variable configuration |
| `install_x11_deps.sh` | X11 dependency installer (for wkhtmltopdf PDF generation) |
| `setup.cfg` | Python setup configuration |
| `requirements-test.txt` | Test dependencies |
| `CONTRIBUTING.md` | Contribution guidelines |
| `LICENSE` | MIT license |

### Documentation: `docs/`

| Folder | Purpose |
|--------|---------|
| `01-getting-started/` | Choosing deployment method, initial setup, ARM64 setup |
| `02-setup/` | Container setup overview and configuration |
| `03-production/` | Production deployment guides |
| `04-operations/` | Day-to-day operations (backup, restore, update) |
| `05-development/` | Development environment setup |
| `06-migration/` | Migration from non-Docker to Docker setup |
| `07-troubleshooting/` | Common issues and solutions |
| `08-reference/` | Reference documentation |
| `images/` | Documentation images |
| `getting-started.md` | Comprehensive getting started guide |

### Docker Images: `images/`

| Folder | Purpose |
|--------|---------|
| `bench/` | Frappe Bench base image |
| `custom/` | Custom app image builder |
| `layered/` | Multi-stage layered image build |
| `production/` | Production-optimized images |

### Other

| Folder | Purpose |
|--------|---------|
| `overrides/` | Docker Compose override files for common deployment patterns |
| `development/` | Development environment configs and VS Code settings |
| `devcontainer-example/` | VS Code devcontainer setup for development |
| `resources/` | Helper scripts (nginx config, gunicorn, bench commands) |
| `resources/core/` | Core resource scripts |
| `tests/` | Docker setup tests |

---

## 6. Traccar

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\traccar`
**Tech**: Java (Netty), React (traccar-web) | H2/MySQL/PostgreSQL (Liquibase)
**Role**: Open-source GPS tracking system supporting 200+ protocols and 2000+ device models. Real-time fleet tracking, geofencing, driver behavior, trip reports, and multi-channel notifications.

### Root Files

| File | Purpose |
|------|---------|
| `build.gradle` | Gradle build configuration |
| `settings.gradle` | Gradle settings |
| `gradlew` / `gradlew.bat` | Gradle wrapper scripts (Linux/Windows) |
| `Dockerfile` | Docker image build |
| `debug.xml` | Debug configuration |
| `traccar.xml` | Default server configuration |
| `openapi.yaml` | **Full OpenAPI 3.0 spec** (87KB) — complete REST API documentation |
| `setup.sh` | Linux installation script |
| `README.md` | Project overview |
| `LICENSE.txt` | Apache 2.0 license |

### Database Schema: `schema/`

| File | Purpose |
|------|---------|
| `changelog-4.0-clean.xml` | **Base schema** — all 12 core tables (tc_users, tc_devices, tc_positions, tc_events, tc_geofences, tc_drivers, tc_groups, tc_notifications, tc_commands, tc_maintenances, tc_calendars, tc_attributes) + 20 junction tables |
| `changelog-4.1.xml` to `changelog-4.15.xml` | Schema migrations v4.x — index additions, column changes |
| `changelog-5.1.xml` to `changelog-5.12.xml` | Schema migrations v5.x — tc_orders table, tc_reports, new columns |
| `changelog-6.1.xml` to `changelog-6.11.xml` | Schema migrations v6.x — OIDC auth, queued commands, logs, revoked tokens, tc_statistics |

### Source: `src/main/java/org/traccar/`

#### `model/` — Data Models (37 Java classes)

| File | Purpose |
|------|---------|
| `User.java` | User entity — auth, preferences, device limits, map settings, admin flag |
| `Device.java` | GPS device — IMEI, status, last position, group, category |
| `Position.java` | GPS position — lat, lon, speed, course, altitude, accuracy, attributes, address |
| `Event.java` | System event — type, device, position, geofence, maintenance references |
| `Geofence.java` | Geofence zone — area geometry (WKT), calendar, attributes |
| `Driver.java` | Driver — name, unique ID (iButton/RFID), attributes |
| `Group.java` | Device group — hierarchical parent references |
| `Notification.java` | Notification rule — type, channels, calendar, always-on flag |
| `Command.java` | Device command — type, text channel, attributes |
| `Maintenance.java` | Maintenance rule — type (km/hours/date), start, period |
| `Calendar.java` | Calendar — iCalendar data for scheduling rules |
| `Attribute.java` | Computed attribute — expression-based calculations |
| `Order.java` | Delivery order — from/to address, lat/lon coordinates |
| `Report.java` | Saved report configuration |
| `QueuedCommand.java` | Queued command for offline devices |
| `LogRecord.java` | Audit log entry |
| `Statistics.java` | Server usage statistics |
| `Server.java` | Server config singleton — registration, map, keys |
| `Permission.java` | Permission model — generic owner→property linking |
| `BaseModel.java` | Base class for all entities |
| `ExtendedModel.java` | Base with JSONB attributes support |

#### `api/resource/` — REST API (22 JAX-RS resources)

| File | Purpose |
|------|---------|
| `DeviceResource.java` | Device CRUD + accumulators + position history |
| `PositionResource.java` | Get positions by device/time range + CSV/KML export |
| `EventResource.java` | Get events by device/time range |
| `GeofenceResource.java` | Geofence CRUD |
| `CommandResource.java` | Send commands to devices + list command types |
| `GroupResource.java` | Device group CRUD |
| `DriverResource.java` | Driver CRUD |
| `MaintenanceResource.java` | Maintenance rule CRUD |
| `NotificationResource.java` | Notification CRUD + test + list notification types |
| `UserResource.java` | User CRUD + managed users |
| `SessionResource.java` | Login/logout authentication |
| `OidcResource.java` | OpenID Connect SSO authentication |
| `PasswordResource.java` | Password reset/change |
| `PermissionsResource.java` | Link/unlink generic permissions |
| `ReportResource.java` | Generate all report types (route, trips, stops, summary, events, combined) |
| `OrderResource.java` | Delivery order CRUD |
| `CalendarResource.java` | Calendar CRUD |
| `AttributeResource.java` | Computed attribute CRUD |
| `ServerResource.java` | Server settings management |
| `StatisticsResource.java` | Usage statistics |
| `HealthResource.java` | Health check endpoint |
| `AuditResource.java` | Audit log access |

#### `api/security/` — Authentication & Authorization (9 files)

| File | Purpose |
|------|---------|
| `LoginService.java` | **Login service** — credential validation, LDAP, OIDC, token-based auth |
| `PermissionsService.java` | **Permissions engine** — check user access to devices/groups/geofences/etc. |
| `SecurityRequestFilter.java` | JAX-RS filter — authenticate every API request |
| `OidcSessionManager.java` | **OIDC session management** — OpenID Connect session lifecycle |
| `LoginResult.java` | Login response DTO |
| `CodeRequiredException.java` | 2FA code required exception |
| `ServiceAccountUser.java` | Service account user context |
| `UserPrincipal.java` | Authenticated user principal |
| `UserSecurityContext.java` | JAX-RS security context |

#### `api/signature/` — Cryptography & Token Management

| File | Purpose |
|------|---------|
| `CryptoManager.java` | **Cryptographic operations** — key generation, signing, verification |
| `TokenManager.java` | **Token management** — JWT token generation and validation |
| `KeystoreModel.java` | Keystore data model |

#### `command/` — Device Command Delivery (5 senders)

| File | Purpose |
|------|---------|
| `CommandSender.java` | Abstract command sender interface |
| `CommandSenderManager.java` | Routes commands to appropriate sender |
| `FindHubCommandSender.java` | FindHub cloud command delivery |
| `FirebaseCommandSender.java` | **Firebase** command delivery (mobile push) |
| `TraccarCommandSender.java` | Traccar push command delivery |

#### `database/` — Business Logic Managers (9 managers)

| File | Purpose |
|------|---------|
| `BufferingManager.java` | **Position buffering** — batch write positions for performance |
| `CommandsManager.java` | Command queue management, delivery tracking |
| `DeviceLookupService.java` | Device lookup by unique ID (IMEI resolution) |
| `LdapProvider.java` | **LDAP authentication** — Active Directory / LDAP login support |
| `LocaleManager.java` | **Localization** — multi-language string management |
| `MediaManager.java` | **Media storage** — photo/video file management from devices |
| `NotificationManager.java` | Notification orchestration — route events to notificators |
| `OpenIdProvider.java` | **OpenID Connect provider** — OIDC authentication flow |
| `StatisticsManager.java` | Server usage statistics collection |

#### `handler/` — Position Processing Pipeline (18 handlers)

| File | Purpose |
|------|---------|
| `FilterHandler.java` | Validate positions (accuracy, speed, distance thresholds) |
| `GeocoderHandler.java` | Reverse geocode lat/lon → street address |
| `GeolocationHandler.java` | Cell tower/WiFi → lat/lon resolution |
| `GeofenceHandler.java` | Geofence enter/exit detection |
| `MotionHandler.java` | Moving/stopped state detection |
| `EngineHoursHandler.java` | Engine runtime hour tracking |
| `DistanceHandler.java` | Odometer/distance accumulation |
| `SpeedLimitHandler.java` | Speed limit lookup and comparison |
| `DriverHandler.java` | Driver identification from device data |
| `ComputedAttributesHandler.java` | Custom computed attribute calculations |
| `TimeHandler.java` | Timestamp correction |
| `HemisphereHandler.java` | GPS hemisphere correction |
| `CopyAttributesHandler.java` | Copy attributes between positions |
| `DefaultDataHandler.java` | Store positions to database |
| `DatabaseHandler.java` | Database position persistence |
| `PostProcessHandler.java` | Post-processing logic |
| `NetworkForwarderHandler.java` | Forward raw data to other servers |
| `StandardLoggingHandler.java` | Position processing logging |

#### `handler/events/` — Event Handlers (12 handlers)

| File | Purpose |
|------|---------|
| `AlarmEventHandler.java` | Device alarms (SOS, tamper, low battery, shock) |
| `MotionEventHandler.java` | Movement start/stop events |
| `OverspeedEventHandler.java` | Speed limit exceed alerts |
| `GeofenceEventHandler.java` | Geofence enter/exit events |
| `FuelEventHandler.java` | Fuel level drop (theft) / refill detection |
| `IgnitionEventHandler.java` | Engine on/off events |
| `MaintenanceEventHandler.java` | Maintenance schedule triggers |
| `DriverEventHandler.java` | Driver change (iButton/RFID swap) |
| `BehaviorEventHandler.java` | Harsh braking, rapid acceleration, sharp cornering |
| `CommandResultEventHandler.java` | Device command response events |
| `MediaEventHandler.java` | Media file (photo/video) received |
| `BaseEventHandler.java` | Abstract base for event handlers |

#### `notificators/` — Notification Channels (10 notificators)

| File | Purpose |
|------|---------|
| `NotificatorFirebase.java` | Firebase Cloud Messaging (mobile push) |
| `NotificatorMail.java` | Email via SMTP |
| `NotificatorSms.java` | SMS via configured gateway |
| `NotificatorTelegram.java` | Telegram bot messages |
| `NotificatorWhatsapp.java` | WhatsApp messages |
| `NotificatorPushover.java` | Pushover push notifications |
| `NotificatorWeb.java` | WebSocket in-app notifications |
| `NotificatorCommand.java` | Send device command as notification |
| `NotificatorTraccar.java` | Traccar push notification service |
| `Notificator.java` | Abstract base notificator |

#### `protocol/` — GPS Protocol Decoders (200+)

Each protocol is a folder with `*Protocol.java` (connection handler) and `*ProtocolDecoder.java` (data parser).

| Examples | Devices |
|----------|---------|
| `gt06/` | GT06, Concox, JiMi trackers |
| `teltonika/` | Teltonika FMB, FMC devices |
| `h02/` | H02 protocol trackers |
| `tk103/` | TK103/TK102 trackers |
| `gps103/` | GPS103 trackers |
| `watch/` | Kids GPS watches |
| `suntech/` | Suntech fleet devices |
| `ruptela/` | Ruptela fleet devices |
| `meitrack/` | Meitrack trackers |
| `huabao/` | Chinese JT/T 808 protocol |
| `+ 190 more` | Covering 2000+ device models |

#### `reports/` — Report Generation (11 providers)

| File | Purpose |
|------|---------|
| `RouteReportProvider.java` | Full route/position history |
| `TripsReportProvider.java` | Trip detection (start, end, distance, duration) |
| `StopsReportProvider.java` | Stop detection (location, duration, engine hours) |
| `SummaryReportProvider.java` | Daily summary (distance, avg speed, max speed, fuel) |
| `EventsReportProvider.java` | Event listing (alarms, geofence, overspeed) |
| `GeofenceReportProvider.java` | Geofence entry/exit history |
| `DevicesReportProvider.java` | Device status overview |
| `CombinedReportProvider.java` | Multi-report combined view |
| `CsvExportProvider.java` | CSV export for any report |
| `GpxBuilder.java` | GPX format export |
| `KmlBuilder.java` | Google Earth KML export |

#### `reports/common/` — Report Utilities

| File | Purpose |
|------|---------|
| `ReportExecutor.java` | Report execution engine |
| `ReportMailer.java` | **Email scheduled reports** — auto-send reports via email |
| `ReportUtils.java` | Report calculation utilities |
| `TripsConfig.java` | Trip detection configuration (min moving speed, min stop duration) |
| `ExpressionEvaluatorFactory.java` | Expression evaluator for report formulas |

#### `reports/model/` — Report Data Models

| File | Purpose |
|------|---------|
| `TripReportItem.java` | Trip data model (start/end, distance, duration, avg speed) |
| `StopReportItem.java` | Stop data model (location, duration, engine hours) |
| `SummaryReportItem.java` | Summary data model (distance, speed, fuel) |
| `DeviceReportItem.java` | Device status data model |
| `GeofenceReportItem.java` | Geofence entry/exit data model |
| `CombinedReportItem.java` | Combined report data model |
| `DeviceReportSection.java` | Report section per device |
| `BaseReportItem.java` | Base report item class |

#### `geocoder/` — Geocoding Providers (25)

| File | Purpose |
|------|---------|
| `GoogleGeocoder.java` | Google Maps geocoding |
| `BingMapsGeocoder.java` | Bing Maps geocoding |
| `NominatimGeocoder.java` | OpenStreetMap Nominatim |
| `HereGeocoder.java` | HERE Maps geocoding |
| `MapboxGeocoder.java` | Mapbox geocoding |
| `OpenCageGeocoder.java` | OpenCage geocoding |
| `TomTomGeocoder.java` | TomTom geocoding |
| `MapQuestGeocoder.java` | MapQuest geocoding |
| `GeoapifyGeocoder.java` | Geoapify geocoding |
| `LocationIqGeocoder.java` | LocationIQ geocoding |
| `MapTilerGeocoder.java` | MapTiler geocoding |
| `+ 14 more providers` | Additional geocoding services |

#### Other Source Folders

| Folder | Purpose |
|--------|---------|
| `storage/` | Database storage (JDBC), `QueryBuilder`, `DatabaseStorage`, `MemoryStorage`, query DSL (Columns, Condition, Limit, Order, Request) |
| `forward/` | Event forwarding to external systems — 19 forwarders (AMQP, Kafka, MQTT, Redis, HTTP/JSON, Wialon) for both positions and events |
| `geolocation/` | Cell tower / WiFi positioning (Google, OpenCellId, Unwired) |
| `geofence/` | Geofence geometry engine (polygon, circle, polyline intersection checks) |
| `notification/` | Notification orchestration, message formatting, event routing |
| `session/` | Device connection sessions — connection keys, device sessions |
| `session/cache/` | **Cache system** — CacheManager, CacheGraph, CacheNode, WeakValueMap for device/position caching |
| `session/state/` | **State processors** — MotionProcessor/State, OverspeedProcessor/State for stateful event detection |
| `schedule/` | **10 scheduled tasks** — TaskClearStatus, TaskDeleteTemporary, TaskDeviceInactivityCheck, TaskExpirations, TaskHealthCheck, TaskReports, TaskWebSocketKeepalive |
| `speedlimit/` | **Speed limit provider** — Overpass API integration for road speed limit lookups |
| `sms/` | SMS gateway abstraction (HTTP, Amazon SNS) |
| `mail/` | Email sending (SMTP) |
| `broadcast/` | Internal event broadcasting — Multicast, Redis, Null broadcast services |
| `config/` | Configuration loading — ConfigKey, Keys (all configuration options), KeyType |
| `helper/` | Utility helper functions |
| `web/` | Embedded web server (Jetty) — console servlet, **MCP auth filter, MCP server holder**, file override filters, request logging |

### Templates: `templates/`

| Folder | Purpose |
|--------|---------|
| `export/` | **Excel report templates** — 6 XLSX templates (devices, events, route, stops, summary, trips) for formatted report export |
| `notifications/` | **Multi-language notification templates** — email/SMS message templates in 10 languages (de, el, en, es, fr, it, pl, pt_BR, ru, tr) |

### Docker: `docker/`

| File | Purpose |
|------|---------|
| `Dockerfile.alpine` | Alpine Linux Docker image (smallest) |
| `Dockerfile.debian` | Debian Docker image |
| `Dockerfile.ubuntu` | Ubuntu Docker image |
| `compose/traccar-mysql.yaml` | Docker Compose with MySQL backend |
| `compose/traccar-timescaledb.yaml` | Docker Compose with **TimescaleDB** backend (time-series optimized for GPS data) |

### Other Root Folders

| Folder | Purpose |
|--------|---------|
| `setup/` | Linux installer configuration template |
| `tools/` | **8 testing/debugging scripts** (Python/Bash) — config-doc.py, test-generator.py, test-integration.py, test-performance.py, test-commands.py, test-trips.py, hex.sh, test-photo.sh |
| `gradle/wrapper/` | Gradle wrapper distribution |
| `src/test/` | Unit test source directory |

---

## 📊 Summary Statistics

| Project | Folders | Key Data Models | Reports | Integration Points |
|---------|---------|-----------------|---------|-------------------|
| **ERPNext** | 1000+ | 400+ doctypes across 21 modules | 100+ reports | Plaid banking, email, printing |
| **Evolution API** | 90+ | 35+ Prisma models | N/A | 8 chatbot platforms, 7 event streams, S3 |
| **n8n** | 200+ | 30+ TypeORM entities | Dashboard analytics | 400+ integration nodes, LangChain AI |
| **Twenty CRM** | 500+ | 37 workspace + 55+ metadata entities | Dashboard module | Zapier, Chrome extension, Email/Calendar OAuth |
| **Frappe Docker** | 22 | N/A (deployment only) | N/A | Docker, Nginx, Redis, MariaDB/PostgreSQL |
| **Traccar** | 100+ | 37 Java models, 12 core DB tables | 11 report types | 200+ GPS protocols, 25 geocoders, 10 notificators |

### Features Previously Missing from Our Docs (Now Added)

| Feature | Source | Description |
|---------|--------|-------------|
| AI Workflow Builder | n8n | LLM-powered automatic workflow generation with agents & chains |
| Model Context Protocol (MCP) | n8n + Twenty | LLM tool integration protocol for AI agents |
| ClickHouse Analytics | Twenty | Analytical query engine for dashboards and reporting |
| CRDT Collaboration | n8n | Real-time collaborative workflow editing |
| Task Runner (Python+JS) | n8n | Sandboxed script execution for code nodes |
| Chrome Extension Sidecar | Twenty | Browser extension for CRM data access |
| Marketplace | Twenty | Extension/plugin marketplace |
| Geo Map Module | Twenty | Geographic data visualization |
| Spreadsheet Import | Twenty | CSV/Excel bulk data import |
| Rich Text Editor (BlockNote) | Twenty | Advanced document editing |
| Admin Panel | Twenty | System administration dashboard |
| Audit Trail | Twenty | Comprehensive activity auditing |
| Log Streaming (Enterprise) | n8n | External log destination forwarding |
| Source Control (Enterprise) | n8n | Git-based workflow versioning |
| External Secrets | n8n | HashiCorp Vault / AWS Secrets Manager |
| Dynamic Credentials | n8n | Runtime credential resolution |
| Data Redaction | n8n | Sensitive data masking in executions |
| LDAP Authentication | n8n | Active Directory / LDAP login |
| Voice Calls | Evolution API | WhatsApp voice call handling |
| Logic Functions | Twenty | Custom server-side TypeScript functions |
| Front Components | Twenty | Plugin-registerable React components |
| AI Agent System | Twenty | Full AI agent lifecycle (execution, monitoring, billing, chat) |
| Dashboard Sync | Twenty | Real-time dashboard data sync |
| Contact Creation Manager | Twenty | Auto-create contacts from interactions |
| IMAP Email | n8n | Direct IMAP email receiving |
| Regional Compliance | ERPNext | Country-specific tax (GST, VAT, IRS) and e-invoicing |
| Quality Management | ERPNext | ISO quality goals, procedures, reviews, non-conformance |
| Subcontracting | ERPNext | Outsourced manufacturing (BOM, orders, receipts) |
| **Real-Time GPS Tracking** | **Traccar** | **200+ protocol decoders, live map, 2000+ device models** |
| **Geofencing Engine** | **Traccar** | **Polygon/circle geofence with enter/exit alerts** |
| **Fleet Management** | **Traccar** | **Device groups, categories, hierarchical management** |
| **Driver Behavior Monitoring** | **Traccar** | **Harsh braking, acceleration, cornering detection** |
| **Trip/Route Reports** | **Traccar** | **11 report types with CSV/GPX/KML export** |
| **Multi-Channel Notifications** | **Traccar** | **Firebase, SMS, Telegram, WhatsApp, Pushover, Email** |
| **Event Forwarding** | **Traccar** | **AMQP, Kafka, MQTT, Redis, HTTP, Wialon forwarding** |
| **Geocoding (25 providers)** | **Traccar** | **Google, Bing, Here, Nominatim, Mapbox, TomTom, etc.** |
| **OIDC Authentication** | **Traccar** | **OpenID Connect SSO for GPS platform** |
| **Delivery Orders** | **Traccar** | **Order management with from/to coordinates** |
| **LDAP Authentication** | **Traccar** | **Active Directory / LDAP login for GPS platform** |
| **MCP Protocol** | **Traccar** | **Model Context Protocol support (3rd project with MCP!)** |
| **TimescaleDB Support** | **Traccar** | **Time-series optimized database for GPS position data** |
| **Excel Report Export** | **Traccar** | **6 XLSX templates for formatted report export** |
| **Multi-Language Notifications** | **Traccar** | **Email/SMS templates in 10 languages** |
| **Omnichannel Inbox** | **Chatwoot** | **12 channels in unified view (Web, Email, WhatsApp, FB, IG, Twitter, Telegram, Line, SMS, TikTok, Voice, API)** |
| **Captain AI Agent** | **Chatwoot** | **AI assistants with pgvector embeddings, custom tools, scenarios, copilot** |
| **Help Center Portal** | **Chatwoot** | **Public knowledge base with articles, categories, multi-language** |
| **SLA Policies** | **Chatwoot** | **Response/resolution SLA tracking per conversation** |
| **CSAT Surveys** | **Chatwoot** | **Customer satisfaction surveys with ratings and feedback** |
| **Canned Responses** | **Chatwoot** | **Shortcode-based quick reply templates for agents** |
| **Macros** | **Chatwoot** | **Multi-step automation playbooks for agent actions** |
| **Agent Bots** | **Chatwoot** | **Webhook-based chatbots on inboxes** |
| **SAML SSO** | **Chatwoot** | **Enterprise SAML authentication (6th SSO method!)** |
| **Custom Roles** | **Chatwoot** | **Granular permission-based custom roles** |
| **SMPP Gateway** | **Jasmin** | **Full SMPP v3.4 client/server for enterprise SMS** |
| **SMS Routing Engine** | **Jasmin** | **Static, Roundrobin, Failover, Leastcost, HLR routing** |
| **SMS Billing** | **Jasmin** | **Per-message rate billing with rate tables** |
| **DLR Tracking** | **Jasmin** | **Real-time SMS delivery receipts via Redis** |
| **Message Interception** | **Jasmin** | **Modify SMS in transit (content, headers)** |

---

## 7. Chatwoot

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\chatwoot`
**Tech**: Ruby on Rails 7.1, Vue.js, PostgreSQL (pgvector), Redis, Sidekiq

### Root Files

| File | Purpose |
|------|---------|
| `Gemfile` / `Gemfile.lock` | Ruby gem dependencies |
| `package.json` / `pnpm-lock.yaml` | JavaScript dependencies |
| `docker-compose.yaml` | Docker Compose for development |
| `docker-compose.production.yaml` | Docker Compose for production |
| `docker-compose.test.yaml` | Docker Compose for testing |
| `Procfile` / `Procfile.dev` | Process manager config (web, worker, clock) |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.js` | TailwindCSS configuration |
| `.env.example` | Environment variables template (10KB) |
| `Rakefile` | Rake task definitions |
| `crowdin.yml` | Translation crowdsourcing config |
| `README.md` | Project overview |

### Application: `app/`

| Folder | Purpose |
|--------|---------|
| `models/` | **49 ActiveRecord models** — Account, Contact, Conversation, Message, Inbox, Team, etc. |
| `models/channel/` | **12 channel models** — api, email, facebook_page, instagram, line, sms, telegram, tiktok, twilio_sms, twitter_profile, web_widget, whatsapp |
| `models/concerns/` | Shared model behaviors (mixins) |
| `models/integrations/` | Integration models (app, hook) |
| `controllers/` | Rails API + web controllers |
| `services/` | **35 service directories** — business logic for each channel and feature |
| `jobs/` | Sidekiq background jobs |
| `channels/` | ActionCable WebSocket channels |
| `javascript/` | Vue.js frontend components |
| `views/` | ERB templates and JSON builders |
| `mailers/` | Email mailer classes |
| `mailboxes/` | ActionMailbox inbound email processing |
| `builders/` | Builder pattern constructors |
| `dispatchers/` | Event dispatching |
| `listeners/` | Event listener classes |
| `finders/` | Query finder objects |
| `presenters/` | View presenters |
| `policies/` | Pundit authorization policies |
| `helpers/` | View helper methods |
| `fields/` | Custom field definitions |
| `drops/` | Liquid template drop objects |
| `actions/` | Service action classes |
| `assets/` | Static assets |
| `dashboards/` | Dashboard configurations |

### Database: `db/`

| Item | Purpose |
|------|---------|
| `schema.rb` (1306 lines) | **85 PostgreSQL tables** — full schema definition |
| `migrate/` | 400+ migration files (v1 through 2026) |
| `seeds.rb` | Database seed data |

### Enterprise: `enterprise/`

| Folder | Purpose |
|--------|---------|
| `app/` | 15 sub-folders — enterprise-only models, controllers, services, jobs, policies |
| `config/` | Enterprise configuration |
| `lib/` | Enterprise library code |

### Other Folders

| Folder | Purpose |
|--------|---------|
| `config/` | Rails configuration (routes, database, environments, initializers) |
| `lib/` | Library code (integrations, Redis, event handling) |
| `swagger/` | **Swagger/OpenAPI** API documentation |
| `spec/` | RSpec test suite |
| `docker/` | Docker build configurations |
| `deployment/` | Deployment scripts and configs |
| `bin/` | Executable scripts (rails, rake, setup) |
| `public/` | Public static assets |
| `theme/` | Theme/styling configuration |
| `script/` | Utility scripts |
| `rubocop/` | Ruby linting configuration |
| `clevercloud/` | CleverCloud PaaS deployment configuration |
| `vendor/` | Ruby gem vendor cache |
| `__mocks__/` | JavaScript test mocks (Vitest) |
| `log/` | Application log output |
| `tmp/` | Temporary files and cache |

### Summary Statistics

| Metric | Value |
|--------|-------|
| Total DB tables | 85 |
| ActiveRecord models | 49+ |
| Channel types | 12 |
| Service directories | 35 |
| Enterprise folders | 15 |
| DB migrations | 400+ |
| PostgreSQL extensions | 4 (pgvector, pg_trgm, pgcrypto, pg_stat_statements) |

---

## 8. Jasmin

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\jasmin`
**Tech**: Python 3 (Twisted), Redis, RabbitMQ (AMQP)

### Root Files

| File | Purpose |
|------|---------|
| `setup.py` | Python package setup |
| `requirements.txt` | Python dependencies |
| `requirements-test.txt` | Test dependencies |
| `docker-compose.yml` | Docker Compose (Jasmin + RabbitMQ + Redis) |
| `docker-compose.restapi.yml` | Docker Compose with REST API |
| `docker-compose.grafana.yml` | Docker Compose with Grafana monitoring |
| `Procfile` | Heroku process config |
| `app.json` | Heroku app config |
| `nfpm.yaml` | Linux package builder config (deb/rpm) |
| `README.rst` | Project overview |

### Source: `jasmin/`

| Folder | Purpose |
|--------|---------|
| `protocols/smpp/` | **SMPP v3.4 protocol** — client, server, PDU encoding/decoding, connection management |
| `protocols/http/` | **HTTP API** — send/receive SMS via HTTP endpoints |
| `protocols/rest/` | **REST API** — modern RESTful SMS interface |
| `protocols/cli/` | **CLI (Telnet)** — console-based live configuration |
| `protocols/validation.py` | Protocol message validation |
| `routing/` | **Routing engine** (14 files) — Routes, Filters, Bills, Interceptors, RoutingTables, router.py (47KB), throwers.py (31KB), jasminApi.py |
| `managers/` | **Manager layer** (7 files) — clients.py (SMPP), listeners.py (AMQP), dlr.py (Redis DLR), content.py, configs.py, proxies.py |
| `queues/` | AMQP queue management |
| `redis/` | Redis connection and utilities |
| `interceptor/` | Message interception framework |
| `config/` | Configuration management |
| `tools/` | Utility tools |
| `bin/` | Executable scripts |

### Infrastructure

| Folder | Purpose |
|--------|---------|
| `docker/` | Docker image build configs |
| `kubernetes/` | **Kubernetes** deployment manifests |
| `misc/` | Documentation sources, architecture diagrams |
| `tests/` | Test suite |

### Summary Statistics

| Metric | Value |
|--------|-------|
| Protocol types | 4 (SMPP, HTTP, REST, CLI) |
| Routing files | 14 (router.py = 47KB) |
| Manager files | 7 (listeners.py = 38KB) |
| Route types | 5 (Static, Roundrobin, Failover, Leastcost, HLR) |
| Deployment options | 4 (Docker, Kubernetes, Ubuntu pkg, RedHat pkg) |

---

## 9. Mailcow

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\mailcow-dockerized`
**Tech**: Docker, Postfix, Dovecot, SOGo, Rspamd, ClamAV, PHP, MariaDB, Redis

### Root Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Full mailcow environment composition |
| `generate_config.sh` | Setup script for `.env` generation |
| `update.sh` | Update utility |
| `mailcow.conf` | Core mailcow configuration file |

### Configuration: `data/conf/`

| Folder | Purpose |
|--------|---------|
| `postfix/` | **SMTP Server** (MTA) configuration (main.cf, master.cf) |
| `dovecot/` | **IMAP/POP3 Server** configuration |
| `sogo/` | **Webmail & Groupware** (CalDAV/CardDAV/ActiveSync) config |
| `rspamd/` | **Anti-Spam** configuration and modules |
| `clamav/` | **Anti-Virus** signature databases and config |
| `mysql/` | MariaDB initialization and configuration |
| `redis/` | Redis cache configuration (used by Rspamd) |
| `nginx/` | Web server config for Admin UI and SOGo |
| `phpfpm/` | PHP-FPM configuration for the Admin UI |
| `unbound/` | DNS caching and DNSSEC |

### Admin Interface: `data/web/`

| Folder | Purpose |
|--------|---------|
| `index.php` | Main entrypoint for mailcow admin and user panels |
| `inc/` | Core logic and database schema definitions (`init_db.inc.php`) |
| `admin/` | Server administration interface |
| `domainadmin/` | Domain-level administration UI |
| `user/` | Mailbox-level user settings UI |
| `api/` | Management REST API |

### Summary Statistics

| Metric | Value |
|--------|-------|
| Core Services | 10 (Postfix, Dovecot, SOGo, Rspamd, ClamAV, MariaDB, Redis, Nginx, PHP, Unbound) |
| Total DB Tables | ~40 |
| Deployment Type | Docker Compose Cluster |

---

## 9. Frappe HR (HRMS)

**Path**: `C:\Users\arpit\OneDrive\Desktop\Saas\hrms`
**Tech**: Python (Frappe Framework), Vue 3, Ionic, Vite | MariaDB
**Role**: Advanced Human Resource Management and Payroll. Integrated with ERPNext but functions as a standalone feature-set for employee lifecycle.

### Root Files

| File | Purpose |
|------|---------|
| `README.md` | HRMS overview and setup |
| `license.txt` | GNU Affero General Public License v3 |
| `package.json` | Node dependencies for building the PWA frontend |
| `pyproject.toml` | Python project metadata |

### Directory Structure

| Folder | Role & Purpose |
|--------|----------------|
| `hrms/` | **Main App Code** — Python backend logic |
| `hrms/hr/` | **HR Module** — Core HR functionality (Leave, Attendance, Shifts, Recruitment) |
| `hrms/payroll/` | **Payroll Module** — Salary processing, taxation, and benefits |
| `hrms/controllers/` | Base controllers and logic overrides for HR documents |
| `hrms/hooks.py` | App entry point, doctype overrides, and scheduler events |
| `hrms/overrides/` | Native Frappe/ERPNext class overrides |
| `hrms/public/` | Static assets and JS/CSS for the desktop UI |
| `hrms/regional/` | Country-specific logic (e.g., India HRA, Tax calculation) |
| `frontend/` | **Mobile PWA** — Vue 3 + Ionic + Tailwind mobile application |
| `frontend/src/` | Component, View, and State logic for the mobile app |
| `docker/` | Container orchestration for development/production |

### Highlights: `hrms/hrms/`

- **Leave Management**: Standardized workflows for leave requests and policy-based allocations.
- **Auto-Attendance**: Logic to process attendance from check-in logs and shifts.
- **Taxation Engine**: In `payroll/doctype/income_tax_slab/`, handles complex tax logic.
- **PWA Integration**: Unified mobile experience for employees to apply for leave and view payslips.
