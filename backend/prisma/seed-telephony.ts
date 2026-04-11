import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Telephony & Campaign Infrastructure...');

  const tenantId = 'dev-tenant-001'; // Default dev tenant
  const adminEmail = 'admin@alpha.dev';
  
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
     console.error('❌ Admin user not found. Please run the main seed first.');
     return;
  }

  // ── 1. Extensions ──
  console.log('📞 Creating Extensions...');
  for (let i = 1001; i <= 1010; i++) {
    await prisma.extension.upsert({
      where: { tenantId_number: { tenantId, number: i.toString() } },
      update: {},
      create: {
        tenantId,
        number: i.toString(),
        name: `Agent ${i}`,
        password: 'securepass123',
        type: 'WEBRTC',
        isActive: true,
      }
    });
  }

  // ── 2. ACD Queues ──
  console.log('📋 Creating ACD Queues...');
  const queues = [
    { name: 'Sales Main', strategy: 'RING_ALL' as any },
    { name: 'Technical Support', strategy: 'ROUND_ROBIN' as any },
    { name: 'VIP Priority', strategy: 'FEWEST_CALLS' as any },
  ];

  for (const q of queues) {
    const existing = await prisma.acdQueue.findFirst({ where: { tenantId, name: q.name } });
    if (!existing) {
      await prisma.acdQueue.create({
        data: {
          tenantId,
          ...q,
          timeout: 30,
          isActive: true,
        }
      });
    }
  }

  // ── 3. Campaign & Contacts ──
  console.log('📢 Creating Outbound Campaign...');
  const campaign = await prisma.campaign.upsert({
    where: { id: 'campaign-telephony-seed' },
    update: {},
    create: {
      id: 'campaign-telephony-seed',
      tenantId,
      name: 'High Octane Outreach',
      description: 'Massive outbound dialing for Q2 targets',
      type: 'OUTBOUND',
      dialerMode: 'POWER',
      status: 'ACTIVE',
      startDate: new Date(),
      createdById: admin.id,
      callingStartTime: '09:00',
      callingEndTime: '20:00',
    }
  });

  const contactList = await prisma.campaignContactList.create({
    data: {
      tenantId,
      campaignId: campaign.id,
      name: 'Premium Leads List',
      description: 'Seed leads for telephony testing',
    }
  });

  console.log('👥 Seeding Contacts...');
  const sampleContacts = [
    { firstName: 'John', lastName: 'Doe', phone: '9000000001', email: 'john@example.com', company: 'Cyberdyne' },
    { firstName: 'Jane', lastName: 'Smith', phone: '9000000002', email: 'jane@example.com', company: 'Weyland-Yutani' },
    { firstName: 'Will', lastName: 'Riker', phone: '9000000003', email: 'will@starfleet.com', company: 'Federation' },
    { firstName: 'Sarah', lastName: 'Connor', phone: '9000000004', email: 'sarah@terminator.com', company: 'Resistance' },
    { firstName: 'Ellen', lastName: 'Ripley', phone: '9000000005', email: 'ripley@nostromo.com', company: 'USCSS' },
  ];

  for (const c of sampleContacts) {
    await prisma.campaignContact.create({
      data: {
        listId: contactList.id,
        ...c,
        status: 'PENDING',
        priority: 1,
        tenantId,
      }
    });
  }

  // ── 4. IVR Logic ──
  console.log('🌳 Creating Sample IVR...');
  await prisma.ivrMenu.upsert({
    where: { id: 'ivr-seed-main' },
    update: {},
    create: {
      id: 'ivr-seed-main',
      tenantId,
      name: 'Main Welcome IVR',
      description: 'Primary customer entry point',
      nodes: [
        { id: '1', type: 'input', data: { label: 'Inbound Call' }, position: { x: 250, y: 0 } },
        { id: '2', type: 'default', data: { label: 'Play: Welcome Greeting' }, position: { x: 250, y: 100 } },
        { id: '3', type: 'default', data: { label: 'Route: Sales Queue' }, position: { x: 100, y: 200 } },
        { id: '4', type: 'default', data: { label: 'Route: Support Queue' }, position: { x: 400, y: 200 } },
      ],
      isActive: true,
    }
  });

  console.log('✅ Telephony Seed Complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
