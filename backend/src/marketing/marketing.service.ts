import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MarketingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('marketing') private marketingQueue: Queue,
  ) {}

  // Landing Pages
  async createLandingPage(tenantId: string, data: any) {
    return this.prisma.landingPage.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
        htmlContent: data.htmlContent,
        cssContent: data.cssContent,
        isPublished: data.isPublished || false,
      },
    });
  }

  async getLandingPages(tenantId: string) {
    return this.prisma.landingPage.findMany({ where: { tenantId } });
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.landingPage.findFirst({
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async submitForm(landingPageId: string, formData: any) {
    const page = await this.prisma.landingPage.findUnique({ where: { id: landingPageId } });
    if (!page) throw new NotFoundException('Page not found');

    // Save submission
    const submission = await this.prisma.pageSubmission.create({
      data: {
        landingPageId,
        formData,
      },
    });

    // Automate: Convert to Lead if email/phone present
    if (formData.email || formData.phone) {
      await this.prisma.lead.create({
        data: {
          tenantId: page.tenantId,
          firstName: formData.firstName || formData.name || 'Web',
          lastName: formData.lastName || 'Lead',
          email: formData.email,
          phone: formData.phone || '',
          source: `Landing Page: ${page.name}`,
        },
      });
    }

    return submission;
  }

  // Journeys
  async createJourney(tenantId: string, data: any) {
    return this.prisma.marketingJourney.create({
      data: {
        tenantId,
        name: data.name,
        trigger: data.trigger,
        steps: data.steps || [],
        isActive: data.isActive || false,
      },
    });
  }

  async getJourneys(tenantId: string) {
    return this.prisma.marketingJourney.findMany({ where: { tenantId } });
  }

  async startJourneyForLead(journeyId: string, leadId: string) {
    const journey = await this.prisma.marketingJourney.findUnique({ where: { id: journeyId } });
    if (!journey || !journey.isActive) return;

    // Add to BullMQ for processing steps
    await this.marketingQueue.add('process-step', {
      journeyId,
      leadId,
      stepIndex: 0,
    });
  }
}
