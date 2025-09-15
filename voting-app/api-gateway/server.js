// voting-app/api-gateway/server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Node < 18, altrimenti fetch globale
// Works whether ai-generator exports default or named
const AIGenerator = require("./ai-generator");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Health check per test da browser
app.get("/", (_req, res) => res.json({ ok: true, service: "api-gateway" }));

//  app.use(cors());
//app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
//app.use(express.json());

//*************** Carlotta */
//const allowed = [/^http:\/\/localhost:(3000|5173)$/, /^http:\/\/127\.0\.0\.1:(3000|5173)$/];


// -----------------------------
// Config microservizi (nomi di servizio Docker)
// -----------------------------
const SERVICES = {
  USER: "http://user-service:4001",
  AUTH: "http://auth-service:4000",
  QUESTION: "http://question-service:4002",
  VOTING: "http://voting-service:4003",
};

// -----------------------------
// HEALTH
// -----------------------------
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-gateway" });
});

// AGGIUNTA!! 
// Health per AUTH (inoltra a /health del servizio)
app.get("/api/auth/health", async (_req, res) => {
  try {
    const r = await fetch(`${SERVICES.AUTH}/health`);
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    // se il servizio risponde HTML, normalizza comunque a JSON
    const data = ct.includes("application/json") ? JSON.parse(body) : { ok: r.ok, raw: body.slice(0, 120) };
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "auth-service unreachable", detail: err.message });
  }
});


// AGGIUNTA!! 
// Health per AUTH (inoltra a /health del servizio)
app.get("/api/auth/health", async (_req, res) => {
  try {
    const r = await fetch(`${SERVICES.AUTH}/health`);
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    // se il servizio risponde HTML, normalizza comunque a JSON
    const data = ct.includes("application/json") ? JSON.parse(body) : { ok: r.ok, raw: body.slice(0, 120) };
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "auth-service unreachable", detail: String(err?.message || err) });
  }
});


app.get("/api/auth/health", async (_req, res) => {
  try {
    const r = await fetch(`${SERVICES.AUTH}/health`);
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    const data = ct.includes("application/json")
      ? JSON.parse(body)
      : { ok: r.ok, raw: body.slice(0, 120) };
    res.status(r.status).json(data);
  } catch (err) {
    res
      .status(502)
      .json({ ok: false, error: "auth-service unreachable", detail: String(err?.message || err) });
  }
});

// -----------------------------
// AUTH (emette token "token-<userId>-<ts>")
// -----------------------------
// api-gateway/server.js

// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { email, username, password } = req.body;

//     if (!email || !username || !password) {
//       return res.status(400).json({ ok: false, error: "Email, username e password richiesti" });
//     }

//     // 1️⃣ Creazione utente su user-service
//     const rUser = await fetch(`${SERVICES.USER}/users`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, name: username }),
//     });
//     const user = await rUser.json();
//     if (!rUser.ok) return res.status(rUser.status).json(user);

//     // 2️⃣ Creazione password su auth-service
//     const rPw = await fetch(`${SERVICES.AUTH}/passwords`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId: user.id, password }),
//     });
//     if (!rPw.ok) return res.status(rPw.status).json(await rPw.json());

//     // 3️⃣ Token fittizio (per ora)
//     const token = `token-${user.id}-${Date.now()}`;

//     res.status(201).json({ ok: true, user, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });


// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { email, username, password } = req.body;

//     if (!email || !username || !password) {
//       return res.status(400).json({ ok: false, error: "Email, username e password richiesti" });
//     }

//     // 1️⃣ Creazione utente su user-service
//     const rUser = await fetch(`${SERVICES.USER}/users`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, name: username }),
//     });
//     const user = await rUser.json();
//     if (!rUser.ok) return res.status(rUser.status).json(user);

//     // 2️⃣ Creazione password su auth-service
//     const rPw = await fetch(`${SERVICES.AUTH}/passwords`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId: user.id, password }),
//     });
//     if (!rPw.ok) return res.status(rPw.status).json(await rPw.json());

//     // 3️⃣ Token fittizio (per ora)
//     const token = `token-${user.id}-${Date.now()}`;

//     res.status(201).json({ ok: true, user, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ ok: false, error: "Email, username e password richiesti" });
    }

    // helper: prova a leggere JSON, altrimenti restituisce text grezzo
    async function parseMaybeJson(r) {
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text(); // lo stream si legge UNA sola volta
      if (ct.includes("application/json")) {
        try { return JSON.parse(txt); } catch { /* fallback sotto */ }
      }
      return { ok: r.ok, raw: txt };
    }

    // helper: prova a leggere JSON, altrimenti restituisce text grezzo
    async function parseMaybeJson(r) {
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text(); // lo stream si legge UNA sola volta
      if (ct.includes("application/json")) {
        try { return JSON.parse(txt); } catch { /* fallback sotto */ }
      }
      return { ok: r.ok, raw: txt };
    }

    // 1) crea utente su user-service
    const rUser = await fetch(`${SERVICES.USER}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: username }),
    });
    const userData = await parseMaybeJson(rUser);
    if (!rUser.ok) {
      return res.status(rUser.status).json(userData);
    }
    const user = userData; // ci aspettiamo un oggetto { id, ... }

    // 2) registra password su auth-service
    const rPw = await fetch(`${SERVICES.AUTH}/passwords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, password }),
    });
    const pwData = await parseMaybeJson(rPw);
    if (!rPw.ok) {
      return res.status(rPw.status).json(pwData);
    }

    // 3️⃣ risposta finale
    const token = `token-${user.id}-${Date.now()}`;
    return res.status(201).json({ ok: true, user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});



app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // trova utente su user-service
    const usersR = await fetch(`${SERVICES.USER}/users`);
    const users = await usersR.json();
    const user = (Array.isArray(users) ? users : []).find((u) => u.email === email);
    if (!user) return res.status(401).json({ ok: false, error: "User not found" });

    // valida password su auth-service
    const authR = await fetch(`${SERVICES.AUTH}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!authR.ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    // emetti token fittizio
    const token = `token-${user.id}-${Date.now()}`;
    res.json({ ok: true, user, token });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// -----------------------------
// Auth middleware per /api (escluso /api/auth/*)
// Estrae userId da token "token-<userId>-<ts>"
// -----------------------------
function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ ok: false, error: "Missing token" });
  if (!token.startsWith("token-")) return res.status(401).json({ ok: false, error: "Invalid token" });

  // token-userId-ts → ricompone userId nel caso contenga trattini (UUID)
  const parts = token.split("-");
  if (parts.length < 3) return res.status(401).json({ ok: false, error: "Invalid token format" });
  // rimuovi "token" e l'ultimo elemento (timestamp)
  const userId = parts.slice(1, -1).join("-");
  req.userId = userId;
  next();
}

// -----------------------------
// USERS
// -----------------------------
app.get("/api/users/:userId/profile", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/users/${req.params.userId}`);
    const profile = await r.json();
    res.json({
      ok: true,
      profile: {
        id: profile.id,
        email: profile.email,
        username: profile.name,
        avatarUrl: profile.avatarUrl || null,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.put("/api/users/:userId/profile", authRequired, async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;
    const r = await fetch(`${SERVICES.USER}/users/${req.params.userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, avatarUrl }),
    });
    const data = await r.json();
    res.status(r.status).json(
      r.ok
        ? { ok: true, profile: { id: data.id, email: data.email, username: data.name, avatarUrl: data.avatarUrl || "" } }
        : data
    );
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// Lista gruppi dell’utente
app.get("/api/users/:userId/groups", authRequired, async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/users/${req.params.userId}/groups`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "user-service unreachable" });
  }
});

// -----------------------------
// GROUPS
// -----------------------------
app.get("/api/groups", async (_req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "user-service unreachable" });
  }
});

app.post("/api/groups", authRequired, async (req, res) => {
  try {
    const leaderId = req.userId;
    const r = await fetch(`${SERVICES.USER}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req.body, leaderId }),
    });
    const data = await r.json();
    const group = data?.group ?? data;
    res.status(r.ok ? 201 : r.status).json(r.ok ? { ok: true, group } : data);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups/${req.params.groupId}`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "user-service unreachable" });
  }
});

app.get("/api/groups/:groupId/members", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.USER}/groups/${req.params.groupId}/members`);
    const data = await r.json();
    res.status(r.status).json(Array.isArray(data) ? data : data.members || []);
  } catch (err) {
    res.status(502).json({ ok: false, error: "user-service unreachable" });
  }
});

// Join via codice (richiede auth)
app.post("/api/groups/join", authRequired, async (req, res) => {
  try {
    const { code } = req.body || {};
    const userId = req.userId;
    const r = await fetch(`${SERVICES.USER}/groups/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "user-service unreachable" });
  }
});

// -----------------------------
// QUESTIONS
// -----------------------------
app.get("/api/groups/:groupId/pending-question", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.QUESTION}/questions/active/${req.params.groupId}`);
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) return res.json({ hasPending: false });
    const q = data[0];
    res.json({ hasPending: true, question: q });
  } catch (err) {
    res.status(502).json({ ok: false, error: "question-service unreachable" });
  }
});

app.post("/api/questions", authRequired, async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.QUESTION}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "question-service unreachable" });
  }
});

// -----------------------------
// VOTES & LEADERBOARD (proxy verso voting-service)
// -----------------------------
app.post("/api/votes", authRequired, async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.VOTING}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "voting-service unreachable" });
  }
});

// risultati grezzi per una domanda (facoltativo)
app.get("/api/votes/results/:questionId", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.VOTING}/votes/results/${req.params.questionId}`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "voting-service unreachable" });
  }
});


app.get("/api/gruppo/:groupId/stats", async (req, res) => {
  try {
    const r = await fetch(`${SERVICES.VOTING}/gruppo/${req.params.groupId}/stats`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: "voting-service unreachable" });
  }
});

// -----------------------------
// 404 & error handler
// -----------------------------
app.use((req, res) => {
  res.status(404).type("application/json").send({ ok: false, error: "Not found", path: req.path });
});

app.use((err, req, res, _next) => {
  console.error("Gateway error:", err);
  res
    .status(err.status || 500)
    .type("application/json")
    .send({ ok: false, error: err.message || "Internal error" });
});

// -----------------------------
// BOOT
// -----------------------------
const PORT = 8080;
app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));
