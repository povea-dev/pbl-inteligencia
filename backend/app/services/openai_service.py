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
from app.services.misuse_detection import misuse_detection_service
from app.services.file_service import file_service


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

    def _build_system_prompt(self, course_files: List[dict] = None, course_title: str = "", file_contents: str = "") -> str:
        """Construye el prompt del sistema con contexto del curso y contenido de archivos."""
        
        base_prompt = """Eres un asistente pedagógico especializado en Aprendizaje Basado en Problemas (PBL) para el curso: {course_title}

**IMPORTANTE - RESTRICCIONES CRÍTICAS:**
1. **SOLO puedes responder preguntas relacionadas con el curso y los materiales del curso**
2. **NO respondas preguntas generales** como: clima, noticias, deportes, entretenimiento, etc.
3. **Si no hay archivos en el curso, NO puedes responder ninguna pregunta** - debes informar que el docente aún no ha subido materiales
4. **Si la pregunta no está relacionada con el curso, debes rechazarla educadamente** y redirigir al estudiante a preguntar sobre el curso

**CUÁNDO DAR RESPUESTAS DIRECTAS (está permitido):**
- **Resúmenes generales del curso**: Cuando el estudiante pregunta "¿De qué trata este curso?" o "¿Qué temas se cubren?", DEBES dar un resumen completo y detallado basándote en el contenido de los archivos.
- **Explicaciones de conceptos**: Cuando el estudiante pregunta sobre conceptos, definiciones o temas del curso, puedes explicarlos directamente usando el contenido de los archivos.
- **Información sobre el contenido**: Puedes compartir información específica del curso cuando se solicite.

**CUÁNDO GUIAR EN LUGAR DE RESOLVER (metodología PBL):**
- **NO resuelvas tareas, ejercicios o problemas**: Si el estudiante pide que le resuelvas una tarea, ejercicio o problema, guíalo con preguntas socráticas en lugar de dar la solución directa.
- **NO hagas el trabajo por el estudiante**: En lugar de resolver problemas, ayuda al estudiante a pensar y llegar a sus propias conclusiones.

**Tu rol es:**
1. **Proporcionar información del curso**: Comparte conocimiento y resúmenes del contenido del curso cuando se solicite.
2. **Guiar el aprendizaje**: Para tareas y problemas, usa preguntas socráticas para que el estudiante piense y aprenda.
3. **Fomentar el pensamiento crítico**: Ayuda a identificar supuestos, analizar información y evaluar soluciones.
4. **Retroalimentación constructiva**: Reconoce fortalezas y señala áreas de mejora con sugerencias específicas.
5. **Adaptarte al nivel**: Ajusta la complejidad según las respuestas del estudiante.
6. **Promover autonomía**: Anima al estudiante a investigar, reflexionar y autoevaluarse.

**Metodología PBL que debes reforzar:**
- Identificación clara del problema
- Análisis de información disponible
- Generación de hipótesis y soluciones
- Justificación con argumentos sólidos
- Reflexión sobre el proceso

**Tono:** Amigable, motivador y profesional. Usa lenguaje claro y accesible.

**Formato de respuesta:**
- Para preguntas sobre el curso (resúmenes, conceptos, información): Proporciona respuestas completas y detalladas basadas en el contenido de los archivos.
- Para tareas y problemas: Inicia reconociendo lo que el estudiante hizo bien, haz 1-3 preguntas que lo hagan profundizar, sugiere recursos o conceptos a explorar, y termina con una pregunta abierta para continuar el diálogo."""
        
        # Agregar información de archivos si están disponibles
        if course_files and len(course_files) > 0:
            files_info = "\n\n**Archivos disponibles en el curso:**\n"
            for i, file_info in enumerate(course_files[:5], 1):  # Máximo 5 archivos
                files_info += f"{i}. {file_info.get('name', 'Archivo')} ({file_info.get('type', 'unknown')})\n"
            
            base_prompt += files_info
            
            # Si hay contenido extraído de los archivos, incluirlo
            if file_contents:
                base_prompt += "\n\n**CONTENIDO DE LOS ARCHIVOS DEL CURSO:**\n"
                base_prompt += "A continuación tienes el contenido extraído de los archivos del curso. Úsalo como contexto para responder las preguntas de los estudiantes.\n"
                base_prompt += "**IMPORTANTE**: Cuando un estudiante pregunte sobre el curso (por ejemplo: '¿De qué trata este curso?', '¿Qué temas se cubren?', '¿Qué voy a aprender?'), DEBES dar un resumen completo y detallado basándote en este contenido.\n\n"
                base_prompt += file_contents
                base_prompt += "\n\n**INSTRUCCIONES FINALES:**\n"
                base_prompt += "- Usa SOLO la información de estos archivos para responder.\n"
                base_prompt += "- Si detectas que el contenido de los archivos NO está relacionado con el curso, debes informar al estudiante que los archivos no están relacionados y que no puedes responder hasta que se suban archivos correctos.\n"
                base_prompt += "- Para preguntas sobre el curso (resúmenes, temas, conceptos): Proporciona respuestas completas y directas basadas en el contenido de arriba.\n"
                base_prompt += "- Para tareas y problemas: Guía al estudiante con preguntas socráticas en lugar de resolver directamente.\n"
            else:
                base_prompt += "\n**Usa SOLO la información de estos archivos para responder. Si la pregunta no está relacionada con estos materiales, recházala educadamente.**"
        else:
            base_prompt += "\n\n**ADVERTENCIA - NO HAY ARCHIVOS EN EL CURSO:** Si el estudiante hace una pregunta, debes informarle que el docente aún no ha subido materiales al curso y que no puedes responder hasta que haya archivos disponibles."
        
        return base_prompt.format(course_title=course_title or "el curso")

    async def _check_content_relevance(self, file_contents: str, course_title: str) -> bool:
        """
        Verifica si el contenido de los archivos está relacionado con el curso.
        Usa la IA para hacer una verificación rápida.
        """
        try:
            # Crear un prompt simple para verificar relevancia
            relevance_prompt = f"""Analiza si el siguiente contenido está relacionado con el curso "{course_title}".

CONTENIDO DEL ARCHIVO (primeros 1000 caracteres):
{file_contents[:1000]}

Responde SOLO con "SÍ" si el contenido está relacionado con el curso, o "NO" si no está relacionado."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un asistente que verifica si el contenido de un archivo está relacionado con un curso. Responde SOLO con 'SÍ' o 'NO'."},
                    {"role": "user", "content": relevance_prompt}
                ],
                temperature=0.1,
                max_tokens=10
            )
            
            answer = response.choices[0].message.content.strip().upper()
            is_related = "SÍ" in answer or "SI" in answer or "YES" in answer
            
            print(f"[DEBUG] Verificación de relevancia: {answer} -> {is_related}")
            return is_related
            
        except Exception as e:
            print(f"[ERROR] Error verificando relevancia: {e}")
            # En caso de error, asumir que está relacionado para no bloquear respuestas
            return True

    def _build_messages(self, request: FeedbackRequest, course_files: List[dict] = None, course_title: str = "", file_contents: str = "") -> List[dict]:
        """Convierte tu historial a formato OpenAI Chat con contexto del curso."""
        messages: List[dict] = [{"role": "system", "content": self._build_system_prompt(course_files, course_title, file_contents)}]

        # historial (últimos 5 mensajes para respuestas más rápidas)
        for msg in request.conversationHistory[-5:]:
            if msg.role in ["user", "assistant"]:
                messages.append({"role": msg.role, "content": msg.content})

        # última respuesta del estudiante (soporta tanto 'message' como 'studentResponse')
        student_message = request.message or request.studentResponse or ""
        if student_message:
            messages.append({"role": "user", "content": student_message})
        return messages

    async def generate_feedback(self, request: FeedbackRequest, course_files: List[dict] = None, course_title: str = "", max_pages_per_file: int = 10) -> FeedbackResponse:
        """Genera feedback pedagógico usando OpenAI con contexto de archivos del curso."""
        try:
            # Detectar mal uso de IA (solo para estudiantes)
            student_message = request.message or request.studentResponse or ""
            is_misuse, misuse_reason = misuse_detection_service.detect_misuse(student_message)
            
            # Si se detecta mal uso, retornar respuesta educativa y marcar para alerta
            if is_misuse:
                feedback_text = misuse_detection_service.get_misuse_response()
                
                return FeedbackResponse(
                    response=feedback_text,
                    feedback=feedback_text,
                    tokensUsed={
                        "prompt": 0,
                        "completion": 0,
                        "total": 0,
                        "assessment": {
                            "misuse_detected": True,
                            "misuse_reason": misuse_reason,
                            "courseId": request.courseId,
                            "conversationId": request.conversationId,
                            "studentMessage": student_message
                        }
                    },
                    sourcesUsed=None,
                    suggestions=None,
                    nextQuestion=None,
                    assessment={
                        "misuse_detected": True,
                        "misuse_reason": misuse_reason,
                        "courseId": request.courseId,
                        "conversationId": request.conversationId,
                        "studentMessage": student_message
                    },
                )
            
            # Verificar que haya archivos en el curso
            if not course_files or len(course_files) == 0:
                return FeedbackResponse(
                    response="Lo siento, pero el docente aún no ha subido materiales al curso. No puedo responder preguntas hasta que haya archivos disponibles. Por favor, contacta al docente para que suba los materiales del curso.",
                    feedback="Lo siento, pero el docente aún no ha subido materiales al curso. No puedo responder preguntas hasta que haya archivos disponibles. Por favor, contacta al docente para que suba los materiales del curso.",
                    tokensUsed=None,
                    sourcesUsed=None,
                    suggestions=None,
                    nextQuestion=None,
                    assessment=None,
                )
            
            # Verificar que la pregunta esté relacionada con el curso
            if not file_service.is_course_related(student_message, course_title):
                return FeedbackResponse(
                    response="Lo siento, pero solo puedo responder preguntas relacionadas con el curso y los materiales del curso. Por favor, haz preguntas sobre el contenido del curso, los temas que se están estudiando, o los archivos que el docente ha compartido.",
                    feedback="Lo siento, pero solo puedo responder preguntas relacionadas con el curso y los materiales del curso. Por favor, haz preguntas sobre el contenido del curso, los temas que se están estudiando, o los archivos que el docente ha compartido.",
                    tokensUsed=None,
                    sourcesUsed=None,
                    suggestions=None,
                    nextQuestion=None,
                    assessment=None,
                )
            
            # Extraer contenido de los archivos (optimizado: solo primeros 3 archivos y limitar tamaño)
            file_contents = ""
            if course_files:
                print(f"[DEBUG] Curso: {course_title}")
                print(f"[DEBUG] Archivos recibidos: {len(course_files)}")
                for i, f in enumerate(course_files, 1):
                    print(f"[DEBUG] Archivo {i}: {f.get('name', 'Sin nombre')} (tipo: {f.get('type', 'unknown')})")
                
                print(f"Extrayendo contenido de {min(len(course_files), 3)} archivos (máximo {max_pages_per_file} páginas por archivo)...")
                # Limitar a 3 archivos y truncar contenido para respuestas más rápidas
                file_contents = await file_service.extract_text_from_files(
                    course_files, 
                    max_files=3, 
                    max_chars=8000,
                    max_pages_per_file=max_pages_per_file
                )
                if file_contents:
                    print(f"Contenido extraído: {len(file_contents)} caracteres")
                    # Mostrar un preview del contenido extraído
                    preview = file_contents[:200] + "..." if len(file_contents) > 200 else file_contents
                    print(f"[DEBUG] Preview del contenido: {preview}")
                    
                    # Verificar si el contenido está relacionado con el curso
                    is_related = await self._check_content_relevance(file_contents, course_title)
                    if not is_related:
                        return FeedbackResponse(
                            response="Lo siento, pero los archivos subidos al curso no están relacionados con el contenido del curso. No puedo responder preguntas hasta que se suban archivos que correspondan al tema del curso. Por favor, contacta al docente para que suba los materiales correctos relacionados con el curso.",
                            feedback="Lo siento, pero los archivos subidos al curso no están relacionados con el contenido del curso. No puedo responder preguntas hasta que se suban archivos que correspondan al tema del curso. Por favor, contacta al docente para que suba los materiales correctos relacionados con el curso.",
                            tokensUsed=None,
                            sourcesUsed=None,
                            suggestions=None,
                            nextQuestion=None,
                            assessment=None,
                        )
                else:
                    print("No se pudo extraer contenido de los archivos")
            
            # Si no hay mal uso, generar feedback normal con contexto
            messages = self._build_messages(request, course_files, course_title, file_contents)

            # Optimizar para respuestas más rápidas
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=800,  # Reducido de 1024 a 800 para respuestas más rápidas
                stream=False,  # No usar streaming para mantener compatibilidad
            )

            feedback_text = resp.choices[0].message.content or "No se recibió contenido."

            # Calcular tokens usados
            tokens_used = {
                "prompt": resp.usage.prompt_tokens if hasattr(resp, 'usage') and resp.usage else 0,
                "completion": resp.usage.completion_tokens if hasattr(resp, 'usage') and resp.usage else 0,
                "total": resp.usage.total_tokens if hasattr(resp, 'usage') and resp.usage else 0
            }

            return FeedbackResponse(
                response=feedback_text,  # Frontend espera 'response'
                feedback=feedback_text,  # Mantener para compatibilidad
                tokensUsed=tokens_used,
                sourcesUsed=None,
                suggestions=None,
                nextQuestion=None,
                assessment=None,
            )

        except Exception as e:
            print(f"Error OpenAI: {e}")
            error_msg = "Lo siento, hubo un error al procesar tu respuesta con OpenAI. Intenta nuevamente."
            return FeedbackResponse(
                response=error_msg,  # Frontend espera 'response'
                feedback=error_msg,  # Mantener para compatibilidad
                tokensUsed=None,
                sourcesUsed=None,
                suggestions=None,
                nextQuestion=None,
                assessment=None,
            )


# Instancia única del servicio
openai_service = OpenAIService()
