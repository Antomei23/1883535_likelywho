import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Endpoint di esempio: lista tutti gli utenti
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nel recupero degli utenti" });
  }
});

// Endpoint di esempio: crea un nuovo utente
router.post("/", async (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        avatarUrl,
        // Non serve id se hai @default(uuid()) nel modello Prisma
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nella creazione dell'utente" });
  }
});

export default router;
