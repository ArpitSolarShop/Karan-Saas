const fs = require('fs');
const schemaPath = 'backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

const tSearch = `  workbooks         Workbook[]
  workflowRules     WorkflowRule[]

  @@map("tenants")
}`;
const tReplace = `  workbooks         Workbook[]
  workflowRules     WorkflowRule[]

  companies         Company[]
  productCategories ProductCategory[]
  products          Product[]
  invoices          Invoice[]
  payments          Payment[]
  calendarEvents    CalendarEvent[]
  emailTemplates    EmailTemplate[]
  customFields      CustomField[]
  businessHours     BusinessHours[]
  numberSequences   NumberSequence[]

  documentFolders   DocumentFolder[]
  documents         Document[]
  vendors           Vendor[]
  salesOrders       SalesOrder[]
  purchaseOrders    PurchaseOrder[]
  contracts         Contract[]
  projects          Project[]
  pipelines         Pipeline[]
  closingReasons    ClosingReason[]
  dedupeRules       DedupeRule[]
  dedupePairs       DedupePair[]
  channels          Channel[]
  savedViews        SavedView[]

  @@map("tenants")
}`;
schema = schema.replace(tSearch, tReplace);

const uSearch = `  team              Team?              @relation("TeamMembers", fields: [teamId], references: [id])
  tenant            Tenant             @relation(fields: [tenantId], references: [id])

  @@index([tenantId, role])`;
const uReplace = `  team              Team?              @relation("TeamMembers", fields: [teamId], references: [id])
  tenant            Tenant             @relation(fields: [tenantId], references: [id])

  calendarEvents    CalendarEvent[]    @relation("UserEvents")
  savedViews        SavedView[]

  @@index([tenantId, role])`;
schema = schema.replace(uSearch, uReplace);

const lSearch = `  campaign        Campaign?        @relation(fields: [campaignId], references: [id])
  tenant          Tenant           @relation(fields: [tenantId], references: [id])`;
const lReplace = `  campaign        Campaign?        @relation(fields: [campaignId], references: [id])
  companyId       String?
  company         Company?         @relation("CompanyLeads", fields: [companyId], references: [id])
  leadChannels    LeadChannel[]
  tenant          Tenant           @relation(fields: [tenantId], references: [id])`;
// also rename company String? into companyName String?
schema = schema.replace('company         String?', 'companyName     String?');
schema = schema.replace(lSearch, lReplace);


const dSearch = `  owner             User         @relation(fields: [ownerId], references: [id])
  tenant            Tenant       @relation(fields: [tenantId], references: [id])`;
const dReplace = `  owner             User         @relation(fields: [ownerId], references: [id])
  companyId         String?
  company           Company?     @relation("CompanyDeals", fields: [companyId], references: [id])
  dealChannels      DealChannel[]
  tenant            Tenant       @relation(fields: [tenantId], references: [id])`;
schema = schema.replace(dSearch, dReplace);

// We append first into schema memory:
const phase1 = fs.readFileSync('backend/prisma/schema_phase1_append.prisma', 'utf8');
const phase2 = fs.readFileSync('backend/prisma/schema_phase2_append.prisma', 'utf8');

schema = schema + '\n' + phase1 + '\n' + phase2;

// Now replacing company block which we just appended!
const cSearch = `  leads       Lead[]      @relation("CompanyLeads")
  deals       Deal[]      @relation("CompanyDeals")
  invoices    Invoice[]
  
  createdAt   DateTime @default(now())`;
const cReplace = `  leads       Lead[]      @relation("CompanyLeads")
  deals       Deal[]      @relation("CompanyDeals")
  invoices    Invoice[]
  salesOrders SalesOrder[]
  contracts   Contract[]
  projects    Project[]
  
  createdAt   DateTime @default(now())`;
schema = schema.replace(cSearch, cReplace);

fs.writeFileSync(schemaPath, schema);
