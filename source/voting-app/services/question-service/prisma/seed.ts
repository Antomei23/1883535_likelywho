import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.question.upsert({
    where: { id: 'q_demo_1' },
    update: {},
    create: {
      id: 'q_demo_1',
      groupId: 'grp_demo',       // deve coincidere con quanto creato nello user-service
      text: 'Chi viene stasera?',
      expiresAt: in2h,
      closed: false
    }
  });

  await prisma.question.upsert({
    where: { id: 'q_demo_2' },
    update: {},
    create: {
      id: 'q_demo_2',
      groupId: 'grp_demo',
      text: 'Prossima settimana martedì o mercoledì?',
      expiresAt: in24h,
      closed: false
    }
  });

  console.log('Seed question-service OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
