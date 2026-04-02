# 🎮 GAMIFICATION, ANALYTICS & REPORTING — From All 17 CRMs

> Gamification engines, analytics features, and reporting capabilities extracted.

---

## 1. GAMIFICATION ENGINE (from Zurmo CRM)

### Overview
Zurmo is the ONLY open-source CRM with built-in gamification. Their system drives CRM adoption by rewarding users for activity.

### Point-Earning Events

| Event | Points | Found In |
|-------|--------|----------|
| Create a lead | 5 | Zurmo |
| Log a call | 5 | Zurmo |
| Send an email | 3 | Zurmo |
| Create a deal | 10 | Zurmo |
| Close deal (won) | 50 | Zurmo |
| Complete a task | 5 | Zurmo |
| Update a contact | 2 | Zurmo |
| Log a meeting | 5 | Zurmo |
| Add a note | 2 | Zurmo |
| Import contacts | 10 | Zurmo |
| First login today | 5 | Zurmo |
| 7-day login streak | 20 | Zurmo |
| 30-day login streak | 100 | Zurmo |

### Badge System

| Badge | Criteria | Icon Idea |
|-------|----------|-----------|
| 🌟 Rookie | First 100 points | Star |
| 🔥 Call Master | 100 calls logged | Phone |
| 💰 Deal Closer | 10 deals won | Money |
| 📧 Email Pro | 500 emails sent | Mail |
| 📋 Task Champion | 200 tasks completed | Clipboard |
| 🏆 Top Seller | #1 on monthly leaderboard | Trophy |
| 🎯 Conversion King | 50 leads converted | Target |
| 📊 Data Hero | 1000 records updated | Chart |
| 🔄 Streak Master | 30-day login streak | Flame |
| 💎 Diamond Seller | ₹10L+ in closed deals | Diamond |

### Mission System (Zurmo)

```
Daily Missions:
- "Log 5 calls today" → 15 bonus points
- "Update 3 lead statuses" → 10 bonus points
- "Close at least 1 deal" → 25 bonus points

Weekly Missions:
- "Convert 3 leads this week" → 50 bonus points
- "Schedule 5 meetings" → 30 bonus points
- "Achieve 100% task completion" → 40 bonus points

Monthly Challenges:
- "Top 3 in team leaderboard" → 200 bonus points
- "Close ₹5L+ in deals" → 300 bonus points
- "Zero overdue tasks" → 100 bonus points
```

### Leaderboard

```
Leaderboard {
  period: "daily" | "weekly" | "monthly" | "quarterly" | "all_time"
  view: "individual" | "team"
  metrics: [
    { name: "Total Points", type: "sum" },
    { name: "Deals Won", type: "count" },
    { name: "Revenue", type: "sum" },
    { name: "Calls Made", type: "count" },
    { name: "Tasks Completed", type: "count" }
  ]
}
```

### TODO for Our Implementation:
- [ ] Create gamification models (see 06_SCHEMA_TODO.md)
- [ ] Create event listener that awards points on CRM actions
- [ ] Create Badge evaluation cron job
- [ ] Create Leaderboard page with period selector
- [ ] Create user profile with badges and point history
- [ ] Create Mission management UI (admin creates missions)
- [ ] Create Notification "🏆 You earned a badge: Call Master!"
- [ ] Create Dashboard widget showing user's rank and progress

---

## 2. ANALYTICS & REPORTING

### Dashboard Metrics (Combined from all CRMs)

#### Sales Metrics
| Metric | Visualization | Source CRMs |
|--------|--------------|-------------|
| Revenue (won deals) | Line chart (trend) | All |
| Pipeline Value | Funnel chart | Twenty, Krayin, EspoCRM |
| Deals by Stage | Horizontal bar | SuiteCRM, vTiger |
| Win Rate | Percentage gauge | OroCRM, Django |
| Average Deal Size | KPI card | Twenty, AtomicCRM |
| Sales Cycle Length | KPI card + trend | Django, OroCRM |
| Revenue by Product | Pie chart | vTiger, YetiForce |
| Revenue by Agent | Bar chart | All |
| Revenue by Source | Pie chart | EspoCRM, Django |
| Forecast vs Actual | Dual bar chart | SuiteCRM, OroCRM |
| Monthly Recurring Revenue (MRR) | Line chart | YetiForce |
| Customer Lifetime Value (CLV) | KPI card | OroCRM |

#### Lead Metrics
| Metric | Visualization | Source CRMs |
|--------|--------------|-------------|
| New Leads Today/Week/Month | KPI card | All |
| Leads by Source | Pie chart | EspoCRM, Django, SuiteCRM |
| Leads by Status | Bar chart | All |
| Lead Conversion Rate | Percentage gauge | SuiteCRM, X2CRM |
| Lead Response Time | KPI card | EspoCRM |
| Leads by Agent | Bar chart | All |
| Lead Score Distribution | Histogram | Twenty, Krayin |

#### Activity Metrics
| Metric | Visualization | Source CRMs |
|--------|--------------|-------------|
| Calls Made Today | KPI card | X2CRM, YetiForce, Django |
| Emails Sent | KPI card | EspoCRM, SuiteCRM |
| WhatsApp Messages | KPI card | Unique to us |
| Tasks Completed | Progress bar | All |
| Tasks Overdue | Alert card | SuiteCRM, EspoCRM |
| Meeting Count | KPI card | EspoCRM, SuiteCRM |
| Average Handle Time | KPI card | Unique to us (telephony) |

#### Support Metrics
| Metric | Visualization | Source CRMs |
|--------|--------------|-------------|
| Open Tickets | KPI card | EspoCRM, SuiteCRM, YetiForce |
| Average Response Time | KPI card | YetiForce |
| SLA Compliance | Percentage gauge | YetiForce |
| CSAT Score | Star rating / gauge | SuiteCRM |
| Tickets by Priority | Pie chart | All with ticketing |
| Resolution Time Trend | Line chart | YetiForce |

#### Finance Metrics (from YetiForce, DaybydayCRM, CiviCRM)
| Metric | Visualization | Source CRMs |
|--------|--------------|-------------|
| Outstanding Invoices | KPI card | YetiForce, DaybydayCRM |
| Amount Receivable | KPI card | DaybydayCRM |
| Payments Received This Month | KPI card | DaybydayCRM, Django |
| Overdue Invoices | Alert card | YetiForce |
| Invoice Aging | Bucket chart | YetiForce |

### RFM Analytics (from OroCRM) ⭐

**Recency-Frequency-Monetary Analysis**:
```
For each customer, calculate:
- Recency: Days since last purchase/interaction
- Frequency: Number of purchases/interactions in period
- Monetary: Total spend in period

Segment customers into:
- Champions: High R, High F, High M
- Loyal: Medium R, High F, Medium M
- At Risk: Low R, Medium F, Medium M
- Lost: Very Low R, Low F, Low M
- New: High R, Low F, Low M
- Promising: High R, Low F, Medium M
```

### TODO for Our Implementation:
- [ ] Create `/reports` page with report builder
- [ ] Create `/analytics` page with dashboard widgets
- [ ] Create Widget library (chart types: line, bar, pie, funnel, gauge, KPI card)
- [ ] Create Date range selector (today, this week, this month, custom)
- [ ] Create Report export (PDF, CSV, Excel)
- [ ] Create Scheduled reports (email weekly summaries)
- [ ] Create Role-based dashboards (Agent gets activity metrics, Manager gets team + revenue)
- [ ] Create Report builder UI (select entity, metrics, filters, grouping, chart type)
- [ ] Create RFM Analysis page for customer segmentation

---

## 3. REPORTING ENGINE DESIGN

### Report Types (from SuiteCRM, X2CRM, vTiger)

#### Tabular Reports
```
Definition:
  entity: "deals"
  columns: ["name", "amount", "stage", "owner", "created_at"]
  filters: [
    { field: "stage", operator: "not_in", value: ["lost"] },
    { field: "created_at", operator: "this_month" }
  ]
  groupBy: "stage"
  sortBy: { field: "amount", direction: "desc" }
  aggregations: [
    { field: "amount", function: "sum" },
    { field: "id", function: "count" }
  ]
```

#### Summary Reports
```
Definition:
  entity: "deals"
  groupBy: ["stage", "owner"]
  aggregations: [
    { field: "amount", function: "sum", label: "Total Value" },
    { field: "id", function: "count", label: "Deal Count" },
    { field: "amount", function: "avg", label: "Average Size" }
  ]
  display: "chart" // or "table"
  chartType: "bar" // line, pie, funnel
```

#### Matrix/Pivot Reports
```
Definition:
  entity: "deals"
  rows: "owner"       // Y axis
  columns: "stage"    // X axis  
  values: { field: "amount", function: "sum" }
  // Shows: owner × stage matrix with summed amounts
```

### Report Schema:
```prisma
model Report {
  id          String @id @default(uuid())
  name        String
  description String?
  type        ReportType // TABULAR, SUMMARY, MATRIX, CHART
  entityType  String
  config      Json   // full report definition
  chartType   String? // line, bar, pie, funnel, gauge
  
  isShared    Boolean @default(false)
  isScheduled Boolean @default(false)
  schedule    Json?   // cron expression + recipient list
  
  createdBy   String
  tenantId    String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ReportType {
  TABULAR
  SUMMARY
  MATRIX
  CHART
  KPI
}
```

---

## 4. SALES FORECASTING (from OroCRM, SuiteCRM)

### Forecast Calculation
```
For each deal:
  Weighted Value = Deal Amount × Probability%

Forecast = Sum of all Weighted Values in pipeline

Categories:
  Committed: Deals with >80% probability
  Best Case: Deals with >50% probability  
  Pipeline: All open deals
  Closed Won: Completed deals

Display:
  Monthly forecast bars
  Quota vs Actual vs Forecast comparison
  Team breakdown
  Product/pipeline breakdown
```

### TODO:
- [ ] Add probability field to PipelineStage
- [ ] Auto-calculate weighted pipeline value
- [ ] Create Forecast dashboard widget
- [ ] Create Quota tracking (set quotas per user/team/month)
- [ ] Create Forecast accuracy tracking (predicted vs actual over time)

---

## 5. WIN/LOSS ANALYSIS (from Django-CRM, SuiteCRM)

### Django-CRM Pattern:
- ClosingReason model with `success_reason` flag
- Stage tracking with date of each transition
- Probability tracking per stage

### Reports to Build:
- [ ] Win/Loss ratio by agent, product, source, period
- [ ] Top winning reasons chart
- [ ] Top losing reasons chart
- [ ] Average deal cycle per stage
- [ ] Stage-to-stage conversion rates (funnel)
- [ ] Revenue by closing reason
- [ ] Time spent in each stage

---

## 6. ACTIVITY ANALYTICS (from X2CRM, Zurmo)

### Agent Performance Dashboard
| Widget | Description |
|--------|-------------|
| Calls per day vs target | Bar chart |
| Talk time distribution | Histogram |
| Calls by outcome | Pie chart |
| Emails sent/received | Dual bar |
| Tasks completion rate | Progress bar |
| Average response time | KPI card |
| Activity heatmap | Calendar heatmap (like GitHub) |
| Agent efficiency score | Composite metric |

### Team Comparison
| Widget | Description |
|--------|-------------|
| Team revenue ranking | Horizontal bar |
| Team activity volume | Stacked bar |
| Team conversion rate | Gauge comparison |
| Per-agent breakdown | Data table |

---

## 7. CUSTOMER ANALYTICS (from OroCRM, Monica)

### Customer Intelligence
- [ ] Customer 360° view — all interactions, purchases, tickets, communications
- [ ] Customer health score — based on engagement, support tickets, deal activity
- [ ] Churn prediction — ML-based churn risk scoring
- [ ] Customer journey mapping — visualize touchpoints over time
- [ ] Cohort analysis — group customers by first purchase month

---

## IMPLEMENTATION PRIORITY

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Dashboard KPI widgets | Low | High | 🔴 P1 |
| Basic report builder (tabular) | Medium | High | 🔴 P1 |
| Date range filtering | Low | High | 🔴 P1 |
| Gamification points system | Medium | Medium | 🟠 P2 |
| Leaderboard page | Low | Medium | 🟠 P2 |
| Pipeline funnel chart | Low | High | 🟠 P2 |
| RFM Analysis | High | High | 🟡 P3 |
| Sales forecasting | Medium | High | 🟡 P3 |
| Win/Loss analysis | Medium | High | 🟡 P3 |
| Badge & Mission system | Medium | Medium | 🟡 P3 |
| Scheduled reports (email) | Medium | Medium | 🟡 P3 |
| Activity heatmap | Low | Low | 🟢 P4 |
| Churn prediction (ML) | High | High | 🟢 P4 |
| Customer journey mapping | High | Medium | 🟢 P4 |
