import React, { useState } from 'react';
import { filesService } from '../../services/filesService';
import { CourseFile } from '../../types';
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  courseId: string;
  userId: string;
  teacherName?: string;
  onFileUploaded: (file: CourseFile) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  courseId, 
  userId,
  teacherName,
  onFileUploaded 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validar archivo
    const validation = filesService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedFile = await filesService.uploadFile(courseId, file, userId, teacherName);
      onFileUploaded(uploadedFile);
    } catch (err: any) {
      console.error('Error al subir archivo:', err);
      
      // Mensajes de error más específicos
      if (err.message?.includes('CORS')) {
        setError('Error de CORS. Verifica que las reglas de Firebase Storage estén configuradas correctamente. Consulta firebase-storage-rules.txt');
      } else if (err.message?.includes('permisos') || err.message?.includes('unauthorized')) {
        setError('No tienes permisos para subir archivos. Verifica las reglas de Firebase Storage.');
      } else if (err.message?.includes('autenticado')) {
        setError('Debes estar autenticado para subir archivos. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err.message || 'Error al subir el archivo. Intenta nuevamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
          dragActive
            ? 'border-red-500 bg-red-50/50 shadow-lg shadow-red-500/20'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-700">Subiendo archivo...</p>
            <p className="text-xs text-slate-500">Por favor espera</p>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-slate-100 rounded-2xl mb-4 border border-red-200/50">
              <Upload className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors">
                  <File className="w-4 h-4" />
                  Selecciona un archivo
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleInputChange}
                  disabled={uploading}
                />
              </label>
              <p className="text-slate-500 text-sm mt-2">o arrastra y suelta aquí</p>
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <File className="w-3 h-3" />
              PDF, DOCX o TXT hasta 10MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};