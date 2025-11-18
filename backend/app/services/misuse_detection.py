# app/services/misuse_detection.py
import re
from typing import Optional, Tuple

class MisuseDetectionService:
    """Servicio para detectar mal uso de IA por parte de estudiantes"""
    
    # Patrones que indican mal uso
    MISUSE_PATTERNS = [
        r'hazme\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n)',
        r'resu[eé]lveme\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)',
        r'puedes\s+hacer\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)',
        r'quiero\s+que\s+hagas\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)',
        r'necesito\s+que\s+hagas\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)',
        r'haz\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)\s+por\s+m[ií]',
        r'resuelve\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)\s+por\s+m[ií]',
        r'completa\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)\s+por\s+m[ií]',
        r'responde\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n|tarea)\s+por\s+m[ií]',
        r'dame\s+(las|los)\s+respuestas\s+(de|del|de la|del)\s+(prueba|examen|test|evaluaci[oó]n)',
        r'pasa\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n)\s+por\s+m[ií]',
        r'aprueba\s+(la|el|un|una)\s+(prueba|examen|test|evaluaci[oó]n)\s+por\s+m[ií]',
    ]
    
    def detect_misuse(self, message: str) -> Tuple[bool, Optional[str]]:
        """
        Detecta si un mensaje indica mal uso de IA
        
        Returns:
            Tuple[bool, Optional[str]]: (es_mal_uso, razon)
        """
        if not message:
            return False, None
        
        message_lower = message.lower()
        
        # Buscar patrones de mal uso
        for pattern in self.MISUSE_PATTERNS:
            if re.search(pattern, message_lower, re.IGNORECASE):
                return True, f"El estudiante está pidiendo que se le resuelva una prueba, examen o tarea"
        
        return False, None
    
    def get_misuse_response(self) -> str:
        """Retorna una respuesta educativa cuando se detecta mal uso"""
        return """Entiendo que puedas sentir presión, pero mi rol es ayudarte a aprender, no hacer el trabajo por ti.

**¿Por qué no puedo hacer tu prueba o tarea?**
- El aprendizaje real viene del esfuerzo y la reflexión personal
- Las evaluaciones miden tu comprensión, no la mía
- Hacer el trabajo por ti no te ayuda a desarrollar tus habilidades

**¿Cómo puedo ayudarte realmente?**
- Puedo explicarte conceptos que no entiendas
- Puedo guiarte con preguntas para que descubras las respuestas
- Puedo revisar tu trabajo y darte retroalimentación
- Puedo sugerirte recursos para estudiar

¿Hay algún concepto específico del tema que te gustaría que te explique o con el que necesites ayuda?"""


# Instancia única del servicio
misuse_detection_service = MisuseDetectionService()

