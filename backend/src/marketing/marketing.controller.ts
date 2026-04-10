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
import { MarketingService } from './marketing.service';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('marketing')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('pages')
  async createPage(@Req() req: any, @Body() body: any) {
    return this.marketingService.createLandingPage(req.user.tenantId, body);
  }

  @Get('pages')
  async findPages(@Req() req: any) {
    return this.marketingService.getLandingPages(req.user.tenantId);
  }

  // Public endpoint for rendering pages
  @Public()
  @Get('p/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.marketingService.getPageBySlug(slug);
  }

  // Public endpoint for form submissions
  @Public()
  @Post('p/:id/submit')
  async submit(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.submitForm(id, body);
  }

  @Post('journeys')
  async createJourney(@Req() req: any, @Body() body: any) {
    return this.marketingService.createJourney(req.user.tenantId, body);
  }

  @Get('journeys')
  async findJourneys(@Req() req: any) {
    return this.marketingService.getJourneys(req.user.tenantId);
  }
}
