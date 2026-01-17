from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InteractionCreate(BaseModel):
    article_id: str

class SubscriptionCreate(BaseModel):
    publisher_name: str
    publisher_avatar: Optional[str] = None
    followers_count: Optional[str] = None

class InteractionResponse(BaseModel):
    success: bool
    message: str

class ReadHistoryCreate(BaseModel):
    article_id: str
    read_duration: int

class BookmarkListResponse(BaseModel):
    articles: List[dict]
    total: int

class SubscriptionResponse(BaseModel):
    id: str
    publisher_name: str
    publisher_avatar: Optional[str]
    followers_count: Optional[str]
    subscribed_at: datetime
