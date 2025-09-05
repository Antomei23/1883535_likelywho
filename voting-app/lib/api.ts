export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export type Member = { id: string; name: string };
export type Group = { id: string; name: string; leader?: Member; members?: Member[] };
export type Question = { id: string; text: string; createdAt: string; deadline: string };
export type LeaderboardEntry = { userId: string; name: string; points: number };

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/members`, { cache: "no-store" });
  const data = await j<{ members: Member[] }>(r);
  return data.members;
}

export async function inviteMembers(groupId: string, payload: { userIds?: string[]; emails?: string[] }) {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j<{ ok: boolean }>(r);
}

export async function createQuestion(payload: { groupId: string; text: string; expiresInHours?: number }) {
  const r = await fetch(`${API_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresInHours: 24, ...payload }),
  });
  return j<{ ok: boolean; questionId: string }>(r);
}

export async function getLeaderboard(groupId: string) {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/leaderboard`, { cache: "no-store" });
  return j<{ questionText: string; voted: string[]; entries: LeaderboardEntry[] }>(r);
}

// già presenti dalle risposte precedenti (se non le hai, aggiungile):
export async function getGroup(groupId: string): Promise<Group> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}`, { cache: "no-store" });
  return j<Group>(r);
}

export async function getPendingQuestion(groupId: string, userId: string):
  Promise<{ hasPending: boolean; question?: Question }> {
  const r = await fetch(`${API_BASE}/api/groups/${groupId}/pending-question?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
  return j(r);
}

export async function sendVote(payload: { groupId: string; questionId: string; voterId: string; votedUserId: string }) {
  const r = await fetch(`${API_BASE}/api/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j<{ ok: boolean }>(r);
}
