from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.analytics import AnalyticsEngine
from models import VideoMetrics, HashtagPerformance
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
import os

router = APIRouter(prefix="/api/hashtags", tags=["hashtags"])

class HashtagSuggestion(BaseModel):
    hashtag: str
    relevance_score: float
    estimated_views: int
    competition_level: str  # "baixa", "média", "alta"
    trending: bool

# --- Funções auxiliares fictícias (substituir pela integração real com banco) ---

def get_videos_since(user_id: str, cutoff: datetime) -> list:
    """Mock: retorna lista vazia. Em produção, consultar o banco de dados."""
    return []

async def fetch_trending_hashtags(limit: int = 20) -> list:
    """Mock: retorna hashtags fictícias. Em produção, usar scraping ou API."""
    return [
        {"hashtag": "fyp", "volume": 85000000},
        {"hashtag": "viral", "volume": 42000000},
        {"hashtag": "paravoce", "volume": 38000000},
        {"hashtag": "fy", "volume": 25000000},
        {"hashtag": "tiktok", "volume": 22000000},
        {"hashtag": "trending", "volume": 18000000},
        {"hashtag": "humor", "volume": 15000000},
        {"hashtag": "danca", "volume": 12000000},
        {"hashtag": "comedia", "volume": 10000000},
        {"hashtag": "music", "volume": 9500000},
        {"hashtag": "love", "volume": 8500000},
        {"hashtag": "cute", "volume": 7800000},
        {"hashtag": "foryou", "volume": 7200000},
        {"hashtag": "follow", "volume": 6500000},
        {"hashtag": "like", "volume": 6000000},
        {"hashtag": "memes", "volume": 5500000},
        {"hashtag": "brasil", "volume": 5000000},
        {"hashtag": "foryoupage", "volume": 4800000},
        {"hashtag": "explore", "volume": 4200000},
        {"hashtag": "video", "volume": 3800000},
    ][:limit]

async def generate_hashtag_suggestions(content_type: str, niche: Optional[str] = None) -> list:
    """Mock: sugestões baseadas no tipo de conteúdo."""
    suggestions_db = {
        "danca": [
            {"hashtag": "danca", "relevance_score": 95, "estimated_views": 50000, "competition_level": "alta", "trending": True},
            {"hashtag": "dancando", "relevance_score": 90, "estimated_views": 30000, "competition_level": "alta", "trending": True},
            {"hashtag": "coreografia", "relevance_score": 85, "estimated_views": 25000, "competition_level": "media", "trending": True},
            {"hashtag": "passinhos", "relevance_score": 80, "estimated_views": 15000, "competition_level": "media", "trending": False},
            {"hashtag": "dancatiktok", "relevance_score": 78, "estimated_views": 20000, "competition_level": "alta", "trending": True},
            {"hashtag": "dancachallenge", "relevance_score": 75, "estimated_views": 40000, "competition_level": "media", "trending": True},
            {"hashtag": "justdance", "relevance_score": 70, "estimated_views": 18000, "competition_level": "media", "trending": False},
        ],
        "comedia": [
            {"hashtag": "comedia", "relevance_score": 95, "estimated_views": 60000, "competition_level": "alta", "trending": True},
            {"hashtag": "humor", "relevance_score": 92, "estimated_views": 55000, "competition_level": "alta", "trending": True},
            {"hashtag": "piadas", "relevance_score": 85, "estimated_views": 25000, "competition_level": "media", "trending": False},
            {"hashtag": "memes", "relevance_score": 82, "estimated_views": 35000, "competition_level": "alta", "trending": True},
            {"hashtag": "risadas", "relevance_score": 78, "estimated_views": 20000, "competition_level": "media", "trending": False},
            {"hashtag": "comediaemvideo", "relevance_score": 75, "estimated_views": 15000, "competition_level": "baixa", "trending": False},
            {"hashtag": "sketch", "relevance_score": 72, "estimated_views": 12000, "competition_level": "baixa", "trending": False},
        ],
        "tutorial": [
            {"hashtag": "tutorial", "relevance_score": 95, "estimated_views": 30000, "competition_level": "alta", "trending": True},
            {"hashtag": "aprenda", "relevance_score": 88, "estimated_views": 20000, "competition_level": "media", "trending": True},
            {"hashtag": "diy", "relevance_score": 85, "estimated_views": 25000, "competition_level": "alta", "trending": True},
            {"hashtag": "comofazer", "relevance_score": 82, "estimated_views": 22000, "competition_level": "media", "trending": True},
            {"hashtag": "passoapasso", "relevance_score": 78, "estimated_views": 15000, "competition_level": "media", "trending": False},
            {"hashtag": "dicas", "relevance_score": 75, "estimated_views": 18000, "competition_level": "media", "trending": True},
        ],
        "gaming": [
            {"hashtag": "gaming", "relevance_score": 95, "estimated_views": 45000, "competition_level": "alta", "trending": True},
            {"hashtag": "games", "relevance_score": 90, "estimated_views": 40000, "competition_level": "alta", "trending": True},
            {"hashtag": "gameplay", "relevance_score": 85, "estimated_views": 30000, "competition_level": "alta", "trending": True},
            {"hashtag": "gamer", "relevance_score": 82, "estimated_views": 28000, "competition_level": "alta", "trending": True},
            {"hashtag": "freefire", "relevance_score": 80, "estimated_views": 35000, "competition_level": "alta", "trending": True},
            {"hashtag": "minecraft", "relevance_score": 78, "estimated_views": 32000, "competition_level": "alta", "trending": True},
        ],
        "musica": [
            {"hashtag": "musica", "relevance_score": 95, "estimated_views": 40000, "competition_level": "alta", "trending": True},
            {"hashtag": "music", "relevance_score": 92, "estimated_views": 38000, "competition_level": "alta", "trending": True},
            {"hashtag": "cantando", "relevance_score": 85, "estimated_views": 25000, "competition_level": "media", "trending": True},
            {"hashtag": "cover", "relevance_score": 82, "estimated_views": 22000, "competition_level": "media", "trending": True},
            {"hashtag": "vocal", "relevance_score": 78, "estimated_views": 18000, "competition_level": "media", "trending": False},
            {"hashtag": "instrumento", "relevance_score": 75, "estimated_views": 15000, "competition_level": "baixa", "trending": False},
        ],
    }
    
    # Fallback para genérico
    default = [
        {"hashtag": content_type, "relevance_score": 90, "estimated_views": 20000, "competition_level": "media", "trending": True},
        {"hashtag": "tiktok", "relevance_score": 85, "estimated_views": 30000, "competition_level": "alta", "trending": True},
        {"hashtag": "fyp", "relevance_score": 80, "estimated_views": 50000, "competition_level": "alta", "trending": True},
        {"hashtag": "viral", "relevance_score": 75, "estimated_views": 40000, "competition_level": "alta", "trending": True},
        {"hashtag": "paravoce", "relevance_score": 70, "estimated_views": 35000, "competition_level": "alta", "trending": True},
    ]
    
    suggestions = suggestions_db.get(content_type.lower(), default)
    
    # Se tiver nicho, filtra ou adiciona sugestão específica
    if niche:
        suggestions.insert(0, {
            "hashtag": niche.lower().replace(" ", ""),
            "relevance_score": 98,
            "estimated_views": 10000,
            "competition_level": "baixa",
            "trending": False
        })
    
    return suggestions

# --- Rotas ---

@router.get("/top")
async def get_top_hashtags(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    days: int = Query(default=30, ge=1, le=365)
):
    """Retorna as hashtags com melhor performance para o usuário"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    videos = get_videos_since(user_id, cutoff)
    
    performance = AnalyticsEngine.hashtag_performance(videos)
    return {"hashtags": performance[:limit], "total_analyzed": len(performance)}

@router.get("/suggestions")
async def suggest_hashtags(
    content_type: str = Query(..., description="Tipo de conteúdo ex: danca, comedia, tutorial"),
    niche: Optional[str] = Query(None, description="Nicho específico")
):
    """Sugere hashtags com base no tipo de conteúdo e nicho"""
    suggestions = await generate_hashtag_suggestions(content_type, niche)
    return {"suggestions": suggestions}

@router.get("/trending")
async def get_trending_hashtags(limit: int = Query(default=20)):
    """Retorna hashtags em alta no momento"""
    trending = await fetch_trending_hashtags(limit)
    return {"trending": trending, "captured_at": datetime.utcnow().isoformat()}

@router.get("/{hashtag}/analytics")
async def get_hashtag_analytics(
    hashtag: str,
    user_id: Optional[str] = None
):
    """Análise detalhada de uma hashtag específica"""
    return {
        "hashtag": hashtag,
        "total_videos_estimated": 1250000,
        "views_in_last_24h": 45000,
        "trend_direction": "up",
        "related_hashtags": [f"{hashtag}challenge", f"{hashtag}love", f"best{hashtag}"],
        "avg_engagement_rate": 4.5,
        "analyzed_at": datetime.utcnow().isoformat()
    }