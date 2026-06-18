import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getUserData } from '../services/auth';
import { dashboardAPI } from '../services/api';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import BestTimesChart from '../components/BestTimesChart';
import HashtagTable from '../components/HashtagTable';
import VideoList from '../components/VideoList';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye, Heart, BarChart3, TrendingUp, RefreshCw, Calendar } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const user = getUserData();
  const [data, setData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30'); // dias

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const overviewResponse = await dashboardAPI.getOverview(user?.user_id);
      setData(overviewResponse.data);
      
      // Também busca lista de vídeos
      if (overviewResponse.data?.videos) {
        setVideos(overviewResponse.data.videos);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!isAuthenticated()) return null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Carregando suas métricas..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.display_name || user?.username}
          </h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao seu dashboard de análise</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Seletor de período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2C55] focus:border-transparent"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="text-sm font-medium text-red-600 hover:text-red-800 mt-1 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Visualizações Totais"
          value={formatNumber(data?.total_views)}
          subtitle="Em todos os vídeos"
          icon={Eye}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Curtidas Totais"
          value={formatNumber(data?.total_likes)}
          subtitle="Em todos os vídeos"
          icon={Heart}
          color="bg-red-100 text-red-600"
        />
        <MetricCard
          title="Taxa de Engajamento"
          value={`${data?.avg_engagement_rate || 0}%`}
          subtitle="Média geral"
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <MetricCard
          title="Total de Vídeos"
          value={data?.total_videos || 0}
          subtitle="Publicados"
          icon={BarChart3}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Melhores Horários */}
        <BestTimesChart data={data?.best_posting_times} />
        
        {/* Últimos dias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Vídeos no período</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{videos.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Média de views/vídeo</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {videos.length > 0 
                  ? formatNumber(Math.round(data?.total_views / videos.length))
                  : '0'
                }
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Média de likes/vídeo</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {videos.length > 0
                  ? formatNumber(Math.round(data?.total_likes / videos.length))
                  : '0'
                }
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">Melhor dia para postar</span>
              </div>
              <span className="text-lg font-bold text-[#FE2C55]">
                {data?.best_posting_times?.best_days 
                  ? Object.keys(data.best_posting_times.best_days)[0] || '-'
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Hashtags */}
      <div className="mb-8">
        <HashtagTable 
          hashtags={data?.top_hashtags} 
          loading={loading}
        />
      </div>

      {/* Lista de Vídeos */}
      <div className="mb-8">
        <VideoList 
          videos={videos} 
          loading={loading}
        />
      </div>
    </Layout>
  );
}

function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}