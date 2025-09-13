// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   // Utenti demo
//   const alice = await prisma.user.upsert({
//     where: { email: 'alice@example.com' },
//     update: {},
//     create: { id: 'usr_alice', email: 'alice@example.com', name: 'Alice' }
//   });

//   const bob = await prisma.user.upsert({
//     where: { email: 'bob@example.com' },
//     update: {},
//     create: { id: 'usr_bob', email: 'bob@example.com', name: 'Bob' }
//   });

//   // Gruppo demo
//   const group = await prisma.group.upsert({
//     where: { id: 'grp_demo' },
//     update: {},
//     create: { id: 'grp_demo', name: 'Calcetto del Giovedì', leaderId: alice.id }
//   });

//   // Membership
//   await prisma.membership.upsert({
//     where: { userId_groupId: { userId: alice.id, groupId: group.id } },
//     update: {},
//     create: { userId: alice.id, groupId: group.id, role: 'leader' }
//   });
//   await prisma.membership.upsert({
//     where: { userId_groupId: { userId: bob.id, groupId: group.id } },
//     update: {},
//     create: { userId: bob.id, groupId: group.id, role: 'member' }
//   });

//   // (Opzionale) riferimento domanda
//   await prisma.questionRef.upsert({
//     where: { id: 'q_demo_1' },
//     update: {},
//     create: { id: 'q_demo_1', groupId: group.id }
//   });

//   console.log('Seed user-service OK:', { alice: alice.email, bob: bob.email, group: group.name });
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// }).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const aliceId = '11111111-1111-1111-1111-111111111111';
  const bobId   = '22222222-2222-2222-2222-222222222222';
  const groupId = '33333333-3333-3333-3333-333333333333';

  // Utente Alice
  await prisma.user.upsert({
    where: { id: aliceId },
    update: { name: 'Alice' },
    create: {
      id: aliceId,
      email: 'alice@example.com',
      name: 'Alice',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Utente Bob
  await prisma.user.upsert({
    where: { id: bobId },
    update: { name: 'Bob' },
    create: {
      id: bobId,
      email: 'bob@example.com',
      name: 'Bob',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Gruppo Demo guidato da Alice
  await prisma.group.upsert({
    where: { id: groupId },
    update: { name: 'Gruppo Demo' },
    create: {
      id: groupId,
      name: 'Gruppo Demo',
      leaderId: aliceId,
    },
  });

  // Membership Alice come leader
  await prisma.membership.upsert({
    where: { userId_groupId: { userId: aliceId, groupId } },
    update: { role: 'leader' },
    create: {
      id: crypto.randomUUID(),
      userId: aliceId,
      groupId,
      role: 'leader',
    },
  });

  // Membership Bob come membro
  await prisma.membership.upsert({
    where: { userId_groupId: { userId: bobId, groupId } },
    update: { role: 'member' },
    create: {
      id: crypto.randomUUID(),
      userId: bobId,
      groupId,
      role: 'member',
    },
  });

  console.log('✅ Seed completato: Alice + Bob + Gruppo Demo popolati');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
