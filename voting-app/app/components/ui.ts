// Stili/palette condivisi per mantenere coerenza con page.tsx esistente
export const colors = {
  bg: "#f5f6f8",
  text: "#333",
  card: "#ffffff",
  primary: "#4CAF50",
  secondary: "#007bff",
  danger: "#dc3545",
  accent: "#ff3b30",
  mutedBorder: "#eee",
  shadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export const card: React.CSSProperties = {
  backgroundColor: colors.card,
  borderRadius: 10,
  padding: 16,
  boxShadow: colors.shadow,
};

export const h2: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  margin: "8px 0 16px",
  textAlign: "left",
  color: colors.text,
};

export const btnBase: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: 8,
  color: "#fff",
  textDecoration: "none",
  fontSize: 16,
  textAlign: "center",
  border: "none",
  cursor: "pointer",
};

export const btnPrimary: React.CSSProperties = { ...btnBase, backgroundColor: colors.primary };
export const btnSecondary: React.CSSProperties = { ...btnBase, backgroundColor: colors.secondary };
export const btnDanger: React.CSSProperties = { ...btnBase, backgroundColor: colors.danger };
export const dot: React.CSSProperties = { width: 10, height: 10, borderRadius: "50%", background: colors.accent };
