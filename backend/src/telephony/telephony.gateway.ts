import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class TelephonyGateway {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(TelephonyGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Frontend Connected: ${client.id}`);
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
}
