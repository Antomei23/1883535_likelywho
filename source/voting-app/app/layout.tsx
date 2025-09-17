// frontend/app/layout.tsx
export const metadata = {
  title: 'LikelyWho',
  description: 'Distributed voting game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
