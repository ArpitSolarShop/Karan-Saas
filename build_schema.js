const fs = require('fs');
const schemaPath = 'backend/prisma/schema.prisma';

// Start from clean HEAD
require('child_process').execSync('git restore backend/prisma/schema.prisma');

let schema = fs.readFileSync(schemaPath, 'utf8');

// Phase 1 + 2 + 3 + 3.5 + 4 strings
const phase1 = fs.readFileSync('backend/prisma/schema_phase1_append.prisma', 'utf8');
const phase2 = fs.readFileSync('backend/prisma/schema_phase2_append.prisma', 'utf8');
const phase3 = fs.readFileSync('backend/prisma/schema_phase3_append.prisma', 'utf8');
const phase35 = fs.readFileSync('backend/prisma/schema_phase35_append.prisma', 'utf8');
const phase4 = fs.readFileSync('backend/prisma/schema_phase4_append.prisma', 'utf8');

schema = schema + '\n' + phase1 + '\n' + phase2 + '\n' + phase3 + '\n' + phase35 + '\n' + phase4;

// Tenant Injection
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
  
  workflows         Workflow[]
  
  approvalRequests  ApprovalRequest[]
  webForms          WebForm[]
  emailCampaigns    EmailCampaign[]
  
  gamificationScores GamificationScore[]
  badges            Badge[]
  assets            Asset[]
  assetReservations AssetReservation[]
  leaveRequests     LeaveRequest[]
  slaPolicies       SlaPolicy[]
  contactRelationships ContactRelationship[]
  events            Event[]
  eventRegistrations EventRegistration[]
  surveys           Survey[]
  announcements     Announcement[]
  customObjectSchemas CustomObjectSchema[]

  @@map("tenants")
}`;
schema = schema.replace(tSearch, tReplace);

// User Injection
const uSearch = `  team              Team?              @relation("TeamMembers", fields: [teamId], references: [id])
  tenant            Tenant             @relation(fields: [tenantId], references: [id])

  @@index([tenantId, role])`;
const uReplace = `  team              Team?              @relation("TeamMembers", fields: [teamId], references: [id])
  tenant            Tenant             @relation(fields: [tenantId], references: [id])

  calendarEvents    CalendarEvent[]    @relation("UserEvents")
  savedViews        SavedView[]
  approvals         ApprovalRequest[]
  gamificationScore GamificationScore? @relation("UserGamification")
  badges            Badge[]            @relation("UserBadges")
  assetReservations AssetReservation[]
  leaveRequests     LeaveRequest[]

  @@index([tenantId, role])`;
schema = schema.replace(uSearch, uReplace);

// Lead Injection
const lSearch = `  campaign        Campaign?        @relation(fields: [campaignId], references: [id])
  tenant          Tenant           @relation(fields: [tenantId], references: [id])`;
const lReplace = `  campaign        Campaign?        @relation(fields: [campaignId], references: [id])
  companyId       String?
  company         Company?         @relation("CompanyLeads", fields: [companyId], references: [id])
  leadChannels    LeadChannel[]
  eventRegistrations EventRegistration[]
  campaignRecipient CampaignRecipient[]
  relatedFrom     ContactRelationship[] @relation("ContactRelationA")
  relatedTo       ContactRelationship[] @relation("ContactRelationB")
  tenant          Tenant           @relation(fields: [tenantId], references: [id])`;
schema = schema.replace('company         String?', 'companyName     String?');
schema = schema.replace(lSearch, lReplace);


// Deal Injection
const dSearch = `  owner             User         @relation(fields: [ownerId], references: [id])
  tenant            Tenant       @relation(fields: [tenantId], references: [id])`;
const dReplace = `  owner             User         @relation(fields: [ownerId], references: [id])
  companyId         String?
  company           Company?     @relation("CompanyDeals", fields: [companyId], references: [id])
  dealChannels      DealChannel[]
  tenant            Tenant       @relation(fields: [tenantId], references: [id])`;
schema = schema.replace(dSearch, dReplace);

// Company injection
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
console.log("Schema compiled completely across all phases 1-4!");
