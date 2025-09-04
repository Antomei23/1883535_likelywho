"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { card, btnSecondary, btnBase, colors } from "./ui";

type Props = {
  groupId: string | number;
  groupName: string;
  questionTitle?: string; // es: "nuova domanda"
  autoOpen?: boolean;     // apri al mount (per demo)
};

const toastWrap: React.CSSProperties = {
  position: "fixed",
  top: 16,
  left: 16,
  zIndex: 50,
  maxWidth: 360,
};

const toastCard: React.CSSProperties = {
  ...card,
  padding: 14,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  marginTop: 10,
};

const ghostBtn: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  color: colors.secondary,
  border: `1px solid ${colors.secondary}`,
};

export default function NotificationToast({
  groupId,
  groupName,
  questionTitle = "A new question for your group is available!",
  autoOpen = false,
}: Props) {
  const [open, setOpen] = useState(autoOpen);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  if (!open) return null;

  return (
    <div style={toastWrap} role="dialog" aria-live="polite">
      <div style={toastCard}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>LikelyWho? – new ques</div>
        <div style={{ fontSize: 14, lineHeight: 1.35, color: "#555" }}>
          {questionTitle} <br />
          Group: <strong>{groupName}</strong>. Let’s play together!
        </div>
        <div style={actions}>
          <button style={ghostBtn} onClick={() => setOpen(false)}>
            Postpone
          </button>
          <Link href={`/gruppo/${groupId}?play=1`} style={btnSecondary}>
            Play now
          </Link>
        </div>
      </div>
    </div>
  );
}
