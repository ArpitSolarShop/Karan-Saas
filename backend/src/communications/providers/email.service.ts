import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(email: string, subject: string, body: string): Promise<boolean> {
    this.logger.log(`[EXTERNAL_API] Sending Email to ${email} | Subject: ${subject}`);
    // Mock successful SMTP/API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }
}
