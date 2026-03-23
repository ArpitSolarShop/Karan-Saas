# Open-Source Telephony Stack — Zero Third-Party Dependency
> Decision: Replace Twilio with FreeSWITCH + SIP.js + Coturn + node-esl
> Goal: Own every line. No vendor lock-in. No pricing risk. Full control forever.

---

## The Honest Truth About Call Costs

| Call Type | Cost Model |
|---|---|
| Agent ↔ Agent (browser to browser) | **Free forever** — WebRTC via FreeSWITCH + Coturn |
| Agent → Customer (real mobile/landline) | Always costs money — PSTN termination fee |

**Twilio was a middleman.** Direct SIP trunk from TATA/DIDLogic = same call, 3x cheaper:

| Provider | Cost/min |
|---|---|
| Twilio (middleman) | ₹1.20–1.50 |
| TATA SIP trunk (direct) | ₹0.30–0.50 |
| DIDLogic (direct) | ₹0.35 |
| **You charge customer** | **₹0.80** |
| **Your profit/min** | **₹0.30–0.45** |

**The call cost becomes a revenue stream, not an expense.**

---

## 100% Open-Source Stack

| Component | Role | License |
|---|---|---|
| **FreeSWITCH** | Core telephony engine (WebRTC, SIP, IVR, conference, recording) | MPL |
| **FusionPBX** | Web GUI for FreeSWITCH multi-tenant management | MPL |
| **SIP.js** | Browser WebRTC SIP client for Next.js | MIT |
| **JsSIP** | Alternative to SIP.js (slightly lighter) | MIT |
| **node-esl** | NestJS ↔ FreeSWITCH Event Socket Library bridge | MIT |
| **Coturn** | STUN/TURN server for WebRTC NAT traversal | BSD |
| **Kamailio** | SIP proxy / load balancer (for scale) | GPL |
| **OpenSIPS** | Alternative SIP server | GPL |
| **Janus Gateway** | WebRTC SFU for conference calls | GPL |
| **MediaSoup** | Node.js WebRTC SFU (alternative to Janus) | ISC |
| **MinIO** | Call recording storage | AGPL |
| **Whisper** | Open-source AI transcription (replace Deepgram) | MIT |
| **Homer** | Call monitoring and SIP tracing | MIT |

---

## Three-Phase Rollout

### Phase 1 — SIM-Based Android App (Zero Cost, immediate)
- Agent calls from their own phone's SIM
- Android app dials and logs call metadata back to NestJS via REST
- NestJS just records the call — no telephony infra needed
- **Cost**: ₹0 (agent uses their own SIM)

### Phase 2 — FreeSWITCH + SIP.js (Browser Calling)
- FreeSWITCH runs in Docker (self-hosted)
- Agent's browser connects via SIP.js WebSocket → FreeSWITCH
- Coturn handles NAT traversal
- node-esl bridges FreeSWITCH events to NestJS
- **Cost**: ₹0 (server cost only)

### Phase 3 — Direct SIP Trunk (Revenue Model)
- Buy SIP trunk from TATA/DIDLogic directly
- Plug into FreeSWITCH (one XML config line)
- Route all outbound calls through it
- **Cost**: ₹0.35/min to you, ₹0.80/min billed to customer = profit

---

## Architecture

```
Browser (SIP.js WebRTC)
      ↕ WSS (WebSocket Secure)
FreeSWITCH (port 8021 ESL, port 5060 SIP, port 7443 WSS)
      ↕ node-esl Event Socket
NestJS TelephonyService
      ↕ REST / WebSocket
Next.js Frontend
      ↕ STUN/TURN (NAT traversal)
Coturn Server (port 3478 UDP/TCP, port 5349 TLS)
      ↕ SIP trunk
TATA / DIDLogic (PSTN → real phones)
```

---

## NestJS Integration (node-esl)

```typescript
// TelephonyService connects to FreeSWITCH via ESL
const esl = new ESLconnection('localhost', '8021', 'ClueCon');
esl.api('originate', `sofia/internal/${phone}@domain 1000`);
esl.on('esl::event::CHANNEL_HANGUP_COMPLETE', handler);
```

---

## Docker Compose Services to Add

```yaml
freeswitch:
  image: drachtio/drachtio-freeswitch-min:latest
  ports:
    - "5060:5060/udp"  # SIP
    - "5060:5060/tcp"
    - "7443:7443"      # WebSocket (WSS for SIP.js)
    - "8021:8021"      # ESL (NestJS bridge)
    - "16384-16484:16384-16484/udp"  # RTP media

coturn:
  image: coturn/coturn:latest
  ports:
    - "3478:3478/udp"
    - "3478:3478/tcp"
    - "5349:5349/tcp"  # TLS
  command: --realm=crm.local --auth-secret=your-secret
```

---

## SIP Trunk Providers (India)
| Provider | Price/min | Notes |
|---|---|---|
| TATA Communications | ₹0.35–0.50 | Enterprise, reliable |
| DIDLogic | ₹0.30–0.40 | SMB-friendly, instant signup |
| Telnyx | ₹0.25–0.35 | Global, pay-as-you-go |
| Voxtelesys | ₹0.30 | India-focused |

*Stored: 2026-03-20*
