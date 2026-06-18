from typing import List, Dict
from models import VideoMetrics
from collections import Counter

class AnalyticsEngine:
    @staticmethod
    def calculate_engagement_rate(video: VideoMetrics) -> float:
        """Taxa de engajamento = (curtidas + comentários + compartilhamentos + salvamentos) / visualizações"""
        if video.views == 0:
            return 0.0
        total_interactions = video.likes + video.comments + video.shares + video.save_count
        return round((total_interactions / video.views) * 100, 2)

    @staticmethod
    def best_posting_times(videos: List[VideoMetrics]) -> List[Dict]:
        """Analisa horários com melhor desempenho"""
        times = {}
        for v in videos:
            if not v.posted_at:
                continue
            hora = v.posted_at.hour
            engajamento = AnalyticsEngine.calculate_engagement_rate(v)
            if hora not in times:
                times[hora] = {"total": 0, "count": 0}
            times[hora]["total"] += engajamento
            times[hora]["count"] += 1

        resultado = []
        for hora, dados in times.items():
            media = round(dados["total"] / dados["count"], 2)
            resultado.append({"hour": hora, "avg_engagement": media})

        return sorted(resultado, key=lambda x: x["avg_engagement"], reverse=True)

    @staticmethod
    def hashtag_performance(videos: List[VideoMetrics]) -> List[Dict]:
        """Desempenho das hashtags mais usadas"""
        todas_hashtags = []
        for v in videos:
            if v.hashtags:
                todas_hashtags.extend(v.hashtags)

        contagem = Counter(todas_hashtags)
        return [{"tag": tag, "count": qtd} for tag, qtd in contagem.most_common()]