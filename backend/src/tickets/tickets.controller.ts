import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.ticketsService.createTicket(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.ticketsService.getTickets(req.user.tenantId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.ticketsService.updateTicket(id, req.user.tenantId, body);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.ticketsService.addMessage(
      id,
      req.user.id,
      body.body,
      body.isInternal,
    );
  }
}
