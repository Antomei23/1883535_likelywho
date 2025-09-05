"use client";

import React, { use as usePromise, useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, LeaderboardEntry } from "@/lib/api";

type Params = { id: string };

export default function StatsPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);

  const [questionText, setQuestionText] = useState<string>("Loading…");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [whoVoted, setWhoVoted] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await getLeaderboard(id);
        if (!live) return;
        setQuestionText(data.questionText);
        setWhoVoted(data.voted);
        setEntries(data.entries);
      } catch (e) {
        console.error(e);
        setQuestionText("Failed to load leaderboard");
      }
    })();
    return () => { live = false; };
  }, [id]);

  // calcolo % semplice per la barra (normalizzo sui punti massimi)
  const maxPoints = entries.reduce((m, e) => Math.max(m, e.points), 1);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href={`/gruppo/${id}`} style={styles.menuButton}>✕</Link>
        <div />
        <Link href="/profile" style={styles.userButton}>👤</Link>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.h2}>{questionText}</h2>

          <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "grid", gap: 10 }}>
            {entries.map((p) => {
              const pct = Math.round((p.points / maxPoints) * 100);
              return (
                <li key={p.userId} style={{ display: "grid", gridTemplateColumns: "110px 1fr 52px", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${pct}%` }} />
                  </div>
                  <span style={{ textAlign: "right" }}>{p.points}</span>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 16, fontSize: 14, color: "#555" }}>
            <div style={{ marginBottom: 6 }}>Who has already voted?</div>
            <div>{whoVoted.join(", ") || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.1)", position: "sticky", top: 0, zIndex: 10 },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  content: { padding: 24, maxWidth: 420, margin: "0 auto" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  h2: { margin: 0, fontSize: 20 },
  barBg: { width: "100%", height: 14, background: "#edf2f7", borderRadius: 8, overflow: "hidden" },
  barFill: { height: "100%", background: "#4CAF50" },
};
