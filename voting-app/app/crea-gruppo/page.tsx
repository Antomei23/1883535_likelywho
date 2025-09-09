"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, createGroup } from "@/lib/api";

const CreaGruppoPage = () => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [notificationTime, setNotificationTime] = useState<"morning" | "midday" | "afternoon" | "evening">("morning");
  const [disableSelfVote, setDisableSelfVote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();
  setError(null);
  if (!groupName.trim()) {
    setError("Inserisci un nome per il gruppo.");
    return;
  }

  try {
    setSubmitting(true);

    // Prendi il token dal localStorage
    const token = localStorage.getItem("accessToken");
    console.log("Token:", token); // <- controllo formato
    if (!token) {
      setError("Utente non autenticato.");
      setSubmitting(false);
      return;
    }

    // Invia direttamente la richiesta con il token
    const data = await createGroup({
      name: groupName.trim(),
      notificationTime,
      disableSelfVote,
    });
    console.log("createGroup response:", data);
    console.log("data.group:", data.group);
    console.log("data.group.id:", data.group?.id);


    if (!data?.ok || !data?.group?.id) {
      throw new Error(data?.error || "Creazione gruppo fallita");
    }

    router.push(`/crea-gruppo/step2?groupId=${encodeURIComponent(data.group.id)}`);
  } catch (err) {
    console.error(err);
    setError("Errore nella creazione del gruppo. Riprova.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Create a new group</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Group name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Eg. Team Alpha"
          required
          style={styles.input}
        />

        <label style={styles.label}>Notification time:</label>
        <select
          value={notificationTime}
          onChange={(e) => setNotificationTime(e.target.value as any)}
          style={styles.select}
        >
          <option value="morning">Morning (7 AM)</option>
          <option value="midday">Midday (12 PM)</option>
          <option value="afternoon">Afternoon (5 PM)</option>
          <option value="evening">Evening (8 PM)</option>
        </select>

        <div>If you do not want a player to vote for him/her-self, then check the following box:</div>
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="disableSelfVote"
            checked={disableSelfVote}
            onChange={() => setDisableSelfVote(!disableSelfVote)}
          />
          <label htmlFor="disableSelfVote" style={styles.checkboxLabel}>
            Disable self-voting
          </label>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={submitting} style={{ ...styles.button, opacity: submitting ? .6 : 1 }}>
          {submitting ? "Creating…" : "Continue"}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    maxWidth: "100%",
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0 10px",
  },
  label: {
    fontSize: "16px",
    fontWeight: 500,
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
  },
  select: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    backgroundColor: "white",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
  },
  checkboxLabel: { fontSize: "15px" },
  button: {
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "14px",
    fontSize: "16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    background: "#ffecec",
    color: "#7a0b0b",
    border: "1px solid #f7c2c2",
    padding: "8px",
    borderRadius: "6px",
  },
};

export default CreaGruppoPage;
