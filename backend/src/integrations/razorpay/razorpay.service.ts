import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  async createPaymentLink(tenantId: string, amount: number, currency = 'INR') {
    this.logger.log(`[Razorpay] Creating payment link for ${amount} ${currency} (Tenant: ${tenantId})`);
    return { success: true, link: 'https://rzp.io/stub', orderId: `order_${Date.now()}` };
  }
}
