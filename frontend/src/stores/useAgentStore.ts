import { create } from 'zustand';

export type AgentStatus = 'AVAILABLE' | 'ON_CALL' | 'WRAP_UP' | 'BREAK' | 'OFFLINE';

export interface AgentPresence {
  id: string;
  name: string;
  status: AgentStatus;
  currentLeadId?: string;
  currentLeadName?: string;
  callStartedAt?: Date;
  extension?: string;
}

interface AgentStore {
  myStatus: AgentStatus;
  myId: string | null;
  agentsOnline: AgentPresence[];

  // Actions
  setMyId: (id: string) => void;
  setMyStatus: (status: AgentStatus) => void;
  updateAgentPresence: (presence: AgentPresence) => void;
  removeAgent: (agentId: string) => void;
  setAgentsOnline: (agents: AgentPresence[]) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  myStatus: 'OFFLINE',
  myId: null,
  agentsOnline: [],

  setMyId: (id) => set({ myId: id }),

  setMyStatus: (status) =>
    set((state) => ({
      myStatus: status,
      // Also update our presence in agentsOnline array
      agentsOnline: state.agentsOnline.map((a) =>
        a.id === state.myId ? { ...a, status } : a,
      ),
    })),

  updateAgentPresence: (presence) =>
    set((state) => {
      const exists = state.agentsOnline.find((a) => a.id === presence.id);
      if (exists) {
        return {
          agentsOnline: state.agentsOnline.map((a) =>
            a.id === presence.id ? { ...a, ...presence } : a,
          ),
        };
      }
      return { agentsOnline: [...state.agentsOnline, presence] };
    }),

  removeAgent: (agentId) =>
    set((state) => ({
      agentsOnline: state.agentsOnline.filter((a) => a.id !== agentId),
    })),

  setAgentsOnline: (agents) => set({ agentsOnline: agents }),
}));
