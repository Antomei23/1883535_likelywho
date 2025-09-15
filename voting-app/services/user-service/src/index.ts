// src/index.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from "crypto";

function generateJoinCode(len = 6) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}


const app = express();
app.use(express.json());
// app.use(inviteRoutes);

// Middleware per loggare tutte le richieste
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body || {});
  next();
});

const prisma = new PrismaClient();

// -----------------------------
// Health check
// -----------------------------
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'user-service' });
});

// -----------------------------
// Users
// -----------------------------
app.get('/users', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const users = await prisma.user.findMany({
      where: email ? { email: String(email) } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err: any) {
    console.error('[GET /users] error:', err);
    res.status(500).json({ message: err.message });
  }
});


app.post('/users', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const user = await prisma.user.create({ data: parsed.data });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Recupera profilo utente
app.get('/users/:userId/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, profile: user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Aggiorna profilo utente
app.put('/users/:userId/profile', async (req: Request, res: Response) => {
  try {
    const { email, name, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { email, name, avatarUrl },
    });
    res.json({ ok: true, profile: user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Elimina utente
app.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.userId } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GET utente per ID
app.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Groups
// -----------------------------
app.get('/groups', async (_req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      include: { leader: true, members: true },
    });
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/groups', async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1),
    leaderId: z.string(),
    notificationTime: z.string().optional(),
    disableSelfVote: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    // 1. crea il gruppo
    const group = await prisma.group.create({
      data: {
        name: parsed.data.name,
        leaderId: parsed.data.leaderId,
        joinCode: generateJoinCode(),
        // se aggiungi i campi al modello Prisma:
        // notificationTime: parsed.data.notificationTime,
        // disableSelfVote: parsed.data.disableSelfVote ?? false,
      },
    });

    // 2. inserisci il leader come membro con ruolo "leader"
    await prisma.membership.create({
      data: {
        groupId: group.id,
        userId: parsed.data.leaderId,
        role: 'leader',
      },
    });

    return res.status(201).json({ ok: true, group });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

app.post('/groups/join', async (req: Request, res: Response) => {
  const schema = z.object({ code: z.string().min(4), userId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  try {
    const code = parsed.data.code.trim().toUpperCase();
    const group = await prisma.group.findUnique({ where: { joinCode: code } }); // richiede @unique
    if (!group) return res.status(404).json({ ok: false, error: "Invalid code" });

    const existing = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: parsed.data.userId, groupId: group.id } },
    });
    if (existing) return res.json({ ok: true, groupId: group.id });

    await prisma.membership.create({
      data: { userId: parsed.data.userId, groupId: group.id, role: "member" },
    });
    res.json({ ok: true, groupId: group.id });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});



// Aggiungi membro a gruppo
app.post('/groups/:groupId/members', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string(),
    role: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const membership = await prisma.membership.create({
      data: {
        groupId: req.params.groupId,
        userId: parsed.data.userId,
        role: parsed.data.role || 'member',
      },
    });
    res.status(201).json(membership);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Recupera membri del gruppo
app.get('/groups/:groupId/members', async (req: Request, res: Response) => {
  try {
    const members = await prisma.membership.findMany({
      where: { groupId: req.params.groupId },
      include: { user: true },
    });

    return res.json(
      members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Recupera un gruppo per ID
// user-service/src/index.ts  (route GET /groups/:groupId)
app.get('/groups/:groupId', async (req, res) => {
  try {
    const g = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: { leader: true, members: { include: { user: true } } },
    });
    if (!g) return res.status(404).json({ ok: false, error: "Group not found" });

    // normalizza i membri
    const members = g.members.map(m => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
    }));

    res.json({ ok: true, group: { id: g.id, name: g.name, joinCode: g.joinCode, leader: g.leader, members } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// GET /users/:userId/groups -> lista gruppi a cui l'utente appartiene
app.get('/users/:userId/groups', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            leader: { select: { id: true, name: true } }, // opzionale
          },
        },
      },
      orderBy: { groupId: 'asc' },
    });

    // normalizza l'output
    const groups = memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      role: m.role,                // "member" | "leader" (o come lo usi tu)
      leaderId: m.group.leaderId,
      leader: m.group.leader ? { id: m.group.leader.id, name: m.group.leader.name } : null,
    }));

    res.json(groups);
  } catch (err: any) {
    console.error('[users/:userId/groups] error:', err?.message || err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
});



// -----------------------------
// Boot
// -----------------------------
const PORT = Number(process.env.PORT) || 4001;
app.listen(PORT, () => {
  console.log(`user-service running on port ${PORT}`);
});
