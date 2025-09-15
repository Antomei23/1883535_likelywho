"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/home";

  const [email, setEmail] = useState("alice@example.com"); // comodo in dev
  const [password, setPassword] = useState("password");    // comodo in dev (se seed auth)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // se hai già una sessione valida, vai subito a /home
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const currentUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (token && currentUser) {
      router.replace("/home");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if ((res as any)?.ok !== true) {
        throw new Error((res as any)?.error || "Login failed");
      }

      const { user, token } = res as any;

      // salva sessione
      localStorage.setItem("accessToken", token);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.name || user.username || "",
          avatarUrl: user.avatarUrl || "",
        })
      );

      router.replace(next);
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.subtitle}>Use your credentials to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Your password"
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={styles.hint}>
          Dev hint: se l’utente non esiste nell’<em>auth-service</em>, registra prima (o seed-a una password).
        </p>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f7fb",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  subtitle: { marginTop: 6, marginBottom: 18, color: "#666", fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 12, color: "#444" },
  input: {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  button: {
    marginTop: 6,
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    background: "#ffe8e8",
    border: "1px solid #ffb3b3",
    color: "#7a0b0b",
    padding: "8px 10px",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  hint: { marginTop: 14, color: "#777", fontSize: 12 },
};
