// voting-app/lib/api.ts
// Stile identico al tuo file originale:
// - API_BASE con default localhost:8080
// - helper j<T>(r: Response)
// - fetch con { cache: "no-store" }
// - nomi funzioni invariati (getGroupMembers, getPendingQuestion, sendVote, ...)

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/* =========================
 * Types usati dal frontend
 * ========================= */
export type Member = { id: string; name: string; avatarUrl?: string };
export type Group = {
  id: string;
  name: string;
  leader?: { id: string; name: string } | Member | null;
  members?: Member[];
  points?: Record<string, number>;
  settings?: Record<string, unknown>;
  categories?: string[];
};
export type Question = { id: string; text: string; createdAt: string; deadline: string };
export type LeaderboardEntry = { userId: string; name: string; points: number };
export type LeaderboardResponse = {
  questionText: string;
  voted: string[];
  entries: LeaderboardEntry[];
};export type CreateQuestionPayload = {
  groupId: string;
  text: string;
  expiresInHours?: number; // default lato server 24
};
export type CreateQuestionResponse = {
  ok: boolean;
  questionId: string;
};
export type InviteMembersPayload = {
  userIds: string[];
  emails: string[];
};
/* ================
 * User-Service
 * ================ */
export type UserProfile = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt?: string;
};
export type UserScores = {
  totalPoints: number;
  groupPoints: { groupId: string; groupName: string; points: number }[];
};

/* =========================
 * Helper JSON
 * ========================= */
async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* =========================
 * Groups (compatibili col tuo frontend)
 * ========================= */

// (Usata dalla home)
export async function getGroups(): Promise<Group[]> {
  const r = await fetch(`${API_BASE}/api/groups`, { cache: "no-store" });
  return j<Group[]>(r);
}

// (Usata dalla pagina del gruppo)
export async function getGroup(groupId: string): Promise<Group> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}`, { cache: "no-store" });
  return j<Group>(r);
}

// (Usata da voting page & gruppo page)
export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/members`, { cache: "no-store" });
  const data = await j<{ members: Member[] }>(r);
  return data.members;
}

// (Usata dalla voting page)
export async function getPendingQuestion(
  groupId: string,
  userId: string
): Promise<{ hasPending: boolean; question?: Question }> {
  const r = await fetch(
    `${API_BASE}/api/groups/${groupId}/pending-question?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" }
  );
  return j(r);
}

// (Usata dalla voting page — nome invariato)
export async function createQuestion(
  payload: CreateQuestionPayload
): Promise<CreateQuestionResponse> {
  const r = await fetch(`${API_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return j<CreateQuestionResponse>(r);
}
export async function sendVote(payload: {
  groupId: string;
  questionId: string;
  voterId: string;
  votedUserId: string;
}) {
  const r = await fetch(`${API_BASE}/api/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return j<{ ok: boolean }>(r);
}

// (Usata dalla pagina stats del gruppo se presente)
export async function getLeaderboard(groupId: string): Promise<LeaderboardResponse> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/leaderboard`, { cache: "no-store" });
  return j<LeaderboardResponse>(r);
}
export async function inviteMembers(groupId: string, payload: InviteMembersPayload): Promise<{ ok: boolean; code: string }> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return j(r);
}
/* -------- JOIN BY CODE: nuova funzione per /unisciti-gruppo -------- */
// se poi aggiungeremo auth reale, qui basterà appendere il token.
export async function joinGroupByCode(
  code: string,
  userId: string,
  userName?: string
): Promise<{ ok: boolean; groupId: string; groupName: string }> {
  const r = await fetch(`${API_BASE}/api/groups/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ code, userId, userName }),
  });
  return j(r);
}
/* =========================
 * User-Service (nuove funzioni per profilo / reset psw)
 * ========================= */

// GET profilo utente
export async function getProfile(userId: string): Promise<{ ok: boolean; profile?: UserProfile; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}/profile`, { cache: "no-store" });
  return j(r);
}

// UPDATE profilo utente
export async function updateProfile(
  userId: string,
  payload: Partial<Pick<UserProfile, "username" | "email" | "firstName" | "lastName" | "avatarUrl">>
): Promise<{ ok: boolean; profile?: UserProfile; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return j(r);
}

// RESET password (usata da /resetpsw)
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email, newPassword }),
  });
  return j(r);
}

// Punteggi personali (usata da /profile/scores)
export async function getUserScores(
  userId: string
): Promise<{ ok: boolean; totalPoints: number; groupPoints: UserScores["groupPoints"] }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}/scores`, { cache: "no-store" });
  return j(r);
}

// Cancellazione account (usata da /profile/delete-account)
export async function deleteAccount(userId: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return j(r);
}
