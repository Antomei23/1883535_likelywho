import express from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailpit',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === 'true',
});
const fromAddr = `"${process.env.FROM_NAME || 'LikelyWho'}" <${process.env.FROM_EMAIL || 'no-reply@example.test'}>`;

// POST /notifications/group-invite
router.post('/notifications/group-invite', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    groupId: z.string().min(1),
    groupName: z.string().optional(),
    code: z.string().min(4),
    link: z.string().url().optional()
  });
  const parsed = schema.safeParse(req.body);
  console.log(parsed)
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { email, groupName, code, link } = parsed.data;

  const subject = `Invito al gruppo${groupName ? `: ${groupName}` : ''}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
      <h2>${subject}</h2>
      <p>Ecco il tuo codice: <b>${code}</b></p>
      ${link ? `<p><a href="${link}">Clicca per unirti</a></p>` : ''}
    </div>`;

  await transporter.sendMail({ from: fromAddr, to: email, subject, html });
  res.status(201).json({ ok: true });
});

export default router;
