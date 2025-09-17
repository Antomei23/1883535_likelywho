import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

// -----------------------------
// CONFIG SERVIZI
// -----------------------------
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:4001";

// -----------------------------
// HEALTH
// -----------------------------
app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'auth-service' });
});


// -----------------------------
// REGISTRAZIONE PASSWORD
// -----------------------------
app.post('/passwords', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string().uuid(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const hashed = await bcrypt.hash(parsed.data.password, 10);

    const pw = await prisma.password.upsert({
      where: { userId: parsed.data.userId },
      create: { userId: parsed.data.userId, hash: hashed },
      update: { hash: hashed },
    });
    return res.status(201).json(pw);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// -----------------------------
// LOGIN (email + password)
// -----------------------------
app.post('/login', async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  console.log(parsed)
  try {
    // 1. Recupera utente da user-service
    const userResp = await fetch(`${USER_SERVICE_URL}/users?email=${encodeURIComponent(parsed.data.email)}`);
    if (!userResp.ok) return res.status(401).json({ ok: false, error: "User not found" });
    const users = await userResp.json();
    const user = Array.isArray(users) ? users[0] : users;

    if (!user || !user.id) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    // 2. Recupera hash password da auth-service
    const pw = await prisma.password.findUnique({ where: { userId: user.id } });
    if (!pw) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    // 3. Confronta password
    const valid = await bcrypt.compare(parsed.data.password, pw.hash);
    if (!valid) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    // 4. Crea sessione
    const jwtId = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.session.create({
      data: { userId: user.id, jwtId, expiresAt },
    });

    return res.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      token: jwtId,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// -----------------------------
// CREA SESSIONE MANUALE
// -----------------------------
app.post('/sessions', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string().uuid(),
    jwtId: z.string().min(1),
    expiresAt: z.string().datetime(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const s = await prisma.session.create({
      data: {
        userId: parsed.data.userId,
        jwtId: parsed.data.jwtId,
        expiresAt: new Date(parsed.data.expiresAt),
      },
    });
    return res.status(201).json(s);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// -----------------------------
// AVVIO
// -----------------------------
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`✅ auth-service on ${PORT}`);
});
