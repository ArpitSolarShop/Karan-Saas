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
    origin: '*',
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
   */
  emitQrCode(instanceId: string, qrCode: string) {
    this.server.emit(`wa-qr:${instanceId}`, { qrCode });
  }

  /**
   * Tells the frontend that the instance is officially connected and authorized.
   */
  emitConnected(instanceId: string) {
    this.server.emit(`wa-connected:${instanceId}`, { status: 'connected' });
  }

  /**
   * Pushes real-time inbound/outbound messages to the Next.js Unified Chat Inbox.
   */
  emitMessageUpsert(instanceId: string, message: any) {
    this.server.emit(`wa-message:${instanceId}`, message);
  }
}
