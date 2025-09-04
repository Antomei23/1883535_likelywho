import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'auth-service' });
});

// set password (hash già calcolato a monte: in prod usa bcrypt/argon2)
app.post('/passwords', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string().uuid(),
    hash: z.string().min(10),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const pw = await prisma.password.upsert({
      where: { userId: parsed.data.userId },
      create: { userId: parsed.data.userId, hash: parsed.data.hash },
      update: { hash: parsed.data.hash },
    });
    return res.status(201).json(pw);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// crea sessione
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

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`auth-service on ${PORT}`);
});
