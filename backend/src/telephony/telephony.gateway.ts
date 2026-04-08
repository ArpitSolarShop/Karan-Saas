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
  handleJoinRoom(client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room ${data.roomId}`);
    return { status: 'OK' };
  }

  @SubscribeMessage('call:initiate')
  handleCallInitiate(client: Socket, @MessageBody() data: { to: string; agentId: string; metadata?: any }) {
    this.logger.log(`[Signaling] Call Initiate from ${data.agentId} to ${data.to}`);
    // In real scenario, talk to FreeSWITCH here
    this.server.to(`agent:${data.agentId}`).emit('call:status', { status: 'CONNECTING', to: data.to, metadata: data.metadata });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:answer')
  handleCallAnswer(client: Socket, @MessageBody() data: { agentId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Answered by ${data.agentId}`);
    this.server.to(`agent:${data.agentId}`).emit('call:status', { status: 'INCALL', callId: data.callId });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:hangup')
  handleCallHangup(client: Socket, @MessageBody() data: { agentId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Hangup by ${data.agentId}`);
    this.server.to(`agent:${data.agentId}`).emit('call:status', { status: 'IDLE', callId: data.callId });
    return { status: 'OK' };
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Frontend Disconnected: ${client.id}`);
  }

  broadcastCallEvent(agentId: string, status: string, callData: any) {
    // E.g. notify specific agent or supervisor dash
    this.server.emit(`agent:${agentId}:call`, { status, callData });
    this.server.emit('supervisor:live_calls', { agentId, status, callData });
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
