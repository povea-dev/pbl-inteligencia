
import React, { useState, useEffect, useMemo } from 'react';
import { Conversation, SearchResult } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { conversationsService } from '../../services/conversationsService';
import { Plus, MessageSquare, Trash2, Calendar, Loader2, Clock, Edit2, Check, X, Circle, Search, XCircle } from 'lucide-react';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onUpdateTitle?: (conversationId: string, newTitle: string) => void;
  loading?: boolean;
  courseId: string;
  userId: string | null; // null para docente (buscar todas)
  onClose?: () => void; // Para cerrar en móviles
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateTitle,
  loading,
  courseId,
  userId,
  onClose
}) => {
  const { darkMode } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await conversationsService.searchConversations(
          courseId,
          userId,
          searchQuery,
          { limit: 20, searchInMessages: true }
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setSearchError('Error al buscar conversaciones');
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, courseId, userId]);

  // Función para resaltar texto
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className={`${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'} px-0.5 rounded`}>
          {part}
        </mark>
      ) : part
    );
  };

  // Determinar qué conversaciones mostrar
  const displayConversations = useMemo(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults.map(result => result.conversation);
    }
    return conversations;
  }, [searchQuery, searchResults, conversations]);

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
            darkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 max-w-[85vw] h-full border-r backdrop-blur-lg flex flex-col shadow-sm ${
      darkMode 
        ? 'border-slate-700/50 bg-slate-800/80' 
        : 'border-slate-200/50 bg-white/80'
    }`}>
      {/* Header */}
      <div className={`p-4 sm:p-5 border-b space-y-3 ${
        darkMode
          ? 'border-slate-700/50 bg-gradient-to-r from-red-900/20 to-slate-900/20'
          : 'border-slate-200/50 bg-gradient-to-r from-red-50/50 to-slate-50/50'
      }`}>
        {/* Botón cerrar para móviles */}
        {onClose && (
          <div className="flex justify-end lg:hidden">
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all ${
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                darkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-red-600 to-slate-700 text-white rounded-xl px-4 py-3 hover:from-red-700 hover:to-slate-800 transition-all font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva conversación
        </button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {/* Estado de búsqueda */}
        {isSearching && (
          <div className="p-8 text-center">
            <Loader2 className={`w-6 h-6 animate-spin mx-auto mb-2 ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`} />
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Buscando...
            </p>
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && !searchError && (
          <div className="p-8 text-center">
            <Search className={`w-8 h-8 mx-auto mb-3 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <p className={`font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              No se encontraron resultados
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}

        {searchError && (
          <div className="p-4 m-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{searchError}</p>
          </div>
        )}

        {!isSearching && displayConversations.length === 0 && !searchQuery ? (
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
            {displayConversations.map((conversation) => {
              // Obtener información de búsqueda si está disponible
              const searchResult = searchResults.find(r => r.conversation.id === conversation.id);
              const titleMatches = searchResult?.matches.filter(m => m.type === 'title') || [];
              
              return (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer transition-all relative group border-l-4 ${
                  currentConversationId === conversation.id
                    ? darkMode
                      ? 'bg-gradient-to-r from-red-900/30 to-slate-900/30 border-red-600'
                      : 'bg-gradient-to-r from-red-50 to-slate-50 border-red-600'
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
                          ? darkMode ? 'text-red-400' : 'text-red-600'
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
                            className={`flex-1 text-sm font-semibold border-2 border-red-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
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
                                ? 'hover:bg-red-900/50 text-red-400'
                                : 'hover:bg-red-50 text-red-600'
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
                          {searchQuery && titleMatches.length > 0
                            ? highlightText(conversation.title, searchQuery)
                            : conversation.title}
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
                      {searchResult && searchResult.matches.length > 0 && (
                        <>
                          <Circle className={`w-1 h-1 fill-current ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                          }`}>
                            {searchResult.matches.length} coincidencia{searchResult.matches.length !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Mostrar snippets de mensajes encontrados */}
                    {searchResult && searchResult.matches.filter(m => m.type === 'message').length > 0 && (
                      <div className={`mt-2 ml-6 text-xs space-y-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {searchResult.matches
                          .filter(m => m.type === 'message')
                          .slice(0, 2) // Mostrar máximo 2 snippets
                          .map((match, idx) => (
                            <div key={idx} className="truncate italic">
                              "{highlightText(match.snippet, searchQuery)}"
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de acción (aparecen al hacer hover) */}
                  {editingId !== conversation.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onUpdateTitle && (
                        <button
                          onClick={(e) => handleStartEdit(conversation, e)}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? 'hover:bg-red-900/50 text-red-400'
                              : 'hover:bg-red-50 text-red-600'
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
            );
            })}
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