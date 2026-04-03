# ⚙️ Technology Stack Comparison — 13 Tele CRM Repos

> **Purpose**: Side-by-side comparison of every technology used across all 13 repos  
> **Goal**: Identify optimal tech choices for Karan SaaS

---

## 1. Language & Framework Matrix

| Project | Primary Language | Framework | Frontend | Lines of Code (est.) |
|---------|-----------------|-----------|----------|---------------------|
| Rocket.Chat | TypeScript | Meteor.js + Express | React (Fuselage) | ~2M+ |
| Asterisk | C | Custom (GNU) | None (CLI/AMI/ARI) | ~3M+ |
| Chatwoot | Ruby | Rails 7.1 | Vue.js 3 | ~500K |
| Fonoster | TypeScript | Node.js + gRPC | Next.js | ~200K |
| FreePBX | PHP | Custom MVC | jQuery + Bootstrap | ~500K |
| FusionPBX | PHP | Custom MVC | jQuery + Bootstrap | ~400K |
| ICTCore | PHP | Custom Framework | None (API only) | ~100K |
| IssabelPBX | PHP | FreePBX Fork | jQuery + Bootstrap | ~600K |
| Callcenter | PHP | Issabel Framework | jQuery + Ext.js | ~150K |
| OMniLeads | Python | Django 3.x | Vue.js 2 | ~300K |
| GOautodial | PHP 7 | Custom (monolithic) | AdminLTE + jQuery | ~200K |
| VICIdial | Perl + PHP | Custom (CGI/mod_perl) | HTML/JS (inline) | ~1M+ |
| Wazo-confd | Python | Flask/Connexion | None (API only) | ~100K |

---

## 2. Database Comparison

| Project | Database | ORM/Driver | Schema Size | Tables |
|---------|----------|------------|-------------|--------|
| **Rocket.Chat** | MongoDB 6.10 | Meteor Collections | N/A (schemaless) | ~50+ collections |
| **Asterisk** | File-based (+ optional SQL) | Realtime ODBC | Variable | ~10 optional |
| **Chatwoot** | PostgreSQL | ActiveRecord (Rails) | 59KB / 1322 lines | **65+ tables** |
| **Fonoster** | PostgreSQL + InfluxDB | Prisma ORM | 3.5KB | 6 tables |
| **FreePBX** | MySQL/MariaDB | Custom PHP | Variable | ~80+ tables |
| **FusionPBX** | PostgreSQL (primary) | Custom PHP PDO | Variable | ~100+ tables |
| **ICTCore** | MySQL (InnoDB) | Custom PHP | 118KB / 1833 lines | **30+ tables** |
| **IssabelPBX** | MySQL | Custom PHP | Variable | ~80+ tables |
| **Callcenter** | MySQL | Custom PHP | Shared with Issabel | ~20+ tables |
| **OMniLeads** | PostgreSQL | Django ORM | 160KB models.py! | ~40+ tables |
| **GOautodial** | MariaDB/MySQL | Custom PHP | Shared with VICIdial | ~200+ tables |
| **VICIdial** | MySQL/MariaDB | Perl DBI | Massive | **200+ tables** |
| **Wazo-confd** | PostgreSQL | SQLAlchemy (xivo-dao) | Distributed | ~112+ entities |

### Database Preference for Karan SaaS

| Criteria | Winner | Why |
|----------|--------|-----|
| **Most modern schema** | Chatwoot | Rails migrations, JSONB, pgvector, proper indexes |
| **Most comprehensive** | VICIdial | 200+ tables covering every call center scenario |
| **Best extensibility** | Chatwoot | custom_attributes JSONB, custom_attribute_definitions |
| **Best multi-tenancy** | Chatwoot/FusionPBX | account_id on every table / domain-based |
| **Best AI support** | Chatwoot | pgvector embeddings, vector similarity search |
| **Our choice** | **PostgreSQL + Prisma** | ✅ Already using — matches Chatwoot & Fonoster & OMniLeads |

---

## 3. API Architecture Comparison

| Project | API Type | Auth Method | Documentation | Versioning |
|---------|----------|-------------|---------------|------------|
| Rocket.Chat | REST + Realtime (DDP) | Token / OAuth | REST API Docs | /api/v1/ |
| Asterisk | ARI (REST) + AMI (TCP) | HTTP Basic + AMI auth | Swagger/OpenAPI | /ari/ |
| Chatwoot | REST | Token (API key) + JWT | Swagger | /api/v1/, /api/v2/ |
| Fonoster | gRPC + REST (via Envoy) | JWT + API Keys | Protobuf defs | gRPC services |
| FreePBX | PHP endpoints | Session-based | Minimal | None |
| FusionPBX | REST (Gold tier) | Token | Minimal | None |
| ICTCore | REST | Token / Basic | README | /rest/v1/ |
| IssabelPBX | PHP endpoints | Session-based | Minimal | None |
| Callcenter | ECCP (custom TCP) | Custom auth | In-code | None |
| OMniLeads | REST (DRF) | Token + Session | DRF Browsable | /api/v1/ |
| GOautodial | REST (custom PHP) | Token | In-code | /goAPI/ |
| VICIdial | REST (non-agent API) | User/Pass params | Wiki | /vicidial/ |
| Wazo-confd | REST (Connexion/OpenAPI) | Token (wazo-auth) | **Auto-generated OpenAPI** | /1.1/ |

### Best API Pattern for Karan SaaS

| Pattern | Source | Why Adopt |
|---------|--------|----------|
| **OpenAPI auto-generation** | Wazo-confd | NestJS + @nestjs/swagger does this automatically |
| **gRPC for internal services** | Fonoster | If we scale to microservices later |
| **API versioning** | Chatwoot (/v1, /v2) | Standard REST versioning |
| **Token + JWT auth** | Chatwoot + Fonoster | Already implemented in Karan SaaS |
| **WebSocket gateway** | Rocket.Chat + Chatwoot | NestJS @WebSocketGateway for real-time |

---

## 4. Real-Time Communication Comparison

| Project | WebSocket | Events/PubSub | Push Notifications |
|---------|-----------|--------------|-------------------|
| Rocket.Chat | DDP (Meteor) + Socket.IO | Meteor PubSub | FCM + VAPID |
| Asterisk | WebSocket (chan_websocket) | ARI events (WebSocket) | N/A |
| Chatwoot | ActionCable (Rails) | Sidekiq + PubSub token | FCM + VAPID |
| Fonoster | N/A | NATS | N/A |
| OMniLeads | Django Channels | Redis PubSub | N/A |
| GOautodial | Socket.IO + Node.js | Custom events | N/A  |
| VICIdial | AJAX polling | N/A | N/A |
| Wazo-confd | N/A | wazo-bus (AMQP) | N/A |

### Real-Time Architecture for Karan SaaS

```
NestJS WebSocket Gateway (Socket.IO or WS)
  ├── Agent events (status, calls, messages)
  ├── Queue events (waiting, agents, SLA)
  ├── Campaign events (progress, stats)
  └── Conversation events (new message, assign)

Redis PubSub ← BullMQ workers ← Asterisk ARI events
```

---

## 5. Authentication & Authorization Comparison

| Project | Auth Method | 2FA/MFA | SSO | RBAC | Multi-Tenant |
|---------|-------------|---------|-----|------|-------------|
| Rocket.Chat | OAuth, SAML, LDAP, CAS | ✅ TOTP | ✅ Full | ✅ Custom roles | Workspaces |
| Asterisk | AMI user/pass, ARI HTTP | ✗ | ✗ | Basic | N/A |
| Chatwoot | Devise (email+pass), OAuth | ✅ TOTP (OTP) | ✅ SAML | ✅ Custom roles + permissions | ✅ account_id |
| Fonoster | JWT + OAuth2 (GitHub) | ✅ (built-in) | ✅ OAuth2 | ✅ Access keys | ✅ Workspaces |
| FreePBX | PHP session | ✗ | ✗ | Admin/User | ✗ |
| FusionPBX | PHP session | ✗ | ✗ | Groups | ✅ Domains |
| ICTCore | Token/Basic | ✗ | ✗ | ✅ 80+ permissions | ✅ Tenants |
| OMniLeads | Django auth | ✗ | ✗ | 4 fixed profiles | ✗ |
| GOautodial | PHP session | ✗ | ✗ | Admin/User/Agent | ✗ |
| VICIdial | User/pass | ✗ | ✗ | User levels (1-9) | ✗ |
| Wazo-confd | wazo-auth tokens | ✗ | ✗ | ACL-based | ✅ Tenants |

### Auth Architecture for Karan SaaS

| Feature | Status | Source |
|---------|--------|--------|
| JWT Token Auth | ✅ Built | — |
| Custom RBAC | ✅ Built | — |
| Multi-tenant | ✅ Built | — |
| 2FA/TOTP | ❌ Need | Chatwoot (otp_secret, otp_required_for_login) |
| SAML SSO | ❌ Need | Chatwoot (account_saml_settings) |
| OAuth2 Providers | ❌ Need | Fonoster (GitHub), Chatwoot (Google) |
| Granular Permissions | 🔧 Partial | ICTCore (80+ permissions model) |

---

## 6. Deployment & Infrastructure Comparison

| Project | Containerized | Orchestration | CI/CD | Cloud Support |
|---------|:------------:|:-------------:|:-----:|:-------------:|
| Rocket.Chat | ✅ Docker | Kubernetes, Docker Compose | GitHub Actions | AWS, Azure, GCP, DigitalOcean |
| Asterisk | ✅ Docker | Custom | None | Self-hosted |
| Chatwoot | ✅ Docker | Docker Compose, K8s | GitHub Actions | Heroku, AWS, Azure, GCP, DO |
| Fonoster | ✅ Docker | Docker Compose (10 services) | GitHub Actions | Self-hosted, Cloud |
| FreePBX | ✗ (installer) | N/A | N/A | Self-hosted |
| FusionPBX | ✗ (installer) | N/A | N/A | Self-hosted |
| ICTCore | ✗ (RPM/shell) | N/A | N/A | Self-hosted |
| IssabelPBX | ✗ (ISO/RPM) | N/A | N/A | Self-hosted |
| Callcenter | ✗ (Issabel addon) | N/A | N/A | Self-hosted |
| OMniLeads | ✅ Docker/Podman | Docker Compose, Ansible | GitLab CI | Self-hosted |
| GOautodial | ✗ (ISO installer) | N/A | N/A | Self-hosted |
| VICIdial | ✗ (shell scripts) | Custom clustering | N/A | Self-hosted |
| Wazo-confd | ✅ Docker | Docker Compose | Jenkins/GitLab | Self-hosted |

---

## 7. Frontend Framework Comparison

| Project | Framework | UI Library | State Management | Design System |
|---------|-----------|-----------|-----------------|---------------|
| Rocket.Chat | React 18 | Fuselage (custom) | React Query + Hooks | Fuselage Design System |
| Chatwoot | Vue.js 3 | Custom components | Vuex/Pinia | Custom CSS |
| Fonoster | Next.js 14 | Custom dashboard | React Hooks | Storybook |
| OMniLeads | Vue.js 2 | Element UI | Vuex | Element UI |
| GOautodial | jQuery | AdminLTE 3 | DOM manipulation | AdminLTE |
| VICIdial | Vanilla JS | None | AJAX polling | Inline CSS |

### Frontend Architecture for Karan SaaS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | **Next.js** (already using) | Server components, App Router, API routes |
| UI Library | **shadcn/ui** + custom | Modern, accessible, customizable |
| State | **React Query** + Zustand | Server state + client state |
| Real-time | **Socket.IO client** | WebSocket for live updates |
| WebRTC | **SIP.js** or **JsSIP** | Browser softphone (used by OMniLeads + GOautodial) |
| Charts | **Recharts** or **Chart.js** | Dashboard analytics |

---

## 8. Key Libraries & Dependencies Worth Adopting

### From Chatwoot
| Library | Purpose | Karan SaaS Use |
|---------|---------|----------------|
| `pg_trgm` | Trigram text search in PostgreSQL | Fuzzy contact/message search |
| `pgvector` | Vector similarity search | AI knowledge base |
| `sidekiq` analogue → `BullMQ` | Background job processing | Already using BullMQ |
| `ActionCable` analogue → `@nestjs/websockets` | Real-time | Agent dashboard updates |
| `Devise` analogue → `@nestjs/passport` | Auth | Already using Passport |

### From Fonoster
| Library | Purpose | Karan SaaS Use |
|---------|---------|----------------|
| `ari-client` (npm) | Asterisk REST Interface | Telephony control |
| `@prisma/client` | ORM | Already using |
| `xstate` | State machines | Campaign/call state management |
| `NATS` | Event messaging | Inter-service events (future) |
| `Envoy` | API gateway | gRPC-Web proxy (future) |

### From GOautodial/OMniLeads
| Library | Purpose | Karan SaaS Use |
|---------|---------|----------------|
| `JsSIP` / `SIP.js` | WebRTC SIP client | Browser softphone |
| `Socket.IO` | Real-time bidirectional | Agent dashboard |
| `AdminLTE` pattern → `shadcn` | Dashboard theme | Already using shadcn |

### From Asterisk
| Library | Purpose | Karan SaaS Use |
|---------|---------|----------------|
| `chan_websocket` | WebSocket for WebRTC | SIP over WSS |
| `res_ari` | REST API for call control | Primary telephony API |
| `app_queue` logic | ACD algorithms | Queue distribution engine |
| `app_amd` logic | Answering machine detection | Outbound campaigns |

---

## 9. Performance & Scalability Patterns

| Pattern | Used By | How |
|---------|---------|-----|
| **MongoDB sharding** | Rocket.Chat | Horizontal scaling for messages |
| **PostgreSQL partitioning** | Chatwoot (CDR/events) | Time-based partitions for large tables |
| **InfluxDB for metrics** | Fonoster | Time-series call metrics |
| **Redis caching** | Chatwoot, Rocket.Chat | Session + hot data cache |
| **Multi-server telephony** | VICIdial, ICTCore | Distribute calls across Asterisk nodes |
| **Sidekiq/BullMQ workers** | Chatwoot / Karan SaaS | Async job processing |
| **Connection pooling** | All PostgreSQL repos | PgBouncer for connection management |
| **CDN for assets** | Chatwoot (ASSET_CDN_HOST) | Static assets via CDN |
| **Pre-aggregated rollups** | Chatwoot (reporting_events_rollups) | Fast dashboard queries |

### Scalability Recommendations for Karan SaaS
1. **Partition `cdr` and `messages` tables** by month (from VICIdial pattern)
2. **Use Redis for session + real-time agent state** (from Chatwoot)
3. **Pre-aggregate reporting data** nightly (from Chatwoot rollups)
4. **Use InfluxDB/TimescaleDB** for call metrics if volume exceeds 1M/day (from Fonoster)
5. **Multi-node Asterisk** with Kamailio SIP proxy (from OMniLeads/GOautodial)
