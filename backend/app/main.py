from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
import sys
from pathlib import Path

# Agregar directorio padre al path
sys.path.insert(0, str(Path(__file__).parent))

from config import get_settings
from models import FeedbackRequest, FeedbackResponse, HealthResponse
# from app.services.claude_service import claude_service
from app.services.openai_service import openai_service


# Configuración
settings = get_settings()

# Crear app
app = FastAPI(
    title="PBL Chatbot API",
    description="Backend para el chatbot educativo con IA",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "PBL Chatbot API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check del servicio"""
    return HealthResponse(
        status="healthy",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now()
    )


@app.post("/api/chat/feedback", response_model=FeedbackResponse)
async def get_feedback(request: FeedbackRequest):
    """
    Genera feedback pedagógico basado en la respuesta del estudiante
    Compatible con el frontend que envía: conversationId, courseId, message, conversationHistory, courseFiles, courseTitle
    """
    try:
        # Validar que se haya enviado un mensaje
        if not request.message and not request.studentResponse:
            raise HTTPException(
                status_code=400,
                detail="Se requiere 'message' o 'studentResponse' en el request"
            )
        
        # Obtener archivos y título del curso desde el request (el frontend los enviará)
        course_files = getattr(request, 'courseFiles', None) or []
        course_title = getattr(request, 'courseTitle', None) or ""
        max_pages_per_file = getattr(request, 'maxPagesPerFile', None) or 10
        
        feedback = await openai_service.generate_feedback(request, course_files, course_title, max_pages_per_file)
        return feedback
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en /api/chat/feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al generar feedback"
        )


# Mantener endpoint antiguo para compatibilidad
@app.post("/api/feedback", response_model=FeedbackResponse)
async def get_feedback_legacy(request: FeedbackRequest):
    """
    Endpoint legacy - redirige a /api/chat/feedback
    """
    return await get_feedback(request)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )