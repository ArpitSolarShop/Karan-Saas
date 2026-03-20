"use client";

import { useEffect } from "react";
import { useRealtimeSocket } from "./useRealtimeSocket";
import { useCallStore } from "@/stores/useCallStore";
import { useAgentStore } from "@/stores/useAgentStore";

/**
 * useRealtimeState
 *
 * Wire all Socket.io events into Zustand stores.
 * Mount this once in the root layout to keep global state in sync.
 *
 * Usage: mount in src/app/layout.tsx inside a client component.
 */
export function useRealtimeState(myAgentId?: string) {
  const { startCall, endCall, setStatus } = useCallStore();
  const { updateAgentPresence, removeAgent } = useAgentStore();

  useRealtimeSocket({
    // Call started → update call store + mark agent ON_CALL
    callStarted: (data: { leadId: string; agentId: string; leadName?: string; phone?: string; callSid?: string }) => {
      if (myAgentId && data.agentId === myAgentId) {
        startCall({
          callSid: data.callSid || 'unknown',
          leadId: data.leadId,
          leadName: data.leadName || '',
          phone: data.phone || '',
          agentId: data.agentId,
        });
      }
      updateAgentPresence({
        id: data.agentId,
        name: '',
        status: 'ON_CALL',
        currentLeadId: data.leadId,
        currentLeadName: data.leadName,
        callStartedAt: new Date(),
      });
    },

    // Call ended → clear call store + mark agent WRAP_UP
    callEnded: (data: { leadId: string; agentId: string; durationSeconds?: number }) => {
      if (myAgentId && data.agentId === myAgentId) {
        endCall();
      }
      updateAgentPresence({ id: data.agentId, name: '', status: 'WRAP_UP' });
    },

    // Agent status change → update presence
    agentStatusChanged: (data: { agentId: string; status: string }) => {
      updateAgentPresence({ id: data.agentId, name: '', status: data.status as any });
    },

    // Agent disconnected → remove from board
    agentDisconnected: (data: { agentId: string }) => {
      removeAgent(data.agentId);
    },
  });

  // Tick call duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      const { activeCall, tickDuration } = useCallStore.getState();
      if (activeCall?.status === 'connected') tickDuration();
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}
