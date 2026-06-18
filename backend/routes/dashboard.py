from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.analytics import AnalyticsEngine
from models import VideoMetrics
from database import get_db  # ✅ Importa a conexão
from typing import List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview")
async def get_overview(user_id: str, db: Session = Depends(get_db)):
    """Retorna visão geral das métricas do banco de dados"""
    # ✅ Consulta real no banco
    videos = db.query(VideoMetrics).all()  # Você pode filtrar por user_id se adicionar o campo

    if not videos:
        return {
            "total_videos": 0,
            "total_views": 0,
            "total_likes": 0,
            "avg_engagement_rate": 0,
            "best_posting_times": [],
            "top_hashtags": []
        }
    
    total_views = sum(v.views for v in videos)
    total_likes = sum(v.likes for v in videos)
    
    avg_engagement = sum(
        AnalyticsEngine.calculate_engagement_rate(v) for v in videos
    ) / len(videos)

    return {
        "total_videos": len(videos),
        "total_views": total_views,
        "total_likes": total_likes,
        "avg_engagement_rate": round(avg_engagement, 2),
        "best_posting_times": AnalyticsEngine.best_posting_times(videos),
        "top_hashtags": AnalyticsEngine.hashtag_performance(videos)[:10]
    }


@router.get("/video/{video_id}")
async def get_video_analytics(video_id: str, db: Session = Depends(get_db)):
    """Métricas detalhadas de um vídeo"""
    video = db.query(VideoMetrics).filter(VideoMetrics.video_id == video_id).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    
    return {
        "video_id": video.video_id,
        "description": video.description,
        "views": video.views,
        "likes": video.likes,
        "comments": video.comments,
        "shares": video.shares,
        "save_count": video.save_count,
        "engagement_rate": video.engagement_rate,
        "hashtags": video.hashtags,
        "posted_at": video.posted_at.isoformat() if video.posted_at else None
    }