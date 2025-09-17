import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

function genCode(len=8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:len}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

// POST /groups/:groupId/invites  { email?, expiresInHours?, createdByUserId }
router.post('/groups/:groupId/invites', async (req, res) => {
  const schema = z.object({
    email: z.string().email().optional(),
    expiresInHours: z.number().min(1).max(720).default(72),
    createdByUserId: z.string().min(1),
    notificationBaseUrl: z.string().url().default('http://notification-service:4004')
  });
  const parsed = schema.safeParse(req.body);
  console.log(parsed)
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { email, expiresInHours, createdByUserId, notificationBaseUrl } = parsed.data;

  const { groupId } = req.params;
  const code = genCode(8);
  const expiresAt = new Date(Date.now() + expiresInHours*60*60*1000);

  const inv = await prisma.invite.create({
    data: { groupId, code, email, createdByUserId, expiresAt }
  });

  const group = await prisma.group.findUnique({ where: { id: groupId } });

  // se c'è email → invia mail tramite notification-service
  if (email) {
    await axios.post(`${notificationBaseUrl}/notifications/group-invite`, {
      email,
      groupId,
      groupName: group?.name,
      code,
      link: `http://localhost:8080/unisciti-gruppo?code=${code}`
    }).catch(() => {}); // in dev non bloccare se mail fallisce
  }

  res.status(201).json({ id: inv.id, code: inv.code, expiresAt: inv.expiresAt });
});

// POST /invites/redeem  { code, userId }
router.post('/invites/redeem', async (req, res) => {
  const schema = z.object({
    code: z.string().min(4),
    userId: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { code, userId } = parsed.data;

  const inv = await prisma.invite.findUnique({ where: { code } });
  if (!inv) return res.status(404).json({ ok:false, error:'Invalid code' });
  if (inv.usedAt) return res.status(400).json({ ok:false, error:'Code already used' });
  if (inv.expiresAt < new Date()) return res.status(400).json({ ok:false, error:'Code expired' });

  // crea membership se non esiste
  await prisma.membership.upsert({
    where: { userId_groupId: { userId, groupId: inv.groupId } },
    update: {},
    create: { userId, groupId: inv.groupId, role: 'member' }
  });

  // marca invito come usato
  await prisma.invite.update({
    where: { code },
    data: { usedByUserId: userId, usedAt: new Date() }
  });

  res.json({ ok:true, groupId: inv.groupId });
});

export default router;
