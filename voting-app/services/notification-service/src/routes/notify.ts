import express from 'express';
import axios from 'axios';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router = express.Router();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailpit',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === 'true',
});
const fromAddr = `"${process.env.FROM_NAME || 'LikelyWho'}" <${process.env.FROM_EMAIL || 'no-reply@example.test'}>`;

// POST /notifications/new-question-for-group
router.post('/notifications/new-question-for-group', async (req, res) => {
  const schema = z.object({
    groupId: z.string().min(1),
    questionId: z.string().min(1),
    groupName: z.string().optional(),
    link: z.string().url().optional(),
    userServiceBaseUrl: z.string().url().default('http://user-service:4001')
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { groupId, questionId, groupName, link, userServiceBaseUrl } = parsed.data;

  // 1) membri dal user-service
  const { data: members } = await axios.get(`${userServiceBaseUrl}/groups/${groupId}/members`);
  const subject = `Nuova domanda${groupName ? ` in ${groupName}` : ''}`;

  // 2) persisti + invia
  for (const m of members) {
    await prisma.notification.create({
      data: {
        userId: m.userId,
        type: 'NEW_QUESTION',
        payload: { groupId, groupName, questionId, link }
      }
    });
    if (m.email) {
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
          <h2>${subject}</h2>
          <p>C'è una nuova domanda${groupName ? ` nel gruppo <b>${groupName}</b>` : ''}.</p>
          <p>${link ? `<a href="${link}">Apri</a>` : 'Apri l’app per rispondere.'}</p>
        </div>`;
      await transporter.sendMail({ from: fromAddr, to: m.email, subject, html });
    }
  }

  res.status(201).json({ sent: members.length });
});

export default router;
