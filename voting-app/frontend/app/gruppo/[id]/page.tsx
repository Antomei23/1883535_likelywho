"use client";

import React, { use as usePromise } from "react";
import Link from "next/link";

type Params = { id: string };

export default function GroupPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);

  const members = ["Mario", "Eva"]; // mock minimal come nel wireframe

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/home" style={styles.menuButton}>←</Link>
        <div />
        <Link href="/profile" style={styles.userButton}>👤</Link>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Banner PLAY */}
        <Link
          href={`/voting/${id}/current?selfVoting=false&currentUserId=u1`}
          style={{ ...styles.bannerPlay }}
        >
          ▶ PLAY – new question available
        </Link>

        {/* Card info gruppo */}
        <div style={styles.card}>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={styles.label}>Group name</div>
              <div style={styles.value}>FunGroup</div>
            </div>
            <div>
              <div style={styles.label}>Group Leader</div>
              <div style={styles.value}>Mario</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={styles.label}>Group players</div>
            <div style={styles.playersRow}>
              {members.map((m) => (
                <div key={m} style={styles.playerChip}>
                  <span>{m}</span>
                  <span title="stats" style={{ marginLeft: 8, opacity: .7 }}>📊</span>
                  <span title="roles" style={{ marginLeft: 6, opacity: .7 }}>🧩</span>
                  <span title="kick" style={{ marginLeft: 6, opacity: .7 }}>🔒</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Link href={`/gruppo/${id}/invite`} style={styles.btnSecondary}>+ Add players</Link>
              <button style={styles.btnDanger}>Delete group 🗑️</button>
            </div>
          </div>
        </div>

        {/* Shortcut alle stats/leaderboard */}
        <Link href={`/gruppo/${id}/stats`} style={{ ...styles.card, textDecoration: "none", display: "block" }}>
          <h3 style={{ margin: 0 }}>Leaderboard</h3>
          <div style={{ marginTop: 8, color: "#666" }}>Open group statistics →</div>
        </Link>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.1)", position: "sticky", top: 0, zIndex: 10,
  },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  content: { padding: 24, maxWidth: 420, margin: "0 auto", display: "grid", gap: 14 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: .4, color: "#6b7280" },
  value: { fontSize: 16, fontWeight: 600 },
  bannerPlay: {
    display: "block", textAlign: "center", padding: 12, borderRadius: 10,
    background: "#b8f4ff", color: "#083344", textDecoration: "none", fontWeight: 700,
    boxShadow: "0 2px 8px rgba(0,0,0,.06)"
  },
  playersRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 },
  playerChip: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#fff7d6", border: "1px solid #f4e4a1", borderRadius: 10, fontWeight: 600 },
  btnSecondary: { backgroundColor: "#007bff", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 600 },
  btnDanger: { backgroundColor: "#ef4444", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" },
};
