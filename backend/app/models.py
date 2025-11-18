from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class Message(BaseModel):
    """Modelo de mensaje del chat (compatible con frontend)"""
    id: str
    conversationId: Optional[str] = None  # Para compatibilidad con frontend
    sessionId: Optional[str] = None  # Para compatibilidad con backend antiguo
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: Optional[datetime] = None
    metadata: Optional[dict] = None
    tokens: Optional[dict] = None
    sourcesUsed: Optional[List[str]] = None


class FeedbackRequest(BaseModel):
    """Request para obtener feedback de la IA (compatible con frontend)"""
    conversationId: Optional[str] = None
    courseId: Optional[str] = None
    message: Optional[str] = None  # Frontend usa 'message'
    studentResponse: Optional[str] = None  # Backend antiguo usa 'studentResponse'
    sessionId: Optional[str] = None  # Backend antiguo
    problemId: Optional[str] = None  # Backend antiguo
    conversationHistory: List[Message] = Field(default_factory=list)
    idToken: Optional[str] = None  # Token de Firebase para autenticación
    courseFiles: Optional[List[dict]] = Field(default_factory=list)  # Archivos del curso con URLs para extraer contenido
    courseTitle: Optional[str] = None  # Título del curso
    maxPagesPerFile: Optional[int] = 10  # Máximo de páginas a leer por archivo PDF


class FeedbackResponse(BaseModel):
    """Response con el feedback generado (compatible con frontend)"""
    response: Optional[str] = None  # Frontend espera 'response'
    feedback: Optional[str] = None  # Backend antiguo usa 'feedback'
    sourcesUsed: Optional[List[str]] = None
    tokensUsed: Optional[dict] = None
    suggestions: Optional[List[str]] = None
    nextQuestion: Optional[str] = None
    assessment: Optional[dict] = None


class HealthResponse(BaseModel):
    """Response del health check"""
    status: str
    environment: str
    timestamp: datetime