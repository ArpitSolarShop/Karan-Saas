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
import { Public } from '../auth/public.decorator';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pages')
  async createPage(@Req() req: any, @Body() body: any) {
    return this.marketingService.createLandingPage(req.user.tenantId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pages')
  async findPages(@Req() req: any) {
    return this.marketingService.getLandingPages(req.user.tenantId);
  }

  // Public endpoint for rendering pages
  @Get('p/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.marketingService.getPageBySlug(slug);
  }

  // Public endpoint for form submissions
  @Post('p/:id/submit')
  async submit(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.submitForm(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('journeys')
  async createJourney(@Req() req: any, @Body() body: any) {
    return this.marketingService.createJourney(req.user.tenantId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('journeys')
  async findJourneys(@Req() req: any) {
    return this.marketingService.getJourneys(req.user.tenantId);
  }
}
