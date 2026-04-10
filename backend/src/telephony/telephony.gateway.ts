import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
})
export class TelephonyGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelephonyGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Frontend Connected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, @MessageBody() data: { roomId: string; tenantId: string }) {
    // Standard room joining with tenant scoping
    const scopedRoomId = `tenant:${data.tenantId}:${data.roomId}`;
    client.join(scopedRoomId);
    this.logger.log(`Client ${client.id} joined scoped room ${scopedRoomId}`);
    return { status: 'OK', room: scopedRoomId };
  }

  @SubscribeMessage('call:initiate')
  handleCallInitiate(client: Socket, @MessageBody() data: { to: string; agentId: string; tenantId: string; metadata?: any }) {
    this.logger.log(`[Signaling] Call Initiate from Tenant ${data.tenantId} Agent ${data.agentId} to ${data.to}`);
    // In real scenario, talk to FreeSWITCH here
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;
    this.server.to(agentRoom).emit('call:status', { status: 'CONNECTING', to: data.to, metadata: data.metadata });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:answer')
  handleCallAnswer(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Answered in Tenant ${data.tenantId} by ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;
    this.server.to(agentRoom).emit('call:status', { status: 'INCALL', callId: data.callId });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:hangup')
  handleCallHangup(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Hangup in Tenant ${data.tenantId} by ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;
    this.server.to(agentRoom).emit('call:status', { status: 'IDLE', callId: data.callId });
    return { status: 'OK' };
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Frontend Disconnected: ${client.id}`);
  }

  broadcastCallEvent(tenantId: string, agentId: string, status: string, callData: any) {
    // E.g. notify specific agent or supervisor dash
    const agentRoom = `tenant:${tenantId}:agent:${agentId}:call`;
    const supervisorRoom = `tenant:${tenantId}:supervisor:live_calls`;
    
    this.server.to(agentRoom).emit('call:event', { status, callData });
    this.server.to(supervisorRoom).emit('call:event', { agentId, status, callData });
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any): string {
    return 'pong';
  }

  @OnEvent('bi.wallboard.update')
  handleWallboardUpdate(payload: any) {
    // Broadcast to everyone subscribed to global BI
    this.server.emit('bi:live_metrics', payload);
  }
}
