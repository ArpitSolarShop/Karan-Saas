import { create } from 'zustand';

export type CallStatus = 'idle' | 'ringing' | 'connected' | 'on-hold' | 'ended';

interface ActiveCall {
  callSid: string;
  leadId: string;
  leadName: string;
  phone: string;
  agentId: string;
  startTime: Date;
  status: CallStatus;
  isMuted: boolean;
  isOnHold: boolean;
  durationSeconds: number;
}

interface CallStore {
  activeCall: ActiveCall | null;
  recentCalls: Pick<ActiveCall, 'callSid' | 'leadName' | 'phone' | 'durationSeconds'>[];

  // Actions
  startCall: (data: Omit<ActiveCall, 'startTime' | 'status' | 'isMuted' | 'isOnHold' | 'durationSeconds'>) => void;
  endCall: () => void;
  setStatus: (status: CallStatus) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  tickDuration: () => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  activeCall: null,
  recentCalls: [],

  startCall: (data) => {
    set({
      activeCall: {
        ...data,
        startTime: new Date(),
        status: 'ringing',
        isMuted: false,
        isOnHold: false,
        durationSeconds: 0,
      },
    });
  },

  endCall: () => {
    const call = get().activeCall;
    if (!call) return;
    set((state) => ({
      activeCall: null,
      recentCalls: [
        { callSid: call.callSid, leadName: call.leadName, phone: call.phone, durationSeconds: call.durationSeconds },
        ...state.recentCalls.slice(0, 9), // keep last 10
      ],
    }));
  },

  setStatus: (status) =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, status } : null,
    })),

  toggleMute: () =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, isMuted: !state.activeCall.isMuted } : null,
    })),

  toggleHold: () =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, isOnHold: !state.activeCall.isOnHold } : null,
    })),

  tickDuration: () =>
    set((state) => ({
      activeCall: state.activeCall
        ? { ...state.activeCall, durationSeconds: state.activeCall.durationSeconds + 1 }
        : null,
    })),
}));
