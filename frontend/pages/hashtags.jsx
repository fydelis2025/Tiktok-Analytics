import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getUserData } from '../services/auth';
import { hashtagsAPI } from '../services/api';
import Layout from '../components/Layout';
import HashtagTable from '../components/HashtagTable';
import HashtagSuggestions from '../components/HashtagSuggestions';
import LoadingSpinner from '../components/LoadingSpinner';
import { Hash, TrendingUp, RefreshCw, Search, AlertCircle } from 'lucide-react';

export default function HashtagsPage() {
  const router = useRouter();
  const user = getUserData();
  const [topHashtags, setTopHashtags] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('top');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [topResponse, trendingResponse] = await Promise.all([
        hashtagsAPI.getTop(user?.user_id, { limit: 50, days: 30 }),
        hashtagsAPI.getTrending(20)
      ]);

      setTopHashtags(topResponse.data?.hashtags || []);
      setTrending(trendingResponse.data?.trending || []);
    } catch (err) {
      console.error('Erro ao carregar hashtags:', err);
      setError('Não foi possível carregar as hashtags. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHashtags = topHashtags.filter(tag =>
    tag.hashtag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise de Hashtags</h1>
          <p className="text-gray-500 mt-1">
            Descubra quais hashtags geram mais engajamento para seu conteúdo
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={fetchData} className="text-sm font-medium underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('top')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'top'
              ? 'bg-white text-[#FE2C55] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4" />
            <span>Minhas Hashtags</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trending'
              ? 'bg-white text-[#FE2C55] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Em Alta</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-white text-[#FE2C55] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Sugestões</span>
          </div>
        </button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Carregando hashtags..." />
        </div>
      ) : (
        <>
          {/* Aba: Minhas Hashtags */}
          {activeTab === 'top' && (
            <div className="space-y-6">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar hashtag..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2C55] focus:border-transparent"
                />
              </div>

              <HashtagTable hashtags={filteredHashtags} loading={false} />
            </div>
          )}

          {/* Aba: Em Alta */}
          {activeTab === 'trending' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#FE2C55]" />
                <span>Hashtags em Alta no Momento</span>
              </h3>
              
              {trending.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma hashtag em alta encontrada no momento.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {trending.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-gradient-to-br from-[#FE2C55]/5 to-[#25F4EE]/5 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-[#FE2C55]">#{tag.hashtag}</p>
                        <p className="text-xs text-gray-400">
                          {tag.volume ? `${formatNumber(tag.volume)} posts` : 'Em alta'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aba: Sugestões */}
          {activeTab === 'suggestions' && (
            <HashtagSuggestions />
          )}
        </>
      )}
    </Layout>
  );
}

function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}