"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  getCurrentUserId,
  getGroupMembers,
  getPendingQuestion,
  sendVote,
  type Member,
} from "@/lib/api";

function hoursLeft(deadlineIso?: string) {
  if (!deadlineIso) return undefined;
  const diff = Math.max(0, new Date(deadlineIso).getTime() - Date.now());
  return Math.floor(diff / (1000 * 60 * 60));
}

export default function VotingPage() {
  const { groupId, questionId } = useParams<{ groupId: string; questionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selfVoting = (searchParams.get("selfVoting") || "false") === "true";
  const currentUserId = getCurrentUserId();

  const [members, setMembers] = useState<Member[]>([]);
  const [questionText, setQuestionText] = useState<string>("Loading question…");
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        // 1) membri: ora l'API ritorna Member[] diretto
        const mm = await getGroupMembers(groupId);
        if (!live) return;
        setMembers(mm);

        // 2) pending question: controlla che l'ID corrisponda a quello in URL
        const pq = await getPendingQuestion(groupId, currentUserId);
        if (!live) return;

        if (pq.hasPending && pq.question && pq.question.id === questionId) {
          setQuestionText(pq.question.text);
          setExpiresAt(pq.question.expiresAt); // <-- campo corretto
        } else {
          setQuestionText("No active question or already answered.");
        }
      } catch (e) {
        console.error(e);
        if (live) setQuestionText("Failed to load question.");
      }
    })();
    return () => { live = false; };
  }, [groupId, questionId, currentUserId]);

  const disabledIfSelf = (id: string) => !selfVoting && id === currentUserId;

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await sendVote({
        groupId,
        questionId,
        voterId: currentUserId,
        votedUserId: selected,
      });
      router.replace(`/gruppo/${groupId}/stats`);
    } catch (e) {
      console.error(e);
      alert("Errore nell'invio del voto");
    } finally {
      setSubmitting(false);
    }
  };

  const remainHours = hoursLeft(expiresAt);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href={`/gruppo/${groupId}`} style={styles.menuButton}>←</Link>
        <div />
        <Link href="/profile" style={styles.userButton}>👤</Link>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.h2}>{questionText}</h2>
          {typeof remainHours === "number" && (
            <p style={{ color: "#666", marginTop: 6 }}>
              This question will expire in <strong>{remainHours}h</strong> ⏳
            </p>
          )}

          <div style={styles.grid}>
            {members.length > 0 ? (
              members.map((m) => {
                const isActive = selected === m.id;
                const isDisabled = disabledIfSelf(m.id);
                return (
                  <button
                    key={m.id}
                    disabled={isDisabled}
                    onClick={() => setSelected(m.id)}
                    style={{
                      ...styles.memberBtn,
                      ...(isActive ? styles.memberBtnActive : {}),
                      ...(isDisabled ? styles.memberBtnDisabled : {}),
                    }}
                  >
                    {m.name}
                  </button>
                );
              })
            ) : (
              <p style={{ color: "#888" }}>No members available</p>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected || submitting}
            style={{
              ...styles.actionButtonGreen,
              width: "100%",
              marginTop: 16,
              opacity: selected && !submitting ? 1 : 0.6,
              cursor: selected && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "Sending…" : "Confirm choice"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { fontFamily: "Inter, sans-serif", backgroundColor: "#f5f6f8", minHeight: "100vh", color: "#333" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,.1)", position: "sticky", top: 0, zIndex: 10 },
  menuButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  userButton: { fontSize: 22, textDecoration: "none", color: "#333" },
  content: { padding: 24, maxWidth: 420, margin: "0 auto" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,.05)" },
  h2: { margin: 0, fontSize: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginTop: 12 },
  memberBtn: { padding: 14, borderRadius: 10, border: "1px solid #a9c4ff", background: "#cfe1ff", fontWeight: 600, cursor: "pointer" },
  memberBtnActive: { background: "#f7a53a", borderColor: "#f7a53a", color: "#1a1a1a" },
  memberBtnDisabled: { background: "#e9ecef", color: "#9aa0a6", borderColor: "#e9ecef", cursor: "not-allowed" },
  actionButtonGreen: { backgroundColor: "#4CAF50", color: "#fff", padding: "12px 18px", borderRadius: 8, border: "none", fontWeight: 700 },
};
