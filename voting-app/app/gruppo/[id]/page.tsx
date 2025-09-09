"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  getCurrentUserId,
  getGroup,
  getGroupMembers,
  getPendingQuestion,
  type Group,
  type Member,
} from "@/lib/api";

type Params = { groupId: string };

export default function GroupPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  console.log("Group ID:", groupId);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ hasPending: boolean; questionId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = getCurrentUserId();// TODO: sostituire con utente loggato

  useEffect(() => {
    let active = true;

    async function loadOnce() {
      try {
        setError(null);

        const g = await getGroup(groupId);
        if (!active) return;
        setGroup(g);

        if (g.members && g.members.length) {
          setMembers(g.members);
        } else {
          const mm = await getGroupMembers(groupId);
          if (!active) return;
          setMembers(mm.members ?? []);
        }

        const pq = await getPendingQuestion(groupId, currentUserId);
        if (!active) return;
        setPending({ hasPending: pq.hasPending, questionId: pq.question?.id });
      } catch (e) {
        console.error(e);
        if (!active) return;
        setError("Impossibile caricare il gruppo. Riprova.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOnce();

    const t = setInterval(async () => {
      try {
        const pq = await getPendingQuestion(groupId, currentUserId);
        if (!active) return;
        setPending({ hasPending: pq.hasPending, questionId: pq.question?.id });
      } catch { /* silenzioso */ }
    }, 30_000);

    return () => {
      active = false;
      clearInterval(t);
    };
  }, [groupId, currentUserId]);

  if (loading) return <div style={{ padding: 24 }}>Loading group…</div>;
  if (!group) return <div style={{ padding: 24 }}>Group not found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href="/home" style={styles.menuButton} aria-label="Back to home">←</Link>
        <div />
        <Link href="/profile" style={styles.userButton} aria-label="Profile">👤</Link>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.errorBox}>{error}</div>}

        {pending?.hasPending && pending.questionId && (
          <Link
            href={`/voting/${group.id}/${pending.questionId}?selfVoting=false&currentUserId=${currentUserId}`}
            style={styles.bannerPlay}
          >
            ▶ PLAY — new question available
          </Link>
        )}

        {!pending?.hasPending && (
          <Link
            href={`/gruppo/${groupId}/nuova_domanda`}
            style={{ ...styles.bannerPlay, background: "#e7f5ff", color: "#1c3d5a", borderColor: "#b6e0ff" }}
          >
            + Create a new question
          </Link>
        )}

        <div style={styles.card}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={styles.label}>Group name</div>
              <div style={styles.value}>{group.name}</div>
            </div>
            <div>
              <div style={styles.label}>Group leader</div>
              <div style={styles.value}>{group.leader?.name ?? "—"}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={styles.label}>Group players</div>
            <div style={styles.playersRow}>
              {members.map(m => (
                <div key={m.id} style={styles.playerChip} title={m.id}>
                  <span>{m.name}</span>
                  <span title="stats" style={{ marginLeft: 8, opacity: .7 }}>📊</span>
                  <span title="roles" style={{ marginLeft: 6, opacity: .7 }}>🧩</span>
                  <span title="kick" style={{ marginLeft: 6, opacity: .7 }}>🔒</span>
                </div>
              ))}
              {!members.length && <div style={{ color: "#777" }}>No players yet.</div>}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Link href={`/gruppo/${groupId}/invite`} style={styles.btnSecondary}>+ Add players</Link>
              <button style={styles.btnDanger} onClick={() => alert("TODO: implement delete group")}>
                Delete group 🗑️
              </button>
            </div>
          </div>
        </div>

        <Link href={`/gruppo/${groupId}/stats`} style={{ ...styles.card, textDecoration: "none", display: "block" }}>
          <h3 style={{ margin: 0 }}>Leaderboard</h3>
          <div style={{ marginTop: 8, color: "#666" }}>Open group statistics →</div>
        </Link>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.08)", position: "sticky", top: 0, zIndex: 10 },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  content: { padding: 24, maxWidth: 520, margin: "0 auto", display: "grid", gap: 14 },
  errorBox: { background: "#ffecec", color: "#7a0b0b", border: "1px solid #f7c2c2", padding: 10, borderRadius: 8 },
  bannerPlay: { background: "#fff4e5", color: "#7a3d00", border: "1px solid #ffd7a3", padding: "12px 14px", borderRadius: 12, fontWeight: 700, display: "block", textDecoration: "none", textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280" },
  value: { fontSize: 16, fontWeight: 700, marginTop: 2 },
  playersRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  playerChip: { background: "#eef4ff", border: "1px solid #cddcff", borderRadius: 20, padding: "8px 12px", fontWeight: 600, display: "inline-flex", alignItems: "center" },
  btnSecondary: { backgroundColor: "#007bff", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 700 },
  btnDanger: { backgroundColor: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" },
};
