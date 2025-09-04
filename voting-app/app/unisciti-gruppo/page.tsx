"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UniscitiGruppoPage = () => {
  const router = useRouter();
  const [codice, setCodice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Codice gruppo inserito:", codice);
    router.push("/unisciti-gruppo/success");
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Join a new group</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Insert invitation code:</label>
          <input
            type="text"
            value={codice}
            onChange={(e) => setCodice(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Join</button>
        </form>
      </div>
    </div>
  );
};

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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
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

export default UniscitiGruppoPage;
