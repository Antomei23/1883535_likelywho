// src/index.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(express.json());

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
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (err: any) {
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
app.get('/groups/:groupId', async (req: Request, res: Response) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: { leader: true, members: { include: { user: true } } },
    });
    if (!group) return res.status(404).json({ ok: false, error: "Group not found" });
    res.json({ ok: true, group });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// -----------------------------
// Boot
// -----------------------------
const PORT = Number(process.env.PORT) || 4001;
app.listen(PORT, () => {
  console.log(`user-service running on port ${PORT}`);
});
