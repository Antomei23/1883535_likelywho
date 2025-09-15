// voting-app/api-gateway/server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Node < 18, altrimenti fetch globale
// Works whether ai-generator exports default or named
const AIGenerator = require("./ai-generator");

const app = express();
//app.use(cors({
//  origin(origin, cb) {
//    if (!origin) return cb(null, true); // SSR / curl / same-origin
//    if (allowed.some(re => re.test(origin))) return cb(null, true);
//    return cb(new Error("Not allowed by CORS"));
//  },
//  credentials: true,
//  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//  allowedHeaders: ["Content-Type", "Authorization"],
//}));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // SSR/curl/health-check
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ⚠️ Express 5: niente pattern con "*" negli OPTIONS.
// Preflight generico per tutte le richieste.
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Body parser JSON
app.use(express.json());

// Health check per test da browser
app.get("/", (_req, res) => res.json({ ok: true, service: "api-gateway" }));

//  app.use(cors());
//app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
//app.use(express.json());

//*************** Carlotta */
//const allowed = [/^http:\/\/localhost:(3000|5173)$/, /^http:\/\/127\.0\.0\.1:(3000|5173)$/];


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
    res.status(502).json({ ok: false, error: "auth-service unreachable", detail: err.message });
  }
});


// -----------------------------
// AUTH
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

    // 1️⃣ users
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

    // 2️⃣ auth/passwords
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
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
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

// POST /api/v1/ai/generate   { topic?: string, n?: number }
app.post("/api/v1/ai/generate", async (req, res) => {
  try {
    //const topic = String(req.body?.topic ?? "").trim() || "anything";
    //const n = Math.max(1, Math.min(20, Number(req.body?.n ?? 5)));
    //const items = await AIGenerator.generateQuestions(topic, n);
    //res.json({ ok: true, items });
    const topic = String(req.query.topic || "anything");
    const n = Number(req.query.n || 3);
    const items = await AIGenerator.generateQuestions(topic, n);
    res.json({ ok: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "AI generation failed" });
  }
});

// Alias /api/ai/generate -> /api/v1/ai/generate
async function handleAiGenerate(req, res) {
  try {
    const topic = String(req.body?.topic ?? "").trim() || "anything";
    const n = Math.max(1, Math.min(20, Number(req.body?.n ?? 5)));
    const items = await AIGenerator.generateQuestions(topic, n);
    res.json({ ok: true, items });
  } catch (err) {
    const msg = err?.message || "AI generation failed";
    console.error("Route /ai/generate failed:", msg);
    res.status(500).json({ ok: false, error: msg });
  }
}

app.post("/api/v1/ai/generate", handleAiGenerate);
app.post("/api/ai/generate", handleAiGenerate); // optional alias for older frontend
// 404 catcher with logging
app.use((req, res) => {
  console.warn("No route matched:", req.method, req.originalUrl);
  res.status(404).json({ ok: false, error: "Not found", path: req.originalUrl });
});

app.listen(8080, () => console.log("API Gateway running on http://localhost:8080"));



// -----------------------------
// ❗️Handler 404 JSON (in fondo, dopo tutte le route)
// -----------------------------
app.use((req, res) => {
  res.status(404).type("application/json").send({ ok: false, error: "Not found", path: req.path });
});

// -----------------------------
// ❗️Error handler JSON (sempre in fondo)
// -----------------------------
app.use((err, req, res, _next) => {
  console.error("Gateway error:", err);
  res.status(err.status || 500).type("application/json").send({ ok: false, error: err.message || "Internal error" });
});


// -----------------------------
// BOOT
// -----------------------------
const PORT = 8080;
app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));
