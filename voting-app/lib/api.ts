// voting-app/lib/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/* ─────────────────────────────────────────────────────
 * Auth helpers (token in localStorage)
 * ────────────────────────────────────────────────────*/
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
}

function getCurrentUser(): { id: string; email?: string; name?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("currentUser");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/** ID utente corrente dalla UI (salvato in localStorage dopo il login). */
export function getCurrentUserId(): string {
  return getCurrentUser()?.id || "";
}

/* ─────────────────────────────────────────────────────
 * fetch con Authorization automatico
 * ────────────────────────────────────────────────────*/
async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}

/* ─────────────────────────────────────────────────────
 * Helpers JSON
 * ────────────────────────────────────────────────────*/
async function asJson<T = any>(r: Response): Promise<T> {
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return txt as any; }
}

function ensureOk(data: any, r: Response, fallbackMsg = "Request failed") {
  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || fallbackMsg;
    throw new Error(msg);
  }
}

/* ─────────────────────────────────────────────────────
 * Types usati dal frontend
 * ────────────────────────────────────────────────────*/
export type Member = { id: string; name: string; avatarUrl?: string | null };
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


export type LeaderboardEntry = { 
  userId: string; 
  name: string; 
  points: number 
};

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

export type ApiOk = { ok: true };
export type ApiErr = { ok: false; error: string };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  createdAt?: string;
}

/* ─────────────────────────────────────────────────────
 * GROUPS
 * ────────────────────────────────────────────────────*/
/** Lista gruppi di un utente (protetta: richiede token). */
export async function getUserGroups(userId: string): Promise<Group[]> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/groups`, { cache: "no-store" });
  const data = await asJson(r);
  ensureOk(data, r, "Unable to fetch groups");
  // gateway può restituire array diretto o { groups:[...] }
  return Array.isArray(data) ? data : (data.groups ?? []);
}

/** (Facoltativa) lista di tutti i gruppi. */
export async function getGroups(): Promise<Group[]> {
  const r = await authFetch(`${API_BASE}/api/groups`, { cache: "no-store" });
  const data = await asJson(r);
  // ensureOk(data, r, "Unable to fetch groups");
  // return Array.isArray(data) ? data : (data.groups ?? data);
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  // alcuni servizi rispondono { ok:true, group }, altri direttamente il group
  return data?.group ?? data;
}

/** Dettaglio gruppo (gateway può rispondere { ok, group } o gruppo diretto). */
export async function getGroup(groupId: string): Promise<Group> {
  const r = await authFetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}`, { cache: "no-store" });
  const data = await asJson(r);
  ensureOk(data, r, data?.error || "Group not found");
  return data?.group ?? data;
}

/** Membri del gruppo (gateway normalizza in array). */
export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const r = await authFetch(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/members`, { cache: "no-store" });
  const data = await asJson(r);
  ensureOk(data, r, "Unable to fetch members");
  return Array.isArray(data) ? data : (data.members ?? []);
}

/** Crea un nuovo gruppo (leaderId ricavato dal token dal gateway). */
export async function createGroup(payload: {
  name: string;
  notificationTime?: "morning" | "afternoon" | "evening" | "midday";
  disableSelfVote?: boolean;
}): Promise<{ ok: boolean; group?: Group; error?: string }> {
  const r = await authFetch(`${API_BASE}/api/groups`, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.error || "Create group failed" };
  return { ok: true, group: data?.group ?? data };
}

/** Entra in un gruppo con codice (userId preso dal token lato gateway). */
export async function joinGroupByCode(
  code: string,
  _userId?: string,  // compat: ignorato; il gateway usa il token
  _userName?: string
): Promise<{ ok: boolean; groupId?: string; error?: string }> {
  const r = await authFetch(`${API_BASE}/api/groups/join`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const data = await asJson(r);
  ensureOk(data, r, data?.error || "Join failed");
  return data;
}

/* ─────────────────────────────────────────────────────
 * QUESTIONS & VOTES
 * ────────────────────────────────────────────────────*/
export async function getPendingQuestion(groupId: string, userId?: string): Promise<PendingQuestionResponse> {
  const u = new URL(`${API_BASE}/api/groups/${encodeURIComponent(groupId)}/pending-question`);
  if (userId) u.searchParams.set("userId", userId);
  const r = await authFetch(u.toString(), { cache: "no-store" });
  const data = await asJson(r);
  if (!r.ok) return { hasPending: false };
  // normalizza: backend può già dare { hasPending: true/false, question? }
  if (typeof data?.hasPending === "boolean") return data as PendingQuestionResponse;
  // fallback legacy
  if (Array.isArray(data) && data.length > 0) {
    return { hasPending: true, question: data[0] as PendingQuestion };
  }
  return { hasPending: false };
}

export async function createQuestion(payload: {
  groupId: string;
  text: string;
  expiresInHours?: number;
}): Promise<{ ok: boolean; questionId?: string; error?: string }> {
  const expiresAt = new Date(Date.now() + (payload.expiresInHours ?? 24) * 60 * 60 * 1000).toISOString();
  const r = await authFetch(`${API_BASE}/api/questions`, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({ groupId: payload.groupId, text: payload.text, expiresAt }),
  });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.message || data?.error || "createQuestion failed" };
  return { ok: true, questionId: data.id ?? data.questionId };
}

export async function sendVote(payload: {
  groupId: string;
  questionId: string;
  voterId: string;
  votedUserId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const r = await authFetch(`${API_BASE}/api/votes`, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.error || "Vote failed" };
  return { ok: true };
}

// === Get group leaderboard ===
// Accetta sia risposta come array puro, sia { ok:true, leaderboard:[...] }
export async function getLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
  const r = await fetch(
    `${API_BASE}/api/groups/${encodeURIComponent(groupId)}/leaderboard`,
    { cache: "no-store" }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data?.error || `HTTP ${r.status}`);
  }
  const arr = Array.isArray(data) ? data : (data?.leaderboard ?? []);
  return (arr || []) as LeaderboardEntry[];
}


/* ─────────────────────────────────────────────────────
 * SCORES (se usato nella tua UI)
 * ────────────────────────────────────────────────────*/
export type UserScores = {
  totalPoints: number;
  groupPoints: Array<{ groupId: string; groupName: string; points: number }>;
};

export async function getUserScores(userId: string): Promise<UserScores | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/scores`, { cache: "no-store" });
  const data = await asJson<{ ok?: boolean; totalPoints?: number; groupPoints?: any; error?: string }>(r);
  if (!r.ok || data?.ok === false) {
    return { ok: false, error: data?.error || "Unable to fetch scores" } as ApiErr;
  }
  return {
    totalPoints: data.totalPoints ?? 0,
    groupPoints: data.groupPoints ?? [],
  };
}

/* ─────────────────────────────────────────────────────
 * PROFILE / ACCOUNT
 * ────────────────────────────────────────────────────*/
export async function getUserProfile(
  userId: string
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, { cache: "no-store" });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.error || "Profile not found" };
  return data;
}

export type UpdateProfilePayload = Partial<Pick<UserProfile, "username" | "email" | "avatarUrl">>;

export async function updateUserProfile(
  userId: string,
  payload: UpdateProfilePayload
): Promise<{ ok: true; profile: UserProfile } | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile`, {
    method: "PUT",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.error || "Update failed" };
  return data;
}

export async function deleteAccount(userId: string): Promise<ApiOk | ApiErr> {
  const r = await authFetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  const data = await asJson(r);
  if (!r.ok) return { ok: false, error: data?.error || "Delete failed" };
  return data;
}

/* ─────────────────────────────────────────────────────
 * AUTH (gateway emette token fittizio token-<userId>-<ts>)
 * ────────────────────────────────────────────────────*/
export async function register(payload: { email: string; username: string; password: string }) {
  const r = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await asJson(r);
  ensureOk(data, r, data?.error || "Register failed");
  return data as { ok: true; user: any; token: string };
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await asJson(r);
  ensureOk(data, r, data?.error || "Login failed");
  return data as { ok: true; user: any; token: string };
}

/** Alias compatibilità storica */
export const getProfile = getUserProfile;
export const updateProfile = updateUserProfile;
