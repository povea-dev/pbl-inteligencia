# app/services/file_service.py
import httpx
from typing import List, Optional
import sys
from pathlib import Path
import io

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import get_settings

# Importar librerías para extracción de texto
try:
    import PyPDF2
    PDF_AVAILABLE = True
    print("[OK] PyPDF2 está disponible para extracción de PDF")
except ImportError as e:
    PDF_AVAILABLE = False
    print(f"[ADVERTENCIA] PyPDF2 no está instalado. La extracción de PDF no funcionará.")
    print(f"   Instala con: pip install PyPDF2")
    print(f"   Error: {e}")

try:
    from docx import Document
    DOCX_AVAILABLE = True
    print("[OK] python-docx está disponible para extracción de DOCX")
except ImportError as e:
    DOCX_AVAILABLE = False
    print(f"[ADVERTENCIA] python-docx no está instalado. La extracción de DOCX no funcionará.")
    print(f"   Instala con: pip install python-docx")
    print(f"   Error: {e}")

class FileService:
    """Servicio para obtener y procesar archivos del curso desde Firebase"""
    
    def __init__(self):
        self.settings = get_settings()
    
    async def get_course_files(self, course_id: str, id_token: str) -> List[dict]:
        """
        Obtiene la lista de archivos de un curso desde Firestore
        Retorna lista de archivos con sus URLs
        """
        try:
            # Usar Firebase Admin SDK o hacer petición a Firestore REST API
            # Por ahora, retornamos lista vacía - esto se implementará con Firebase Admin
            # TODO: Implementar obtención de archivos desde Firestore
            return []
        except Exception as e:
            print(f"Error obteniendo archivos del curso: {e}")
            return []
    
    async def extract_text_from_url(self, file_url: str, file_type: str, max_length: int = 8000, max_pages: int = 10) -> Optional[str]:
        """
        Extrae texto de un archivo desde su URL
        Soporta PDF, DOCX, TXT
        max_length: Longitud máxima de texto a extraer (para evitar prompts muy largos)
        """
        try:
            # Normalizar tipo de archivo
            file_type = file_type.lower().strip()
            
            # Timeout reducido para respuestas más rápidas
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(file_url)
                response.raise_for_status()
                
                if file_type == 'txt':
                    text = response.text
                    # Limitar longitud
                    if len(text) > max_length:
                        text = text[:max_length] + "\n\n[... contenido truncado ...]"
                    return text
                    
                elif file_type == 'pdf':
                    if not PDF_AVAILABLE:
                        print(f"ERROR: PyPDF2 no está instalado. Instala con: pip install PyPDF2")
                        return None
                    
                    # Extraer texto de PDF
                    try:
                        pdf_file = io.BytesIO(response.content)
                        pdf_reader = PyPDF2.PdfReader(pdf_file)
                        text_parts = []
                        
                        # Extraer texto de las primeras páginas (usar max_pages del parámetro)
                        pages_to_read = min(max_pages, len(pdf_reader.pages))
                        for i in range(pages_to_read):
                            page = pdf_reader.pages[i]
                            page_text = page.extract_text()
                            if page_text:
                                text_parts.append(page_text)
                        
                        text = "\n\n".join(text_parts)
                        if len(text) > max_length:
                            text = text[:max_length] + "\n\n[... contenido truncado ...]"
                        return text
                    except Exception as pdf_error:
                        print(f"Error extrayendo texto del PDF: {pdf_error}")
                        return None
                    
                elif file_type in ['docx', 'doc']:
                    if not DOCX_AVAILABLE:
                        print(f"ERROR: python-docx no está instalado. Instala con: pip install python-docx")
                        return None
                    
                    # Extraer texto de DOCX
                    try:
                        docx_file = io.BytesIO(response.content)
                        doc = Document(docx_file)
                        text_parts = []
                        
                        for paragraph in doc.paragraphs:
                            if paragraph.text.strip():
                                text_parts.append(paragraph.text)
                        
                        text = "\n\n".join(text_parts)
                        if len(text) > max_length:
                            text = text[:max_length] + "\n\n[... contenido truncado ...]"
                        return text
                    except Exception as docx_error:
                        print(f"Error extrayendo texto del DOCX: {docx_error}")
                        return None
                    
                else:
                    print(f"Tipo de archivo no soportado: {file_type}. Tipos soportados: txt, pdf, docx")
                    return None
                    
        except Exception as e:
            print(f"Error extrayendo texto de {file_url}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def extract_text_from_files(self, files: List[dict], max_files: int = 5, max_chars: int = 50000, max_pages_per_file: int = 10) -> str:
        """
        Extrae texto de múltiples archivos y los combina
        Retorna el texto combinado de todos los archivos
        """
        extracted_texts = []
        
        # Limitar número de archivos para evitar timeouts
        files_to_process = files[:max_files]
        
        for file_info in files_to_process:
            file_url = file_info.get('url')
            file_type = file_info.get('type', '').lower()
            file_name = file_info.get('name', 'Archivo')
            
            if not file_url:
                continue
            
            print(f"Extrayendo texto de: {file_name} ({file_type})")
            # Calcular max_length por archivo basado en max_chars total
            chars_per_file = max_chars // max_files if max_files > 0 else max_chars
            text = await self.extract_text_from_url(file_url, file_type, max_length=chars_per_file, max_pages=max_pages_per_file)
            
            if text:
                extracted_texts.append(f"=== {file_name} ===\n{text}\n")
            else:
                print(f"No se pudo extraer texto de: {file_name}")
        
        combined_text = "\n\n".join(extracted_texts)
        # Limitar el texto total combinado
        if len(combined_text) > max_chars:
            combined_text = combined_text[:max_chars] + "\n\n[... contenido truncado para optimizar velocidad ...]"
        return combined_text
    
    def is_course_related(self, message: str, course_title: str = "") -> bool:
        """
        Detecta si un mensaje está relacionado con el curso o es una pregunta general
        """
        message_lower = message.lower()
        
        # Palabras clave que indican preguntas fuera del contexto del curso
        off_topic_keywords = [
            'clima', 'tiempo', 'weather', 'temperatura',
            'noticias', 'news', 'actualidad',
            'deportes', 'sports', 'futbol', 'fútbol',
            'pelicula', 'película', 'movie', 'cine',
            'cocina', 'receta', 'recipe', 'cooking',
            'viaje', 'travel', 'turismo',
            'música', 'music', 'canción',
            'juego', 'game', 'videojuego',
            'red social', 'social media', 'instagram', 'facebook', 'twitter'
        ]
        
        # Si contiene palabras clave fuera del tema, es off-topic
        for keyword in off_topic_keywords:
            if keyword in message_lower:
                return False
        
        # Si pregunta explícitamente sobre el curso, es on-topic
        course_keywords = [
            'curso', 'materia', 'asignatura', 'tema', 'contenido',
            'archivo', 'documento', 'pdf', 'material',
            'aprender', 'estudiar', 'entender', 'explicar',
            'qué es', 'qué significa', 'cómo funciona', 'por qué'
        ]
        
        for keyword in course_keywords:
            if keyword in message_lower:
                return True
        
        # Si no hay indicadores claros, asumimos que es sobre el curso
        # (mejor ser permisivo que restrictivo)
        return True


# Instancia única del servicio
file_service = FileService()

