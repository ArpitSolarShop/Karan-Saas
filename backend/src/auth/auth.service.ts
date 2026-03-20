import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
const { authenticator } = require('otplib');
import * as QRCode from 'qrcode';

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'alpha-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private signToken(userId: string, tenantId: string, role: string): string {
    return this.jwtService.sign({ userId, tenantId, role });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    tenantId?: string;
  }) {
    const tenantId = data.tenantId || 'dev-tenant-001';
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      await this.prisma.tenant.create({
        data: { id: tenantId, name: 'Alpha Development', subdomain: 'dev', plan: 'STARTER', maxAgents: 100 },
      });
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new UnauthorizedException('Email already in use');

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        passwordHash: hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'AGENT',
      },
    });

    const token = this.signToken(user.id, tenantId, user.role);
    return { token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } }) as any;
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    if (user.mfaEnabled) {
      return { mfaRequired: true, userId: user.id, message: 'MFA token required.' };
    }

    const token = this.signToken(user.id, user.tenantId, user.role);
    return {
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async verifyMfaAndLogin(userId: string, mfaToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user || !user.mfaSecret) throw new UnauthorizedException('MFA not set up');

    const isValid = authenticator.verify({ token: mfaToken, secret: user.mfaSecret });
    if (!isValid) throw new UnauthorizedException('Invalid MFA token');

    const token = this.signToken(user.id, user.tenantId, user.role);
    return {
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, agentStatus: true, tenantId: true, teamId: true },
    });
  }

  async listUsers(tenantId?: string) {
    return this.prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, agentStatus: true, isActive: true, lastLoginAt: true, mfaEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(userId: string, data: { role?: string; agentStatus?: string; isActive?: boolean; extension?: string; firstName?: string; lastName?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: data as any,
      select: { id: true, email: true, role: true, agentStatus: true, isActive: true, extension: true, firstName: true, lastName: true },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deletedAt: new Date() } as any,
    });
  }

  // ── MFA ──
  async generateMfaSecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user) throw new NotFoundException('User not found');

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'AlphaCRM', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });
    return { secret, qrCode };
  }

  async verifyAndEnableMfa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user || !user.mfaSecret) throw new UnauthorizedException('MFA not set up');

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) throw new UnauthorizedException('Invalid MFA token');

    await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    return { success: true };
  }

  // ── OAUTH ──
  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google provided');
    }
    const { email, firstName, lastName } = req.user;

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          tenantId: 'dev-tenant-001',
          email,
          passwordHash: hashPassword(Math.random().toString(36).slice(-10)),
          firstName: firstName || 'Google User',
          lastName: lastName || '',
          role: 'AGENT',
        },
      });
    }

    const token = this.signToken(user.id, user.tenantId, user.role);
    return {
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    };
  }
}
