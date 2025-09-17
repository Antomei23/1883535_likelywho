// voting-app/lib/auth.ts
"use client";

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string | null;
};

const TOKEN_KEY = "accessToken";
const USER_KEY  = "currentUser";
const ID_KEY    = "userId";

export function saveAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ID_KEY, user.id);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ID_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem(USER_KEY);
  if (!s) return null;
  try { return JSON.parse(s) as AuthUser; } catch { return null; }
}

export function getCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem(ID_KEY);
  if (id) return id;
  const u = getCurrentUser();
  return u?.id ?? "";
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getCurrentUserId();
}
