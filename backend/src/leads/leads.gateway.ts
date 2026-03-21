import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * LeadsGateway
 *
 * Handles WebSocket connections for real-time lead updates.
 * The Redis Pub/Sub adapter (wired in main.ts) automatically fans out
 * broadcastUpdate() calls across all NestJS nodes.
 *
 * Events emitted:
 *   - "leadUpdated"         → a lead record was modified ({ leadId, changes })
 *   - "leadCreated"         → a new lead was created ({ lead })
 *   - "leadDeleted"         → a lead was deleted ({ leadId })
 *   - "callStarted"         → a call began ({ leadId, agentId })
 *   - "callEnded"           → a call ended ({ leadId, agentId, duration })
 *   - "agentStatusChanged"  → agent presence changed ({ agentId, status })
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/leads',
})
export class LeadsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[LeadsGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[LeadsGateway] Client disconnected: ${client.id}`);
  }

  /** Broadcast any named event to all connected clients (all nodes via Redis adapter) */
  broadcastUpdate(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  /** Convenience helpers — call these from LeadsService / CallsService */
  notifyLeadUpdated(leadId: string, changes: Partial<any>) {
    this.server.emit('leadUpdated', { leadId, changes });
  }

  notifyLeadCreated(lead: any) {
    this.server.emit('leadCreated', { lead });
  }

  notifyCallStarted(leadId: string, agentId: string) {
    this.server.emit('callStarted', { leadId, agentId });
  }

  notifyCallEnded(leadId: string, agentId: string, duration: number) {
    this.server.emit('callEnded', { leadId, agentId, duration });
  }

  notifyAgentStatusChanged(agentId: string, status: string) {
    this.server.emit('agentStatusChanged', { agentId, status });
  }

  /** Client-to-server: allow a client to subscribe to a specific lead room */
  @SubscribeMessage('joinLead')
  handleJoinLead(
    @MessageBody() data: { leadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`lead:${data.leadId}`);
    return { event: 'joinedLead', data: { leadId: data.leadId } };
  }

  /** Broadcast to subscribers of a specific lead only */
  notifyLeadRoom(leadId: string, event: string, payload: any) {
    this.server.to(`lead:${leadId}`).emit(event, payload);
  }
}
