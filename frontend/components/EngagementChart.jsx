import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EngagementChart({ videos = [], days = 30 }) {
  if (!videos?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engajamento ao Longo do Tempo</h3>
        <p className="text-gray-500">Publique vídeos para ver seu engajamento ao longo do tempo.</p>
      </div>
    );
  }

  // Gera array de datas dos últimos N dias
  const today = new Date();
  const startDate = subDays(today, days);
  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  // Agrupa métricas por dia
  const dailyMetrics = dateRange.map(date => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayVideos = videos.filter(v => {
      const postDate = new Date(v.posted_at);
      return postDate >= dayStart && postDate <= dayEnd;
    });

    return {
      date,
      views: dayVideos.reduce((sum, v) => sum + (v.views || 0), 0),
      likes: dayVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
      comments: dayVideos.reduce((sum, v) => sum + (v.comments || 0), 0),
      shares: dayVideos.reduce((sum, v) => sum + (v.shares || 0), 0),
      engagement: dayVideos.reduce((sum, v) => {
        const total = (v.likes || 0) + (v.comments || 0) + (v.shares || 0);
        return sum + total;
      }, 0)
    };
  });

  const labels = dailyMetrics.map(d =>
    format(d.date, "dd MMM", { locale: ptBR })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Visualizações',
        data: dailyMetrics.map(d => d.views),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Curtidas',
        data: dailyMetrics.map(d => d.likes),
        borderColor: '#FE2C55',
        backgroundColor: 'rgba(254, 44, 85, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FE2C55',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Engajamento Total',
        data: dailyMetrics.map(d => d.engagement),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter',
          },
        },
      },
      tooltip: {
        backgroundColor: '#010101',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatNumber(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          color: '#8A8B91',
          callback: function(value) {
            return formatNumber(value);
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#8A8B91',
          callback: function(value) {
            return formatNumber(value);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8A8B91',
          maxRotation: 45,
          maxTicksLimit: 15,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Engajamento ao Longo do Tempo</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="inline-block w-3 h-0.5 bg-blue-500 rounded"></span>
          <span>Views</span>
          <span className="inline-block w-3 h-0.5 bg-[#FE2C55] rounded ml-2"></span>
          <span>Likes</span>
          <span className="inline-block w-3 h-0.5 bg-green-500 rounded ml-2"></span>
          <span>Engajamento</span>
        </div>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}