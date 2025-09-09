// voting-app/api-gateway/server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Node < 18, altrimenti fetch globale

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Config microservizi
// -----------------------------
const SERVICES = {
  USER: "http://user-service:4001",
  AUTH: "http://auth-service:4000",
  QUESTION: "http://question-service:4002",
  VOTING: "http://voting-service:4003",
  NOTIFICATION: "http://notification-service:4004",
};

// -----------------------------
// HEALTH
// -----------------------------
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-gateway" });
});

// -----------------------------
// AUTH
// -----------------------------
// api-gateway/server.js
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ ok: false, error: "Email, username e password richiesti" });
    }

    // 1️⃣ Creazione utente su user-service
    const rUser = await fetch(`${SERVICES.USER}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: username }),
    });
    const user = await rUser.json();
    if (!rUser.ok) return res.status(rUser.status).json(user);

    // 2️⃣ Creazione password su auth-service
    const rPw = await fetch(`${SERVICES.AUTH}/passwords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, password }),
    });
    if (!rPw.ok) return res.status(rPw.status).json(await rPw.json());

    // 3️⃣ Token fittizio (per ora)
    const token = `token-${user.id}-${Date.now()}`;

    res.status(201).json({ ok: true, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trova utente su user-service
    const usersR = await fetch(`${SERVICES.USER}/users`);
    const users = await usersR.json();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ ok: false, error: "User not found" });

    console.log("User logged in:", user.id);


    // Verifica password su auth-service
    const authR = await fetch(`${SERVICES.AUTH}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!authR.ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    // Token fittizio
    const token = `token-${user.id}-${Date.now()}`;
    res.json({ ok: true, user, token });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Middleware per simulare autenticazione
// Middleware per simulare autenticazione
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer token-")) {
    const parts = authHeader.replace("Bearer ", "").split("-");
    // token-userId-timestamp
    const userIdParts = parts.slice(1, parts.length - 1);
    req.userId = userIdParts.join("-"); // <-- adesso è l'ID corretto
  }
  next();
});

// -----------------------------
// USERS
// -----------------------------
app.get("/api/users/:userId/profile", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/users/${req.params.userId}`);
    const profile = await r.json();
    // Aggiungi username, firstName, lastName se non presenti
    res.json({ ok: true, profile: {
      id: profile.id,
      email: profile.email,
      username: profile.name,      // o profile.username a seconda del DB
      avatarUrl: profile.avatarUrl || null,
    }});
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.put("/api/users/:userId/profile", async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;

    const r = await fetch(`${SERVICES.USER}/users/${req.params.userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, avatarUrl }), // <-- manda name
    });

    const updated = await r.json();

    res.json({
      ok: true,
      profile: {
        id: updated.id,
        email: updated.email,
        username: updated.name, // <-- mappa name su username
        avatarUrl: updated.avatarUrl || "",
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// -----------------------------
// GROUPS
// -----------------------------
app.get("/api/groups", async (_req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/groups", async (req, res) => {
  try {
    console.log("Auth header:", req.headers.authorization);
    console.log("UserId from middleware:", req.userId);
    const leaderId = req.userId; // prendo ID dall'utente autenticato

    if (!leaderId) return res.status(401).json({ ok: false, error: "Not authenticated" });

    const r = await fetch(`${SERVICES.USER}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req.body, leaderId }),
    });
    const group = await r.json();
    console.log("user-service response:", group);
    res.status(201).json({
      ok: true,
      group: group?.group ?? group, // se user-service risponde { ok, group }, prendi solo group
    });
  } catch (err) {
    console.log("Creating group with leaderId:", leaderId);
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups/${req.params.groupId}`);
    const group = await r.json();
    if (!group) return res.status(404).json({ ok: false, error: "Group not found" });
    res.json({ ok: true, group });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/groups/:groupId/members", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups/${req.params.groupId}/members`);
    const data = await r.json();

    // Normalizza in array
    let members;
    if (Array.isArray(data)) {
      members = data;
    } else if (Array.isArray(data.members)) {
      members = data.members;
    } else {
      members = [];
    }

    res.json(members); // <-- manda direttamente l’array
  } catch (err) {
    res.status(500).json({ ok: false, error: "Errore membri" });
  }
});


// Pending question di un gruppo
app.get("/api/groups/:groupId/pending-question", async (req, res) => {
  try {
    const { groupId } = req.params;

    // inoltra al question-service
    const r = await fetch(`${SERVICES.QUESTION}/questions/active/${groupId}`);
    const questions = await r.json();

    // normalizza in formato atteso dal frontend (PendingQuestionResponse)
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.json({ hasPending: false });
    }

    const q = questions[0]; // prendi la più recente
    return res.json({ hasPending: true, question: q });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST nuova domanda
app.post("/api/questions", async (req, res) => {
  try {
    console.log("API Gateway POST /api/questions body:", req.body); 
    const r = await fetch(`${SERVICES.QUESTION}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



// -----------------------------
// BOOT
// -----------------------------
const PORT = 8080;
app.listen(PORT, () => console.log(`✅ API Gateway running on http://localhost:${PORT}`));
