// voting-app/api-gateway/server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Helpers
// -----------------------------
function makeId(prefix = "g") {
  return `${prefix}${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// -----------------------------
// MOCK DATA (sviluppo)
// -----------------------------
const mockGroups = {
  g1: {
    id: "g1",
    name: "FunGroup",
    leader: { id: "u1", name: "Mario" },
    members: [
      { id: "u1", name: "Mario" },
      { id: "u2", name: "Eva" },
      { id: "u7", name: "Riccardo" },
      { id: "u8", name: "Sandra" },
    ],
    points: { u1: 3, u2: 5, u7: 2, u8: 1 },
    settings: { notificationTime: "morning", disableSelfVote: false },
    categories: ["Game", "Music", "Food"],
  },
  g2: {
    id: "g2",
    name: "Weekend Warriors",
    leader: { id: "u9", name: "Luca" },
    members: [
      { id: "u9", name: "Luca" },
      { id: "u10", name: "Giulia" },
      { id: "u11", name: "Paolo" },
    ],
    points: { u9: 1, u10: 2, u11: 0 },
    settings: { notificationTime: "evening", disableSelfVote: true },
    categories: ["Sport", "Films"],
  },
  g3: {
    id: "g3",
    name: "Office Legends",
    leader: { id: "u12", name: "Sara" },
    members: [
      { id: "u12", name: "Sara" },
      { id: "u13", name: "Enzo" },
    ],
    points: { u12: 4, u13: 4 },
    settings: { notificationTime: "afternoon", disableSelfVote: false },
    categories: ["Culture", "Book"],
  },
};

let mockQuestions = {
  g1: {
    id: "q99",
    text: "Who is most likely to win a swimming competition?",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
    answeredBy: new Set(), // userIds che hanno votato
    votedLog: [],          // {voterId, votedUserId}
  },
  // g2/g3 per ora senza domanda attiva
};

// -----------------------------
// Groups - LIST
// -----------------------------
app.get("/api/groups", (req, res) => {
  // risposta minimale per la Home
  const arr = Object.values(mockGroups).map((g) => ({
    id: g.id,
    name: g.name,
  }));
  res.json(arr);
});

// -----------------------------
// Groups - CREATE
// -----------------------------
app.post("/api/groups", (req, res) => {
  const { name, leaderId, leaderName, notificationTime, disableSelfVote } = req.body || {};
  if (!name || !leaderId) {
    return res.status(400).json({ ok: false, error: "Missing name or leaderId" });
  }

  const id = makeId("g");
  const group = {
    id,
    name,
    leader: { id: leaderId, name: leaderName ?? leaderId },
    members: [{ id: leaderId, name: leaderName ?? leaderId }],
    points: { [leaderId]: 0 },
    settings: {
      notificationTime: notificationTime ?? "morning",
      disableSelfVote: !!disableSelfVote,
    },
    categories: [],
  };

  mockGroups[id] = group;
  console.log(`[MOCK] created group ${id} "${name}" (leader=${leaderId})`);
  res.status(201).json({ ok: true, group });
});

// -----------------------------
// Groups - READ + MEMBERS
// -----------------------------
app.get("/api/groups/:groupId", (req, res) => {
  const g = mockGroups[req.params.groupId];
  if (!g) return res.status(404).json({ error: "Group not found" });
  res.json(g);
});

app.get("/api/groups/:groupId/members", (req, res) => {
  const g = mockGroups[req.params.groupId];
  if (!g) return res.status(404).json({ error: "Group not found" });
  res.json({ members: g.members });
});

// -----------------------------
// Groups - INVITE (mock)
// -----------------------------
app.post("/api/groups/:groupId/invite", (req, res) => {
  const { groupId } = req.params;
  const { userIds = [], emails = [] } = req.body || {};
  console.log(`[MOCK] invite to group ${groupId}: userIds=${userIds.join(",")} emails=${emails.join(",")}`);
  // In produzione: chiamata al microservizio Users/Invites
  res.json({ ok: true });
});

// -----------------------------
// Groups - CATEGORIES
// -----------------------------
app.post("/api/groups/:groupId/categories", (req, res) => {
  const { groupId } = req.params;
  const { categories = [] } = req.body || {};
  const g = mockGroups[groupId];
  if (!g) return res.status(404).json({ ok: false, error: "Group not found" });

  g.categories = Array.isArray(categories) ? categories.slice(0, 12) : [];
  console.log(`[MOCK] categories set for ${groupId}: ${g.categories.join(", ")}`);
  res.json({ ok: true });
});

// -----------------------------
// Questions - PENDING
// -----------------------------
app.get("/api/groups/:groupId/pending-question", (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;
  const q = mockQuestions[groupId];
  if (!q) return res.json({ hasPending: false });

  const expired = new Date(q.deadline).getTime() < Date.now();
  const hasAnswered = q.answeredBy.has(userId);
  const hasPending = !expired && !hasAnswered;

  // Non serializziamo Set
  const safe = q && hasPending
    ? {
        id: q.id,
        text: q.text,
        createdAt: q.createdAt,
        deadline: q.deadline,
      }
    : undefined;

  res.json({ hasPending, question: safe });
});

// -----------------------------
// Questions - CREATE
// -----------------------------
app.post("/api/questions", (req, res) => {
  const { groupId, text, expiresInHours = 24 } = req.body || {};
  if (!groupId || !text) return res.status(400).json({ ok: false, error: "Missing fields" });

  const qid = `q${Math.floor(Math.random() * 100000)}`;
  mockQuestions[groupId] = {
    id: qid,
    text,
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString(),
    answeredBy: new Set(),
    votedLog: [],
  };
  console.log(`[MOCK] new question ${qid} for ${groupId}: "${text}"`);
  res.json({ ok: true, questionId: qid });
});

// -----------------------------
// Votes + Leaderboard
// -----------------------------
app.post("/api/votes", (req, res) => {
  const { groupId, questionId, voterId, votedUserId } = req.body;
  const q = mockQuestions[groupId];
  const g = mockGroups[groupId];
  if (!g) return res.status(404).json({ ok: false, error: "Group not found" });
  if (!q || q.id !== questionId) return res.status(400).json({ ok: false, error: "Question not found" });

  // salva voto
  q.answeredBy.add(voterId);
  q.votedLog.push({ voterId, votedUserId });

  // aggiorna punteggi
  g.points[votedUserId] = (g.points[votedUserId] ?? 0) + 1;
  console.log(`[MOCK] +1 punto a ${votedUserId} nel gruppo ${groupId} (da ${voterId})`);

  res.json({ ok: true });
});

app.get("/api/groups/:groupId/leaderboard", (req, res) => {
  const { groupId } = req.params;
  const g = mockGroups[groupId];
  const q = mockQuestions[groupId];
  if (!g) return res.status(404).json({ error: "Group not found" });

  const entries = Object.entries(g.points)
    .map(([userId, points]) => {
      const m = g.members.find((x) => x.id === userId);
      return { userId, name: m?.name ?? userId, points: Number(points) };
    })
    .sort((a, b) => b.points - a.points);

  const votedNames = (q?.votedLog ?? []).map((v) => {
    const m = g.members.find((x) => x.id === v.voterId);
    return m?.name ?? v.voterId;
  });

  res.json({
    questionText: q?.text ?? "No active question",
    voted: votedNames,
    entries,
  });
});

// -----------------------------
// Boot
// -----------------------------
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
});
