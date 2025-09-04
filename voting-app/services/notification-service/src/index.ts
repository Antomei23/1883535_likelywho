import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'notification-service' });
});

app.post('/notifications', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string().min(1), // .uuid() se usi uuid
    type: z.string().min(1),
    payload: z.any(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const n = await prisma.notification.create({ data: parsed.data });
    return res.status(201).json(n);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

app.get('/notifications/:userId', async (req: Request, res: Response) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(items);
});

app.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const n = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    return res.json(n);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

const PORT = Number(process.env.PORT) || 4004;
app.listen(PORT, () => {
  console.log(`notification-service on ${PORT}`);
});
