import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Connect to WebSocket Gateway
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to Telephony WebSocket Gateway');
    });

    // Listen to personal agent call state events pushed by BullMQ Dialer or PBX
    socketRef.current.on(`agent:${user.id}:call`, (data) => {
      console.log('📡 Live Agent Event:', data);
    });

    // If supervisor, listen to global system live monitor
    if (['ADMIN', 'MANAGER'].includes(user.role)) {
      socketRef.current.on('supervisor:live_calls', (data) => {
        console.log('👁️ Supervisor Live Call Update:', data);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return socketRef.current;
}
