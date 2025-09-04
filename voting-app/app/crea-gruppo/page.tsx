"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CreaGruppoPage = () => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [notificationTime, setNotificationTime] = useState("morning");
  const [disableSelfVote, setDisableSelfVote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      groupName,
      notificationTime,
      disableSelfVote,
    });

    router.push("/crea-gruppo/step2");
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Crate a new group</h1>

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
          onChange={(e) => setNotificationTime(e.target.value)}
          style={styles.select}
        >
          <option value="morning">Morning (7 AM)</option>
          <option value="midday">Midday (12 AM)</option>
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

        <button type="submit" style={styles.button}>Continue</button>
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
  checkboxLabel: {
    fontSize: "15px",
  },
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
};

export default CreaGruppoPage;
