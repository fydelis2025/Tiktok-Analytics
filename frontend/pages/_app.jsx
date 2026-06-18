import '../styles/globals.css'; // ✅ Caminho correto
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#010101',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '0.9rem',
          },
          error: { style: { background: '#FE2C55' } },
          success: { style: { background: '#25F4EE', color: '#000000' } }
        }}
      />
    </>
  );
}