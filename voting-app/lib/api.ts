// voting-app/lib/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/* =========================
 * Helpers
 * ========================= */
type Jsonish = Record<string, any>;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (extra) Object.assign(headers, extra);
  return headers;
}

/** fetch con Authorization se presente */
async function authFetch(input: string, init: RequestInit = {}) {
  const headers = buildHeaders(init.headers as Record<string, string> | undefined);
  return fetch(input, { ...init, headers, cache: "no-store" });
}

async function j<T>(r: Response): Promise<T> {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data as any)?.error ?? `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

async function asJson<T = any>(r: Response): Promise<T> {
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return txt as any; }
}

/* =========================
 * Types usati dal frontend
 * ========================= */
export type Member = { id: string; name: string; avatarUrl?: string | null};
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

export type ApiOk = { ok: true };
export type ApiErr = { ok: false; error: string };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  createdAt?: string;
}

/* =========================================================
 * GROUPS
 * ========================================================= */
export async function getGroups(): Promise<Group[]> {
  const r = await authFetch(`${API_BASE}/api/groups`);
  return j<Group[]>(r);
}

export async function getGroup(groupId: string): Promise<Group> {
  const r = await authFetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as any)?.error ?? `HTTP ${r.status}`);
  // l’API Gateway può rispondere { ok:true, group:{...} } oppure direttamente il group
  return (data?.group ?? data) as Group;
}

export async function createGroup(payload: {
  name: string;
  notificationTime?: "morning" | "afternoon" | "evening" | "midday";
  disableSelfVote?: boolean;
}): Promise<{ ok: boolean; group?: Group; error?: string }> {

  const token = getToken();
  if (!token) return { ok: false, error: "Not authenticated" };

  const r = await authFetch(`${API_BASE}/api/groups`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data: any = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: data?.error ?? `HTTP ${r.status}` };

  const group = data?.group ?? data;
  if (group?.id) return { ok: true, group };
  return { ok: false, error: "No group returned" };
}

export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const r = await authFetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/members`);
  // il gateway già normalizza a [] oppure array
  return j<Member[]>(r);
}

export async function getLeaderboard(groupId: string): Promise<LeaderboardResponse> {
  try {
    const r = await authFetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/leaderboard`);
    if (r.ok) return j(r);
  } catch { /* ignore */ }
  return { questionText: "", voted: [], entries: [] };
}

/* =========================================================
 * QUESTIONS & VOTES
 * ========================================================= */
export async function getPendingQuestion(groupId: string, userId: string): Promise<PendingQuestionResponse> {
  const u = new URL(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/pending-question`);
  u.searchParams.set("userId", userId);
  const r = await authFetch(u.toString());
  return j<PendingQuestionResponse>(r);
}

export async function createQuestion(payload: {
  groupId: string;
  text: string;
  expiresInHours?: number;
}): Promise<{ ok: boolean; questionId?: string; error?: string }> {
  const expiresAt = new Date(Date.now() + (payload.expiresInHours ?? 24) * 60 * 60 * 1000).toISOString();
  const r = await authFetch(`${API_BASE}/api/questions`, {
    method: "POST",
    body: JSON.stringify({ groupId: payload.groupId, text: payload.text, expiresAt }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: data?.message || "createQuestion failed" };
  return { ok: true, questionId: data.id };
}

/* =========================================================
 * JOIN BY CODE (niente email)
 * ========================================================= */
export async function joinGroupByCode(
  code: string,
  userId: string,
  userName?: string
): Promise<JoinByCodeResponse> {
  const r = await authFetch(`${API_BASE}/api/groups/join`, {
    method: "POST",
    body: JSON.stringify({ code, userId, userName }),
  });
  return j(r);
}

/* =========================================================
 * SCORES / ACCOUNT
 * ========================================================= */
export async function getUserScores(userId: string): Promise<UserScores | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/scores`);
  const data = await asJson<{ ok: boolean; totalPoints?: number; groupPoints?: any; error?: string }>(r);
  if (!data || (data as any).ok === false) {
    return { ok: false, error: (data as any)?.error || "Unable to fetch scores" } as ApiErr;
  }
  return { totalPoints: data.totalPoints ?? 0, groupPoints: data.groupPoints ?? [] };
}

export async function deleteAccount(userId: string): Promise<ApiOk | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
  return asJson(r);
}

/* =========================================================
 * Profilo
 * ========================================================= */
export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  const direct = localStorage.getItem("userId");
  if (direct) return direct;
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return "";
  try {
    const user = JSON.parse(userStr);
    return user.id || "";
  } catch {
    return "";
  }
}

export async function getUserProfile(
  userId: string
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`);
  return asJson(r);
}

export async function updateUserProfile(
  userId: string,
  payload: Partial<Pick<UserProfile, "username" | "email" | "avatarUrl">>
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return asJson(r);
}

export async function resetPassword(email: string, newPassword: string): Promise<ApiOk | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/reset-password`, {
    method: "POST",
    body: JSON.stringify({ email, newPassword }),
  });
  return asJson(r);
}

export async function register(payload: { email: string; username?: string; password: string }) {
  const r = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: buildHeaders(), // non serve token qui
    body: JSON.stringify(payload),
  });
  return j(r);
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: buildHeaders(), // non serve token qui
    body: JSON.stringify({ email, password }),
  });
  return asJson(r);
}

/* =========================
 * Alias compatibilità
 * ========================= */
export const getProfile = getUserProfile;
export const updateProfile = updateUserProfile;
