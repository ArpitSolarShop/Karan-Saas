const fs = require('fs');
const schemaPath = 'backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

const tSearch = `  savedViews        SavedView[]

  @@map("tenants")
}`;
const tReplace = `  savedViews        SavedView[]

  workflows         Workflow[]
  webhookTargets    WebhookTarget[]
  auditLogs         AuditLog[]

  @@map("tenants")
}`;
schema = schema.replace(tSearch, tReplace);

fs.writeFileSync(schemaPath, schema);
