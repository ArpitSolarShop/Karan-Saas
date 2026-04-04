import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Backfilling OmniInboxes from existing WhatsAppInstances...');
  
  const instances = await prisma.whatsAppInstance.findMany();
  
  for (const instance of instances) {
    const existing = await prisma.omniInbox.findFirst({
      where: { 
        tenantId: instance.tenantId,
        channelType: { in: ['WHATSAPP_BAILEYS', 'WHATSAPP_CLOUD'] },
        config: { path: ['externalId'], equals: instance.id }
      }
    });

    if (!existing) {
      const type = instance.connectionType === 'BAILEYS_NATIVE' ? 'WHATSAPP_BAILEYS' : 'WHATSAPP_CLOUD';
      await prisma.omniInbox.create({
        data: {
          tenantId: instance.tenantId,
          name: `WhatsApp: ${instance.name}`,
          channelType: type,
          config: { externalId: instance.id },
          status: 'ACTIVE'
        }
      });
      console.log(`✅ Created OmniInbox for instance: ${instance.name}`);
    } else {
      console.log(`ℹ️ OmniInbox already exists for instance: ${instance.name}`);
    }
  }

  console.log('✨ Backfill complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
