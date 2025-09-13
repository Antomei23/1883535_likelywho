import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// GET /groups/:groupId/members -> [{ userId, email, name }]
router.get('/groups/:groupId/members', async (req, res) => {
  const groupId = req.params.groupId;
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    include: { user: true }
  });
  res.json(memberships.map(m => ({
    userId: m.userId,
    email:  m.user.email,
    name:   m.user.name
  })));
});

export default router;
