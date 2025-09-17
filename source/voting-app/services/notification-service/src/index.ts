import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import notifyRoutes from './routes/notify';
import inviteRoutes from './routes/invite';

const app = express();
app.use(express.json());
app.use(notifyRoutes);
app.use(inviteRoutes);

const prisma = new PrismaClient();

// --- Mailer minimale (Mailpit) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailpit',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === 'true',
});

async function sendMailBasic({
  to, subject, text, html
}: { to: string; subject: string; text?: string; html?: string }) {
  return transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'App'}" <${process.env.FROM_EMAIL || 'no-reply@example.test'}>`,
    to, subject, text, html
  });
}

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'notification-service' });
});

// app.post('/notifications', async (req: Request, res: Response) => {
//   const schema = z.object({
//     userId: z.string().min(1), // .uuid() se usi uuid
//     type: z.string().min(1),
//     payload: z.any(),
//   });
//   const parsed = schema.safeParse(req.body);
//   if (!parsed.success) return res.status(400).json(parsed.error.format());

//   try {
//     const n = await prisma.notification.create({ data: parsed.data });
//     return res.status(201).json(n);
//   } catch (err: any) {
//     return res.status(400).json({ message: err.message });
//   }
// });

// app.get('/notifications/:userId', async (req: Request, res: Response) => {
//   const items = await prisma.notification.findMany({
//     where: { userId: req.params.userId },
//     orderBy: { createdAt: 'desc' },
//   });
//   return res.json(items);
// });

// app.post('/notifications/:id/read', async (req: Request, res: Response) => {
//   try {
//     const n = await prisma.notification.update({
//       where: { id: req.params.id },
//       data: { read: true },
//     });
//     return res.json(n);
//   } catch (err: any) {
//     return res.status(400).json({ message: err.message });
//   }
// });



// Versione SEMPLICE: passa l'email nel body
app.post('/notifications/new-question', async (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string().min(1),
    email: z.string().email(),
    // opzionali: li useremo solo per personalizzare il messaggio/link
    groupName: z.string().optional(),
    groupId: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const { userId, email, groupName, groupId } = parsed.data;

  try {
    // salva una notifica “tipizzata” ma senza contenuto domanda
    const n = await prisma.notification.create({
      data: {
        userId,
        type: 'NEW_QUESTION',
        payload: { groupName, groupId } // JSON in Prisma
      }
    });

    // soggetto e corpo generici (nessun testo domanda)
    const subject = `Nuova domanda disponibile${groupName ? ` in ${groupName}` : ''}`;

    // se in futuro avrai una route, costruisci il link qui:
    const link =
      groupId
        ? `http://localhost:8080/groups/${groupId}/questions` // <-- adatta al tuo gateway
        : undefined;

    const textLines = [
      `C'è una nuova domanda${groupName ? ` nel gruppo ${groupName}` : ''}.`,
      link ? `Apri: ${link}` : 'Apri l’app per rispondere.'
    ];

    await sendMailBasic({
      to: email,
      subject,
      text: textLines.join('\n'),
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
          <h2>${subject}</h2>
          <p>${link ? `<a href="${link}">Apri il gruppo</a>` : 'Apri l’app per rispondere.'}</p>
        </div>
      `
    });

    return res.status(201).json(n);
  } catch (err: any) {
    console.error(err);
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
