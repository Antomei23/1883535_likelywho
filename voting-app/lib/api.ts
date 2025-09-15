// lib/api.ts

// URL base e prefisso per le API
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

// Funzione helper per fare fetch + text
async function fetchText(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  const text = await res.text();
  return { res, text };
}

// ========================
//  CREAZIONE GRUPPO
// ========================
export async function createGroup(input: {
  name: string;
  notificationTime?: "morning" | "midday" | "afternoon" | "evening";
  disableSelfVote?: boolean;
  themes?: string[];
}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const { res, text } = await fetchText(`${API_BASE}${API_PREFIX}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name: input.name,
      notificationTime: input.notificationTime ?? "morning",
      disableSelfVote: input.disableSelfVote ?? false,
      themes: input.themes ?? [], // 👈 default per nuovo schema
    }),
  });

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (typeof text === "string" ? text : "") ||
      `Errore API (${res.status})`;
    throw new Error(msg);
  }

  // Normalizzazione id
  const id =
    data?.group?.id ??
    data?.id ??
    data?.groupId ??
    data?.data?.id ??
    data?.data?.group?.id;

  if (!id) {
    console.warn("createGroup: risposta inattesa dal server:", data);
    throw new Error("Creazione gruppo riuscita ma manca group.id nella risposta");
  }

  const group =
    data?.group ??
    data?.data?.group ??
    (typeof data === "object" ? data : { id });

  if (!group.id) group.id = id;

  return { ok: true, group };
}

// ========================
//  GENERAZIONE DOMANDE AI
// ========================
export async function generateAiQuestions(input: { topic?: string; n?: number }) {
  const { res, text } = await fetchText(`${API_BASE}${API_PREFIX}/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input ?? {}),
  });

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (typeof text === "string" ? text : "") ||
      `Errore API (${res.status})`;
    throw new Error(msg);
  }

  return data as { ok: true; items: string[] };
}
