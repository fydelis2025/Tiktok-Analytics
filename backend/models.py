# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import Dict, Any

Base = declarative_base()

class VideoMetrics(Base):
    __tablename__ = "video_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    hashtags = Column(JSON, default=list)
    posted_at = Column(DateTime, nullable=False)
    collected_at = Column(DateTime, default=datetime.utcnow)
    engagement_rate = Column(Float, default=0.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "video_id": self.video_id,
            "description": self.description,
            "views": self.views,
            "likes": self.likes,
            "comments": self.comments,
            "shares": self.shares,
            "save_count": self.save_count,
            "hashtags": self.hashtags,
            "posted_at": self.posted_at.isoformat() if self.posted_at else None,
            "collected_at": self.collected_at.isoformat() if self.collected_at else None,
            "engagement_rate": self.engagement_rate
        }


class HashtagPerformance(Base):
    __tablename__ = "hashtag_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    hashtag = Column(String, unique=True, index=True, nullable=False)
    total_views = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    avg_engagement = Column(Float, default=0.0)
    video_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hashtag": self.hashtag,
            "total_views": self.total_views,
            "total_likes": self.total_likes,
            "avg_engagement": self.avg_engagement,
            "video_count": self.video_count,
            "last_used": self.last_used.isoformat() if self.last_used else None
        }


class UserTokens(Base):
    __tablename__ = "user_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "access_token": self.access_token,
            "refresh_token": self.refresh_token,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }