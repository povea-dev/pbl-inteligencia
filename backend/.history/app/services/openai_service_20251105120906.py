# app/services/openai_service.py
from typing import List
import os
import sys
from pathlib import Path
from openai import OpenAI

# Agregar directorio padre al path (igual que en Claude)
sys.path.insert(0, str(Path(__file__).parent.parent))

from models import Message, FeedbackRequest, FeedbackResponse
from config import get_settings


class OpenAIService:
    """Servicio para interactuar con OpenAI (GPT) manteniendo la misma interfaz que ClaudeService."""

    def __init__(self):
        settings = get_settings()
        api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", None)
        if not api_key:
            raise ValueError("Falta OPENAI_API_KEY en .env o en tu settings.")
        self.client = OpenAI(api_key=api_key)
        # Puedes cambiar el modelo aquí centralmente
        self.model = "gpt-4o-mini"

    def _build_system_prompt(self) -> str:
        """Mantiene el mismo prompt PBL para que el comportamiento sea equivalente."""
        return """Eres un asistente pedagógico especializado en Aprendizaje Basado en Problemas (PBL).

Tu rol es:
1. **Guiar, no resolver**: No des respuestas directas. Usa preguntas socráticas para que el estudiante piense.
2. **Fomentar el pensamiento crítico**: Ayuda a identificar supuestos, analizar información y evaluar soluciones.
3. **Retroalimentación constructiva**: Reconoce fortalezas y señala áreas de mejora con sugerencias específicas.
4. **Adaptarte al nivel**: Ajusta la complejidad según las respuestas del estudiante.
5. **Promover autonomía**: Anima al estudiante a investigar, reflexionar y autoevaluarse.

**Metodología PBL que debes reforzar:**
- Identificación clara del problema
- Análisis de información disponible
- Generación de hipótesis y soluciones
- Justificación con argumentos sólidos
- Reflexión sobre el proceso

**Tono:** Amigable, motivador y profesional. Usa lenguaje claro y accesible.

**Formato de respuesta:**
- Inicia reconociendo lo que el estudiante hizo bien
- Haz 1-3 preguntas que lo hagan profundizar
- Sugiere recursos o conceptos a explorar (si es necesario)
- Termina con una pregunta abierta para continuar el diálogo"""

    def _build_messages(self, request: FeedbackRequest) -> List[dict]:
        """Convierte tu historial a formato OpenAI Chat."""
        messages: List[dict] = [{"role": "system", "content": self._build_system_prompt()}]

        # historial (últimos 10)
        for msg in request.conversationHistory[-10:]:
            if msg.role in ["user", "assistant"]:
                messages.append({"role": msg.role, "content": msg.content})

        # última respuesta del estudiante
        messages.append({"role": "user", "content": request.studentResponse})
        return messages

    async def generate_feedback(self, request: FeedbackRequest) -> FeedbackResponse:
        """Genera feedback pedagógico usando OpenAI, misma firma que ClaudeService."""
        try:
            messages = self._build_messages(request)

            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
            )

            feedback_text = resp.choices[0].message.content or "No se recibió contenido."

            return FeedbackResponse(
                feedback=feedback_text,
                suggestions=None,
                nextQuestion=None,
                assessment=None,
            )

        except Exception as e:
            print(f"Error OpenAI: {e}")
            return FeedbackResponse(
                feedback="Lo siento, hubo un error al procesar tu respuesta con OpenAI. Intenta nuevamente.",
                suggestions=None,
                nextQuestion=None,
                assessment=None,
            )


# Instancia única del servicio
openai_service = OpenAIService()
