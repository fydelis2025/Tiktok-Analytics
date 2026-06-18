import httpx
import os
from typing import Optional

class TikTokAPIClient:
    """Cliente para a API oficial do TikTok (requer conta Business/Creator)"""
    
    BASE_URL = "https://open-api.tiktok.com"
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.client = httpx.Client(
            base_url=self.BASE_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    def get_user_videos(self, username: str, max_count: int = 20):
        """Obtém vídeos recentes de um usuário"""
        response = self.client.get(
            f"/video/list/",
            params={
                "username": username,
                "max_count": max_count
            }
        )
        response.raise_for_status()
        return response.json()
    
    def get_video_analytics(self, video_id: str):
        """Métricas detalhadas de um vídeo específico"""
        response = self.client.get(
            f"/video/analytics/",
            params={"video_id": video_id}
        )
        response.raise_for_status()
        return response.json()
    
    def get_followers_analytics(self):
        """Dados demográficos dos seguidores"""
        response = self.client.get("/followers/analytics/")
        response.raise_for_status()
        return response.json()