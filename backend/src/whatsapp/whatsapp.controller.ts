import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaileysEngineService } from './baileys.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baileysEngine: BaileysEngineService,
  ) {}

  @Get('instances/:tenantId')
  async getInstances(@Param('tenantId') tenantId: string) {
    return this.prisma.whatsAppInstance.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { messages: true, contacts: true },
        },
      },
    });
  }

  @Post('instances')
  async createInstance(@Body() data: { tenantId: string; name: string }) {
    const instance = await this.prisma.whatsAppInstance.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        connectionType: 'BAILEYS_NATIVE',
        connectionStatus: 'disconnected',
      },
    });

    return instance;
  }

  @Post('instances/:id/connect')
  async connectInstance(@Param('id') id: string) {
    // Starts the session (generates QR or restores session)
    await this.baileysEngine.startSession(id);
    return { success: true, message: 'Session boot sequence initiated.' };
  }

  @Delete('instances/:id/disconnect')
  async disconnectInstance(@Param('id') id: string) {
    const socket = this.baileysEngine.getSocket(id);
    await socket.logout(); // Will trigger connection.update -> close -> DB cleanup
    return { success: true, message: 'Disconnection initiated.' };
  }

  // --- Send Messages API ---

  @Post('send/text')
  async sendText(
    @Body() data: { instanceId: string; jid: string; text: string }
  ) {
    const socket = this.baileysEngine.getSocket(data.instanceId);
    
    // Add WhatsApp's internal domain suffix if missing
    let targetJid = data.jid;
    if (!targetJid.includes('@')) {
      targetJid = `${targetJid}@s.whatsapp.net`;
    }

    const sentMsg = await socket.sendMessage(targetJid, { text: data.text });
    
    return { success: true, messageId: sentMsg?.key.id };
  }
}
