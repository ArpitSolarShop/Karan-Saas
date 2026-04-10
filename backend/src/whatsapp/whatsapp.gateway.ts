import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * Socket.io Gateway to push real-time WhatsApp QR codes and incoming 
 * conversational messages directly to the frontend clients without page refresh.
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
  namespace: '/whatsapp',
})
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsappGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Frontend Client connected to WhatsApp Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Frontend Client disconnected from WhatsApp Gateway: ${client.id}`);
  }

  /**
   * Broadcasts the Base64 QR code to a specific active frontend instance pairing screen.
   * Scoped by tenant for security.
   */
  emitQrCode(instanceId: string, tenantId: string, qrCode: string) {
    this.server.emit(`tenant:${tenantId}:wa-qr:${instanceId}`, { qrCode });
  }

  /**
   * Tells the frontend that the instance is officially connected and authorized.
   * Scoped by tenant for security.
   */
  emitConnected(instanceId: string, tenantId: string) {
    this.server.emit(`tenant:${tenantId}:wa-connected:${instanceId}`, { status: 'connected' });
  }

  /**
   * Pushes real-time inbound/outbound messages to the Next.js Unified Chat Inbox.
   * Scoped by tenant for security.
   */
  emitMessageUpsert(instanceId: string, tenantId: string, message: any) {
    this.server.emit(`tenant:${tenantId}:wa-message:${instanceId}`, message);
  }
}
