import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../services/auth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  // ✅ Melhorado: espera verificar autenticação antes de renderizar
  useEffect(() => {
    // Verifica se está no cliente (evita erro no servidor)
    if (typeof window !== 'undefined') {
      if (isAuthenticated()) {
        router.replace('/dashboard');
      } else {
        setCarregando(false);
      }
    }
  }, [router]);

  // Enquanto verifica, mostra nada ou loading
  if (carregando) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#010101] via-[#161616] to-[#010101] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold">
            <span className="text-[#FE2C55]">TK</span>
            <span className="text-[#25F4EE]">Analytics</span>
          </div>
          <Link
            href="/login"
            className="bg-[#FE2C55] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#e0244e] transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Analise e Otimize seu{' '}
            <span className="text-[#FE2C55]">TikTok</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Descubra os melhores horários para postar, hashtags com maior performance 
            e métricas detalhadas para fazer seu conteúdo crescer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-[#FE2C55]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#FE2C55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Métricas em Tempo Real</h3>
              <p className="text-gray-400 text-sm">
                Acompanhe visualizações, curtidas, comentários e compartilhamentos de todos os seus vídeos.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-[#25F4EE]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#25F4EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Melhores Horários</h3>
              <p className="text-gray-400 text-sm">
                Descubra exatamente quando seu público está mais engajado para maximizar o alcance.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Análise de Hashtags</h3>
              <p className="text-gray-400 text-sm">
                Veja quais hashtags geram mais engajamento e receba sugestões inteligentes.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-[#FE2C55] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-[#e0244e] transition-colors"
          >
            <span>Começar Agora</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-gray-500 text-sm">
        <p>TK Analytics &copy; {new Date().getFullYear()} — Ferramenta de análise para TikTok</p>
      </footer>
    </div>
  );
}