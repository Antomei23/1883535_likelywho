import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get("/health", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "voting-service" });
});

// Inserisci un voto (vincolo: un voto per domanda per votante)
app.post("/votes", async (req: Request, res: Response) => {
  const schema = z.object({
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
    // es. violazione @@unique([questionId, voterId]) => già votato
    return res.status(400).json({ message: err.message });
  }
});

// Risultati per domanda (conteggio per votedUserId)
app.get("/votes/results/:questionId", async (req: Request, res: Response) => {
  const questionId = req.params.questionId;
  const rows = await prisma.vote.groupBy({
    by: ["votedUserId"],
    where: { questionId },
    _count: { _all: true },
  });

  return res.json(
    rows.map(
      (r: { votedUserId: string; _count: { _all: number } }) => ({
        votedUserId: r.votedUserId,
        votes: r._count._all,
      })
    )
  );
});

const PORT = Number(process.env.PORT) || 4003;
app.listen(PORT, () => {
  console.log(`voting-service on ${PORT}`);
});
