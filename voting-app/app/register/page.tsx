"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const RegisterPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = () => {
    if (username.trim().length < 3) {
      setError("Username deve avere almeno 3 caratteri");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email non valida");
      return false;
    }
    if (password.length < 10) {
      setError("Password deve contenere almeno 10 caratteri");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json() as {
        ok: boolean;
        user?: { id: string; username?: string; email: string };
        token?: string;
        tokens?: { access?: string };
        error?: string;
        _errors?: any;
      };

      if (!data.ok) {
        // Mostra errori dettagliati provenienti dall'API
        if (data.error) setError(data.error);
        else if (data._errors) setError("Controlla i campi del modulo");
        else setError("Registrazione non riuscita");
        return;
      }

      if (data.user && (data.token || data.tokens?.access)) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("accessToken", data.token ?? data.tokens?.access ?? "");

        setSuccess("Registrazione avvenuta con successo! Reindirizzamento...");
        setTimeout(() => router.replace("/home"), 1000);
        return;
      }

      setError("Errore durante la registrazione. Riprova.");
    } catch (err) {
      console.error(err);
      setError("Errore di connessione al server.");
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
          {success && <div style={styles.success}>{success}</div>}

          <button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? 0.7 : 1 }}>
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

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center", width: "350px" },
  title: { marginBottom: "25px", fontSize: "24px", fontWeight: "bold", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "10px", fontSize: "15px", borderRadius: "6px", border: "1px solid #ddd" },
  button: { backgroundColor: "#007bff", color: "white", padding: "12px", fontSize: "17px", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "15px" },
  text: { marginTop: "20px", fontSize: "15px", color: "#555" },
  link: { color: "#007bff", textDecoration: "none" },
  error: { marginTop: 6, background: "#ffecec", color: "#7a0b0b", border: "1px solid #f7c2c2", padding: 8, borderRadius: 6, fontSize: 13 },
  success: { marginTop: 6, background: "#e0f9e0", color: "#1a7f1a", border: "1px solid #b2e6b2", padding: 8, borderRadius: 6, fontSize: 13 },
};

export default RegisterPage;
