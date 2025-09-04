"use client";

import React, { use as usePromise } from "react";
import Link from "next/link";

type Params = { id: string };

export default function GroupPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);

  // mock: elenco membri del gruppo (potresti caricarli dal backend)
  const members = [
    { id: "u1", name: "Sara" },
    { id: "u2", name: "Mattia" },
    { id: "u3", name: "Simona" },
    { id: "u4", name: "Andrea" },
    { id: "u5", name: "Antonio" },
    { id: "u6", name: "Lucia" },
    { id: "u7", name: "Mario" },
    { id: "u8", name: "Sandra" },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/home" style={styles.back}>&larr; Back</Link>
        <div style={{ fontSize: 22 }}>👥 Group {id}</div>
      </header>

      <main style={styles.content}>
        <section style={styles.card}>
          <h2 style={styles.h2}>Members</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            {members.map((m) => (
              <li key={m.id} style={styles.memberPill}>{m.name}</li>
            ))}
          </ul>
        </section>

        <section style={styles.card}>
          <h2 style={styles.h2}>Current Question</h2>
          <p style={{ marginTop: 8 }}>
            <strong>Who is most likely to win a swimming competition?</strong>
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* In un’app reale passeresti gli ID reali; qui usiamo questionId="current" */}
            <Link
              href={`/voting/${id}/current?selfVoting=false&currentUserId=u7`} // u7 = Mario
              style={styles.btnPrimary}
            >
              ▶ Play
            </Link>

            <Link
              href={`/voting/${id}/current?selfVoting=true&currentUserId=u7`}
              style={styles.btnSecondary}
            >
              ▶ Play (self-vote enabled)
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "#f5f6f8", fontFamily: "Inter, system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.06)" },
  back: { textDecoration: "none", color: "#0070f3" },
  content: { maxWidth: 900, margin: "24px auto", padding: "0 16px", display: "grid", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,.05)" },
  h2: { margin: 0, fontSize: 18 },
  memberPill: { background: "#edf2ff", color: "#1f3b8f", padding: "10px 12px", borderRadius: 10, textAlign: "center" },
  btnPrimary: { background: "#1f9d55", color: "#fff", padding: "12px 18px", borderRadius: 10, textDecoration: "none", fontWeight: 600 },
  btnSecondary: { background: "#0a66c2", color: "#fff", padding: "12px 18px", borderRadius: 10, textDecoration: "none", fontWeight: 600 },
};
