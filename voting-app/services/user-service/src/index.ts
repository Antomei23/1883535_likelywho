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

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'user-service' });
});

// Crea utente
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
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// Lista utenti
app.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(users);
});

// Crea gruppo
app.post('/groups', async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1),
    leaderId: z.string().uuid(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const group = await prisma.group.create({ data: parsed.data });
    return res.status(201).json(group);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// Aggiungi membro a gruppo
app.post('/groups/:groupId/members', async (req: Request, res: Response) => {
  const groupId = req.params.groupId;
  const schema = z.object({
    userId: z.string().uuid(),
    role: z.string().min(1).default('member'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const membership = await prisma.membership.create({
      data: { groupId, userId: parsed.data.userId, role: parsed.data.role },
    });
    return res.status(201).json(membership);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

const PORT = Number(process.env.PORT) || 4001;
app.listen(PORT, () => {
  console.log(`user-service on ${PORT}`);
});
