import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
  namespace: '/communications',
})
export class CommunicationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommunicationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Frontend Client connected to Communications Gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Frontend Client disconnected from Communications Gateway: ${client.id}`);
  }

  /**
   * Broadcasts a unified message update to the omnichannel inbox.
   */
  emitMessageUpdate(tenantId: string, conversationId: string, message: any) {
    // Emit to a tenant-specific room or just broadcast if simple
    this.server.emit(`omni-message:${conversationId}`, message);
    this.server.emit(`inbox-update:${tenantId}`, { conversationId, lastMessage: message });
  }

  /**
   * Broadcasts a conversation update (e.g., assignment, status change)
   */
  emitConversationUpdate(tenantId: string, conversation: any) {
    this.server.emit(`conversation-update:${tenantId}`, conversation);
  }
}
