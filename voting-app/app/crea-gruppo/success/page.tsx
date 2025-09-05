'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      textAlign: 'center',
    },
    message: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '30px',
    },
    row: { display: "flex", gap: 10 },
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    secondary: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.message}>Gruppo creato con successo!</p>
      <div style={styles.row}>
        <button style={styles.button} onClick={() => router.push('/home')}>
          Vai alla Home
        </button>
        {groupId && (
          <button style={styles.secondary} onClick={() => router.push(`/gruppo/${groupId}`)}>
            Apri il gruppo
          </button>
        )}
      </div>
    </div>
  );
}
