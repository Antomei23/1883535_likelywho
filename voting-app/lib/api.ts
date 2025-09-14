// voting-app/lib/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";


function assertJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return res.text().then(t => {
      throw new Error(`HTTP ${res.status} ${res.statusText} – non-JSON: ${t.slice(0,200)}...`);
    });
  }
  return res.json();
}

/* =========================
 * Types usati dal frontend
 * ========================= */
// consigliato: estendi Member
export type Member = { id: string; name: string; avatarUrl?: string | null; role?: string };
export type Group = {
  id: string;
  name: string;
  joinCode?: string;
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
  expiresAt: string;
};

export type PendingQuestionResponse =
  | { hasPending: false; question?: undefined }
  | { hasPending: true; question: PendingQuestion };

export type JoinByCodeResponse = { ok: boolean; groupId?: string; groupName?: string; error?: string };

export type UserScores = {
  totalPoints: number;
  groupPoints: Array<{ groupId: string; groupName: string; points: number }>;
};

export type UpdateProfilePayload = Partial<
  Pick<UserProfile, "username" | "email" | "avatarUrl">
>;


export type ApiError = { error: string; code?: string; status?: number };
/** Aggiunto: profilo utente, coerente con l'API gateway */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
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
  notificationTime?: "morning" | "afternoon" | "evening" | "midday";
  disableSelfVote?: boolean;
}): Promise<{ ok: boolean; group?: Group; error?: string }> {

  // prendi l'ID utente dal localStorage (fallback demo se vuoto)
  const leaderId =
    getCurrentUserId() ||
    (typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "") ||
    "11111111-1111-1111-1111-111111111111"; // <-- opzionale: id seed di Alice in dev

  const r = await fetch(`${API_BASE}/api/groups`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      leaderId,                   // <-- necessario per user-service
    }),
  });

  let data: any;
  try {
    data = await r.json();
  } catch {
    return { ok: false, error: "Failed to parse response" };
  }

  if (data?.group && data.group.id) {
    return { ok: true, group: data.group as Group };
  } else if (data?.id) {
    return { ok: true, group: data as Group };
  } else {
    return { ok: false, error: data?.error ?? "No group returned" };
  }
}


export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/members`, { cache: "no-store" });
  return j<Member[]>(r);
}


export async function getLeaderboard(groupId: string): Promise<LeaderboardResponse> {
  try {
    const r = await fetch(`${API_BASE}/api/groups/${groupId}/leaderboard`, { cache: "no-store" });
    if (r.ok) return j(r);
  } catch { /* ignore */ }
  return { questionText: "", voted: [], entries: [] };
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
  const expiresAt = new Date(Date.now() + (payload.expiresInHours ?? 24) * 60 * 60 * 1000).toISOString();

  const r = await fetch(`${API_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      groupId: payload.groupId,
      text: payload.text,
      expiresAt
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: data?.message || "createQuestion failed" };

  // il question-service ritorna { id, groupId, text, ... }
  return { ok: true, questionId: data.id };
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

export async function joinGroupByCode(
  code: string,
  userId: string,
  userName?: string
): Promise<JoinByCodeResponse> {
  const r = await fetch(`${API_BASE}/api/groups/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, userId, userName }),
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
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return "";
  try {
    const user = JSON.parse(userStr);
    return user.id || "";
  } catch {
    return "";
  }
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

export async function register(payload: { email: string; username?: string; password: string }): Promise<{ ok: true; user: any; token?: string } | ApiErr> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return assertJsonResponse(res);
}


export async function login(email: string, password: string): Promise<{ ok: true; user: any; token: string } | ApiErr> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return asJson(res);
}


/* =========================
 * Alias compatibilità con import esistenti
 * ========================= */
export const getProfile = getUserProfile;       // compatibile con /profile/page.tsx
export const updateProfile = updateUserProfile; // compatibile con /profile/page.tsx
