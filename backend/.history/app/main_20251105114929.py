from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

from app.config import get_settings
from app.models import FeedbackRequest, FeedbackResponse, HealthResponse
from app.services.claude_service import claude_service


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


@app.post("/api/feedback", response_model=FeedbackResponse)
async def get_feedback(request: FeedbackRequest):
    """
    Genera feedback pedagógico basado en la respuesta del estudiante
    """
    try:
        feedback = await claude_service.generate_feedback(request)
        return feedback
    
    except Exception as e:
        print(f"Error en /api/feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al generar feedback"
        )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )