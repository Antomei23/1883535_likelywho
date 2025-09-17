"use client";

import React, { use as usePromise, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createQuestion } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

type Params = { id: string };

const categories = ["Game", "Films", "Music", "Food", "Science", "Animal", "Book", "Sport", "Culture", "Fashion"];


export default function NewQuestionPage({ params }: { params: Promise<Params> }) {
  const { id } = usePromise(params);
  const router = useRouter();

  const [text, setText] = useState("");
  const [hours, setHours] = useState(24);
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const q = text.trim();
    if (!q) return setError("Inserisci un testo per la domanda.");
    setError(null);

    try {
      setSubmitting(true);
      await createQuestion({ groupId: id, text: q, expiresInHours: hours });
      // Torna alla pagina del gruppo appena creata la domanda
      router.replace(`/gruppo/${id}`);
    } catch (e: any) {
      console.error(e);
      setError("Errore nella creazione della domanda. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRandom = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/api/questions/random/${category}`);
      if (!response.ok) throw new Error("Errore nel recupero della domanda random");

      const data = await response.json();
      if (!data) throw new Error("Domanda random non valida");
      
      setText(data);
    } catch (e: any) {
      console.error(e);
      setError("Errore nel recupero della domanda random. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link href={`/gruppo/${id}`} style={styles.menuButton}>←</Link>
        <div />
        <Link href="/profile" style={styles.userButton}>👤</Link>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Crea una nuova domanda</h2>

          <label style={styles.label}>Testo della domanda</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Es.: "Chi tra noi finirà per primo la bottiglia di vino?"'
            style={styles.textarea}
          />

          <label style={{ ...styles.label, marginTop: 12 }}>Scadenza (ore)</label>
          <input
            type="number"
            min={1}
            max={48}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value || "24", 10))}
            style={styles.number}
          />

          <label style={{ ...styles.label, marginTop: 12 }}>Categoria (per domanda random)</label>
          <select style={styles.select} defaultValue="" onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Seleziona una categoria</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={handleRandom}
            disabled={!category.trim()}
            style={{
              ...styles.btnPrimary,
              width: "100%",
              marginTop: 16,
              opacity: !category.trim() ? 0.65 : 1,
              cursor: !category.trim() ? "not-allowed" : "pointer",
            }}
          >
            {"Scegli categoria per domanda random"}
          </button>

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handleCreate}
            disabled={!text.trim() || submitting}
            style={{
              ...styles.btnPrimary,
              width: "100%",
              marginTop: 16,
              opacity: !text.trim() || submitting ? 0.65 : 1,
              cursor: !text.trim() || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Creazione in corso…" : "Crea domanda"}
          </button>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Link href={`/gruppo/${id}`} style={styles.btnSecondary}>Annulla</Link>
            <Link href={`/gruppo/${id}/stats`} style={styles.btnSecondary}>Vai alle stats</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.1)", position: "sticky", top: 0, zIndex: 10 },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  content: { padding: 24, maxWidth: 520, margin: "0 auto" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  h2: { margin: 0, fontSize: 20 },
  label: { fontSize: 12, textTransform: "uppercase", letterSpacing: .4, color: "#6b7280", display: "block", marginTop: 8 },
  textarea: { width: "90%", height: 120, marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", resize: "vertical" },
  number: { width: 120, marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" },
  select: { width: "50%", marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", backgroundColor: "white" },
  btnPrimary: { backgroundColor: "#4CAF50", color: "#fff", padding: "12px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 700, border: "none" },
  btnSecondary: { backgroundColor: "#007bff", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 700 },
  error: { marginTop: 10, color: "#b00020", fontSize: 14 },
};
