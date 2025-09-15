"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinGroupByCode } from "@/lib/api";

function getCurrentUserIdLocal(): string {
  if (typeof window === "undefined") return "22222222-2222-2222-2222-222222222222"; // fallback dev
  // prova varie chiavi usate nell'app
  const direct = localStorage.getItem("userId");
  if (direct) return direct;
  try {
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (cu?.id) return cu.id as string;
  } catch {}
  return "22222222-2222-2222-2222-222222222222"; // fallback dev
}

function getCurrentUserNameLocal(): string | undefined {
  if (typeof window === "undefined") return "Player";
  return localStorage.getItem("username")
    || localStorage.getItem("name")
    || JSON.parse(localStorage.getItem("currentUser") || "{}")?.username
    || "Player";
}

export default function UniscitiGruppoPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const prefill = (sp.get("code") || "").toUpperCase();

  const [codice, setCodice] = useState(prefill);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const code = codice.trim().toUpperCase();
      const res = await joinGroupByCode(code, getCurrentUserIdLocal(), getCurrentUserNameLocal());
      if (res?.ok && res.groupId) {
        // porta alla success passando anche il codice, così lo mostriamo
        router.push(`/unisciti-gruppo/success?groupId=${encodeURIComponent(res.groupId)}&code=${encodeURIComponent(code)}`);
      } else {
        setError(res?.error ?? "Codice non valido");
      }
    } catch (err: any) {
      setError(err?.message ?? "Impossibile unirsi al gruppo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Unisciti a un gruppo</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Inserisci il codice di invito:</label>
          <input
            type="text"
            value={codice}
            onChange={(e) => setCodice(e.target.value.toUpperCase())}
            required
            maxLength={12}
            style={styles.input}
            placeholder="es. 9K4XQZ"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading || codice.trim().length < 4}>
            {loading ? "Accesso..." : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "20px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  error: { color: "#c0392b", fontSize: 13, margin: 0 },
  button: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
