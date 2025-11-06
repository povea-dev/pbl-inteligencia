from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class Message(BaseModel):
    """Modelo de mensaje del chat"""
    id: str
    sessionId: str
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: datetime
    metadata: Optional[dict] = None


class FeedbackRequest(BaseModel):
    """Request para obtener feedback de la IA"""
    sessionId: str
    problemId: str
    studentResponse: str
    conversationHistory: List[Message] = Field(default_factory=list)


class FeedbackResponse(BaseModel):
    """Response con el feedback generado"""
    feedback: str
    suggestions: Optional[List[str]] = None
    nextQuestion: Optional[str] = None
    assessment: Optional[dict] = None


class HealthResponse(BaseModel):
    """Response del health check"""
    status: str
    environment: str
    timestamp: datetime