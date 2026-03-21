import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('marketing')
export class MarketingProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { journeyId, leadId, stepIndex } = job.data;

    const journey = await (this.prisma as any).marketingJourney.findUnique({
      where: { id: journeyId },
    });
    if (!journey || !journey.isActive) return;

    const steps = journey.steps as any[];
    if (stepIndex >= steps.length) return;

    const currentStep = steps[stepIndex];
    console.log(
      `Processing Journey ${journey.name} Step ${stepIndex} for Lead ${leadId}`,
    );

    // Logic for steps: EMAIL, SMS, WAIT
    switch (currentStep.type) {
      case 'EMAIL':
        // sendMail(...) logic
        break;
      case 'WAIT':
        // Schedule next step after delay
        const delay = currentStep.durationMs || 1000 * 60 * 60 * 24; // 1 day default
        await (job as any).queue.add(
          'process-step',
          {
            journeyId,
            leadId,
            stepIndex: stepIndex + 1,
          },
          { delay },
        );
        return;
      default:
        break;
    }

    // Move to next step immediately if not a WAIT step
    await (job as any).queue.add('process-step', {
      journeyId,
      leadId,
      stepIndex: stepIndex + 1,
    });
  }
}
