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
function makeUserId() {
  return `u${Math.floor(Math.random() * 1e9).toString(36)}`;
}
function makeInviteCode() {
  // semplice codice 6/8 char
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// -----------------------------
// MOCK USERS
// -----------------------------
const mockUsers = {
  u7: {
    id: "u7",
    username: "Riccardo",
    email: "ric@example.com",
    password: "pass123",
    firstName: "Riccardo",
    lastName: "Tora",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  },
};

const passwordResetRequests = []; // { email, newPassword, requestedAt }

// -----------------------------
// Auth minimal (register/login)
// -----------------------------
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, firstName = "", lastName = "" } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }
  const exists = Object.values(mockUsers).some((u) => u.email === email);
  if (exists) return res.status(409).json({ ok: false, error: "Email already used" });

  const id = makeUserId();
  mockUsers[id] = {
    id, username, email, password, firstName, lastName, avatarUrl: "", createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ ok: true, user: { id, username, email, firstName, lastName, avatarUrl: "" } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "Missing fields" });
  const user = Object.values(mockUsers).find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });
  const token = `mock-token-${user.id}-${Date.now()}`;
  return res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email }, token });
});

// -----------------------------
// MOCK GROUPS & QUESTIONS
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
    answeredBy: new Set(),
    votedLog: [],
  },
};

// -----------------------------
// INVITES (codes) + "notifications" mock
// -----------------------------
const inviteCodes = new Map(); // code -> { groupId, createdAt, createdBy? }
inviteCodes.set("TEST42", { groupId: "g3", createdAt: new Date().toISOString() });
const notificationOutbox = []; // mock outbox: { to, channel, payload, createdAt }

// -----------------------------
// Groups - LIST/CREATE/READ/MEMBERS/LEADERBOARD
// -----------------------------
app.get("/api/groups", (req, res) => {
  const arr = Object.values(mockGroups).map((g) => ({ id: g.id, name: g.name }));
  res.json(arr);
});

app.post("/api/groups", (req, res) => {
  const { name, leaderId, leaderName, notificationTime, disableSelfVote } = req.body || {};
  if (!name || !leaderId) return res.status(400).json({ ok: false, error: "Missing name or leaderId" });
  const id = makeId("g");
  const group = {
    id,
    name,
    leader: { id: leaderId, name: leaderName ?? leaderId },
    members: [{ id: leaderId, name: leaderName ?? leaderId }],
    points: { [leaderId]: 0 },
    settings: { notificationTime: notificationTime ?? "morning", disableSelfVote: !!disableSelfVote },
    categories: [],
  };
  mockGroups[id] = group;
  res.status(201).json({ ok: true, group });
});

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

  res.json({ questionText: q?.text ?? "No active question", voted: votedNames, entries });
});

// -----------------------------
// Questions
// -----------------------------
app.get("/api/groups/:groupId/pending-question", (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;
  const q = mockQuestions[groupId];
  if (!q) return res.json({ hasPending: false });

  const expired = new Date(q.deadline).getTime() < Date.now();
  const hasAnswered = q.answeredBy.has(userId);
  const hasPending = !expired && !hasAnswered;
  const safe = q && hasPending ? { id: q.id, text: q.text, createdAt: q.createdAt, deadline: q.deadline } : undefined;
  res.json({ hasPending, question: safe });
});

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
  res.json({ ok: true, questionId: qid });
});

app.post("/api/votes", (req, res) => {
  const { groupId, questionId, voterId, votedUserId } = req.body;
  const q = mockQuestions[groupId];
  const g = mockGroups[groupId];
  if (!g) return res.status(404).json({ ok: false, error: "Group not found" });
  if (!q || q.id !== questionId) return res.status(400).json({ ok: false, error: "Question not found" });

  q.answeredBy.add(voterId);
  q.votedLog.push({ voterId, votedUserId });
  g.points[votedUserId] = (g.points[votedUserId] ?? 0) + 1;
  res.json({ ok: true });
});

// ===================================================================
// User-Service: profilo / reset / scores / delete
// ===================================================================
app.post("/api/users/reset-password", (req, res) => {
  const { email, newPassword } = req.body || {};
  if (!email || !newPassword) return res.status(400).json({ ok: false, error: "Missing email or newPassword" });
  const user = Object.values(mockUsers).find((u) => u.email === email);
  if (!user) {
    passwordResetRequests.push({ email, newPassword: "********", requestedAt: new Date().toISOString() });
    return res.json({ ok: true, message: "If the email exists, a reset will be processed." });
  }
  user.password = newPassword;
  passwordResetRequests.push({ email, newPassword: "********", requestedAt: new Date().toISOString() });
  res.json({ ok: true });
});

app.get("/api/users/:userId/profile", (req, res) => {
  const u = mockUsers[req.params.userId];
  if (!u) return res.status(404).json({ ok: false, error: "User not found" });
  const profile = {
    id: u.id, username: u.username, email: u.email,
    firstName: u.firstName || "", lastName: u.lastName || "",
    avatarUrl: u.avatarUrl || "", createdAt: u.createdAt,
  };
  res.json({ ok: true, profile });
});

app.put("/api/users/:userId/profile", (req, res) => {
  const { userId } = req.params;
  const u = mockUsers[userId];
  if (!u) return res.status(404).json({ ok: false, error: "User not found" });
  const { username, email, firstName, lastName, avatarUrl } = req.body || {};
  if (email && Object.values(mockUsers).some((x) => x.email === email && x.id !== userId)) {
    return res.status(409).json({ ok: false, error: "Email already used" });
  }
  if (username !== undefined) u.username = username;
  if (email !== undefined) u.email = email;
  if (firstName !== undefined) u.firstName = firstName;
  if (lastName !== undefined) u.lastName = lastName;
  if (avatarUrl !== undefined) u.avatarUrl = avatarUrl;

  res.json({ ok: true, profile: {
    id: u.id, username: u.username, email: u.email,
    firstName: u.firstName || "", lastName: u.lastName || "",
    avatarUrl: u.avatarUrl || "", createdAt: u.createdAt,
  }});
});

app.delete("/api/users/:userId", (req, res) => {
  const { userId } = req.params;
  const u = mockUsers[userId];
  if (!u) return res.status(404).json({ ok: false, error: "User not found" });

  Object.values(mockGroups).forEach((g) => {
    g.members = g.members.filter((m) => m.id !== userId);
    if (g.points[userId] !== undefined) delete g.points[userId];
    if (g.leader?.id === userId) {
      const newLeader = g.members[0] || null;
      g.leader = newLeader ? { id: newLeader.id, name: newLeader.name } : null;
    }
  });

  delete mockUsers[userId];
  res.json({ ok: true });
});

app.get("/api/users/:userId/scores", (req, res) => {
  const { userId } = req.params;
  let groupPoints = [];
  let total = 0;
  Object.values(mockGroups).forEach((g) => {
    const pts = Number(g.points[userId] ?? 0);
    const isMember = g.members.some((m) => m.id === userId);
    if (isMember || pts > 0) {
      groupPoints.push({ groupId: g.id, groupName: g.name, points: pts });
      total += pts;
    }
  });
  groupPoints.sort((a, b) => b.points - a.points);
  res.json({ ok: true, totalPoints: total, groupPoints });
});

// ===================================================================
// Invites: create + notify + join by code
// ===================================================================

// 1) Genera codice e "notifica" mock nella POST /invite
app.post("/api/groups/:groupId/invite", (req, res) => {
  const { groupId } = req.params;
  const { userIds = [], emails = [] } = req.body || {};
  const g = mockGroups[groupId];
  if (!g) return res.status(404).json({ ok: false, error: "Group not found" });

  const code = makeInviteCode();
  inviteCodes.set(code, { groupId, createdAt: new Date().toISOString() });

  // Stub notifica: salva in outbox (qui poi collegherai notification-service)
  const targets = [...userIds.map((id) => ({ type: "userId", to: id })), ...emails.map((e) => ({ type: "email", to: e }))];
  targets.forEach((t) => {
    notificationOutbox.push({
      to: t.to,
      channel: t.type === "email" ? "email" : "in-app",
      payload: { type: "INVITE_CODE", code, groupId, groupName: g.name },
      createdAt: new Date().toISOString(),
    });
  });

  console.log(`[MOCK] invite code ${code} for ${groupId}, sent to: ${targets.map(t=>t.to).join(", ")}`);
  res.json({ ok: true, code });
});

// 2) Join da codice
app.post("/api/groups/join", (req, res) => {
  const { code, userId, userName } = req.body || {};
  if (!code || !userId) return res.status(400).json({ ok: false, error: "Missing code or userId" });
  const info = inviteCodes.get(code.toUpperCase());
  if (!info) return res.status(404).json({ ok: false, error: "Invalid or expired code" });

  const g = mockGroups[info.groupId];
  if (!g) return res.status(404).json({ ok: false, error: "Group not found" });

  const already = g.members.some((m) => m.id === userId);
  if (!already) {
    g.members.push({ id: userId, name: userName || userId });
    g.points[userId] = g.points[userId] ?? 0;
  }

  // (opzionale) invalidare codice singolo uso:
  // inviteCodes.delete(code.toUpperCase());

  res.json({ ok: true, groupId: g.id, groupName: g.name });
});

// ===================================================================
// Boot
// ===================================================================
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
});
