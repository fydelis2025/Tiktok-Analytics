import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HashtagTable({ hashtags, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hashtags?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtags com Melhor Performance</h3>
        <p className="text-gray-500">Nenhuma hashtag encontrada. Poste vídeos com hashtags para começar.</p>
      </div>
    );
  }

  const getTrendIcon = (engagement) => {
    if (engagement > 10) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (engagement < 3) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtags com Melhor Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hashtag</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views Médias</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Curtidas Médias</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Eng./View</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vídeos</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hashtags.map((tag, index) => (
              <tr key={tag.hashtag} className="hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <span className="text-sm font-medium text-[#FE2C55]">
                    #{tag.hashtag}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-700">{formatNumber(tag.avg_views)}</td>
                <td className="py-3 text-sm text-gray-700">{formatNumber(tag.avg_likes)}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tag.engagement_per_view > 10
                      ? 'bg-green-100 text-green-800'
                      : tag.engagement_per_view > 3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tag.engagement_per_view}%
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-700">{tag.video_count}</td>
                <td className="py-3">
                  {getTrendIcon(tag.engagement_per_view)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}