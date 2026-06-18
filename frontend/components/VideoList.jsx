import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react';

export default function VideoList({ videos, loading }) {
  const [expandedVideo, setExpandedVideo] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Vídeos</h3>
        <p className="text-gray-500">Nenhum vídeo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Vídeos</h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.video_id} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedVideo(
                expandedVideo === video.video_id ? null : video.video_id
              )}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {video.description || 'Sem descrição'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(video.posted_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              {expandedVideo === video.video_id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedVideo === video.video_id && (
              <div className="px-4 pb-3 border-t border-gray-100 pt-3">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Views</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatNumber(video.views)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">Curtidas</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatNumber(video.likes)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">Coment.</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatNumber(video.comments)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">Compart.</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatNumber(video.shares)}
                    </p>
                  </div>
                </div>
                {video.hashtags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {video.hashtags.map(tag => (
                      <span key={tag} className="text-xs text-[#FE2C55] bg-pink-50 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-center">
                  <span className={`text-sm font-semibold ${
                    video.engagement_rate > 10 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Engajamento: {video.engagement_rate}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
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