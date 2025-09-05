"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const RegisterPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setSubmitting(true);

      // 1) REGISTRAZIONE
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const reg = await res.json() as {
        ok: boolean;
        user?: { id: string; username?: string; email: string };
        token?: string; tokens?: { access?: string; refresh?: string };
      };
      if (!reg?.ok) throw new Error("Registration failed");

      // 2) (opzionale) AUTO-LOGIN per UX migliore
      try {
        const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (loginRes.ok) {
          const data = await loginRes.json() as {
            ok: boolean; user?: any; token?: string; tokens?: { access?: string };
          };
          if (data?.ok) {
            const accessToken = data.token ?? data.tokens?.access ?? "mock-access-token";
            localStorage.setItem("accessToken", accessToken);
            if (data.user) localStorage.setItem("currentUser", JSON.stringify(data.user));
            router.replace("/home");
            return;
          }
        }
      } catch {
        // se l'auto-login fallisce, andiamo comunque alla pagina di login
      }

      // fallback → login
      router.replace("/login?registered=1");
    } catch (err) {
      console.error(err);
      setError("Registrazione non riuscita. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign Up</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

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

          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? .7 : 1 }}>
            {submitting ? "Creating…" : "Create an account"}
          </button>
        </form>

        <p style={styles.text}>
          Already a member? <a href="/login" style={styles.link}>Sign In</a>
        </p>
      </div>
    </div>
  );
};

// styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  },
  card: {
    backgroundColor: "white", padding: "30px", borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", textAlign: "center", width: "350px",
  },
  title: { marginBottom: "25px", fontSize: "24px", fontWeight: "bold", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "10px", fontSize: "15px", borderRadius: "6px", border: "1px solid #ddd",
  },
  button: {
    backgroundColor: "#007bff", color: "white", padding: "12px", fontSize: "17px",
    border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "15px",
  },
  text: { marginTop: "20px", fontSize: "15px", color: "#555" },
  link: { color: "#007bff", textDecoration: "none" },
  error: {
    marginTop: 6, background: "#ffecec", color: "#7a0b0b",
    border: "1px solid #f7c2c2", padding: 8, borderRadius: 6, fontSize: 13,
  },
};

export default RegisterPage;
