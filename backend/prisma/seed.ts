import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

function hash(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'alpha-salt';
  const hashed = crypto.createHash('sha256').update(password + salt).digest('hex');
  console.log(`[SeedDebug] Hashing with salt length ${salt.length}, prefix ${salt.substring(0, 5)}... -> ${hashed.substring(0, 8)}...`);
  return hashed;
}

async function main() {
  console.log('🌱 Seeding Alpha CRM database...');

  // ── Tenant ──
  const tenant = await prisma.tenant.upsert({
    where: { id: 'dev-tenant-001' },
    update: {},
    create: { id: 'dev-tenant-001', name: 'Alpha Development', subdomain: 'dev', plan: 'STARTER', maxAgents: 100 },
  });
  console.log('✅ Tenant:', tenant.name);

  // ── Users (all 7 roles) ──
  const users = [
    { email: 'admin@alpha.dev', firstName: 'Arpit', lastName: 'Admin', role: 'ADMIN' as any, password: 'admin123' },
    { email: 'manager@alpha.dev', firstName: 'Karan', lastName: 'Manager', role: 'MANAGER' as any, password: 'manager123' },
    { email: 'supervisor@alpha.dev', firstName: 'Priya', lastName: 'Supervisor', role: 'SUPERVISOR' as any, password: 'super123' },
    { email: 'teamlead@alpha.dev', firstName: 'Rahul', lastName: 'Lead', role: 'TEAM_LEAD' as any, password: 'lead123' },
    { email: 'agent1@alpha.dev', firstName: 'Ravi', lastName: 'Kumar', role: 'AGENT' as any, password: 'agent123' },
    { email: 'agent2@alpha.dev', firstName: 'Neha', lastName: 'Sharma', role: 'AGENT' as any, password: 'agent123' },
    { email: 'qa@alpha.dev', firstName: 'Vikram', lastName: 'QA', role: 'QA' as any, password: 'qa123' },
  ];

  const createdUsers: any[] = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hash(u.password) },
      create: { tenantId: tenant.id, email: u.email, passwordHash: hash(u.password), firstName: u.firstName, lastName: u.lastName, role: u.role },
    });
    createdUsers.push(user);
    console.log(`  👤 ${u.role}: ${u.firstName} ${u.lastName} (${u.email})`);
  }

  // ── Team ──
  const team = await prisma.team.upsert({
    where: { id: 'team-sales-001' },
    update: {},
    create: { id: 'team-sales-001', tenantId: tenant.id, name: 'Sales Team Alpha', supervisorId: createdUsers[2].id },
  });
  console.log('✅ Team:', team.name);

  // ── Dispositions ──
  const dispositions = [
    { name: 'Interested', code: 'INTERESTED', category: 'POSITIVE' as any, colorHex: '#4ade80', isCallback: true },
    { name: 'Not Interested', code: 'NOT_INTERESTED', category: 'NEGATIVE' as any, colorHex: '#ef4444' },
    { name: 'Callback', code: 'CALLBACK', category: 'CALLBACK' as any, colorHex: '#fbbf24', isCallback: true },
    { name: 'Not Reachable', code: 'NOT_REACHABLE', category: 'NEUTRAL' as any, colorHex: '#888888' },
    { name: 'Wrong Number', code: 'WRONG_NUMBER', category: 'NEGATIVE' as any, colorHex: '#f97316' },
    { name: 'Do Not Call', code: 'DNC', category: 'DNC' as any, colorHex: '#ef4444' },
    { name: 'Call Back Later', code: 'CALL_BACK_LATER', category: 'CALLBACK' as any, colorHex: '#60a5fa', isCallback: true },
    { name: 'Converted', code: 'CONVERTED', category: 'POSITIVE' as any, colorHex: '#22c55e' },
    { name: 'Voicemail', code: 'VOICEMAIL', category: 'NEUTRAL' as any, colorHex: '#a78bfa' },
    { name: 'Busy', code: 'BUSY', category: 'NEUTRAL' as any, colorHex: '#f59e0b' },
  ];

  for (const [i, d] of dispositions.entries()) {
    await prisma.disposition.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: d.code } },
      update: {},
      create: { tenantId: tenant.id, name: d.name, code: d.code, category: d.category, colorHex: d.colorHex, isCallback: d.isCallback || false, sortOrder: i },
    });
  }
  console.log(`✅ ${dispositions.length} Dispositions created`);

  // ── Sample Leads ──
  const leads = [
    { firstName: 'Amit', name: 'Amit Patel', phone: '9876543001', email: 'amit@test.com', source: 'Website', city: 'Mumbai', status: 'NEW' as any },
    { firstName: 'Sonia', name: 'Sonia Gupta', phone: '9876543002', email: 'sonia@test.com', source: 'Referral', city: 'Delhi', status: 'CONTACTED' as any },
    { firstName: 'Raj', name: 'Raj Malhotra', phone: '9876543003', email: 'raj@test.com', source: 'Facebook Ad', city: 'Bangalore', status: 'INTERESTED' as any, score: 75 },
    { firstName: 'Priya', name: 'Priya Verma', phone: '9876543004', email: 'priya@test.com', source: 'CSV Import', city: 'Hyderabad', status: 'FOLLOW_UP' as any, score: 50 },
    { firstName: 'Vikash', name: 'Vikash Singh', phone: '9876543005', source: 'Cold Call', city: 'Pune', status: 'NEGOTIATION' as any, score: 85 },
    { firstName: 'Deepika', name: 'Deepika Rao', phone: '9876543006', email: 'deepika@test.com', source: 'LinkedIn', city: 'Chennai', status: 'CONVERTED' as any, score: 95 },
    { firstName: 'Manish', name: 'Manish Jain', phone: '9876543007', source: 'Website', city: 'Kolkata', status: 'LOST' as any, score: 20 },
    { firstName: 'Anita', name: 'Anita Das', phone: '9876543008', email: 'anita@test.com', source: 'Referral', city: 'Jaipur', status: 'NEW' as any },
    { firstName: 'Suresh', name: 'Suresh Nair', phone: '9876543009', source: 'WhatsApp', city: 'Kochi', status: 'CONTACTED' as any },
    { firstName: 'Meera', name: 'Meera Iyer', phone: '9876543010', email: 'meera@test.com', source: 'Google Ad', city: 'Ahmedabad', status: 'INTERESTED' as any, score: 60 },
    { firstName: 'Karan', name: 'Karan Gond', phone: '7081957371', email: 'evilkarangour@gmail.com', source: 'Direct Search', city: 'Gwalior', status: 'NEW' as any, score: 99 },
  ];

  for (const l of leads) {
    await prisma.lead.upsert({
      where: { phone_campaignId: { phone: l.phone, campaignId: '' } },
      update: {},
      create: { tenantId: tenant.id, ...l, priority: 1, assignedTo: createdUsers[4].id },
    });
  }
  console.log(`✅ ${leads.length} Sample Leads created`);

  // ── Sample Campaign ──
  const campaign = await prisma.campaign.upsert({
    where: { id: 'campaign-001' },
    update: {},
    create: {
      id: 'campaign-001', tenantId: tenant.id, name: 'Q1 Sales Outreach', description: 'Outbound campaign targeting new leads',
      type: 'OUTBOUND', dialerMode: 'PREVIEW', status: 'ACTIVE', startDate: new Date(),
      callingStartTime: '09:00', callingEndTime: '18:00', createdById: createdUsers[1].id,
    },
  });
  console.log('✅ Campaign:', campaign.name);

  // ── Sample Script ──
  await prisma.script.upsert({
    where: { id: 'script-001' },
    update: {},
    create: {
      id: 'script-001', tenantId: tenant.id, name: 'Standard Sales Pitch',
      content: '<h2>Opening</h2><p>Hello, my name is [Agent Name] from Alpha Corp. Am I speaking with [Lead Name]?</p><h2>Pitch</h2><p>We have an exclusive offer for you today...</p><h2>Closing</h2><p>Would you like to proceed? Great, let me take your details.</p>',
      createdBy: createdUsers[0].id,
    },
  });
  console.log('✅ Call Script created');

  // ── Workbook + Sheet (Hybrid JSONB) ──
  const workbook = await prisma.workbook.upsert({
    where: { id: 'wb-001' },
    update: {},
    create: { id: 'wb-001', tenantId: tenant.id, name: 'CRM Data Hub' },
  });

  const sheet = await prisma.sheet.upsert({
    where: { id: 'sheet-001' },
    update: {},
    create: { id: 'sheet-001', workbookId: workbook.id, name: 'Lead Tracker' },
  });

  const cols = [
    { key: 'name', name: 'Name', dataType: 'TEXT' as any, position: 1, width: 180 },
    { key: 'phone', name: 'Phone', dataType: 'TEXT' as any, position: 2, width: 140 },
    { key: 'email', name: 'Email', dataType: 'TEXT' as any, position: 3, width: 200 },
    { key: 'status', name: 'Status', dataType: 'SELECT' as any, position: 4, width: 100 },
    { key: 'score', name: 'Score', dataType: 'NUMBER' as any, position: 5, width: 80 },
    { key: 'city', name: 'City', dataType: 'TEXT' as any, position: 6, width: 120 },
    { key: 'source', name: 'Source', dataType: 'TEXT' as any, position: 7, width: 120 },
    { key: 'followup_date', name: 'Follow-up Date', dataType: 'DATE' as any, position: 8, width: 140 },
    { key: 'notes', name: 'Notes', dataType: 'TEXT' as any, position: 9, width: 200 },
  ];

  for (const c of cols) {
    await prisma.sheetColumn.upsert({
      where: { sheetId_key: { sheetId: sheet.id, key: c.key } },
      update: {},
      create: { sheetId: sheet.id, ...c },
    });
  }

  for (const [i, l] of leads.entries()) {
    await prisma.sheetRow.upsert({
      where: { sheetId_rowIndex: { sheetId: sheet.id, rowIndex: i + 1 } },
      update: {},
      create: { sheetId: sheet.id, rowIndex: i + 1, data: { name: l.name, phone: l.phone, email: l.email || '', status: l.status, score: l.score || 0, city: l.city, source: l.source } },
    });
  }
  console.log(`✅ Workbook "${workbook.name}" with Sheet "${sheet.name}" (${cols.length} columns, ${leads.length} rows)`);

  // ── Default View ──
  await prisma.sheetView.upsert({
    where: { id: 'view-001' },
    update: {},
    create: { id: 'view-001', sheetId: sheet.id, name: 'All Leads', filters: [], sorts: [{ column: 'name', direction: 'asc' }], hiddenColumns: [] },
  });
  console.log('✅ Default Sheet View created');

  // ── AI Config ──
  await prisma.aiConfig.upsert({
    where: { id: 'ai-001' },
    update: {},
    create: { id: 'ai-001', modelType: 'transcription', provider: 'openai-whisper', version: 'v3', isActive: true },
  });
  await prisma.aiConfig.upsert({
    where: { id: 'ai-002' },
    update: {},
    create: { id: 'ai-002', modelType: 'summary', provider: 'gpt-4o', version: '2026-03', isActive: true },
  });
  await prisma.aiConfig.upsert({
    where: { id: 'ai-003' },
    update: {},
    create: { id: 'ai-003', modelType: 'sentiment', provider: 'huggingface', version: 'bert-sentiment-v2', isActive: true },
  });
  console.log('✅ AI configs created (Whisper, GPT-4o, Sentiment)');

  console.log('\n🎉 Seed complete! Alpha CRM is ready.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
