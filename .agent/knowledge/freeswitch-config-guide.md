# FreeSWITCH Configuration Guide
# Stored at: docker volume `freeswitch_config` → /etc/freeswitch/

## File: /etc/freeswitch/vars.xml (key settings)
```xml
<X-PRE-PROCESS cmd="set" data="domain_name=$${local_ip_v4}"/>
<X-PRE-PROCESS cmd="set" data="default_password=changeme"/>
<!-- WSS for SIP.js browser calling -->
<X-PRE-PROCESS cmd="set" data="internal_ssl_enable=true"/>
```

## File: /etc/freeswitch/sip_profiles/external/tata-trunk.xml
(Add your SIP trunk here — Phase 3)
```xml
<include>
  <gateway name="tata-trunk">
    <param name="username" value="YOUR_TATA_USERNAME"/>
    <param name="password" value="YOUR_TATA_PASSWORD"/>
    <param name="proxy" value="sip.tatacommunications.com"/>
    <param name="register" value="true"/>
    <param name="caller-id-in-from" value="true"/>
  </gateway>
</include>
```

## File: /etc/freeswitch/dialplan/default/outbound-to-trunk.xml
```xml
<include>
  <extension name="outbound-to-pstn">
    <condition field="destination_number" expression="^(\+?91\d{10})$">
      <action application="bridge" data="sofia/gateway/tata-trunk/$1"/>
    </condition>
  </extension>
</include>
```

## SIP.js Browser → FreeSWITCH Port Map
| Service | Port | Protocol |
|---|---|---|
| SIP registration | 5060 | UDP/TCP |
| Browser WebSocket | 7443 | WSS (TLS) |
| ESL (NestJS bridge) | 8021 | TCP |
| RTP media | 16384–16484 | UDP |

## Phase 1: SIM Mode (now)
No config needed. Agent dials from phone, NestJS logs the call.

## Phase 2: Browser Calling (FreeSWITCH running)
1. `docker-compose up freeswitch coturn -d`
2. Set `FREESWITCH_SIP_PASSWORD` in .env
3. Frontend calls `GET /telephony/sip-config` → passes to useSoftphone hook
4. SIP.js registers to FreeSWITCH → agent can call from browser

## Phase 3: Direct SIP Trunk (TATA/DIDLogic)
1. Sign up at https://didlogic.com or call TATA Communications
2. Get SIP credentials (username, password, proxy host)
3. Add `tata-trunk.xml` file above with your credentials
4. Set `FREESWITCH_SIP_TRUNK=sofia/gateway/tata-trunk` in .env
5. You now own the call pipe. ₹0.35/min to you. Charge ₹0.80/min.

## DIDLogic Quick Signup (recommended for India)
URL: https://didlogic.com
- Instant DID (Direct Inward Dialing) number from ₹50/month
- Outbound rates to India mobile: ₹0.30–0.40/min
- SIP credentials ready in <10 minutes
