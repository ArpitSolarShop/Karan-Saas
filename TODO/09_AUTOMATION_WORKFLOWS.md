# ⚡ AUTOMATION & WORKFLOW PATTERNS — From All 17 CRMs

> Workflow automation rules, triggers, conditions, and actions found across all CRMs.

---

## 1. TRIGGER-CONDITION-ACTION FRAMEWORK

### How Most CRMs Structure Workflows

**SuiteCRM's AOW_WorkFlow**:
```
WorkflowRule {
  trigger: "on_create" | "on_update" | "on_delete" | "on_schedule"
  related_module: "Leads" | "Deals" | "Contacts" | ...
  conditions: [
    { field: "status", operator: "equals", value: "qualified" },
    { field: "amount", operator: "greater_than", value: 10000 }
  ]
  actions: [
    { type: "update_field", field: "assigned_to", value: "manager_id" },
    { type: "send_email", template_id: "welcome_email" },
    { type: "create_task", title: "Follow up with {lead.name}" }
  ]
}
```

### Our Existing Model (WorkflowRule):
```
trigger, condition (JSON), action, actionParams (JSON)
```

### Enhanced Model We Should Build:
```prisma
model Workflow {
  id          String @id @default(uuid())
  name        String
  description String?
  entityType  String  // lead, deal, contact, ticket, invoice
  trigger     WorkflowTrigger
  isActive    Boolean @default(true)
  
  conditions  WorkflowCondition[]
  actions     WorkflowAction[]
  
  executionCount Int @default(0)
  lastExecutedAt DateTime?
  
  tenantId    String
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum WorkflowTrigger {
  ON_CREATE
  ON_UPDATE
  ON_DELETE
  ON_FIELD_CHANGE
  ON_SCHEDULE
  ON_STAGE_CHANGE
  ON_STATUS_CHANGE
  ON_DATE_REACHED    // e.g., 2 days before due_date
  ON_INACTIVITY      // no activity for X days
  ON_WEBHOOK         // external trigger
}

model WorkflowCondition {
  id         String @id @default(uuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id])
  field      String     // "status", "amount", "assigned_to"
  operator   ConditionOperator
  value      String     // compared value
  logicGate  String @default("AND") // AND, OR
  position   Int @default(0)
}

enum ConditionOperator {
  EQUALS
  NOT_EQUALS
  GREATER_THAN
  LESS_THAN
  CONTAINS
  NOT_CONTAINS
  STARTS_WITH
  ENDS_WITH
  IS_EMPTY
  IS_NOT_EMPTY
  IN_LIST
  CHANGED_TO
  CHANGED_FROM
}

model WorkflowAction {
  id           String @id @default(uuid())
  workflowId   String
  workflow     Workflow @relation(fields: [workflowId], references: [id])
  actionType   WorkflowActionType
  params       Json   // action-specific configuration
  position     Int @default(0)
  delayMinutes Int? @default(0) // wait before executing
}

enum WorkflowActionType {
  UPDATE_FIELD      // {field: "status", value: "qualified"}
  SEND_EMAIL        // {template_id: "...", to: "lead.email"}
  SEND_WHATSAPP     // {template_id: "...", to: "lead.phone"}
  SEND_SMS          // {template_id: "...", to: "lead.phone"}
  CREATE_TASK       // {title: "...", assigned_to: "...", due_in_days: 3}
  CREATE_NOTE       // {text: "..."}
  ASSIGN_TO_USER    // {user_id: "..."}
  ASSIGN_ROUND_ROBIN // {team_id: "..."}
  SEND_NOTIFICATION // {title: "...", body: "...", to_user: "..."}
  CALL_WEBHOOK      // {url: "...", method: "POST", body: {...}}
  ADD_TAG           // {tag: "high-value"}
  REMOVE_TAG        // {tag: "cold"}
  UPDATE_SCORE      // {delta: 10}
  AWARD_POINTS      // {points: 5, reason: "Deal created"}
  CREATE_DEAL       // {name: "...", pipeline_id: "...", stage: "..."}
  TRIGGER_N8N       // {workflow_id: "..."}
  ESCALATE          // {to_user: "...", reason: "SLA breach"}
  WAIT              // {minutes: 60}
}
```

---

## 2. PRE-BUILT WORKFLOW TEMPLATES

### From SuiteCRM, EspoCRM, X2CRM, Zurmo

#### Lead Management Workflows
```
Template: "Lead Auto-Assignment"
  Trigger: ON_CREATE (Lead)
  Action: ASSIGN_ROUND_ROBIN to team "Sales Team A"

Template: "Lead Qualification Alert"
  Trigger: ON_FIELD_CHANGE (Lead.status → "qualified")
  Action: SEND_NOTIFICATION to manager
  Action: CREATE_TASK "Schedule meeting with {lead.name}" due in 1 day
  Action: UPDATE_SCORE +20 points

Template: "Cold Lead Re-engagement"
  Trigger: ON_INACTIVITY (Lead, 30 days)
  Condition: Lead.status NOT IN ["converted", "disqualified"]
  Action: CREATE_TASK "Re-engage cold lead: {lead.name}"
  Action: SEND_EMAIL template:"re_engagement_email"

Template: "Lead Source Attribution"
  Trigger: ON_CREATE (Lead)
  Condition: Lead.source IS_NOT_EMPTY
  Action: ADD_TAG "{lead.source}"

Template: "High-Value Lead Alert"
  Trigger: ON_CREATE (Lead)
  Condition: Lead.score > 80
  Action: SEND_NOTIFICATION to "All Managers"
  Action: ASSIGN_TO_USER "senior_sales_rep"
```

#### Deal/Pipeline Workflows
```
Template: "Deal Won Celebration"
  Trigger: ON_STAGE_CHANGE (Deal.stage → "won")
  Action: SEND_NOTIFICATION to team "Deal won: {deal.name} - ${deal.amount}"
  Action: CREATE_TASK "Send thank-you email to {deal.contact_name}"
  Action: AWARD_POINTS 50 "Deal closed"
  Action: UPDATE_FIELD Deal.win_closing_date = NOW

Template: "Deal Lost Analysis"
  Trigger: ON_STAGE_CHANGE (Deal.stage → "lost")
  Action: Prompt for CLOSING_REASON
  Action: SEND_NOTIFICATION to manager
  Action: CREATE_TASK "Post-mortem review for {deal.name}"

Template: "Stale Deal Warning"
  Trigger: ON_INACTIVITY (Deal, 14 days)
  Condition: Deal.stage NOT IN ["won", "lost"]
  Action: SEND_NOTIFICATION to owner "Deal inactive for 14 days: {deal.name}"
  Action: ADD_TAG "stale"

Template: "Deal Stage Follow-Up"
  Trigger: ON_STAGE_CHANGE (Deal)
  Action: CREATE_TASK "Next step for {deal.name}" due in 3 days
  Action: UPDATE_FIELD Deal.stages_dates = append timestamp
```

#### Ticket/Support Workflows
```
Template: "SLA Breach Warning"
  Trigger: ON_DATE_REACHED (Ticket.slaDueAt - 2 hours)
  Action: SEND_NOTIFICATION to agent "SLA approaching: {ticket.subject}"
  Action: ESCALATE to supervisor

Template: "Auto-Assign Tickets"
  Trigger: ON_CREATE (Ticket)
  Action: ASSIGN_ROUND_ROBIN to team "Support"

Template: "CSAT Survey on Close"
  Trigger: ON_STATUS_CHANGE (Ticket.status → "resolved")
  Action: WAIT 24 hours
  Action: SEND_EMAIL template:"csat_survey"
```

#### Invoice Workflows
```
Template: "Invoice Overdue Alert"
  Trigger: ON_DATE_REACHED (Invoice.dueDate + 1 day)
  Condition: Invoice.status NOT IN ["paid", "cancelled"]
  Action: UPDATE_FIELD Invoice.status = "OVERDUE"
  Action: SEND_EMAIL template:"overdue_reminder" to client
  Action: SEND_NOTIFICATION to account manager

Template: "Payment Confirmation"
  Trigger: ON_CREATE (Payment)
  Action: UPDATE_FIELD Invoice.status based on total payments vs amount
  Action: SEND_EMAIL template:"payment_receipt" to client
```

---

## 3. SCHEDULED AUTOMATION JOBS

### From SuiteCRM, EspoCRM, Zurmo

| Job | Schedule | Action |
|-----|----------|--------|
| **Lead Aging** | Daily 6 AM | Mark leads with no activity for 60+ days as "cold" |
| **Deal Stale Check** | Daily 9 AM | Send alerts for deals with no update in 14+ days |
| **Invoice Overdue** | Daily 8 AM | Update overdue invoice statuses |
| **SLA Check** | Every 15 min | Check approaching/breached SLA tickets |
| **Report Generation** | Weekly Mon 8 AM | Generate and email weekly reports |
| **Data Cleanup** | Weekly Sun 2 AM | Purge recycle bin (30+ days old) |
| **Exchange Rate Update** | Daily midnight | Update currency exchange rates |
| **Dedup Scan** | Daily 3 AM | Find and flag duplicate contacts/leads |
| **Backup Check** | Daily midnight | Verify database backup completion |
| **Import Queue** | Every 5 min | Process queued import jobs |

---

## 4. APPROVAL WORKFLOWS (from YetiForce)

### Approval Flow System
```prisma
model ApprovalProcess {
  id           String @id @default(uuid())
  name         String
  entityType   String // "deal", "quote", "invoice", "expense"
  conditions   Json   // when to trigger approval
  isActive     Boolean @default(true)
  
  steps        ApprovalStep[]
  
  tenantId     String
}

model ApprovalStep {
  id             String @id @default(uuid())
  processId      String
  process        ApprovalProcess @relation(fields: [processId], references: [id])
  position       Int
  approverType   String // "user", "role", "manager"
  approverId     String? // specific user ID or role ID
  
  escalateAfterMinutes Int? // auto-escalate if not approved
  escalateTo     String? // escalation user/role
}

model ApprovalRequest {
  id           String @id @default(uuid())
  processId    String
  entityType   String
  entityId     String
  currentStep  Int @default(0)
  status       ApprovalStatus @default(PENDING)
  
  requestedBy  String
  requestedAt  DateTime @default(now())
  resolvedAt   DateTime?
  resolvedBy   String?
  comments     String?
  
  tenantId     String
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  ESCALATED
  CANCELLED
}
```

### Pre-Built Approval Workflows
- **High-Value Deals** — Deals over ₹10L require manager approval
- **Discount Approval** — Quotes with >20% discount need approval
- **Expense Approval** — Expenses over ₹5K need department head approval
- **Invoice Credit** — Credit notes need finance team approval
- **Leave Request** — (from HR module) Manager approval for absences

---

## 5. EVENT-DRIVEN AUTOMATION (from Corteza, Twenty)

### Event Bus Design
```
CRM Events:
  entity.created    → {type, id, data, userId, timestamp}
  entity.updated    → {type, id, changes, oldValues, userId}
  entity.deleted    → {type, id, data, userId}
  deal.stage_changed → {dealId, oldStage, newStage}
  deal.won          → {dealId, amount, userId}
  deal.lost         → {dealId, reason, userId}
  lead.qualified    → {leadId, score, userId}
  lead.assigned     → {leadId, fromUserId, toUserId}
  ticket.created    → {ticketId, priority, source}
  ticket.sla_breach → {ticketId, metric(first_response/resolution)}
  invoice.paid      → {invoiceId, amount}
  user.login        → {userId, ip, device}
  call.completed    → {callId, duration, outcome, recording}
  email.received    → {emailId, from, to, subject}
```

### Event Consumers
1. **Workflow Engine** — evaluates rules and executes actions
2. **Notification Service** — sends real-time notifications
3. **Audit Logger** — records all events
4. **Analytics Engine** — updates dashboards and metrics
5. **n8n Trigger** — sends events to n8n for external automations
6. **Webhook Dispatcher** — delivers events to external URLs
7. **Gamification Engine** — awards points for qualifying events
8. **Search Indexer** — updates Meilisearch index

---

## 6. MARKETING AUTOMATION (from Zurmo, Krayin, X2CRM)

### Autoresponder System
```
Autoresponder {
  name, trigger_event, delay_minutes, 
  email_template_id, is_active, 
  conditions (JSON)
}

Flow Examples:
  New Lead → Wait 5 min → Send Welcome Email
  Lead Opened Email → Wait 1 day → Send Follow-Up
  Lead Clicked Link → Immediately → Update Score +10
  Lead No Open → Wait 3 days → Send Reminder
  Lead Booked Meeting → Immediately → Send Confirmation
```

### Marketing Drip Campaigns
```
DripCampaign {
  name, description, audience_filter (JSON), is_active
}

DripStep {
  campaign_id, position, delay_days, 
  action_type (send_email/send_whatsapp/create_task/add_tag),
  action_params (JSON),
  exit_conditions (JSON) // stop campaign if lead converts
}
```
