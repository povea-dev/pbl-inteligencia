import React from 'react';
import { CourseFile } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { FileText, File, Trash2, ExternalLink, Calendar, CheckCircle2, Loader2, Circle, Download } from 'lucide-react';

interface FileListProps {
  files: CourseFile[];
  onDelete?: (fileId: string) => void;
  loading?: boolean;
  canDelete?: boolean; // Si es false, no muestra el botón de eliminar
}

export const FileList: React.FC<FileListProps> = ({ files, onDelete, loading, canDelete = true }) => {
  const { darkMode } = useTheme();
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'txt':
        return <File className="w-5 h-5 text-slate-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-3 ${
            darkMode
              ? canDelete ? 'text-emerald-400' : 'text-emerald-500'
              : canDelete ? 'text-emerald-600' : 'text-emerald-500'
          }`} />
          <p className={`text-sm ${
            darkMode
              ? canDelete ? 'text-slate-300' : 'text-slate-400'
              : canDelete ? 'text-slate-600' : 'text-slate-500'
          }`}>
            Cargando archivos...
          </p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
        darkMode
          ? canDelete
            ? 'bg-slate-700/30 border-slate-600'
            : 'bg-transparent border-slate-600/50'
          : canDelete
            ? 'bg-slate-50 border-slate-200'
            : 'bg-transparent border-slate-200/50'
      }`}>
        <File className={`w-12 h-12 mx-auto mb-3 ${
          darkMode
            ? canDelete ? 'text-slate-500' : 'text-slate-500/50'
            : canDelete ? 'text-slate-400' : 'text-slate-400/50'
        }`} />
        <p className={`font-medium mb-1 ${
          darkMode
            ? canDelete ? 'text-slate-300' : 'text-slate-400'
            : canDelete ? 'text-slate-700' : 'text-slate-500'
        }`}>
          {canDelete ? 'No hay archivos subidos todavía' : 'No hay archivos disponibles'}
        </p>
        {canDelete && (
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sube archivos para que los estudiantes los consulten
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all group ${
            darkMode
              ? canDelete
                ? 'bg-slate-700/50 border-slate-600 hover:border-emerald-600/50 hover:shadow-md'
                : 'bg-slate-700/30 border-slate-600/50 hover:border-emerald-600/30'
              : canDelete
                ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                : 'bg-transparent border-slate-200/50 hover:border-emerald-300/50'
          }`}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              darkMode
                ? canDelete
                  ? 'bg-slate-600 group-hover:bg-emerald-900/30'
                  : 'bg-slate-600/50 group-hover:bg-emerald-900/20'
                : canDelete
                  ? 'bg-slate-100 group-hover:bg-emerald-50'
                  : 'bg-slate-100/50 group-hover:bg-emerald-50/50'
            }`}>
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate mb-1 ${
                darkMode
                  ? canDelete ? 'text-white' : 'text-slate-200'
                  : canDelete ? 'text-slate-900' : 'text-slate-800'
              }`}>
                {file.name}
              </p>
              <div className={`flex items-center gap-3 text-xs ${
                darkMode
                  ? canDelete ? 'text-slate-400' : 'text-slate-500'
                  : canDelete ? 'text-slate-500' : 'text-slate-500/80'
              }`}>
                <span className="flex items-center gap-1">
                  <File className="w-3 h-3" />
                  {formatFileSize(file.size)}
                </span>
                <Circle className={`w-1 h-1 fill-current ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {file.uploadedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            {file.processed && canDelete && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                darkMode
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Procesado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30'
                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
              title="Descargar archivo"
            >
              <Download className="w-4 h-4" />
            </a>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(file.id)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
                title="Eliminar archivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};