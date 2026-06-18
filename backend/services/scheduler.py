"""
Módulo de agendamento — coleta periódica de métricas do TikTok.
Pode ser executado como um serviço separado (cron job, Celery, ou background task).
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import httpx

from models import VideoMetrics, HashtagPerformance
from services.analytics import AnalyticsEngine
from services.tiktok_api import TikTokAPIClient

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configurações (idealmente via variáveis de ambiente)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/tiktok_analytics")
COLLECTION_INTERVAL_HOURS = int(os.getenv("COLLECTION_INTERVAL_HOURS", "6"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_DELAY_SECONDS = int(os.getenv("RETRY_DELAY_SECONDS", "30"))

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class MetricsCollector:
    """
    Coletor de métricas — responsável por buscar dados da API do TikTok
    e armazenar no banco de dados.
    """
    
    def __init__(self, access_token: str, user_id: str):
        self.access_token = access_token
        self.user_id = user_id
        self.api_client = TikTokAPIClient(access_token)
        self.db = SessionLocal()
    
    def __del__(self):
        if hasattr(self, 'db') and self.db:
            self.db.close()
    
    async def collect_all_metrics(self) -> dict:
        """Coleta todas as métricas disponíveis para o usuário"""
        results = {
            "videos_collected": 0,
            "hashtags_updated": 0,
            "errors": [],
            "collected_at": datetime.utcnow().isoformat()
        }
        
        try:
            # 1. Coleta dados dos vídeos
            videos_data = await self._collect_videos_metrics()
            results["videos_collected"] = len(videos_data)
            
            # 2. Atualiza performance de hashtags
            hashtags_count = await self._update_hashtag_performance(videos_data)
            results["hashtags_updated"] = hashtags_count
            
            # 3. Limpa dados antigos (opcional)
            await self._cleanup_old_data()
            
            logger.info(
                f"Coleta concluída: {results['videos_collected']} vídeos, "
                f"{results['hashtags_updated']} hashtags"
            )
            
        except Exception as e:
            logger.error(f"Erro durante coleta de métricas: {str(e)}")
            results["errors"].append(str(e))
        
        return results
    
    async def _collect_videos_metrics(self) -> List[dict]:
        """Coleta métricas de todos os vídeos do usuário"""
        all_videos = []
        
        try:
            # Busca lista de vídeos
            videos_response = await self.api_client.get_user_videos(
                username=self.user_id,
                max_count=50  # Ajuste conforme necessidade
            )
            
            videos_list = videos_response.get("data", {}).get("videos", [])
            
            for video_data in videos_list:
                try:
                    video_id = video_data.get("id")
                    
                    # Busca métricas detalhadas
                    analytics = await self.api_client.get_video_analytics(video_id)
                    
                    # Extrai hashtags da descrição
                    description = video_data.get("description", "")
                    hashtags = self._extract_hashtags(description)
                    
                    # Estrutura os dados
                    video_metrics = {
                        "video_id": video_id,
                        "description": description,
                        "views": analytics.get("views", 0),
                        "likes": analytics.get("likes", 0),
                        "comments": analytics.get("comments", 0),
                        "shares": analytics.get("shares", 0),
                        "save_count": analytics.get("saves", 0),
                        "hashtags": hashtags,
                        "posted_at": datetime.fromtimestamp(
                            video_data.get("create_time", 0)
                        ),
                        "engagement_rate": 0.0  # Será calculado depois
                    }
                    
                    # Calcula taxa de engajamento
                    if video_metrics["views"] > 0:
                        total_eng = (
                            video_metrics["likes"] +
                            video_metrics["comments"] +
                            video_metrics["shares"]
                        )
                        video_metrics["engagement_rate"] = round(
                            (total_eng / video_metrics["views"]) * 100, 2
                        )
                    
                    # Salva no banco
                    self._save_video_metrics(video_metrics)
                    all_videos.append(video_metrics)
                    
                    logger.debug(f"Métricas coletadas para vídeo {video_id}")
                    
                except Exception as e:
                    logger.warning(
                        f"Erro ao processar vídeo {video_data.get('id', 'desconhecido')}: {str(e)}"
                    )
                    continue
            
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            raise e
        
        return all_videos
    
    async def _update_hashtag_performance(self, videos_data: List[dict]) -> int:
        """Atualiza a tabela de performance de hashtags"""
        hashtag_stats = {}
        
        for video in videos_data:
            for tag in video.get("hashtags", []):
                if tag not in hashtag_stats:
                    hashtag_stats[tag] = {
                        "total_views": 0,
                        "total_likes": 0,
                        "total_engagement": 0,
                        "video_count": 0,
                        "last_used": video["posted_at"]
                    }
                
                stats = hashtag_stats[tag]
                stats["total_views"] += video["views"]
                stats["total_likes"] += video["likes"]
                stats["total_engagement"] += (
                    video["likes"] + video["comments"] + video["shares"]
                )
                stats["video_count"] += 1
                
                if video["posted_at"] > stats["last_used"]:
                    stats["last_used"] = video["posted_at"]
        
        # Salva/atualiza no banco
        updated_count = 0
        for tag, stats in hashtag_stats.items():
            try:
                # Verifica se já existe
                existing = self.db.query(HashtagPerformance).filter(
                    HashtagPerformance.hashtag == tag
                ).first()
                
                if existing:
                    # Atualiza
                    existing.total_views = stats["total_views"]
                    existing.total_likes = stats["total_likes"]
                    existing.avg_engagement = round(
                        stats["total_engagement"] / stats["video_count"], 2
                    ) if stats["video_count"] > 0 else 0
                    existing.video_count = stats["video_count"]
                    existing.last_used = stats["last_used"]
                else:
                    # Cria novo
                    new_entry = HashtagPerformance(
                        hashtag=tag,
                        total_views=stats["total_views"],
                        total_likes=stats["total_likes"],
                        avg_engagement=round(
                            stats["total_engagement"] / stats["video_count"], 2
                        ) if stats["video_count"] > 0 else 0,
                        video_count=stats["video_count"],
                        last_used=stats["last_used"]
                    )
                    self.db.add(new_entry)
                
                updated_count += 1
                
            except Exception as e:
                logger.warning(f"Erro ao atualizar hashtag {tag}: {str(e)}")
                continue
        
        self.db.commit()
        return updated_count
    
    async def _cleanup_old_data(self, days_to_keep: int = 90):
        """Remove dados mais antigos que o período especificado"""
        try:
            cutoff = datetime.utcnow() - timedelta(days=days_to_keep)
            
            deleted_videos = self.db.query(VideoMetrics).filter(
                VideoMetrics.collected_at < cutoff
            ).delete()
            
            deleted_hashtags = self.db.query(HashtagPerformance).filter(
                HashtagPerformance.last_used < cutoff
            ).delete()
            
            self.db.commit()
            
            if deleted_videos > 0 or deleted_hashtags > 0:
                logger.info(
                    f"Limpeza: {deleted_videos} vídeos e {deleted_hashtags} hashtags removidos"
                )
                
        except Exception as e:
            self.db.rollback()
            logger.warning(f"Erro durante limpeza de dados: {str(e)}")
    
    def _save_video_metrics(self, metrics: dict):
        """Salva ou atualiza métricas de um vídeo no banco"""
        existing = self.db.query(VideoMetrics).filter(
            VideoMetrics.video_id == metrics["video_id"]
        ).first()
        
        if existing:
            # Atualiza métricas existentes
            existing.views = metrics["views"]
            existing.likes = metrics["likes"]
            existing.comments = metrics["comments"]
            existing.shares = metrics["shares"]
            existing.save_count = metrics["save_count"]
            existing.engagement_rate = metrics["engagement_rate"]
            existing.collected_at = datetime.utcnow()
        else:
            # Cria novo registro
            new_metrics = VideoMetrics(
                video_id=metrics["video_id"],
                description=metrics["description"],
                views=metrics["views"],
                likes=metrics["likes"],
                comments=metrics["comments"],
                shares=metrics["shares"],
                save_count=metrics["save_count"],
                hashtags=metrics["hashtags"],
                posted_at=metrics["posted_at"],
                collected_at=datetime.utcnow(),
                engagement_rate=metrics["engagement_rate"]
            )
            self.db.add(new_metrics)
    
    @staticmethod
    def _extract_hashtags(text: str) -> List[str]:
        """Extrai hashtags de um texto"""
        import re
        hashtags = re.findall(r'#(\w+)', text)
        return [tag.lower() for tag in hashtags]


class SchedulerService:
    """
    Serviço de agendamento — gerencia execução periódica das coletas.
    Pode ser usado com Celery, APScheduler, ou como script standalone.
    """
    
    def __init__(self):
        self.collectors = {}  # user_id -> MetricsCollector
        self.running = False
    
    async def run_once(self, access_token: str, user_id: str) -> dict:
        """Executa uma coleta única para um usuário"""
        collector = MetricsCollector(access_token, user_id)
        return await collector.collect_all_metrics()
    
    async def run_for_all_users(self, db_session: Session):
        """Executa coleta para todos os usuários ativos"""
        # Busca todos os usuários com tokens válidos
        users = db_session.query(UserTokens).filter(
            UserTokens.expires_at > datetime.utcnow()
        ).all()
        
        results = []
        for user in users:
            try:
                result = await self.run_once(user.access_token, user.user_id)
                results.append({
                    "user_id": user.user_id,
                    "success": True,
                    "result": result
                })
                logger.info(f"Coleta concluída para usuário {user.user_id}")
            except Exception as e:
                logger.error(f"Erro na coleta para usuário {user.user_id}: {str(e)}")
                results.append({
                    "user_id": user.user_id,
                    "success": False,
                    "error": str(e)
                })
        
        return results
    
    async def start_periodic_collection(self, interval_hours: int = COLLECTION_INTERVAL_HOURS):
        """Inicia coleta periódica em loop"""
        self.running = True
        logger.info(f"Iniciando coleta periódica a cada {interval_hours} horas")
        
        while self.running:
            try:
                db = SessionLocal()
                await self.run_for_all_users(db)
                db.close()
            except Exception as e:
                logger.error(f"Erro na coleta periódica: {str(e)}")
            
            # Aguarda o intervalo
            await asyncio.sleep(interval_hours * 3600)
    
    def stop(self):
        """Para a coleta periódica"""
        self.running = False
        logger.info("Coleta periódica interrompida")


# Funções auxiliares para uso com Celery ou cron

async def scheduled_collection_job():
    """Job que pode ser chamado por Celery Beat ou cron"""
    scheduler = SchedulerService()
    db = SessionLocal()
    
    try:
        results = await scheduler.run_for_all_users(db)
        logger.info(f"Job concluído: {len(results)} usuários processados")
        return results
    finally:
        db.close()


def run_scheduled_collection():
    """Wrapper síncrono para uso com Celery ou cron"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        results = loop.run_until_complete(scheduled_collection_job())
        return results
    finally:
        loop.close()


# Modelo adicional para armazenar tokens dos usuários (precisa ser adicionado ao models.py)

"""
class UserTokens(Base):
    __tablename__ = "user_tokens"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, unique=True, index=True)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
"""


# Exemplo de uso como script standalone
if __name__ == "__main__":
    import os
    
    # Modo: execução única
    if len(sys.argv) > 2:
        access_token = sys.argv[1]
        user_id = sys.argv[2]
        
        async def main():
            collector = MetricsCollector(access_token, user_id)
            result = await collector.collect_all_metrics()
            print(f"Resultado: {result}")
        
        asyncio.run(main())
    
    # Modo: serviço contínuo
    else:
        scheduler = SchedulerService()
        try:
            asyncio.run(scheduler.start_periodic_collection())
        except KeyboardInterrupt:
            scheduler.stop()
            print("Serviço encerrado.")