"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json() as {
        ok: boolean;
        user?: { id: string; username?: string; email: string };
        token?: string;
        tokens?: { access?: string; refresh?: string };
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Credenziali non valide o servizio non disponibile.");
        return;
      }

      // salva sessione
      const storage = remember ? localStorage : sessionStorage;
      const accessToken = data.token || data.tokens?.access || "";
      storage.setItem("accessToken", accessToken);

      if (data.user) {
        const userId = data.user.id || "";
        const username = data.user.username || "";
        const emailStr = data.user.email || "";

        storage.setItem("currentUser", JSON.stringify({ id: userId, username, email: emailStr }));
        storage.setItem("userId", userId);
      }

      router.replace("/home");

    } catch (err) {
      console.error(err);
      setError("Errore durante il login. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/appiconexample.png" alt="App Icon" style={styles.icon} />
        <h2 style={styles.title}>Sign In</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.rememberForgot}>
            <span>
              <input
                type="checkbox"
                id="rememberMe"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label htmlFor="rememberMe"> Remember me</label>
            </span>
            <a href="/resetpsw" style={styles.link}>Forgot password?</a>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={styles.text}>
          Not a member? <a href="/register" style={styles.link}>Register</a>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  },
  icon: { width: "60px", height: "60px", marginBottom: "20px" },
  card: {
    backgroundColor: "white", padding: "30px", borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center", width: "350px",
  },
  title: { marginBottom: "25px", fontSize: "24px", fontWeight: "bold", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "10px", fontSize: "15px", borderRadius: "6px", border: "1px solid #ddd" },
  rememberForgot: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  link: { color: "#007bff", textDecoration: "none" },
  button: { backgroundColor: "#007bff", color: "white", padding: "12px", fontSize: "17px", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "15px" },
  text: { marginTop: "20px", fontSize: "15px", color: "#555" },
  error: { marginTop: 6, background: "#ffecec", color: "#7a0b0b", border: "1px solid #f7c2c2", padding: 8, borderRadius: 6, fontSize: 13 },
};

export default LoginPage;
