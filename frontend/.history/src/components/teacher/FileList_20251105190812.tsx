import React from 'react';
import { CourseFile } from '../../types';

interface FileListProps {
  files: CourseFile[];
  onDelete: (fileId: string) => void;
  loading?: boolean;
}

export const FileList: React.FC<FileListProps> = ({ files, onDelete, loading }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay archivos subidos todavía</p>
        <p className="text-sm mt-2">Sube archivos para que los estudiantes los consulten</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-2xl">{getFileIcon(file.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>-</span>
                <span>{file.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>
            {file.processed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Procesado
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver
            </a>
            <button
              onClick={() => onDelete(file.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};