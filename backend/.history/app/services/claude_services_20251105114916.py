import anthropic
from typing import List
from app.models import Message, FeedbackRequest, FeedbackResponse
from app.config import get_settings


class ClaudeService:
    """Servicio para interactuar con Claude API"""
    
    def __init__(self):
        settings = get_settings()
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"  # Claude 3.5 Sonnet
    
    def _build_system_prompt(self) -> str:
        """Construye el prompt del sistema para el enfoque PBL"""
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
        """Construye el historial de mensajes para Claude"""
        messages = []
        
        # Agregar historial previo (máximo últimos 10 mensajes)
        for msg in request.conversationHistory[-10:]:
            if msg.role in ['user', 'assistant']:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Agregar el mensaje actual del estudiante
        messages.append({
            "role": "user",
            "content": request.studentResponse
        })
        
        return messages
    
    async def generate_feedback(self, request: FeedbackRequest) -> FeedbackResponse:
        """Genera feedback pedagógico usando Claude"""
        
        try:
            # Construir mensajes
            messages = self._build_messages(request)
            
            # Llamar a Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.7,
                system=self._build_system_prompt(),
                messages=messages
            )
            
            # Extraer el texto de la respuesta
            feedback_text = response.content[0].text
            
            # Crear respuesta
            return FeedbackResponse(
                feedback=feedback_text,
                suggestions=None,  # Podrías extraer esto del texto si lo estructuras
                nextQuestion=None,
                assessment=None
            )
            
        except anthropic.APIError as e:
            print(f"Error de API de Anthropic: {e}")
            return FeedbackResponse(
                feedback="Lo siento, hubo un error al procesar tu respuesta. Por favor, intenta nuevamente.",
                suggestions=None,
                nextQuestion=None,
                assessment=None
            )
        
        except Exception as e:
            print(f"Error inesperado: {e}")
            return FeedbackResponse(
                feedback="Ocurrió un error inesperado. Por favor, contacta al administrador.",
                suggestions=None,
                nextQuestion=None,
                assessment=None
            )


# Instancia única del servicio
claude_service = ClaudeService()