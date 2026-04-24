import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TelephonyService } from './telephony.service';

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

  constructor(
    @Inject(forwardRef(() => TelephonyService))
    private readonly telephonyService: TelephonyService,
  ) {}

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

  // ── Call Lifecycle ────────────────────────────────────────────────────────

  @SubscribeMessage('call:initiate')
  async handleCallInitiate(client: Socket, @MessageBody() data: { to: string; agentId: string; tenantId: string; leadId?: string; metadata?: any }) {
    this.logger.log(`[Signaling] Call Initiate from Tenant ${data.tenantId} Agent ${data.agentId} to ${data.to}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      // Actually originate the call via FreeSWITCH ESL
      const callUUID = await this.telephonyService.initiateCall(data.tenantId, {
        toNumber: data.to,
        agentId: data.agentId,
        leadId: data.leadId || '',
      });
      this.server.to(agentRoom).emit('call:status', { status: 'CONNECTING', to: data.to, callUUID, metadata: data.metadata });
    } catch (err) {
      this.logger.error(`Call initiation failed: ${err}`);
      // Fallback: emit connecting status even without FS so UI doesn't hang
      this.server.to(agentRoom).emit('call:status', { status: 'CONNECTING', to: data.to, metadata: data.metadata, simMode: true });
    }
    return { status: 'OK' };
  }

  @SubscribeMessage('call:answer')
  async handleCallAnswer(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Answered in Tenant ${data.tenantId} by ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      // Mark call as connected in Prisma
      await this.telephonyService.markCallAnswered(data.tenantId, data.callId);
    } catch (err) {
      this.logger.warn(`Failed to mark call answered in DB: ${err}`);
    }

    this.server.to(agentRoom).emit('call:status', { status: 'INCALL', callId: data.callId });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:hangup')
  async handleCallHangup(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string }) {
    this.logger.log(`[Signaling] Call Hangup in Tenant ${data.tenantId} by ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      // Actually hang up the call via FreeSWITCH + update DB
      await this.telephonyService.hangupCall(data.tenantId, data.callId);
    } catch (err) {
      this.logger.warn(`FreeSWITCH hangup failed (may already be hung up): ${err}`);
    }

    this.server.to(agentRoom).emit('call:status', { status: 'IDLE', callId: data.callId });
    return { status: 'OK' };
  }

  // ── In-Call Controls ──────────────────────────────────────────────────────

  @SubscribeMessage('call:mute')
  async handleCallMute(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string; mute: boolean }) {
    this.logger.log(`[Signaling] ${data.mute ? 'Mute' : 'Unmute'} call ${data.callId} for Agent ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      await this.telephonyService.muteCall(data.tenantId, data.callId, data.mute);
    } catch (err) {
      this.logger.warn(`Mute ESL command failed: ${err}`);
    }

    this.server.to(agentRoom).emit('call:mute_status', { callId: data.callId, muted: data.mute });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:hold')
  async handleCallHold(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string; hold: boolean }) {
    this.logger.log(`[Signaling] ${data.hold ? 'Hold' : 'Resume'} call ${data.callId} for Agent ${data.agentId}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      await this.telephonyService.holdCall(data.tenantId, data.callId, data.hold);
    } catch (err) {
      this.logger.warn(`Hold ESL command failed: ${err}`);
    }

    this.server.to(agentRoom).emit('call:hold_status', { callId: data.callId, held: data.hold });
    return { status: 'OK' };
  }

  @SubscribeMessage('call:transfer')
  async handleCallTransfer(client: Socket, @MessageBody() data: { agentId: string; tenantId: string; callId: string; targetExtension: string }) {
    this.logger.log(`[Signaling] Transfer call ${data.callId} to ${data.targetExtension}`);
    const agentRoom = `tenant:${data.tenantId}:agent:${data.agentId}`;

    try {
      await this.telephonyService.transferCall(data.tenantId, data.callId, data.targetExtension);
      this.server.to(agentRoom).emit('call:status', { status: 'TRANSFERRED', callId: data.callId, targetExtension: data.targetExtension });
    } catch (err) {
      this.logger.warn(`Transfer ESL command failed: ${err}`);
      this.server.to(agentRoom).emit('call:error', { message: 'Transfer failed', callId: data.callId });
    }

    return { status: 'OK' };
  }

  // ── Connection Lifecycle ──────────────────────────────────────────────────

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
