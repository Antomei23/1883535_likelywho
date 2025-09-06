"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId, getProfile, updateProfile, UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const userId = getCurrentUserId();
    (async () => {
      const res = await getProfile(userId);
      if ("ok" in res && res.ok) {
        setProfile(res.profile);
      } else {
        setError((res as any).error ?? "Unable to load profile");
      }
      setLoading(false);
    })();
  }, []);

  const onChange = (k: keyof UserProfile, v: string) => {
    if (!profile) return;
    setProfile({ ...profile, [k]: v });
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const res = await updateProfile(profile.id, {
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
    });
    setSaving(false);
    if ("ok" in res && res.ok) {
      setProfile(res.profile);
      alert("Profile saved");
    } else {
      alert((res as any).error ?? "Save failed");
    }
  };

  const goChangePassword = () => router.push("/resetpsw");
  const goScores = () => router.push("/profile/scores");
  const goDeleteAccount = () => router.push("/profile/delete-account");
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    router.push("/login");
  };

  if (loading) return <div style={styles.page}>Loading...</div>;
  if (error) return <div style={styles.page}>Error: {error}</div>;
  if (!profile) return <div style={styles.page}>No profile</div>;

  return (
    <div style={styles.page}>
      <div style={styles.avatar}>
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="avatar"
            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
          />
        ) : (
          // semplice icona utente fallback
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-10 1.934-10 5v3h20v-3c0-3.066-6.134-5-10-5z" />
          </svg>
        )}
      </div>

      <div style={styles.infoBox}>
        <div style={styles.row}>
          <span style={styles.label}>First Name</span>
          <input
            style={styles.input}
            value={profile.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Last Name</span>
          <input
            style={styles.input}
            value={profile.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Username</span>
          <input
            style={styles.input}
            value={profile.username}
            onChange={(e) => onChange("username", e.target.value)}
          />
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <input
            style={styles.input}
            value={profile.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Profile"}
        </button>
        <button style={styles.actionBtn} onClick={goChangePassword}>
          🔑 Change Password
        </button>
        <button style={styles.actionBtn} onClick={goScores}>
          🏆 Scores
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
        <button style={styles.deleteBtn} onClick={goDeleteAccount}>
          🗑 Delete account
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    maxWidth: "100%",
    minHeight: "100vh",
    background: "#f9fafc",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#ddd",
    border: "2px solid #000",
    margin: "20px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  infoBox: {
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "16px",
    width: "100%",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 16 },
  label: { fontWeight: 600, minWidth: 110, alignSelf: "center" },
  input: { flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "8px" },
  actions: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    maxWidth: "480px",
  },
  primaryBtn: {
    padding: "14px",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 6,
    border: "1px solid #2c7",
    background: "#eafff2",
    color: "#0a5",
    cursor: "pointer",
    textAlign: "left",
  },
  actionBtn: {
    padding: "14px",
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },
  logoutBtn: {
    padding: "14px",
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 6,
    border: "1px solid #e67e22",
    background: "#fff5ec",
    color: "#e67e22",
    cursor: "pointer",
    textAlign: "left",
  },
  deleteBtn: {
    padding: "14px",
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 6,
    border: "1px solid #e74c3c",
    background: "#fdecea",
    color: "#e74c3c",
    cursor: "pointer",
    textAlign: "left",
  },
};
