import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import axios from 'axios'

import questions from './questions_rand.json'


const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'question-service' });
});

app.post('/questions', async (req: Request, res: Response) => {
  console.log('POST /questions body:', req.body);
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

    // chiamata al notification-service
    try {
      await axios.post('http://notification-service:4004/notifications/new-question-for-group', {
        groupId: q.groupId,
        questionId: q.id,
        // opzionali:
        // groupName: 'nome del gruppo',  // puoi recuperarlo dal user-service se serve
        link: `http://localhost:8080/groups/${q.groupId}/questions/${q.id}`
      });
    } catch (notifyErr: any) {
      console.error('[notify] errore invio notifica:', notifyErr.message || notifyErr);
      // non bloccare la creazione della domanda se la mail fallisce
    }

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

app.get('/questions/random/:category', async (req: Request, res: Response) => {
  console.log("GET ARRIVATA")
  console.log(`req.params:`, req.params);
  if (!req.params.category) return { ok: false, error: `Category is required: ${req.params.category}` };

  // match case-insensitive
  const key = Object.keys(questions).find(
    (k) => k.toLowerCase() === String(req.params.category).trim().toLowerCase()
  );
  // if (!key) throw new Error(`Unknown category: ${category}`);

  if (!key) return { ok: false, error: `Unknown category: ${req.params.category}` };

  const list = questions[key as keyof typeof questions];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`No questions for category: ${key}`);
  }

  const idx = Math.floor(Math.random() * list.length);
  console.log(`RISPONDO ALLA GET CON:`, list[idx])
  return res.json(list[idx]);
});
