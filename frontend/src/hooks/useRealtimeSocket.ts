"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type EventHandler = (data?: any) => void;

// Two singletons — one per NestJS Gateway namespace
let _leadsSocket: Socket | null = null;
let _sheetsSocket: Socket | null = null;

function getLeadsSocket(): Socket {
  if (!_leadsSocket) {
    _leadsSocket = io(`${API_URL}/leads`, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    _leadsSocket.on("connect", () => console.debug("[WS /leads] connected"));
    _leadsSocket.on("disconnect", () => console.debug("[WS /leads] disconnected"));
  }
  return _leadsSocket;
}

function getSheetsSocket(): Socket {
  if (!_sheetsSocket) {
    _sheetsSocket = io(`${API_URL}/sheets`, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    _sheetsSocket.on("connect", () => console.debug("[WS /sheets] connected"));
    _sheetsSocket.on("disconnect", () => console.debug("[WS /sheets] disconnected"));
  }
  return _sheetsSocket;
}

// Events that belong to each namespace
const LEADS_EVENTS = new Set([
  "leadUpdated",
  "leadCreated",
  "leadDeleted",
  "leadsImported",
  "callStarted",
  "callEnded",
  "agentStatusChanged",
  "leadFunnelUpdated",
]);

const SHEETS_EVENTS = new Set([
  "sheetUpdated",
  "rowUpdated",
]);

/**
 * useRealtimeSocket
 *
 * Subscribe to named Socket.io events. Events are automatically routed
 * to the correct namespace (/leads or /sheets) based on known event names.
 *
 * Usage:
 *   useRealtimeSocket({
 *     leadUpdated: (data) => mutate('/leads'),
 *     sheetUpdated: () => mutate('/sheets/1/rows'),
 *   });
 */
export function useRealtimeSocket(events: Record<string, EventHandler>) {
  useEffect(() => {
    const leadsSocket = getLeadsSocket();
    const sheetsSocket = getSheetsSocket();

    // Register each handler on the correct socket
    const leadsEntries: [string, EventHandler][] = [];
    const sheetsEntries: [string, EventHandler][] = [];

    Object.entries(events).forEach(([event, handler]) => {
      if (SHEETS_EVENTS.has(event)) {
        sheetsSocket.on(event, handler);
        sheetsEntries.push([event, handler]);
      } else {
        // Default to leads socket for all other / custom events
        leadsSocket.on(event, handler);
        leadsEntries.push([event, handler]);
      }
    });

    return () => {
      leadsEntries.forEach(([event, handler]) => leadsSocket.off(event, handler));
      sheetsEntries.forEach(([event, handler]) => sheetsSocket.off(event, handler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Expose sockets for imperative use (e.g. emitting client→server events) */
export const realtimeSockets = {
  leads: getLeadsSocket,
  sheets: getSheetsSocket,
};
