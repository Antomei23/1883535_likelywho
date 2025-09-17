// services/user-service/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ====== UTENTI (ID allineati con auth-service) =============================
const USERS: Array<{ id: string; email: string; name: string }> = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'alice@example.com',   name: 'Alice'   },
  { id: '22222222-2222-2222-2222-222222222222', email: 'bob@example.com',     name: 'Bob'     },
  { id: '55555555-5555-5555-5555-555555555555', email: 'charlie@example.com', name: 'Charlie' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'dave@example.com',    name: 'Dave'    },
  { id: '88888888-8888-8888-8888-888888888888', email: 'eva@example.com',     name: 'Eva'     },
  { id: '99999999-9999-9999-9999-999999999999', email: 'frank@example.com',   name: 'Frank'   },
];

// ====== GRUPPI (con joinCode fissi) ========================================
const GROUPS: Array<{
  id: string;
  name: string;
  joinCode: string;
  leaderEmail: string;
  membersEmails: string[];
}> = [
  {
    id: 'grp_all',
    name: 'Gruppo Tutti',
    joinCode: 'ALLALL', // 6 char, unico
    leaderEmail: 'alice@example.com',
    membersEmails: [
      'alice@example.com',
      'bob@example.com',
      'charlie@example.com',
      'dave@example.com',
      'eva@example.com',
      'frank@example.com',
    ],
  },
  {
    id: 'grp_no_frank',
    name: 'Gruppo Senza Frank',
    joinCode: 'NOFRNK', // 6 char, unico
    leaderEmail: 'bob@example.com',
    membersEmails: [
      'alice@example.com',
      'bob@example.com',
      'charlie@example.com',
      'dave@example.com',
      'eva@example.com',
      // frank escluso
    ],
  },
];

async function main() {
  // 1) Upsert utenti
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name },
      create: { id: u.id, email: u.email, name: u.name },
    });
  }

  // Mappa email -> id per comodità
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const byEmail = new Map(users.map(u => [u.email, u.id]));

  // 2) Upsert gruppi + membership
  for (const g of GROUPS) {
    const leaderId = byEmail.get(g.leaderEmail);
    if (!leaderId) throw new Error(`Leader mancante: ${g.leaderEmail}`);

    const group = await prisma.group.upsert({
      where: { id: g.id },
      update: { name: g.name, leaderId, joinCode: g.joinCode },
      create: { id: g.id, name: g.name, leaderId, joinCode: g.joinCode },
    });

    // Leader come leader
    await prisma.membership.upsert({
      where: { userId_groupId: { userId: leaderId, groupId: group.id } },
      update: { role: 'leader' },
      create: { id: crypto.randomUUID(), userId: leaderId, groupId: group.id, role: 'leader' },
    });

    // Membri (evita doppioni del leader)
    for (const email of g.membersEmails) {
      const uid = byEmail.get(email);
      if (!uid) {
        console.warn(`⚠️  Utente non trovato "${email}" per gruppo "${g.name}"`);
        continue;
      }
      if (uid === leaderId) continue;
      await prisma.membership.upsert({
        where: { userId_groupId: { userId: uid, groupId: group.id } },
        update: { role: 'member' },
        create: { id: crypto.randomUUID(), userId: uid, groupId: group.id, role: 'member' },
      });
    }

    console.log(`✅ Gruppo pronto: ${group.name} | id=${group.id} | joinCode=${group.joinCode}`);
  }

  console.log('🌱 Seed user-service COMPLETATO');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
