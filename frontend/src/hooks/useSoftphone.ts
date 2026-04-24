"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  UserAgent,
  Registerer,
  Inviter,
  Invitation,
  SessionState,
  URI,
  Web,
} from "sip.js";
import { useCallStore } from "@/stores/useCallStore";

/** Generate a simple ring-ring oscillator tone */
function createRingtone(): { start: () => void; stop: () => void } {
  let ctx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      try {
        ctx = new AudioContext();
        osc = ctx.createOscillator();
        gain = ctx.createGain();
        osc.frequency.value = 440;
        osc.type = "sine";
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        // Ring pattern: 400ms on, 200ms off, 400ms on, 2000ms off
        let step = 0;
        interval = setInterval(() => {
          if (!gain) return;
          const pattern = [0.3, 0, 0.3, 0]; // on/off/on/off
          gain.gain.setValueAtTime(pattern[step % 4], ctx!.currentTime);
          step++;
        }, 500);
      } catch {
        // AudioContext not available (SSR or permissions)
      }
    },
    stop() {
      if (interval) clearInterval(interval);
      if (osc) osc.stop();
      if (ctx) ctx.close();
      ctx = null; osc = null; gain = null; interval = null;
    },
  };
}

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

interface IncomingCall {
  invitation: Invitation;
  callerNumber: string;
  callerName: string;
}

/**
 * useSoftphone — SIP.js WebRTC hook
 *
 * Connects to FreeSWITCH via WSS using SIP.js.
 * Manages registration, outbound calls, inbound calls (ring/accept/reject),
 * mute, hold, hangup.
 *
 * Usage:
 *   const { call, hangup, mute, hold, acceptIncoming, rejectIncoming, state, incomingCall } = useSoftphone(sipConfig);
 */
export function useSoftphone(sipConfig: SipConfig | null) {
  const [state, setState] = useState<SoftphoneState>({ status: "unregistered" });
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const userAgentRef = useRef<UserAgent | null>(null);
  const sessionRef = useRef<Inviter | Invitation | null>(null);
  const ringtoneRef = useRef(createRingtone());
  const { startCall, endCall, setStatus, toggleMute, toggleHold } = useCallStore();

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

    // Handle inbound calls — present ring UI instead of auto-accept
    ua.delegate = {
      onInvite: (invitation: Invitation) => {
        const callerNumber =
          invitation.remoteIdentity?.uri?.user || "Unknown";
        const callerName =
          invitation.remoteIdentity?.displayName || callerNumber;

        setIncomingCall({ invitation, callerNumber, callerName });
        setStatus("ringing");
        // Play ringtone
        ringtoneRef.current.start();

        // Listen for remote cancellation
        invitation.stateChange.addListener((newState: SessionState) => {
          if (newState === SessionState.Terminated) {
            setIncomingCall(null);
            setStatus("idle");
            endCall();
            sessionRef.current = null;
            ringtoneRef.current.stop();
          }
        });
      },
    };

    userAgentRef.current = ua;

    return () => {
      registerer.unregister();
      ua.stop();
    };
  }, [sipConfig]);

  // ── Accept Incoming Call ──────────────────────────────────────────────────
  const acceptIncoming = useCallback(() => {
    if (!incomingCall) return;

    const { invitation, callerNumber, callerName } = incomingCall;
    sessionRef.current = invitation;
    setIncomingCall(null);
    ringtoneRef.current.stop();

    invitation.accept();

    invitation.stateChange.addListener((newState: SessionState) => {
      switch (newState) {
        case SessionState.Established:
          setStatus("connected");
          startCall({
            callSid: invitation.id,
            leadId: "",
            leadName: callerName,
            phone: callerNumber,
            agentId: "",
          });
          // Attach media
          attachRemoteMedia(invitation);
          break;
        case SessionState.Terminated:
          setStatus("ended");
          endCall();
          sessionRef.current = null;
          break;
      }
    });
  }, [incomingCall, startCall, endCall, setStatus]);

  // ── Reject Incoming Call ──────────────────────────────────────────────────
  const rejectIncoming = useCallback(() => {
    if (!incomingCall) return;

    incomingCall.invitation.reject();
    setIncomingCall(null);
    setStatus("idle");
    ringtoneRef.current.stop();
  }, [incomingCall, setStatus]);

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
            attachRemoteMedia(inviter);
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
      const session = sessionRef.current;
      if (session.state === SessionState.Established) {
        (session as any).bye?.().catch(() => {});
      } else if (session.state === SessionState.Establishing) {
        (session as any).cancel?.().catch(() => {});
      }
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

  // ── Hold ──────────────────────────────────────────────────────────────────
  const hold = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const pc = (session.sessionDescriptionHandler as any)?.peerConnection;
    if (pc) {
      // Hold: set all senders to inactive direction, Resume: set to sendrecv
      const currentlyHeld = pc.getSenders().some((s: RTCRtpSender) => s.track && !s.track.enabled);
      pc.getSenders().forEach((sender: RTCRtpSender) => {
        if (sender.track) {
          sender.track.enabled = currentlyHeld; // toggle
        }
      });
      pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) {
          receiver.track.enabled = currentlyHeld; // toggle
        }
      });
    }
    toggleHold();
  }, [toggleHold]);

  // ── DTMF ──────────────────────────────────────────────────────────────────
  const sendDtmf = useCallback((digit: string) => {
    const session = sessionRef.current;
    if (!session || session.state !== SessionState.Established) return;

    // Send via SIP INFO (RFC 2833)
    const options = {
      requestOptions: {
        body: {
          contentDisposition: "render",
          contentType: "application/dtmf-relay",
          content: `Signal=${digit}\r\nDuration=250`,
        },
      },
    };
    (session as any).info?.(options).catch(() => {
      // Fallback: some implementations may not support INFO
      console.warn("[Softphone] DTMF via INFO not supported");
    });
  }, []);

  return { call, hangup, mute, hold, sendDtmf, acceptIncoming, rejectIncoming, state, incomingCall };
}

/** Helper: attach remote audio from a session's peer connection */
function attachRemoteMedia(session: any) {
  const pc = session.sessionDescriptionHandler?.peerConnection;
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
}
