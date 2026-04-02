import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

@Module({
  providers: [RazorpayService]
})
export class RazorpayModule {}
