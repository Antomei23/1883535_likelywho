// services/voting-service/src/index.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "voting-service" });
});

// Inserisci un voto (vincolo unico: un voto per (questionId, voterId))
app.post("/votes", async (req: Request, res: Response) => {
  const schema = z.object({
    groupId: z.string().min(1),
    questionId: z.string().min(1),
    voterId: z.string().min(1),
    votedUserId: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const v = await prisma.vote.create({ data: parsed.data });
    return res.status(201).json(v);
  } catch (err: any) {
    // es. violazione unique (questionId, voterId) => già votato
    return res.status(400).json({ ok: false, error: err.message });
  }
});

// Leaderboard del gruppo (conteggio voti ricevuti da ciascun membro del gruppo)
app.get("/groups/:groupId/leaderboard", async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;

    const rows = await prisma.vote.groupBy({
      by: ["votedUserId"],
      where: { groupId },
      _count: { _all: true },
    });

    // Normalizzazione semplice: [{ userId, votes }]
    const leaderboard = rows.map(r => ({
      userId: r.votedUserId,
      votes: r._count._all,
    }));

    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = Number(process.env.PORT) || 4003;
app.listen(PORT, () => {
  console.log(`voting-service on ${PORT}`);
});
