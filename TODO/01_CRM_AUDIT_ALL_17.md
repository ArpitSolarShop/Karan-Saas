# 📋 COMPLETE AUDIT — ALL 17 CRM REPOSITORIES

> Every CRM analyzed for its tech stack, module list, key entities, and standout features.

---

## 1. TWENTY CRM ⭐ (Most Modern — Our Primary Reference)

**Tech**: React 18, NestJS, TypeORM, PostgreSQL, Redis, GraphQL (Yoga), Nx monorepo, Jotai, Linaria, BullMQ, ClickHouse (analytics)

**Packages**:
- `twenty-front` — React SPA frontend
- `twenty-server` — NestJS backend API  
- `twenty-ui` — Shared UI component library
- `twenty-shared` — Common types/utilities
- `twenty-emails` — Email templates (React Email)
- `twenty-zapier` — Zapier integration
- `twenty-e2e-testing` — Playwright E2E
- `twenty-website` / `twenty-website-new` — Next.js docs sites
- `twenty-cli` — CLI tool
- `twenty-companion` — Browser extension
- `twenty-client-sdk` — Client SDK
- `twenty-docker` — Docker setup

**Server Modules (19)**:
`attachment`, `blocklist`, `calendar`, `company`, `connected-account`, `contact-creation-manager`, `dashboard`, `dashboard-sync`, `favorite`, `favorite-folder`, `match-participant`, `messaging`, `note`, `opportunity`, `person`, `task`, `timeline`, `workflow`, `workspace-member`

**Standout Features**:
- ✅ **Custom Objects & Metadata System** — users can create their own entities with custom fields
- ✅ **GraphQL API** with code-first approach
- ✅ **ClickHouse analytics** integration
- ✅ **Connected Accounts** (email sync via calendar/messaging modules)
- ✅ **Favorite Folders** — organize favorites into folders
- ✅ **Timeline** — unified activity timeline per entity
- ✅ **Contact Creation Manager** — auto-create contacts from emails
- ✅ **Dashboard Sync** — real-time dashboard data
- ✅ **Blocklist** — email/contact blocking
- ✅ **Workspace member management**
- ✅ **Browser companion extension**
- ✅ **Zapier integration** (pre-built)
- ✅ Multi-tenant schema architecture (core, metadata, workspace-specific schemas)

**Architecture Patterns**:
- Functional components only, no class components
- Named exports only
- Types over interfaces
- String literals over enums (except GraphQL)
- Components under 300 lines, services under 500
- Jotai for global state, Apollo for GraphQL cache
- Test pyramid: 70% unit, 20% integration, 10% E2E

---

## 2. ESPOCRM ⭐

**Tech**: PHP 8, Backbone.js, MySQL/PostgreSQL, Slim framework

**CRM Entities (25)**:
`Account`, `Call`, `Campaign`, `CampaignLogRecord`, `CampaignTrackingUrl`, `Case`, `Contact`, `Document`, `DocumentFolder`, `Email`, `EmailQueueItem`, `KnowledgeBaseArticle`, `KnowledgeBaseCategory`, `Lead`, `MassEmail`, `Meeting`, `Opportunity`, `Portal`, `Reminder`, `ScheduledJob`, `Target`, `TargetList`, `TargetListCategory`, `Task`, `User`

**Core Entities (65+)**:
`ActionHistoryRecord`, `AddressCountry`, `AppLogRecord`, `AppSecret`, `Attachment`, `AuthenticationProvider`, `AuthLogRecord`, `AuthToken`, `Currency`, `DashboardTemplate`, `EmailAccount`, `EmailAddress`, `EmailFilter`, `EmailFolder`, `EmailTemplate`, `EmailTemplateCategory`, `Export`, `Extension`, `ExternalAccount`, `GroupEmailFolder`, `Import`, `ImportEml`, `InboundEmail`, `Integration`, `Job`, `KanbanOrder`, `LayoutRecord`, `LayoutSet`, `LeadCapture`, `LeadCaptureLogRecord`, `MassAction`, `Note`, `Notification`, `OAuthAccount`, `OAuthProvider`, `PhoneNumber`, `Portal`, `PortalRole`, `Preferences`, `Role`, `ScheduledJobLogRecord`, `Settings`, `Sms`, `StarSubscription`, `StreamSubscription`, `Team`, `Template`, `TwoFactorCode`, `UniqueId`, `UserData`, `UserReaction`, `Webhook`, `WebhookEventQueueItem`, `WebhookQueueItem`, `WorkingTimeCalendar`, `WorkingTimeRange`

**Standout Features**:
- ✅ **Lead Capture Web Forms** with tracking URLs
- ✅ **Portal System** — customer-facing portal with separate roles
- ✅ **Stream/Activity Feed** — star subscriptions, user reactions
- ✅ **Mass Email** with campaign tracking and queue management
- ✅ **SMS support**
- ✅ **Working Time Calendar** — business hours configuration
- ✅ **KanbanOrder** — drag-and-drop board ordering persistence
- ✅ **WebSocket support** via websocket.php
- ✅ **Extension system** for plugins
- ✅ **Two Factor Authentication** codes
- ✅ **Import/Export** with EML email import
- ✅ **Dashboard Templates** — reusable dashboard layouts

---

## 3. SUITECRM ⭐ (110+ Modules — Most Feature-Rich Legacy CRM)

**Tech**: PHP (SugarCRM Community Edition fork), MySQL

**All Modules (110+)**:
`Accounts`, `ACL`, `ACLActions`, `ACLRoles`, `Activities`, `Administration`, `Alerts`, `AM_ProjectTemplates`, `AM_TaskTemplates`, `AOBHBusinessHours`, `AOD_Index`, `AOK_KnowledgeBase`, `AOK_Knowledge_Base_Categories`, `AOP_Case_Events`, `AOP_Case_Updates`, `AOR_Charts`, `AOR_Conditions`, `AOR_Fields`, `AOR_Reports`, `AOR_Scheduled_Reports`, `AOS_Contracts`, `AOS_Invoices`, `AOS_Line_Item_Groups`, `AOS_PDF_Templates`, `AOS_Products`, `AOS_Products_Quotes`, `AOS_Product_Categories`, `AOS_Quotes`, `AOW_Actions`, `AOW_Conditions`, `AOW_Processed`, `AOW_WorkFlow`, `Audit`, `Bugs`, `Calendar`, `CalendarAccount`, `Calls`, `Calls_Reschedule`, `CampaignLog`, `Campaigns`, `CampaignTrackers`, `Cases`, `Charts`, `Configurator`, `Connectors`, `Contacts`, `Currencies`, `Delegates`, `DocumentRevisions`, `Documents`, `DynamicFields`, `EAPM`, `EmailAddresses`, `EmailMan`, `EmailMarketing`, `Emails`, `EmailTemplates`, `EmailText`, `Employees`, `ExternalOAuthConnection`, `ExternalOAuthProvider`, `Favorites`, `FP_events`, `FP_Event_Locations`, `Groups`, `Help`, `History`, `Home`, `iCals`, `Import`, `InboundEmail`, `jjwg_Address_Cache`, `jjwg_Areas`, `jjwg_Maps`, `jjwg_Markers`, `LabelEditor`, `Leads`, `MailMerge`, `Meetings`, `MergeRecords`, `ModuleBuilder`, `MySettings`, `Notes`, `OAuth2AuthCodes`, `OAuth2Clients`, `OAuth2Tokens`, `OAuthKeys`, `OAuthTokens`, `Opportunities`, `OptimisticLock`, `OutboundEmailAccounts`, `Project`, `ProjectTask`, `ProspectLists`, `Prospects`, `Relationships`, `Releases`, `Reminders`, `Reminders_Invitees`, `ResourceCalendar`, `Roles`, `SavedSearch`, `Schedulers`, `SchedulersJobs`, `SecurityGroups`, `Spots`, `Studio`, `SugarFeed`, `SurveyQuestionOptions`, `SurveyQuestionResponses`, `SurveyQuestions`, `SurveyResponses`, `Surveys`, `Tasks`, `TemplateSectionLine`, `Trackers`, `UpgradeWizard`, `UserPreferences`, `Users`, `vCals`

**Standout Features**:
- ✅ **Contracts Module** — full contract lifecycle management
- ✅ **Invoicing** — invoices, line item groups, PDF templates
- ✅ **Products & Quotes** — product catalog with categories, quotes
- ✅ **Surveys** — questions, options, responses (full survey engine)
- ✅ **Events & Locations** — event management (FP_events)
- ✅ **Project Management** — projects, project tasks, templates
- ✅ **Geo Maps** (jjwg) — maps, markers, areas, address cache
- ✅ **Bug Tracking** — full bug/issue reporting
- ✅ **Call Scheduling/Rescheduling** — call management with reschedule
- ✅ **Reports Engine** — charts, conditions, fields, scheduled reports
- ✅ **Module Builder** — create custom modules
- ✅ **Security Groups** — row-level security
- ✅ **Business Hours** configuration
- ✅ **Merge Records** — deduplication and merge
- ✅ **Saved Search** — persistent filter configurations
- ✅ **PDF Templates** — PDF generation from templates
- ✅ **Resource Calendar** — resource scheduling
- ✅ **Dynamic Fields** — runtime field creation
- ✅ **Delegates** — meeting/event delegation
- ✅ **iCal integration** — calendar sync

---

## 4. CORTEZA ⭐ (Low-Code Platform)

**Tech**: Go (server), Vue.js (client), PostgreSQL, Docker

**Server Components**: `app`, `auth`, `automation`, `compose`, `discovery`, `federation`, `system`, `store`, `provision`, `codegen`, `webapp`, `webconsole`

**Key Concepts**:
- Compose (CRM/namespace builder), System (users, roles), Automation (workflows), Federation (multi-instance sync), Discovery (data search/indexing)

**Standout Features**:
- ✅ **Low-Code Platform** — build structured data apps without code
- ✅ **Federation** — connect multiple Corteza instances
- ✅ **RBAC Security** — flattened role-based access
- ✅ **Data Privacy** — GDPR compliance features
- ✅ **Accessibility** — WCAG 2.1 conformance
- ✅ **Compose Namespaces** — modular application building
- ✅ **Automation Scripts** — server-side automation
- ✅ **Workflow Engine** — visual workflow builder
- ✅ **Discovery Service** — unified search/indexing
- ✅ **Sink Routes** — custom webhook endpoints
- ✅ **Email Relay** — built-in email routing
- ✅ **SCIM support** — identity provisioning
- ✅ **Reporting engine**

---

## 5. KRAYIN CRM (Laravel-based Pipeline CRM)

**Tech**: Laravel PHP, Blade Templates

**Packages (19)**:
`Activity`, `Admin`, `Attribute`, `Automation`, `Contact`, `Core`, `DataGrid`, `DataTransfer`, `Email`, `EmailTemplate`, `Installer`, `Lead`, `Marketing`, `Product`, `Quote`, `Tag`, `User`, `Warehouse`, `WebForm`

**Standout Features**:
- ✅ **Warehouse Module** — inventory/warehouse management
- ✅ **WebForm** — lead capture web forms
- ✅ **DataGrid** — advanced data grid component
- ✅ **DataTransfer** — import/export engine
- ✅ **Attribute System** — custom attributes/fields
- ✅ **Marketing Module** — campaign management
- ✅ **Automation Engine** — workflow automation
- ✅ **Quote Management** — quotation builder
- ✅ **Product Catalog** — product management
- ✅ **Email Templates** — template management

---

## 6. MONICA (Personal Relationship CRM)

**Tech**: Laravel PHP, Vue.js/Inertia, PostgreSQL

**Models (70+)**: `Account`, `Address`, `AddressBookSubscription`, `AddressType`, `Call`, `CallReason`, `CallReasonType`, `Company`, `Contact`, `ContactFeedItem`, `ContactImportantDate`, `ContactImportantDateType`, `ContactInformation`, `ContactInformationType`, `ContactReminder`, `ContactTask`, `Currency`, `Emotion`, `File`, `Gender`, `GiftOccasion`, `GiftState`, `Goal`, `Group`, `GroupType`, `GroupTypeRole`, `Journal`, `JournalMetric`, `Label`, `LifeEvent`, `LifeEventCategory`, `LifeEventType`, `LifeMetric`, `Loan`, `Log`, `Module`, `ModuleRow`, `ModuleRowField`, `MoodTrackingEvent`, `MoodTrackingParameter`, `MultiAvatar`, `Note`, `Pet`, `PetCategory`, `Post`, `PostMetric`, `PostSection`, `PostTemplate`, `PostTemplateSection`, `Pronoun`, `QuickFact`, `RelationshipGroupType`, `RelationshipType`, `Religion`, `SliceOfLife`, `Streak`, `SyncToken`, `Tag`, `Template`, `TemplatePage`, `TimelineEvent`, `User`, `UserNotificationChannel`, `UserNotificationSent`, `Vault`, `VaultQuickFactsTemplate`, `WebauthnKey`

**Standout Features (Unique to Monica)**:
- ✅ **Relationship Types** — define how contacts relate (friend, family, colleague, etc.)
- ✅ **Life Events** — track birthdays, marriages, job changes, etc.
- ✅ **Journal & Diary** — daily journaling with metrics
- ✅ **Mood Tracking** — emotion/mood tracking over time
- ✅ **Gift Management** — track gift ideas, occasions, states
- ✅ **Goals** — personal goals tracking
- ✅ **Streaks** — maintain interaction streaks with contacts
- ✅ **Quick Facts** — fast info cards for contacts
- ✅ **Contact Templates** — customizable contact page layouts
- ✅ **Module System** — show/hide sections per contact (modular layout)
- ✅ **Vaults** — multi-workspace data isolation
- ✅ **WebAuthn** — passwordless authentication (FIDO2)
- ✅ **AddressBook Sync** — CardDAV subscription
- ✅ **Loans Tracking** — track money lent/borrowed
- ✅ **Pet Management** — pets per contact with categories
- ✅ **Pronouns & Gender** — inclusive contact management
- ✅ **Slice of Life** — highlight moments
- ✅ **Post Templates** — structured post/update templates
- ✅ **Call Reasons** — categorize call purposes

---

## 7. CIVICRM (Nonprofit/Membership CRM)

**Tech**: PHP, Angular.js, MySQL/PostgreSQL

**CRM Modules (38)**:
`ACL`, `Activity`, `Admin`, `Api4`, `Badge`, `Batch`, `Bridge`, `Campaign`, `Case`, `Contact`, `Contribute`, `Core`, `Custom`, `Dashlet`, `Dedupe`, `Event`, `Export`, `Extension`, `Financial`, `Friend`, `Group`, `Import`, `Invoicing`, `Logging`, `Mailing`, `Member`, `Note`, `PCP`, `Pledge`, `Price`, `Profile`, `Queue`, `Report`, `SMS`, `Tag`, `UF`, `Upgrade`, `Utils`

**Standout Features**:
- ✅ **Membership Management** — membership types, statuses, renewals
- ✅ **Contributions/Donations** — financial contribution tracking
- ✅ **Pledges** — donation pledge management with installments
- ✅ **Event Management** — event creation, registration, sessions
- ✅ **Financial Module** — financial types, categories, GL accounts
- ✅ **Mailing System** — mass mailing with tracking
- ✅ **Personal Campaign Pages (PCP)** — peer-to-peer fundraising
- ✅ **Deduplication Engine** — contact merge/dedup
- ✅ **Badge System** — achievements/badges
- ✅ **Case Management** — case types, statuses, activities
- ✅ **Batch Processing** — bulk operations
- ✅ **Profiles** — custom data collection forms
- ✅ **Price Sets** — flexible pricing structures
- ✅ **Friend/Referral** — "tell a friend" campaigns
- ✅ **SMS Module** — SMS messaging
- ✅ **Dashlets** — configurable dashboard widgets

---

## 8. ATOMICCRM (Modern React CRM)

**Tech**: React 19, Vite, shadcn/ui, Supabase, TanStack Query, React Hook Form, React Router v7, Tailwind CSS v4

**Database Tables (8)**: `companies`, `contacts`, `contact_notes`, `deals`, `deal_notes`, `sales`, `tags`, `tasks`, `configuration`

**Standout Features**:
- ✅ **Kanban Board** for deals — drag-and-drop pipeline
- ✅ **Database Views** — `contacts_summary`, `companies_summary` for aggregated queries
- ✅ **Database Triggers** — auto-sync auth.users to CRM sales table
- ✅ **Edge Functions** — serverless user management, inbound email
- ✅ **CSV Import/Export** for contacts
- ✅ **Contact Merge Logic**
- ✅ **FakeRest Data Provider** — demo mode without backend
- ✅ **Filter System** — PostgREST-compatible operator filters
- ✅ **CRM Configuration via Props** — deal stages, note statuses, task types all configurable
- ✅ **Tag System** with colors
- ✅ **Dark/Light Theme** support
- ✅ **Telemetry opt-out**

---

## 9. DAYBYDAYCRM

**Tech**: Laravel PHP, Bootstrap, jQuery

**Models (29)**: `Absence`, `Activity`, `Appointment`, `BusinessHour`, `Client`, `Comment`, `Contact`, `CreditLine`, `CreditNote`, `Department`, `Document`, `Industry`, `Integration`, `Invoice`, `InvoiceLine`, `Lead`, `Mail`, `Offer`, `Payment`, `Permission`, `PermissionRole`, `Product`, `Project`, `Role`, `RoleUser`, `Setting`, `Status`, `Task`, `User`

**Standout Features**:
- ✅ **Invoicing System** — invoices, line items, credit notes
- ✅ **Payment Tracking** — payment recording
- ✅ **Projects Module** — full project management
- ✅ **Appointments** — scheduling and calendar
- ✅ **Absences** — employee absence tracking
- ✅ **Business Hours** — configurable business hours
- ✅ **Offers/Proposals** — offer management
- ✅ **Products** — product catalog
- ✅ **Department Management** — organizational structure
- ✅ **Credit Notes** — credit management
- ✅ **Mail Module** — email integration
- ✅ **Document Management** — file/document upload

---

## 10. FREE-CRM (.NET Clean Architecture)

**Tech**: .NET C#, ASP.NET Core, Clean Architecture (DDD)

**Domain Entities (31)**: `Budget`, `Campaign`, `Company`, `Customer`, `CustomerCategory`, `CustomerContact`, `CustomerGroup`, `Expense`, `FileDocument`, `FileImage`, `Lead`, `LeadActivity`, `LeadContact`, `NumberSequence`, `Product`, `ProductGroup`, `PurchaseOrder`, `PurchaseOrderItem`, `SalesOrder`, `SalesOrderItem`, `SalesRepresentative`, `SalesTeam`, `Tax`, `Todo`, `TodoItem`, `Token`, `UnitMeasure`, `Vendor`, `VendorCategory`, `VendorContact`, `VendorGroup`

**Standout Features**:
- ✅ **Sales Orders** — full sales order with line items
- ✅ **Purchase Orders** — purchasing with line items
- ✅ **Budget Management** — budget tracking
- ✅ **Expense Tracking** — expense management
- ✅ **Tax Management** — tax calculations
- ✅ **Vendor Management** — vendors with categories, contacts, groups
- ✅ **Customer Categories & Groups** — customer segmentation
- ✅ **Product Groups** — product categorization
- ✅ **Unit of Measure** — UoM management
- ✅ **Number Sequences** — auto-numbering for documents
- ✅ **Sales Teams** — team-based selling
- ✅ **Lead Activities** — activity log per lead
- ✅ **File Documents & Images** — asset management
- ✅ **Clean Architecture (DDD)** — Domain, Application, Infrastructure layers

---

## 11. X2CRM

**Tech**: PHP Yii Framework, MySQL

**Modules (22)**: `accounts`, `actions`, `bugReports`, `calendar`, `charts`, `contacts`, `docs`, `emailInboxes`, `groups`, `marketing`, `media`, `mobile`, `opportunities`, `products`, `quotes`, `reports`, `services`, `template`, `topics`, `users`, `workflow`, `x2Leads`

**Standout Features**:
- ✅ **Bug Reports/Issue Tracking**
- ✅ **Services Module** — service management
- ✅ **Media Management** — media files
- ✅ **Topics/Forums** — discussion topics
- ✅ **Mobile Module** — mobile-optimized views
- ✅ **Workflow Engine** — visual workflow with actions
- ✅ **Marketing Automation** — campaign marketing
- ✅ **Chart/Reports** — reporting engine
- ✅ **Email Inboxes** — multi-inbox management
- ✅ **Document Templates** — document generation

---

## 12. YETIFORCECRM ⭐ (100+ Modules — Enterprise Grade)

**Tech**: PHP, jQuery, MySQL

**All Modules (100+)**:
`Accounts`, `ActivityRegister`, `Announcements`, `API`, `ApiAddress`, `Approvals`, `ApprovalsRegister`, `Assets`, `AuditRegister`, `BankAccounts`, `Calendar`, `CallHistory`, `Campaigns`, `CFixedAssets`, `Chat`, `CInternalTickets`, `CMileageLogbook`, `Competition`, `Contacts`, `CustomView`, `Dashboard`, `DataSetRegister`, `Documents`, `EmailTemplates`, `Faq`, `FBookkeeping`, `FCorectingInvoice`, `FInvoice`, `FInvoiceCost`, `FInvoiceProforma`, `HelpDesk`, `HolidaysEntitlement`, `Home`, `Ideas`, `IGDN`, `IGDNC`, `IGIN`, `IGRN`, `IGRNC`, `IIDN`, `Import`, `IncidentRegister`, `IPreOrder`, `ISTDN`, `ISTN`, `IStorages`, `ISTRN`, `KnowledgeBase`, `Leads`, `LettersIn`, `LettersOut`, `LocationRegister`, `Locations`, `MailIntegration`, `ModComments`, `ModTracker`, `MultiCompany`, `Notification`, `Occurrences`, `OpenStreetMap`, `OSSEmployees`, `OSSMail`, `OSSMailScanner`, `OSSMailView`, `OSSOutsourcedServices`, `OSSSoldServices`, `OSSTimeControl`, `OutsourcedProducts`, `Partners`, `Passwords`, `PaymentsIn`, `PaymentsOut`, `PermissionInspector`, `PickList`, `PriceBooks`, `ProductCategory`, `Products`, `Project`, `ProjectMilestone`, `ProjectTask`, `Queue`, `RecycleBin`, `Reservations`, `Rss`, `SCalculations`, `ServiceContracts`, `Services`, `Settings`, `SMSNotifier`, `SMSTemplates`, `SQuoteEnquiries`, `SQuotes`, `SRecurringOrders`, `SRequirementsCards`, `SSalesProcesses`, `SSingleOrders`, `SVendorEnquiries`, `Users`, `Vendors`

**Standout Features (UNIQUE and VALUABLE)**:
- ✅ **Full Inventory System** — IGDN (Goods Dispatch), IGRN (Goods Receipt), IGIN (Internal), IStorages (warehouses), IPreOrder
- ✅ **Bookkeeping** — FBookkeeping, FInvoice, FInvoiceCost, FInvoiceProforma, FCorectingInvoice
- ✅ **Multi-Company** — manage multiple companies from one instance
- ✅ **Approvals System** — approval workflows with register
- ✅ **Mileage Logbook** — vehicle/travel expense tracking
- ✅ **Fixed Assets** — asset management
- ✅ **Bank Accounts** — bank account management
- ✅ **Letters In/Out** — correspondence tracking
- ✅ **Holidays Entitlement** — employee leave management
- ✅ **Competition Tracking** — competitor analysis
- ✅ **Ideas Module** — idea/suggestion management
- ✅ **Incident Register** — incident/issue tracking
- ✅ **Location Management** — physical location tracking
- ✅ **Reservations** — resource reservation system
- ✅ **Recurring Orders** — subscription/recurring order management
- ✅ **Sales Process** — structured sales pipeline
- ✅ **Quote Enquiries / Vendor Enquiries** — RFQ management
- ✅ **Requirements Cards** — requirements gathering
- ✅ **Outsourced Services/Products** — outsourcing management
- ✅ **Time Control** — employee time tracking
- ✅ **Chat Module** — internal chat
- ✅ **Announcements** — company announcements
- ✅ **Passwords Module** — shared password management
- ✅ **RSS Reader** — news feed
- ✅ **Recycle Bin** — soft delete recovery
- ✅ **Permission Inspector** — debug permission issues
- ✅ **Audit Register** — comprehensive audit trail
- ✅ **Dataset Register** — data management
- ✅ **Activity Register** — activity logging
- ✅ **OpenStreetMap** — map integration
- ✅ **Service Contracts** — service level agreements
- ✅ **Partners Module** — partner relationship management
- ✅ **Mail Scanner** — automatic email parsing
- ✅ **Call History** — telephony logs

---

## 13. VTIGERCRM

**Tech**: PHP, Smarty Templates, MySQL/PostgreSQL

**Modules (36)**: `Accounts`, `Administration`, `Calendar`, `Campaigns`, `Workflows`, `Contacts`, `CustomView`, `Dashboard`, `Documents`, `Emails`, `Faq`, `HelpDesk`, `Home`, `Invoice`, `Leads`, `Migration`, `PickList`, `Portal`, `Potentials`, `PriceBooks`, `Products`, `PurchaseOrder`, `Quotes`, `Reports`, `Rss`, `SalesOrder`, `Settings`, `System`, `Users`, `Utilities`, `Vendors`, `Webmails`

**Standout Features**:
- ✅ **Sales Orders** — full sales order management
- ✅ **Purchase Orders** — procurement
- ✅ **Invoice Module** — invoicing
- ✅ **PriceBooks** — tiered pricing for different customer segments
- ✅ **FAQ Module** — knowledge base
- ✅ **Customer Portal** — client-facing portal
- ✅ **Quotes** — quotation management
- ✅ **Potentials (Opportunities)** — deal/opportunity pipeline
- ✅ **Custom Views** — saved list views
- ✅ **Vendor Management** — supplier handling
- ✅ **Webmail Integration** — email within CRM

---

## 14. DJANGO-CRM

**Tech**: Python Django, PostgreSQL

**Apps**: `crm`, `analytics`, `chat`, `common`, `massmail`, `tasks`, `voip`, `quality`, `help`

**Models**: `BaseContact`, `Company`, `Contact`, `Country`, `CrmEmail`, `Deal`, `Lead`, `Payment`, `Product`, `Request`, `Tag`, `Currency`, `Rate`, `Stage`, `LeadSource`, `ClosingReason`, `Industry`, `ClientType`, `ProductCategory`

**Standout Features**:
- ✅ **Deal Stage Tracking** — records date of each stage transition
- ✅ **Closing Reasons** — structured deal win/loss reasons
- ✅ **Payment System** — payments with status (received, guaranteed, high/low probability), shares
- ✅ **Currency Exchange Rates** — multi-currency with auto-update rates
- ✅ **VoIP Integration** — built-in VoIP module
- ✅ **Analytics Module** — dedicated analytics
- ✅ **Chat Module** — internal messaging
- ✅ **Mass Mail** — bulk email campaigns
- ✅ **Quality Module** — quality management
- ✅ **Lead Sources** with UUID tracking and web form templates
- ✅ **Co-Owner on Deals** — deal co-ownership
- ✅ **Next Step Tracking** — deal next step with deadline
- ✅ **Products** — goods vs services types, with categories

---

## 15. FAT FREE CRM

**Tech**: Ruby on Rails, PostgreSQL/MySQL/SQLite

**Entities**: `Account`, `AccountContact`, `AccountOpportunity`, `Campaign`, `Contact`, `ContactOpportunity`, `Lead`, `Opportunity`

**Other Models**: `List`, `Setting`, `ResearchTool`

**Standout Features**:
- ✅ **Lightweight & Simple** — minimal CRM focused on core features
- ✅ **Account-Contact many-to-many** — flexible relationship modeling
- ✅ **Contact-Opportunity linkage** — track which contacts on which deals
- ✅ **Campaign Management** — marketing campaigns
- ✅ **Custom Fields** via polymorphic model
- ✅ **Research Tool** — data research integration

---

## 16. OROCRM (Enterprise Symfony CRM)

**Tech**: PHP Symfony, Doctrine ORM, MySQL/PostgreSQL

**Bundles**: `AccountBundle`, `ActivityContactBundle`, `AnalyticsBundle`, `CaseBundle`, `ChannelBundle`, `ContactBundle`, `ContactUsBundle`, `CRMBundle`, `DemoDataBundle`, `ReportCRMBundle`, `SalesBundle`, `TestFrameworkCRMBundle`

**Standout Features**:
- ✅ **Channel-based Architecture** — multi-channel customer acquisition
- ✅ **Analytics Bundle** — RFM (Recency, Frequency, Monetary) analysis
- ✅ **Case Management** — customer support cases
- ✅ **Contact Us Forms** — lead capture
- ✅ **Sales Bundle** — pipeline management
- ✅ **Report CRM** — CRM-specific reporting
- ✅ **Activity-Contact tracking** — link activities to contacts
- ✅ **Demo Data** — pre-built demo data generation

---

## 17. ZURMO (Gamification CRM)

**Tech**: PHP Yii Framework, MySQL, RedBeanPHP ORM

**Modules (39)**: `accounts`, `activities`, `api`, `autoresponders`, `campaigns`, `comments`, `configuration`, `contacts`, `contactWebForms`, `conversations`, `designer`, `emailMessages`, `emailTemplates`, `export`, `gamification`, `home`, `import`, `install`, `jobsManager`, `leads`, `maps`, `marketing`, `marketingLists`, `mashableInbox`, `meetings`, `missions`, `notes`, `notifications`, `opportunities`, `products`, `productTemplates`, `reports`, `rssReader`, `socialItems`, `tasks`, `tracking`, `users`, `workflows`, `zurmo`

**Standout Features (UNIQUE)**:
- ✅ **GAMIFICATION ENGINE** — points, badges, leaderboards for CRM users
- ✅ **Missions** — assign missions/challenges to users
- ✅ **Conversations** — threaded internal conversations
- ✅ **Mashable Inbox** — unified inbox for all notifications
- ✅ **Social Items** — social media integration
- ✅ **Autoresponders** — automated email responses
- ✅ **Marketing Lists** — segmented marketing lists
- ✅ **Contact Web Forms** — lead capture forms
- ✅ **Product Templates** — reusable product definitions
- ✅ **Designer** — form/layout designer
- ✅ **Tracking** — visitor/behavior tracking
- ✅ **Job Manager** — background job queue
- ✅ **RSS Reader** — news feed
- ✅ **Maps** — geographic visualization
