# Real-Time Architecture Reference — Project Alpha

> **Extreme load definition**: 10k+ concurrent connections · sub-100ms delivery · 100k+ events/sec · zero message loss

---

## Layer 1 — Transport Protocol (Client ↔ Server)

| Protocol | Mode | Key Points |
|---|---|---|
| **WebSocket / Socket.io** ✅ Default | Full-duplex TCP | Rooms, namespaces, auto-reconnect via NestJS Gateways. Scales to ~10k conn/node. Redis adapter required for multi-node. |
| **SSE (Server-Sent Events)** | Server-push only | HTTP/2 persistent stream. No client→server messages. Perfect for dashboards, feeds, notifications. Lower overhead than WS, works through proxies. NestJS built-in. |
| **WebRTC** | P2P / media | Peer-to-peer UDP. For video, audio, or ultra-low latency binary data. NestJS acts as signalling server only. Bypasses server for data. Requires STUN/TURN. |

---

## Layer 2 — Message Broker (Server ↔ Server, Fan-out, Queue)

| Broker | Use Case | Key Points |
|---|---|---|
| **Redis Pub/Sub** ✅ Recommended | In-memory fan-out | Powers Socket.io adapter to sync events across all NestJS nodes. Sub-millisecond latency. `ioredis` + `@socket.io/redis-adapter`. |
| **Apache Kafka** | High throughput | Distributed log. Millions of events/sec, durable, replayable. Use for event sourcing or audit trail. `kafkajs` + NestJS microservice transport + partitioned topics. |
| **NATS / NATS JetStream** | Low latency | Cloud-native messaging. Lighter than Kafka, built-in NestJS transport. JetStream adds persistence + at-least-once delivery. 10M+ msg/sec. |

---

## Layer 3 — Frontend Real-Time (Next.js Client)

| Approach | Role | Key Points |
|---|---|---|
| **TanStack Query + WS** ✅ Recommended | Server state sync | Use `queryClient.setQueryData()` on incoming WS events. Zero extra fetches, stale-while-revalidate, devtools included. |
| **Zustand** | Client-side transient state | Lightweight store for live cursors, presence, chat. Pairs directly with socket.io event handlers. No provider needed, subscriptions built-in, tiny bundle. |
| **Jotai atoms** | Fine-grained reactivity | Atom-per-entity model. Ideal when individual records update independently (e.g. 500 live order rows). Only re-renders affected atom. RSC-safe. |

---

## Layer 4 — Extreme Scale Additions (100k+ events/sec)

| Solution | Role | Key Points |
|---|---|---|
| **Redis Streams** | Persistent queue | Upgrade from Pub/Sub when replay, consumer groups, and backpressure are needed. Drop-in with `ioredis`. Durable · ACK model. |
| **Managed WS Gateway (Ably / Pusher)** | Offload all connection mgmt | NestJS publishes events via REST; gateway handles millions of sockets. Ably: 1M+ concurrent, global edge, zero ops. |

---

## Recommended Stack for This Project

```
Client  ←──── Socket.io ────→  NestJS Gateway
                                     ↕
                              Redis Pub/Sub (multi-node sync)
                                     ↕
                              TanStack Query (client state)
                              Zustand (live/transient state)

Scale-up path:
  Redis Pub/Sub → Redis Streams → Kafka (event sourcing)
  Self-hosted Socket.io → Ably managed gateway
```

---

*Stored: 2026-03-20 | Source: User-provided architecture spec*
