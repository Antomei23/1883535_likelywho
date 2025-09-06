// voting-app/lib/api.ts

function resolveApiBase() {
  // In SSR (Node dentro Docker) → usa il service name interno
  if (typeof window === "undefined") {
    return process.env.SERVER_API_BASE || "http://api-gateway:8080";
  }
  // In browser → usa l’host raggiungibile dall’esterno
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
}

export const API_BASE = resolveApiBase();

/* =========================
 * Types usati dal frontend
 * ========================= */
export type Member = { id: string; name: string; avatarUrl?: string };
export type Group = {
  id: string;
  name: string;
  leader?: { id: string; name: string } | null;
  members?: Member[];
  points?: Record<string, number>;
  settings?: { notificationTime: "morning" | "afternoon" | "evening"; disableSelfVote: boolean };
  categories?: string[];
};

export type LeaderboardEntry = { userId: string; name: string; points: number };
export type LeaderboardResponse = {
  questionText: string;
  voted: string[];
  entries: LeaderboardEntry[];
};

export type PendingQuestion = {
  id: string;
  text: string;
  createdAt: string;
  deadline: string;
};

export type PendingQuestionResponse =
  | { hasPending: false; question?: undefined }
  | { hasPending: true; question: PendingQuestion };

export type InviteResponse = { ok: boolean; code?: string; error?: string };
export type JoinByCodeResponse = { ok: boolean; groupId?: string; groupName?: string; error?: string };

export type UserScores = {
  ok: boolean;
  totalPoints: number;
  groupPoints: Array<{ groupId: string; groupName: string; points: number }>;
};

/** Aggiunto: profilo utente, coerente con l'API gateway */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt?: string;
}

/* =========================
 * Helper JSON
 * ========================= */
async function j<T>(r: Response): Promise<T> {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data as any)?.error ?? `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/* =========================================================
 * GROUPS
 * ========================================================= */
export async function getGroups(): Promise<Group[]> {
  const r = await fetch(`${API_BASE}/api/groups`, { cache: "no-store" });
  return j<Group[]>(r);
}

export async function getGroup(groupId: string): Promise<Group> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}`, { cache: "no-store" });
  return j<Group>(r);
}

export async function createGroup(payload: {
  name: string;
  leaderId: string;
  leaderName?: string;
  notificationTime?: "morning" | "afternoon" | "evening";
  disableSelfVote?: boolean;
}): Promise<{ ok: boolean; group?: Group; error?: string }> {
  const r = await fetch(`${API_BASE}/api/groups`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j(r);
}

export async function getGroupMembers(groupId: string): Promise<{ members: Member[] }> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/members`, { cache: "no-store" });
  return j(r);
}

export async function getLeaderboard(groupId: string): Promise<LeaderboardResponse> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/leaderboard`, { cache: "no-store" });
  return j(r);
}

/* =========================================================
 * QUESTIONS & VOTES
 * ========================================================= */
export async function getPendingQuestion(groupId: string, userId: string): Promise<PendingQuestionResponse> {
  const u = new URL(`${API_BASE}/api/groups/${groupId}/pending-question`);
  u.searchParams.set("userId", userId);
  const r = await fetch(u.toString(), { cache: "no-store" });
  return j<PendingQuestionResponse>(r);
}

export async function createQuestion(payload: {
  groupId: string;
  text: string;
  expiresInHours?: number;
}): Promise<{ ok: boolean; questionId?: string; error?: string }> {
  const r = await fetch(`${API_BASE}/api/questions`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j(r);
}

export async function sendVote(payload: {
  groupId: string;
  questionId: string;
  voterId: string;
  votedUserId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${API_BASE}/api/votes`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j(r);
}

/* =========================================================
 * INVITES
 * ========================================================= */
export async function createInvite(
  groupId: string,
  payload: { userIds?: string[]; emails?: string[] } = {}
): Promise<InviteResponse> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/invite`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j(r);
}

export async function joinGroupByCode(payload: {
  code: string;
  userId: string;
  userName?: string;
}): Promise<JoinByCodeResponse> {
  const r = await fetch(`${API_BASE}/api/groups/join`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j(r);
}

/* =========================================================
 * USER SCORES (già presente nel tuo file)
 * ========================================================= */
export async function getUserScores(
  userId: string
): Promise<{ ok: boolean; totalPoints: number; groupPoints: UserScores["groupPoints"] }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}/scores`, { cache: "no-store" });
  return j(r);
}

/* =========================================================
 * DELETE ACCOUNT (già presente nel tuo file)
 * ========================================================= */
export async function deleteAccount(userId: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return j(r);
}

/* =========================================================
 * Aggiunte per /app/profile/page.tsx
 * ========================================================= */

/** Ritorna l'userId dall'archiviazione locale; fallback mock "u7" per permettere sviluppo locale. */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "u7";
  const saved = window.localStorage.getItem("userId");
  if (saved && saved.trim().length > 0) return saved;
  window.localStorage.setItem("userId", "u7");
  return "u7";
}

/** GET profilo utente */
export async function getProfile(
  userId: string
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  try {
    const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, { cache: "no-store" });
    const data = await r.json();
    if (!r.ok || data?.ok === false) return { ok: false, error: data?.error ?? `HTTP ${r.status}` };
    return { ok: true, profile: data.profile as UserProfile };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

/** PUT profilo utente */
export async function updateProfile(
  userId: string,
  payload: Partial<Pick<UserProfile, "username" | "email" | "firstName" | "lastName" | "avatarUrl">>
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  try {
    const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok || data?.ok === false) return { ok: false, error: data?.error ?? `HTTP ${r.status}` };
    return { ok: true, profile: data.profile as UserProfile };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" };
  }
}

/** (Opzionale) reset password usato dalla pagina /resetpsw */
export async function resetPassword(email: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${API_BASE}/api/users/reset-password`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  return j(r);
}
