import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * SheetsGateway
 *
 * Handles WebSocket connections for real-time spreadsheet updates.
 * The Redis Pub/Sub adapter (wired in main.ts) automatically fans out
 * broadcastUpdate() calls across all NestJS nodes.
 *
 * Events emitted:
 *   - "sheetUpdated"  → full sheet refresh needed
 *   - "rowUpdated"    → single row data changed ({ rowIndex })
 */
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
  namespace: '/sheets',
})
export class SheetsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('[SheetsGateway] Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('[SheetsGateway] Client disconnected:', client.id);
  }

  broadcastUpdate(event: string, data: any) {
    this.server.emit(event, data);
  }

  broadcastRowUpdate(rowIndex: number, rowData: any) {
    this.server.emit('rowUpdated', { rowIndex, rowData });
  }

  broadcastSheetUpdate(sheetId: string) {
    this.server.emit('sheetUpdated', { sheetId });
  }
}
