import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../services/api';
import { setSessionToken, setUserData, isAuthenticated } from '../services/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

// ✅ Componente FeatureItem que estava faltando
const FeatureItem = ({ text }) => (
  <div className="flex items-center space-x-2">
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
    <span className="text-gray-600 text-sm">{text}</span>
  </div>
);

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Se já estiver logado, vai para o dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  // ✅ Processa o retorno do OAuth do TikTok (quando tem o código na URL)
  useEffect(() => {
    const { code, error: oauthError } = router.query;

    // Se o usuário negou permissão
    if (oauthError) {
      setError('Permissão negada ou erro na autenticação.');
      setLoading(false);
      return;
    }

    // Se tem código, processa
    if (code && !loading) {
      handleCallback(code);
    }
  }, [router.query]);

  // ✅ Troca o código de autorização pelo token de acesso
  const handleCallback = async (code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.handleCallback(code);
      
      // ✅ Ajuste aqui conforme o que sua API retorna
      const { access_token: session_token, user } = response.data;
      
      setSessionToken(session_token);
      setUserData(user);
      
      // ✅ Limpa a URL e redireciona
      router.replace('/dashboard');
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setError(err.response?.data?.detail || 'Falha na autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chama sua API para pegar a URL de login do TikTok
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getLoginUrl();
      // ✅ Redireciona para o TikTok
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError('Erro ao conectar com o TikTok. Verifique sua conexão.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Conectando ao TikTok..." />
      </div>
    );
  }

  return (
    <Layout title="Login | TKAnalytics">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#010101] via-[#161616] to-[#010101]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-[#FE2C55]">TK</span>
              <span className="text-[#25F4EE]">Analytics</span>
            </h1>
            <p className="text-gray-500">
              Analise e otimize seu desempenho no TikTok
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <FeatureItem text="Análise detalhada de métricas" />
            <FeatureItem text="Melhores horários para postar" />
            <FeatureItem text="Performance de hashtags" />
            <FeatureItem text="Sugestões inteligentes" />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#010101] text-white py-3 px-6 rounded-xl text-sm font-semibold hover:bg-[#161616] disabled:opacity-50 transition-colors flex items-center justify-center space-x-3"
          >
            {/* ✅ Ícone do TikTok completo e correto */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2-.5-3.02-.54-2.1-.1-4.2.56-5.85 1.88-1.63 1.32-2.59 3.22-2.7 5.24-.11 2.2.83 4.33 2.42 5.68 1.57 1.34 3.66 1.93 5.71 1.64 2.09-.29 4.07-1.44 5.43-3.19 1.36-1.75 2.09-3.95 2.09-6.18V.02h-3.98z" />
            </svg>
            <span>Entrar com TikTok</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}