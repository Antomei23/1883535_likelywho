"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  getGroupMembers,
  getLeaderboard,
  type Member,
  type LeaderboardEntry,
} from "@/lib/api";

export default function GroupStatsPage() {
  const params = useParams<{ id: string }>();
  const groupId = params?.id;

  const [members, setMembers] = useState<Member[]>([]);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!groupId) {
      setErr("Missing group id");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const [mm, lb] = await Promise.all([
          getGroupMembers(groupId),
          getLeaderboard(groupId),
        ]);

        if (!alive) return;
        setMembers(Array.isArray(mm) ? mm : (mm as any).members ?? []);
        setRows(Array.isArray(lb) ? lb : []);
      } catch (e: any) {
        console.error(e);
        if (alive) setErr(e?.message || "Unable to load leaderboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [groupId]);

  // Mappa per arricchire userId -> nome
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of members) m.set(u.id, u.name || u.id);
    return m;
  }, [members]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.points - a.points),
    [rows]
  );

  if (loading) return <div style={{ padding: 24 }}>Loading leaderboard…</div>;
  if (err) return <div style={{ padding: 24, color: "#a00" }}>Error: {err}</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href={`/gruppo/${groupId}`} style={styles.backBtn}>← Back</Link>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>
        <div />
      </div>

      <div style={styles.content}>
        {!sorted.length ? (
          <div style={styles.emptyBox}>No votes yet.</div>
        ) : (
          <div style={styles.list}>
            {sorted.map((row, i) => {
              const name = nameById.get(row.userId) ?? shortId(row.userId);
              return (
                <div key={`${row.userId}-${i}`} style={styles.item}>
                  <div style={styles.rank}>{i + 1}</div>
                  <div style={styles.name}>{name}</div>
                  <div style={styles.points}>{row.points}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function shortId(id: string) {
  if (!id) return "";
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "#f5f6f8", color: "#333", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.08)", position: "sticky", top: 0, zIndex: 5 },
  backBtn: { textDecoration: "none", color: "#333", fontSize: 18 },
  content: { padding: 24, maxWidth: 560, margin: "0 auto" },
  emptyBox: { background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 16, textAlign: "center" },
  list: { background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 12, display: "grid", gap: 8 },
  item: { display: "grid", gridTemplateColumns: "40px 1fr 60px", alignItems: "center", padding: "10px 8px", borderRadius: 8, border: "1px solid #f0f0f0" },
  rank: { width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "50%", background: "#eef4ff", border: "1px solid #cddcff", fontWeight: 800 },
  name: { fontWeight: 700 },
  points: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
};
