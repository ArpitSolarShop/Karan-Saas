import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
  const salt = process.env.PASSWORD_SALT || 'alpha-salt';
  console.log('Using salt:', salt);
  const password = 'admin123';
  const expectedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  console.log('Expected hash:', expectedHash);

  const user = await prisma.user.findUnique({ where: { email: 'admin@alpha.dev' } });
  console.log('User found:', user ? user.email : 'No user');
  console.log('DB hash:', user?.passwordHash);
  console.log('Match?', expectedHash === user?.passwordHash);
  process.exit();
}
run();
