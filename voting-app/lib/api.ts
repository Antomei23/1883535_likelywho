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
export type Member = { id: string; name: string; avatarUrl?: string | null};
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
  totalPoints: number;
  groupPoints: Array<{ groupId: string; groupName: string; points: number }>;
};

export type UpdateProfilePayload = Partial<
  Pick<UserProfile, "username" | "email" | "firstName" | "lastName" | "avatarUrl">
>;
export type InviteMembersPayload = {
  userIds?: string[];     
  emails?: string[];     
};

export type ApiError = { error: string; code?: string; status?: number };
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
export type ApiOk = { ok: true };
export type ApiErr = { ok: false; error: string };
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
/* =========================
 * Helpers
 * ========================= */
async function asJson<T = any>(r: Response): Promise<T> {
  const txt = await r.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt as any;
  }
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
export async function inviteMembers(
  groupId: string,
  payload: InviteMembersPayload
): Promise<{ ok: true; invitations?: number }> {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
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
// ---- Scores (ritorna il payload "snello" atteso dalle pagine)
export async function getUserScores(userId: string): Promise<UserScores | ApiErr> {
  const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/scores`, {
    cache: "no-store",
  });
  const data = await asJson<{ ok: boolean; totalPoints?: number; groupPoints?: any; error?: string }>(r);
  if (!data || (data as any).ok === false) {
    return { ok: false, error: (data as any)?.error || "Unable to fetch scores" } as ApiErr;
  }
  return {
    totalPoints: data.totalPoints ?? 0,
    groupPoints: data.groupPoints ?? [],
  };
}

/* =========================================================
 * DELETE ACCOUNT (già presente nel tuo file)
 * ========================================================= */
export async function deleteAccount(userId: string): Promise<ApiOk | ApiErr> {
  const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return asJson(r);
}

/* =========================================================
 * Aggiunte per /app/profile/page.tsx
 * ========================================================= */

/** ID utente dal localStorage (compatibile con le tue pagine). */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userId") || "";
}

// ---- Profile (nuovi nomi)
export async function getUserProfile(
  userId: string
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, {
    cache: "no-store",
  });
  return asJson(r);
}

/** PUT profilo utente */
export async function updateUserProfile(
  userId: string,
  payload: UpdateProfilePayload
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJson(r);
}

// ---- Reset password
export async function resetPassword(email: string, newPassword: string): Promise<ApiOk | ApiErr> {
  const r = await fetch(`${API_BASE}/api/users/reset-password`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  return asJson(r);
}

/* =========================
 * Alias compatibilità con import esistenti
 * ========================= */
export const getProfile = getUserProfile;       // compatibile con /profile/page.tsx
export const updateProfile = updateUserProfile; // compatibile con /profile/page.tsx
