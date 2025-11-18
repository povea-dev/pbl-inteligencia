
import React, { useState } from 'react';
import { Conversation } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, MessageSquare, Trash2, Calendar, Loader2, Clock, Edit2, Check, X, Circle } from 'lucide-react';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onUpdateTitle?: (conversationId: string, newTitle: string) => void;
  loading?: boolean;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateTitle,
  loading
}) => {
  const { darkMode } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditValue(conversation.title);
  };

  const handleSaveEdit = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTitle && editValue.trim()) {
      onUpdateTitle(conversationId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace un momento';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return 'Ayer';
    
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className={`w-80 border-r backdrop-blur-sm flex items-center justify-center ${
        darkMode 
          ? 'border-slate-700 bg-slate-800/50' 
          : 'border-slate-200 bg-white/50'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-3 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`} />
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 border-r backdrop-blur-lg flex flex-col shadow-sm ${
      darkMode 
        ? 'border-slate-700/50 bg-slate-800/80' 
        : 'border-slate-200/50 bg-white/80'
    }`}>
      {/* Header */}
      <div className={`p-5 border-b ${
        darkMode
          ? 'border-slate-700/50 bg-gradient-to-r from-emerald-900/20 to-teal-900/20'
          : 'border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50'
      }`}>
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-4 py-3 hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva conversación
        </button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <MessageSquare className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <p className={`font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              No tienes conversaciones
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Inicia una nueva para comenzar
            </p>
          </div>
        ) : (
          <div className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-200/50'}`}>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer transition-all relative group border-l-4 ${
                  currentConversationId === conversation.id
                    ? darkMode
                      ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500'
                      : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-500'
                    : darkMode
                      ? 'hover:bg-slate-700/50 border-transparent'
                      : 'hover:bg-slate-50 border-transparent'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        currentConversationId === conversation.id 
                          ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                          : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                      {editingId === conversation.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(conversation.id, e as any);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit(e as any);
                              }
                            }}
                            className={`flex-1 text-sm font-semibold border-2 border-emerald-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                              darkMode
                                ? 'bg-slate-700 text-white'
                                : 'bg-white text-slate-900'
                            }`}
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveEdit(conversation.id, e)}
                            className={`p-1 rounded ${
                              darkMode
                                ? 'hover:bg-emerald-900/50 text-emerald-400'
                                : 'hover:bg-emerald-50 text-emerald-600'
                            }`}
                            title="Guardar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`p-1 rounded ${
                              darkMode
                                ? 'hover:bg-red-900/50 text-red-400'
                                : 'hover:bg-red-50 text-red-600'
                            }`}
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className={`text-sm font-semibold truncate flex-1 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {conversation.title}
                        </h3>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ml-6 ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conversation.lastMessageAt)}
                      </span>
                      <Circle className={`w-1 h-1 fill-current ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {conversation.messageCount} mensajes
                      </span>
                    </div>
                  </div>
                  
                  {/* Botones de acción (aparecen al hacer hover) */}
                  {editingId !== conversation.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onUpdateTitle && (
                        <button
                          onClick={(e) => handleStartEdit(conversation, e)}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? 'hover:bg-emerald-900/50 text-emerald-400'
                              : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                          title="Editar nombre"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Eliminar esta conversación?')) {
                            onDeleteConversation(conversation.id);
                          }
                        }}
                        className={`p-2 rounded-lg ${
                          darkMode
                            ? 'hover:bg-red-900/50 text-red-400'
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con info */}
      <div className={`p-4 border-t ${
        darkMode
          ? 'border-slate-700/50 bg-slate-800/50'
          : 'border-slate-200/50 bg-slate-50/50'
      }`}>
        <p className={`text-xs text-center leading-relaxed ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Las conversaciones se eliminan automáticamente después de 30 días
        </p>
      </div>
    </div>
  );
};