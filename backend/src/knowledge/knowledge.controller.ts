import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.knowledgeService.createArticle(req.user.tenantId, req.user.id, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.knowledgeService.getArticles(req.user.tenantId);
  }

  @Get(':slug')
  async findOne(@Req() req: any, @Param('slug') slug: string) {
    return this.knowledgeService.getArticleBySlug(req.user.tenantId, slug);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.knowledgeService.updateArticle(id, req.user.tenantId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.knowledgeService.deleteArticle(id, req.user.tenantId);
  }
}
