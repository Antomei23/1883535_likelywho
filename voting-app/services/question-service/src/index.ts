import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'question-service' });
});

app.post('/questions', async (req: Request, res: Response) => {
  const schema = z.object({
    groupId: z.string().min(1),          // metti .uuid() se usi uuid per Group
    text: z.string().min(1),
    expiresAt: z.string().datetime(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const q = await prisma.question.create({
      data: {
        groupId: parsed.data.groupId,
        text: parsed.data.text,
        expiresAt: new Date(parsed.data.expiresAt),
      },
    });
    return res.status(201).json(q);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

app.post('/questions/:id/close', async (req: Request, res: Response) => {
  try {
    const q = await prisma.question.update({
      where: { id: req.params.id },
      data: { closed: true },
    });
    return res.json(q);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

app.get('/questions/active/:groupId', async (req: Request, res: Response) => {
  const now = new Date();
  const items = await prisma.question.findMany({
    where: { groupId: req.params.groupId, closed: false, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(items);
});

const PORT = Number(process.env.PORT) || 4002;
app.listen(PORT, () => {
  console.log(`question-service on ${PORT}`);
});
