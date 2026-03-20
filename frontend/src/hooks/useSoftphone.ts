"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  UserAgent,
  Registerer,
  Inviter,
  SessionState,
  URI,
  Web,
} from "sip.js";
import { useCallStore } from "@/stores/useCallStore";

interface SipConfig {
  wsServer: string;
  sipUri: string;
  password: string;
  iceServers: RTCIceServer[];
}

interface SoftphoneState {
  status: "unregistered" | "registering" | "registered" | "error";
  error?: string;
}

/**
 * useSoftphone — SIP.js WebRTC hook
 *
 * Connects to FreeSWITCH via WSS using SIP.js.
 * Manages registration, outbound calls, mute, hold, hangup.
 *
 * Usage:
 *   const { call, hangup, mute, state } = useSoftphone(sipConfig);
 */
export function useSoftphone(sipConfig: SipConfig | null) {
  const [state, setState] = useState<SoftphoneState>({ status: "unregistered" });
  const userAgentRef = useRef<UserAgent | null>(null);
  const sessionRef = useRef<Inviter | null>(null);
  const { startCall, endCall, setStatus, toggleMute } = useCallStore();

  // ── Registration ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sipConfig) return;

    setState({ status: "registering" });

    const transportOptions: Web.TransportOptions = {
      server: sipConfig.wsServer,
    };

    const ua = new UserAgent({
      uri: UserAgent.makeURI(sipConfig.sipUri),
      authorizationPassword: sipConfig.password,
      transportOptions,
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: sipConfig.iceServers,
        },
      },
      logLevel: "warn",
    });

    const registerer = new Registerer(ua);

    ua.start().then(() => {
      registerer.register();
      setState({ status: "registered" });
    }).catch((err) => {
      setState({ status: "error", error: err.message });
    });

    // Handle inbound calls
    ua.delegate = {
      onInvite: (invitation) => {
        // Auto-answer for now — production: show UI ring
        invitation.accept();
      },
    };

    userAgentRef.current = ua;

    return () => {
      registerer.unregister();
      ua.stop();
    };
  }, [sipConfig]);

  // ── Outbound Call ─────────────────────────────────────────────────────────
  const call = useCallback(
    (data: { toNumber: string; leadId: string; leadName: string }) => {
      if (!userAgentRef.current || state.status !== "registered") {
        console.warn("[Softphone] Not registered — cannot make call");
        return;
      }

      const target = UserAgent.makeURI(`sip:${data.toNumber}@${sipConfig?.sipUri.split("@")[1]}`);
      if (!target) return;

      const inviter = new Inviter(userAgentRef.current, target);
      sessionRef.current = inviter;

      inviter.stateChange.addListener((newState: SessionState) => {
        switch (newState) {
          case SessionState.Establishing:
            setStatus("ringing");
            break;
          case SessionState.Established:
            setStatus("connected");
            startCall({
              callSid: inviter.id,
              leadId: data.leadId,
              leadName: data.leadName,
              phone: data.toNumber,
              agentId: "",
            });
            // Attach media
            const pc = (inviter.sessionDescriptionHandler as any)?.peerConnection;
            if (pc) {
              const remoteStream = new MediaStream();
              pc.getReceivers().forEach((r: RTCRtpReceiver) => {
                if (r.track) remoteStream.addTrack(r.track);
              });
              const audioEle = document.getElementById("remoteAudio") as HTMLAudioElement;
              if (audioEle) {
                audioEle.srcObject = remoteStream;
                audioEle.play().catch(e => console.error("Audio play failed:", e));
              }
            }
            break;
          case SessionState.Terminated:
            setStatus("ended");
            endCall();
            sessionRef.current = null;
            break;
        }
      });

      inviter.invite().catch((err) => {
        console.error("[Softphone] invite failed:", err);
      });
    },
    [state.status, sipConfig, startCall, endCall, setStatus],
  );

  // ── Hang Up ───────────────────────────────────────────────────────────────
  const hangup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.bye().catch(() => sessionRef.current?.cancel());
      sessionRef.current = null;
    }
    endCall();
  }, [endCall]);

  // ── Mute ─────────────────────────────────────────────────────────────────
  const mute = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    // Toggle audio track mute on the local stream
    const pc = (session.sessionDescriptionHandler as any)?.peerConnection;
    if (pc) {
      pc.getSenders().forEach((sender: RTCRtpSender) => {
        if (sender.track && sender.track.kind === "audio") {
          sender.track.enabled = !sender.track.enabled;
        }
      });
    }
    toggleMute();
  }, [toggleMute]);

  return { call, hangup, mute, state };
}
