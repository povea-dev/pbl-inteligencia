import React, { useState } from 'react';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { exportService } from '../../services/exportService';
import { Conversation, Message } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface ExportButtonProps {
  conversation: Conversation;
  messages: Message[];
  courseTitle?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  conversation,
  messages,
  courseTitle
}) => {
  const { darkMode } = useTheme();
  const [exporting, setExporting] = useState<'pdf' | 'txt' | null>(null);

  const handleExportPDF = async () => {
    if (messages.length === 0) {
      alert('No hay mensajes para exportar');
      return;
    }

    setExporting('pdf');
    try {
      await exportService.exportToPDF(conversation, messages, courseTitle);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF. Por favor, intenta nuevamente.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportText = () => {
    if (messages.length === 0) {
      alert('No hay mensajes para exportar');
      return;
    }

    setExporting('txt');
    try {
      exportService.exportToText(conversation, messages, courseTitle);
    } catch (error) {
      console.error('Error exportando a texto:', error);
      alert('Error al exportar a texto. Por favor, intenta nuevamente.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportPDF}
        disabled={exporting !== null || messages.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Exportar a PDF"
      >
        {exporting === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
      <button
        onClick={handleExportText}
        disabled={exporting !== null || messages.length === 0}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Exportar a texto"
      >
        {exporting === 'txt' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <File className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">TXT</span>
      </button>
    </div>
  );
};

