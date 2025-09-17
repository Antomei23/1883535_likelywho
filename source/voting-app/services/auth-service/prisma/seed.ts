import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAlice() {
  // Utente demo
  const userId = '11111111-1111-1111-1111-111111111111';
  const email = 'alice@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}

async function createBob() {
  // Utente demo
  const userId = '22222222-2222-2222-2222-222222222222';
  const email = 'bob@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}

async function createCharlie() {
  // Utente demo
  const userId = '55555555-5555-5555-5555-555555555555';
  const email = 'charlie@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}

async function createDave() {
  // Utente demo
  const userId = '77777777-7777-7777-7777-777777777777';
  const email = 'dave@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}

async function createEva() {
  // Utente demo
  const userId = '88888888-8888-8888-8888-888888888888';
  const email = 'eva@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}

async function createFrank() {
  // Utente demo
  const userId = '99999999-9999-9999-9999-999999999999';
  const email = 'frank@example.com';
  const password = 'password123'; // plain text solo qui, per generare l'hash
  const hash = await bcrypt.hash(password, 10);

  // Account demo (provider "local")
  await prisma.account.upsert({
    where: {
      provider_providerUserId: {
        provider: 'local',
        providerUserId: email,
      },
    },
    update: {
      userId,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'local',
      providerUserId: email,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Password demo
  await prisma.password.upsert({
    where: { userId },
    update: { hash },
    create: { userId, hash },
  });

  console.log(`✅ Seed completato: account "${email}" con password "${password}"`);
}


createAlice()
.then(createBob)
.then(createCharlie)
.then(createDave)
.then(createEva)
.then(createFrank)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



  