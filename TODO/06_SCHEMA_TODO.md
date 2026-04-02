# 🗄️ SCHEMA TODO — Database Tables to Add

> Complete Prisma schema additions needed, derived from all 17 CRM repos.
> Organized by priority. Each model includes fields, types, and foreign keys.

---

## 🔴 PRIORITY 1: Critical Tables (Add First)

### Company (Standalone Entity)
```prisma
model Company {
  id          String   @id @default(uuid())
  name        String
  industry    String?
  sector      String?
  website     String?
  phone       String?
  email       String?
  address     String?
  city        String?
  state       String?
  country     String?
  zipcode     String?
  size        String?  // "1-10", "11-50", "51-200", "201-500", "500+"
  revenue     String?
  description String?  @db.Text
  logo        String?
  linkedinUrl String?
  taxIdentifier String?
  contextLinks Json?   // from AtomicCRM
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdBy   String?
  assignedTo  String?
  
  leads       Lead[]
  deals       Deal[]
  contacts    Contact[]
  invoices    Invoice[]
  salesOrders SalesOrder[]
  contracts   Contract[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([tenantId])
  @@index([name])
}
```

### Product & ProductCategory
```prisma
model ProductCategory {
  id          String    @id @default(uuid())
  name        String
  description String?   @db.Text
  parentId    String?
  parent      ProductCategory? @relation("CategoryTree", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("CategoryTree")
  products    Product[]
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([tenantId])
}

model Product {
  id           String    @id @default(uuid())
  name         String
  sku          String?
  description  String?   @db.Text
  price        Decimal   @db.Decimal(10, 2)
  costPrice    Decimal?  @db.Decimal(10, 2)
  currency     String    @default("INR")
  type         ProductType @default(GOODS)
  categoryId   String?
  category     ProductCategory? @relation(fields: [categoryId], references: [id])
  unitOfMeasure String?  @default("pcs")
  onSale       Boolean   @default(true)
  stockQuantity Int?     @default(0)
  taxRate      Decimal?  @db.Decimal(5, 2)
  images       Json?     // array of image URLs
  
  tenantId     String
  tenant       Tenant    @relation(fields: [tenantId], references: [id])
  
  invoiceLines   InvoiceLine[]
  salesOrderItems SalesOrderItem[]
  quoteLineItems Json? // for linking to quotes
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?
  @@index([tenantId])
  @@index([sku])
}

enum ProductType {
  GOODS
  SERVICE
}
```

### Invoice & InvoiceLine
```prisma
model Invoice {
  id            String   @id @default(uuid())
  number        String   // auto-generated: INV-2026-00001
  status        InvoiceStatus @default(DRAFT)
  issueDate     DateTime @default(now())
  dueDate       DateTime
  subtotal      Decimal  @db.Decimal(12, 2)
  taxAmount     Decimal  @db.Decimal(12, 2) @default(0)
  discountAmount Decimal @db.Decimal(12, 2) @default(0)
  total         Decimal  @db.Decimal(12, 2)
  currency      String   @default("INR")
  notes         String?  @db.Text
  terms         String?  @db.Text
  
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id])
  leadId        String?
  dealId        String?
  
  lineItems     InvoiceLine[]
  payments      Payment[]
  
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  createdBy     String
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  @@index([tenantId])
  @@index([number])
  @@index([status])
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELLED
  REFUNDED
}

model InvoiceLine {
  id          String  @id @default(uuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  description String
  quantity    Decimal @db.Decimal(10, 2)
  unitPrice   Decimal @db.Decimal(10, 2)
  taxRate     Decimal @db.Decimal(5, 2) @default(0)
  discount    Decimal @db.Decimal(10, 2) @default(0)
  total       Decimal @db.Decimal(12, 2)
  position    Int     @default(0)
  @@index([invoiceId])
}
```

### Payment
```prisma
model Payment {
  id            String   @id @default(uuid())
  invoiceId     String?
  invoice       Invoice? @relation(fields: [invoiceId], references: [id])
  amount        Decimal  @db.Decimal(12, 2)
  currency      String   @default("INR")
  paymentDate   DateTime @default(now())
  paymentMethod PaymentMethod @default(BANK_TRANSFER)
  status        PaymentStatus @default(RECEIVED)
  reference     String?  // txn ID, cheque number, etc.
  notes         String?  @db.Text
  
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  recordedBy    String
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([tenantId])
  @@index([invoiceId])
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CREDIT_CARD
  DEBIT_CARD
  UPI
  CHEQUE
  ONLINE
  OTHER
}

enum PaymentStatus {
  RECEIVED
  PENDING
  FAILED
  REFUNDED
}
```

### CalendarEvent & EventAttendee
```prisma
model CalendarEvent {
  id            String   @id @default(uuid())
  title         String
  description   String?  @db.Text
  startDatetime DateTime
  endDatetime   DateTime
  allDay        Boolean  @default(false)
  location      String?
  eventType     EventType @default(MEETING)
  color         String?  @default("#3b82f6")
  recurrenceRule String? // iCal RRULE format
  
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  attendees     EventAttendee[]
  
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([tenantId])
  @@index([userId])
  @@index([startDatetime])
}

enum EventType {
  MEETING
  CALL
  TASK
  REMINDER
  EVENT
  OUT_OF_OFFICE
}

model EventAttendee {
  id        String @id @default(uuid())
  eventId   String
  event     CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId    String?
  contactId String?
  email     String?
  status    AttendeeStatus @default(PENDING)
  @@index([eventId])
}

enum AttendeeStatus {
  PENDING
  ACCEPTED
  DECLINED
  TENTATIVE
}
```

### EmailTemplate
```prisma
model EmailTemplate {
  id        String  @id @default(uuid())
  name      String
  subject   String
  bodyHtml  String  @db.Text
  bodyText  String? @db.Text
  category  String?
  variables Json?   // available variables: ["lead.name", "deal.amount"]
  isActive  Boolean @default(true)
  
  tenantId  String
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  createdBy String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([tenantId])
}
```

### CustomField & CustomFieldValue
```prisma
model CustomField {
  id          String  @id @default(uuid())
  entityType  String  // "lead", "deal", "contact", "company"
  name        String  // internal name (snake_case)
  label       String  // display name
  fieldType   CustomFieldType
  options     Json?   // for SELECT/MULTISELECT: [{value: "a", label: "A"}]
  isRequired  Boolean @default(false)
  defaultValue String?
  placeholder String?
  helpText    String?
  position    Int     @default(0)
  isActive    Boolean @default(true)
  
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  values      CustomFieldValue[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([tenantId, entityType, name])
  @@index([tenantId, entityType])
}

enum CustomFieldType {
  TEXT
  TEXTAREA
  NUMBER
  DECIMAL
  DATE
  DATETIME
  BOOLEAN
  SELECT
  MULTISELECT
  URL
  EMAIL
  PHONE
  FILE
  JSON
}

model CustomFieldValue {
  id            String @id @default(uuid())
  customFieldId String
  customField   CustomField @relation(fields: [customFieldId], references: [id])
  entityType    String
  entityId      String
  value         Json   // stored as JSON for flexibility
  @@unique([customFieldId, entityType, entityId])
  @@index([entityType, entityId])
}
```

### BusinessHours & Holiday
```prisma
model BusinessHours {
  id        String  @id @default(uuid())
  name      String
  timezone  String  @default("Asia/Kolkata")
  isDefault Boolean @default(false)
  
  slots     BusinessHourSlot[]
  holidays  Holiday[]
  
  tenantId  String
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([tenantId])
}

model BusinessHourSlot {
  id              String @id @default(uuid())
  businessHoursId String
  businessHours   BusinessHours @relation(fields: [businessHoursId], references: [id], onDelete: Cascade)
  dayOfWeek       Int    // 0=Sunday, 1=Monday, ..., 6=Saturday
  isWorkingDay    Boolean @default(true)
  openTime        String  // "09:00"
  closeTime       String  // "18:00"
  @@unique([businessHoursId, dayOfWeek])
}

model Holiday {
  id              String @id @default(uuid())
  businessHoursId String
  businessHours   BusinessHours @relation(fields: [businessHoursId], references: [id], onDelete: Cascade)
  name            String
  date            DateTime
  isRecurringAnnually Boolean @default(false)
}
```

### NumberSequence
```prisma
model NumberSequence {
  id          String @id @default(uuid())
  entityType  String // "invoice", "sales_order", "purchase_order", "quote"
  prefix      String // "INV", "SO", "PO", "QUO"
  suffix      String? 
  padLength   Int    @default(5) // 00001
  currentNumber Int  @default(0)
  formatPattern String @default("{prefix}-{year}-{number}")
  
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id])
  @@unique([tenantId, entityType])
}
```

---

## 🟠 PRIORITY 2: High Tables

### SavedView
```prisma
model SavedView {
  id         String  @id @default(uuid())
  name       String
  entityType String
  filters    Json?   // [{field, operator, value}]
  columns    Json?   // ["name", "email", "status"]
  sortBy     Json?   // [{field, direction}]
  isDefault  Boolean @default(false)
  isShared   Boolean @default(false)
  
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  tenantId   String
  tenant     Tenant  @relation(fields: [tenantId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([tenantId, entityType])
}
```

### AuditLog
```prisma
model AuditLog {
  id         String   @id @default(uuid())
  entityType String
  entityId   String
  action     AuditAction
  oldValues  Json?
  newValues  Json?
  changedFields String[] // list of field names that changed
  
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  ipAddress  String?
  userAgent  String?
  
  tenantId   String
  createdAt  DateTime @default(now())
  @@index([tenantId, entityType, entityId])
  @@index([tenantId, userId])
  @@index([createdAt])
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  RESTORE
  LOGIN
  LOGOUT
}
```

### Pipeline & PipelineStage
```prisma
model Pipeline {
  id         String  @id @default(uuid())
  name       String
  entityType String  @default("deal") // deal, lead, ticket
  isDefault  Boolean @default(false)
  isActive   Boolean @default(true)
  
  stages     PipelineStage[]
  
  tenantId   String
  tenant     Tenant  @relation(fields: [tenantId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([tenantId])
}

model PipelineStage {
  id          String  @id @default(uuid())
  pipelineId  String
  pipeline    Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  name        String
  color       String  @default("#6b7280")
  probability Int?    // 0-100%
  position    Int     @default(0)
  isWon       Boolean @default(false)
  isLost      Boolean @default(false)
  @@index([pipelineId])
}
```

### Vendor, SalesOrder, PurchaseOrder
```prisma
model Vendor {
  id           String  @id @default(uuid())
  name         String
  email        String?
  phone        String?
  website      String?
  address      String? @db.Text
  category     String?
  paymentTerms String?
  notes        String? @db.Text
  
  purchaseOrders PurchaseOrder[]
  
  tenantId     String
  tenant       Tenant  @relation(fields: [tenantId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
  @@index([tenantId])
}

model SalesOrder {
  id           String  @id @default(uuid())
  number       String
  status       OrderStatus @default(DRAFT)
  companyId    String?
  company      Company? @relation(fields: [companyId], references: [id])
  orderDate    DateTime @default(now())
  deliveryDate DateTime?
  subtotal     Decimal @db.Decimal(12, 2)
  taxAmount    Decimal @db.Decimal(12, 2) @default(0)
  discountAmount Decimal @db.Decimal(12, 2) @default(0)
  total        Decimal @db.Decimal(12, 2)
  currency     String  @default("INR")
  notes        String? @db.Text
  
  items        SalesOrderItem[]
  
  tenantId     String
  tenant       Tenant  @relation(fields: [tenantId], references: [id])
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([tenantId])
}

model SalesOrderItem {
  id          String @id @default(uuid())
  orderId     String
  order       SalesOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  description String
  quantity    Decimal @db.Decimal(10, 2)
  unitPrice   Decimal @db.Decimal(10, 2)
  discount    Decimal @db.Decimal(10, 2) @default(0)
  taxRate     Decimal @db.Decimal(5, 2) @default(0)
  total       Decimal @db.Decimal(12, 2)
  position    Int     @default(0)
  @@index([orderId])
}

enum OrderStatus {
  DRAFT
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

model PurchaseOrder {
  id           String @id @default(uuid())
  number       String
  status       OrderStatus @default(DRAFT)
  vendorId     String
  vendor       Vendor @relation(fields: [vendorId], references: [id])
  orderDate    DateTime @default(now())
  expectedDate DateTime?
  subtotal     Decimal @db.Decimal(12, 2)
  taxAmount    Decimal @db.Decimal(12, 2) @default(0)
  total        Decimal @db.Decimal(12, 2)
  currency     String  @default("INR")
  notes        String? @db.Text
  
  items        PurchaseOrderItem[]
  
  tenantId     String
  tenant       Tenant @relation(fields: [tenantId], references: [id])
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([tenantId])
}

model PurchaseOrderItem {
  id          String @id @default(uuid())
  orderId     String
  order       PurchaseOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String?
  description String
  quantity    Decimal @db.Decimal(10, 2)
  unitPrice   Decimal @db.Decimal(10, 2)
  total       Decimal @db.Decimal(12, 2)
  position    Int     @default(0)
  @@index([orderId])
}
```

### Contract, Project, Document, ClosingReason, DedupeRule
```prisma
model Contract {
  id           String @id @default(uuid())
  name         String
  number       String?
  type         String?
  status       ContractStatus @default(DRAFT)
  startDate    DateTime
  endDate      DateTime
  value        Decimal? @db.Decimal(12, 2)
  renewalDate  DateTime?
  autoRenew    Boolean @default(false)
  
  companyId    String?
  company      Company? @relation(fields: [companyId], references: [id])
  
  tenantId     String
  tenant       Tenant @relation(fields: [tenantId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([tenantId])
}

enum ContractStatus {
  DRAFT
  ACTIVE
  EXPIRED
  TERMINATED
  RENEWED
}

model Project {
  id          String @id @default(uuid())
  name        String
  description String? @db.Text
  status      ProjectStatus @default(NOT_STARTED)
  startDate   DateTime?
  endDate     DateTime?
  budget      Decimal? @db.Decimal(12, 2)
  actualCost  Decimal? @db.Decimal(12, 2)
  
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  managerId   String?
  
  milestones  ProjectMilestone[]
  tasks       Task[]
  
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([tenantId])
}

enum ProjectStatus {
  NOT_STARTED
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}

model ProjectMilestone {
  id        String @id @default(uuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  dueDate   DateTime?
  status    String @default("pending")
  position  Int    @default(0)
  @@index([projectId])
}

model Document {
  id          String @id @default(uuid())
  name        String
  description String?
  filePath    String
  fileSize    Int?
  mimeType    String?
  fileUrl     String?
  folderId    String?
  folder      DocumentFolder? @relation(fields: [folderId], references: [id])
  
  sourceType  String? // "lead", "deal", "company", "ticket"
  sourceId    String?
  
  uploadedBy  String
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  @@index([tenantId])
  @@index([sourceType, sourceId])
}

model DocumentFolder {
  id        String @id @default(uuid())
  name      String
  parentId  String?
  parent    DocumentFolder? @relation("FolderTree", fields: [parentId], references: [id])
  children  DocumentFolder[] @relation("FolderTree")
  documents Document[]
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id])
  @@index([tenantId])
}

model ClosingReason {
  id          String @id @default(uuid())
  name        String
  isSuccess   Boolean @default(false)
  sortOrder   Int     @default(0)
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  @@index([tenantId])
}

model DedupeRule {
  id         String @id @default(uuid())
  entityType String
  name       String
  fieldRules Json   // [{field: "email", weight: 100, match_type: "exact"}]
  threshold  Int    @default(80) // 0-100 similarity score threshold
  isActive   Boolean @default(true)
  tenantId   String
  tenant     Tenant @relation(fields: [tenantId], references: [id])
  @@index([tenantId])
}

model DedupePair {
  id            String @id @default(uuid())
  entityType    String
  entityAId     String
  entityBId     String
  similarityScore Int
  status        DedupeStatus @default(PENDING)
  resolvedBy    String?
  resolvedAt    DateTime?
  tenantId      String
  tenant        Tenant @relation(fields: [tenantId], references: [id])
  @@index([tenantId, entityType, status])
  @@unique([entityType, entityAId, entityBId])
}

enum DedupeStatus {
  PENDING
  MERGED
  DISMISSED
}
```

---

## 📊 TABLE COUNT SUMMARY

| Category | New Tables | Status |
|----------|-----------|--------|
| Company | 1 | 🔴 P1 |
| Products | 2 | 🔴 P1 |
| Invoicing | 2 | 🔴 P1 |
| Payments | 1 | 🔴 P1 |
| Calendar | 2 | 🔴 P1 |
| Email Templates | 1 | 🔴 P1 |
| Custom Fields | 2 | 🔴 P1 |
| Business Hours | 3 | 🔴 P1 |
| Number Sequence | 1 | 🔴 P1 |
| Saved Views | 1 | 🟠 P2 |
| Audit Log | 1 | 🟠 P2 |
| Pipeline/Stages | 2 | 🟠 P2 |
| Vendors | 1 | 🟠 P2 |
| Sales Orders | 2 | 🟠 P2 |
| Purchase Orders | 2 | 🟠 P2 |
| Contracts | 1 | 🟠 P2 |
| Projects | 2 | 🟠 P2 |
| Documents | 2 | 🟠 P2 |
| Closing Reasons | 1 | 🟠 P2 |
| Deduplication | 2 | 🟠 P2 |
| **TOTAL** | **32 tables** | — |

**Current**: 38 tables → **After P1+P2**: 70 tables → On track toward 152 target
