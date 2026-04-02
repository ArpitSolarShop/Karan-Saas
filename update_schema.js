const fs = require('fs');

const schemaPath = 'backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Inject Tenant fields
const tenantInjection = `
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
`;
schema = schema.replace('  @@map("tenants")\n}', tenantInjection + '  @@map("tenants")\n}');

// 2. Inject User fields
const userInjection = `
  calendarEvents    CalendarEvent[]    @relation("UserEvents")
  savedViews        SavedView[]
`;
schema = schema.replace('  @@index([tenantId, role])\n  @@map("users")\n}', userInjection + '  @@index([tenantId, role])\n  @@map("users")\n}');

// 3. Inject Lead fields
// Replace `company  String?` with `companyName  String?` first
schema = schema.replace('company         String?', 'companyName     String?');
const leadInjection = `
  companyId       String?
  company         Company?         @relation("CompanyLeads", fields: [companyId], references: [id])
  leadChannels    LeadChannel[]
`;
schema = schema.replace('  tenant          Tenant           @relation(fields: [tenantId], references: [id])\n  notes           Note[]', leadInjection + '  tenant          Tenant           @relation(fields: [tenantId], references: [id])\n  notes           Note[]');

// 4. Inject Deal fields
const dealInjection = `
  companyId         String?
  company           Company?     @relation("CompanyDeals", fields: [companyId], references: [id])
  dealChannels      DealChannel[]
`;
schema = schema.replace('  tenant            Tenant       @relation(fields: [tenantId], references: [id])\n  quotes            Quote[]', dealInjection + '  tenant            Tenant       @relation(fields: [tenantId], references: [id])\n  quotes            Quote[]');

// Write baseline updated core schema
fs.writeFileSync(schemaPath, schema);

// 5. Append Phase 1 and 2
const phase1 = fs.readFileSync('backend/prisma/schema_phase1_append.prisma', 'utf8');
const phase2 = fs.readFileSync('backend/prisma/schema_phase2_append.prisma', 'utf8');

fs.appendFileSync(schemaPath, '\n' + phase1 + '\n' + phase2);

// Now update Company inside the newly appended Phase 1 schema, because the initial replace won't find Company since it's just been appended.
// Actually, Company is in phase1. Let's fix Company inside phase1 before appending.
// Let's reload and replace.
let fullSchema = fs.readFileSync(schemaPath, 'utf8');
const companySearch = `  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([tenantId])
  @@index([name])
}`;
const companyReplace = `  leads       Lead[]      @relation("CompanyLeads")
  deals       Deal[]      @relation("CompanyDeals")
  invoices    Invoice[]
  salesOrders SalesOrder[]
  contracts   Contract[]
  projects    Project[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([tenantId])
  @@index([name])
}`;
fullSchema = fullSchema.replace(companySearch, companyReplace);

fs.writeFileSync(schemaPath, fullSchema);
console.log("Schema perfectly manipulated!");
