'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Native Socket.io hook that connects the Next.js App Router 
 * directly to the NestJS Baileys Engine Gateway.
 */
export function useWhatsappSocket(instanceId: string | null) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!instanceId) return;

    // Connect to the NestJS Namespace (must strip /api/v1 from REST API URL)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    const socket: Socket = io(baseUrl + '/whatsapp', {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnectionAttempts: 25, // Give it more chances
    });

    socket.on('connect', () => {
      console.log(`✅ Connected to WhatsApp Gateway [${instanceId}]`);
    });

    // Listen for Base64 QR code emissions from Baileys
    socket.on(`wa-qr:${instanceId}`, (data: { qrCode: string }) => {
      console.log('Received Native QR Update');
      setQrCode(data.qrCode);
      setIsConnected(false);
    });

    // Listen for authorized connections
    socket.on(`wa-connected:${instanceId}`, () => {
      console.log('WhatsApp Instance Authorized!');
      setQrCode(null);
      setIsConnected(true);
    });

    // Listen for live inbound/outbound messages
    socket.on(`wa-message:${instanceId}`, (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [instanceId]);

  return { qrCode, isConnected, messages };
}
