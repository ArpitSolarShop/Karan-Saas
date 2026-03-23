# Full Technology Stack Blueprint
> **Project**: Telecalling + General CRM on Next.js + NestJS + PostgreSQL
> **Current coverage**: ~40% (API, UI, DB, Auth skeleton)
> **Rule**: Check this before implementing any feature. Nothing gets built without the right tool.

---

## Stack Coverage Status

| Layer | Status | Notes |
|---|---|---|
| Frontend (Next.js) | ✅ Have | Need Socket.io client + SIP.js |
| API / Business Logic (NestJS) | ✅ Have | Need BullMQ, CASL, Socket.io gateway |
| Database (PostgreSQL + Prisma) | ✅ Have | Need TimescaleDB ext, Redis, S3 |
| Real-time (Socket.io) | ✅ Wired | `/leads` + `/sheets` namespaces, Redis adapter |
| Background Jobs | ⚠️ Missing | Add BullMQ + Redis |
| Telephony Engine | 🔴 Biggest Gap | Choose Twilio OR FreeSWITCH |
| AI / Intelligence | ⚠️ Missing | Add Deepgram, OpenAI, AWS Comprehend |
| File / Media Storage | ⚠️ Missing | MinIO (Docker) or AWS S3 |
| Auth (JWT + RBAC) | ⚠️ Partial | Add Passport, CASL |

---

## Layer 1 — Frontend / Next.js ✅

**What you have**: Next.js 14 App Router, Tailwind, Recharts, shadcn/ui, Socket.io client

| Technology | Purpose | Status |
|---|---|---|
| Next.js 14 (App Router) | All pages, routing, SSR | ✅ Have |
| React + TypeScript | Component logic | ✅ Have |
| shadcn/ui + Radix UI | Design system components | ✅ Have |
| Tailwind CSS | Styling | ✅ Have |
| Recharts / Chart.js | Charts and analytics | ✅ Have |
| Socket.io client | Real-time event reception | ✅ Wired |
| SWR | Server state, cache invalidation | ✅ Have |
| **SIP.js** | Browser-based WebRTC calling (softphone) | ❌ Add |
| **Twilio Voice JS SDK** | If using Twilio for telephony | ❌ Add |
| **TanStack Query** | Upgrade path from SWR for complex queries | ⏭ Optional |
| **Zustand** | Transient real-time state (presence, cursors) | ❌ Add |

---

## Layer 2 — Backend / NestJS ✅

**What you have**: NestJS modules, Prisma, ValidationPipe, basic CORS, Socket.io gateways

| Technology | Purpose | Status |
|---|---|---|
| NestJS modules | Lead, Calls, Sheets, Campaigns, Reports... | ✅ Have |
| Prisma ORM | DB queries | ✅ Have |
| class-validator | DTO validation | ✅ Have |
| Socket.io gateway | Real-time events (`/leads`, `/sheets`) | ✅ Wired |
| @socket.io/redis-adapter | Multi-node WS fan-out | ✅ Wired |
| ioredis | Redis client | ✅ Have |
| **Passport JWT** | JWT auth middleware | ❌ Add |
| **@nestjs/jwt** | Token sign/verify | ❌ Add |
| **CASL** | Fine-grained RBAC (role + resource + action) | ❌ Add |
| **BullMQ** | Background job queues (dialer, imports, reminders) | 🔴 Critical — Add |
| **@nestjs/bull** | NestJS BullMQ integration | 🔴 Critical — Add |
| **Nodemailer / SendGrid** | Transactional emails | ❌ Add |
| **Twilio SDK** (`twilio`) | Call initiation, SMS, WhatsApp via API | ❌ Add |
| **node-esl** | FreeSWITCH Event Socket Library (if self-hosting) | ❌ Add (advanced) |

---

## Layer 3 — Database & Storage

### PostgreSQL (Primary DB) ✅
| Technology | Purpose | Status |
|---|---|---|
| PostgreSQL 15 | All CRM data | ✅ Have (Docker) |
| Prisma | Schema + migrations | ✅ Have |
| **pgvector extension** | AI embeddings for lead scoring | ❌ Add |
| **TimescaleDB extension** | Time-series call analytics at scale | ❌ Add (Phase 4+) |

### Redis ✅
| Technology | Purpose | Status |
|---|---|---|
| Redis (Docker) | Socket.io adapter Pub/Sub | ✅ Have |
| Redis | BullMQ queue backend | ✅ Have (same instance) |
| Redis | Session store, caching | ❌ Wire |

### File / Media Storage ⚠️
| Technology | Purpose | Status |
|---|---|---|
| **MinIO** (Docker) | S3-compatible: call recordings, attachments, documents | ❌ Add — Docker image ready in docker-compose |
| **AWS S3** | Production alternative to MinIO | ⏭ Phase 3+ |
| **@aws-sdk/client-s3** | NestJS S3 upload | ❌ Add with MinIO |

### Search ⚠️
| Technology | Purpose | Status |
|---|---|---|
| **Meilisearch** | Full-text search for leads, contacts | ❌ Add (Docker image in docker-compose already) |
| **meilisearch** npm client | NestJS integration | ❌ Wire |

---

## Layer 4 — Telephony Engine 🔴 (Biggest Gap)

### Path A — Managed API (Recommended First: Twilio / Exotel)

| Technology | Purpose | Start With? |
|---|---|---|
| **Twilio Programmable Voice** | Call initiation, recording, IVR, SMS | ✅ Yes — fastest path |
| **Twilio Voice JS SDK** | Browser-based WebRTC calling | ✅ Yes |
| **Exotel** | India-focused alternative to Twilio | ✅ Yes (for Indian numbers) |
| Twilio Studio | Visual IVR flow builder | ✅ Yes |
| Twilio TaskRouter | ACD / skill-based call routing | Phase 2 |
| Twilio Conversations | WhatsApp + SMS unified inbox | Phase 2 |

### Path B — Self-Hosted (When Call Volume > 100k/month)

| Technology | Purpose | Complexity |
|---|---|---|
| **FreeSWITCH** | Core SIP/VoIP engine (better than Asterisk for scale) | 🔴 Hardest |
| **Asterisk** | Alternative SIP engine (wider community) | 🔴 Hard |
| **Kamailio** | SIP proxy (load balancer for SIP traffic) | 🔴 Hard |
| **node-esl** | NestJS ↔ FreeSWITCH Event Socket Library | 🔴 Hard |
| **SIP.js** | Browser WebRTC SIP client | Medium |
| **coturn** | STUN/TURN server for WebRTC NAT traversal | Medium |

### Decision Rule
```
Traffic < 50k calls/month  → Use Twilio or Exotel
Traffic > 50k calls/month  → Migrate to FreeSWITCH + Kamailio
India market              → Start with Exotel (local numbers, compliance)
```

---

## Layer 5 — AI & Intelligence ⚠️

| Technology | Purpose | When to Add |
|---|---|---|
| **Deepgram** | Real-time + post-call speech-to-text (fastest, cheapest) | Phase 2 |
| **OpenAI Whisper** | Open-source transcription (self-host) | Phase 3 |
| **AWS Transcribe** | Transcription with speaker diarization | Phase 2 alt |
| **AWS Comprehend** | Sentiment analysis, keyword extraction | Phase 3 |
| **OpenAI GPT-4** | AI email writer, next best action, coaching notes | Phase 3 |
| **pgvector** | Store + query embeddings for lead scoring | Phase 3 |
| **Python microservice** | Isolate ML workloads from NestJS API | Phase 4 |

---

## Layer 6 — Background Jobs 🔴 (Critical — Must Add)

**Every async feature depends on this. Without BullMQ you can't build auto-dialer, reminders, bulk imports, or email campaigns.**

| Technology | Purpose |
|---|---|
| **BullMQ** | Queue processor with delayed, repeatable, retryable jobs |
| **@nestjs/bull** | NestJS-native BullMQ integration |
| Redis Streams (underlying) | BullMQ uses this automatically |

### Jobs That Need BullMQ
| Job | Trigger |
|---|---|
| Auto-dialer tick | Cron: every N seconds per campaign |
| Predictive dial | Agent freed → immediately pop next lead |
| Callback reminders | Scheduled at callback creation |
| Bulk lead import | CSV → parse → deduplicate → insert batches |
| Email campaign send | Drip schedule → send per lead |
| WhatsApp blast | Campaign → send per lead |
| AI transcription | Post-call webhook → transcribe → store |
| Retry failed calls | Busy/no-answer → retry after N minutes |

---

## Layer 7 — Infra & DevOps

### Currently Running (Docker Compose)
| Service | Port | Status |
|---|---|---|
| PostgreSQL 15 | 5433 | ✅ Running |
| MongoDB | 27018 | ✅ Running |
| Redis | 6380 | ✅ Running |
| Meilisearch | 7700 | ✅ Running |
| MinIO | 9001 / 9002 | ✅ Running |
| n8n (workflow automation) | 5678 | ✅ Running |
| Prometheus | 9090 | ✅ Running |
| Grafana | 3002 | ✅ Running |
| Asterisk | host | ✅ Running |

### To Add for Production
| Technology | Purpose |
|---|---|
| **Nginx** | Reverse proxy, SSL termination, WebSocket upgrade headers |
| **PM2** | NestJS process manager (restart on crash) |
| **Docker Swarm / Kubernetes** | Multi-node scaling |
| **GitHub Actions** | CI/CD pipeline |
| **Sentry** | Error tracking + performance |
| **Loki + Grafana** | Log aggregation (Grafana already in compose) |
| **coturn** | STUN/TURN for WebRTC (required for SIP.js in prod) |

---

## Implementation Roadmap (Technology Ordered)

```
Sprint 1 — Auth & Security
  → Passport JWT + CASL RBAC
  → Login, refresh token, role guards on all routes

Sprint 2 — Background Jobs (Unlocks Everything)
  → BullMQ + @nestjs/bull
  → Import queue, callback reminder queue, retry queue

Sprint 3 — Telephony MVP
  → Twilio or Exotel account
  → Click-to-call, call recording, basic IVR
  → Twilio Voice JS SDK in browser (SIP.js for FreeSWITCH path)

Sprint 4 — File Storage
  → Wire MinIO (already in Docker) with @aws-sdk/client-s3
  → Call recording upload, attachment storage

Sprint 5 — Search
  → Wire Meilisearch (already in Docker)
  → Lead full-text search, contact search

Sprint 6 — AI / Transcription
  → Deepgram webhook post-call
  → Store transcript in DB, link to call record

Sprint 7 — Zustand + Jotai (Frontend State)
  → Live agent presence, in-call timer, cursor sync

Sprint 8 — Advanced Telephony
  → Predictive dialer (BullMQ + Twilio)
  → Supervisor whisper/barge (FreeSWITCH ESL or Twilio Conferences)
```

---

*Stored: 2026-03-20 | Cross-reference: crm-feature-blueprint.md + realtime-architecture.md*
