'use client';

import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

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
    message: { fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '30px' },
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <p style={styles.message}>Group joined with success!</p>
      <button style={styles.button} onClick={() => router.push('/home')}>
        Home page
      </button>
    </div>
  );
}
