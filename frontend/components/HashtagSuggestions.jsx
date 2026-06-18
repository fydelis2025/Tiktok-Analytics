import { useState } from 'react';
import { Search, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { hashtagsAPI } from '../services/api';

export default function HashtagSuggestions() {
  const [contentType, setContentType] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contentTypes = [
    'danca', 'comedia', 'tutorial', 'gaming', 'musica',
    'esporte', 'moda', 'beleza', 'comida', 'viagem',
    'animais', 'educacao', 'tecnologia', 'arte', 'outro'
  ];

  const handleSearch = async () => {
    if (!contentType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { content_type: contentType };
      if (niche) params.niche = niche;
      
      const response = await hashtagsAPI.getSuggestions(params);
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      setError('Erro ao buscar sugestões. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sugestões de Hashtags</h3>
      
      <div className="space-y-4">
        {/* Tipo de Conteúdo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Conteúdo
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2C55] focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {contentTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Nicho (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nicho (opcional)
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: maquiagem, futebol, programação..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2C55] focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !contentType}
          className="w-full bg-[#FE2C55] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#e0244e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Buscar Sugestões</span>
            </>
          )}
        </button>

        {/* Erro */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultados */}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#FE2C55]" />
              <span>Hashtags Recomendadas</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestions.map((sug, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(sug.hashtag);
                    // toast.success(`#${sug.hashtag} copiado!`);
                  }}
                >
                  <span className="text-sm font-medium text-[#FE2C55]">#{sug.hashtag}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    sug.competition_level === 'baixa'
                      ? 'bg-green-100 text-green-700'
                      : sug.competition_level === 'média'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {sug.competition_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}