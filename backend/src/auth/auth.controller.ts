import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Headers,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Req } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      tenantId: string;
      role?: string;
      extension?: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    console.log('\n--- 🔴 INCOMING LOGIN REQUEST 🔴 ---');
    console.log(`Email received:    "${body.email}" (Length: ${body.email?.length})`);
    console.log(`Password received: "${body.password}" (Length: ${body.password?.length})`);
    console.log('--------------------------------------\n');
    return this.authService.login(body.email, body.password);
  }

  @Get('profile')
  async profile(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.getProfile(token);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async listUsers(@Req() req: any) {
    return this.authService.listUsers(req.user.tenantId);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async updateUser(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      role?: string;
      extension?: string;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
    },
  ) {
    return this.authService.updateUser(id, req.user.tenantId, body);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return this.authService.deleteUser(id, req.user.tenantId);
  }

  @Post('mfa/enroll')
  async enrollMfa(@Body() body: { userId: string }) {
    return this.authService.generateMfaSecret(body.userId);
  }

  @Post('mfa/verify')
  async verifyMfa(@Body() body: { userId: string; token: string }) {
    return this.authService.verifyAndEnableMfa(body.userId, body.token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Initiates the OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req);
  }
}
