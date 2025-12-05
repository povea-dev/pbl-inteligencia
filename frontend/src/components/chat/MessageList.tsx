import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { useTheme } from '../../contexts/ThemeContext';
import { Zap, Sparkles, HelpCircle, Lightbulb, Rocket } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onSuggestionClick }) => {
  const { darkMode } = useTheme();
  
  const suggestions = [
    { text: "¿Cómo analizo este problema paso a paso?", icon: HelpCircle },
    { text: "¿Qué aspectos debo considerar primero?", icon: Lightbulb },
    { text: "¿Puedes guiarme por el método PBL?", icon: Rocket },
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };
  
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center max-w-lg">
          <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border shadow-lg group ${
            darkMode
              ? 'bg-gradient-to-br from-red-900/50 via-orange-900/30 to-slate-900/50 border-red-700/50'
              : 'bg-gradient-to-br from-red-100 via-orange-50 to-red-100 border-red-200/50'
          }`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Zap className={`w-10 h-10 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-3 flex items-center justify-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Sparkles className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'} animate-pulse`} />
            ¡Hola! Soy tu Asistente IA
          </h3>
          <p className={`mb-10 text-base leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Puedo ayudarte a analizar problemas usando el método de Aprendizaje Basado en Problemas.
            <span className="font-semibold text-red-600 dark:text-red-400"> ¡Hazme una pregunta para comenzar!</span>
          </p>
          
          <div className="space-y-3 text-left">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={`text-sm p-4 rounded-xl cursor-pointer border-2 transition-all group ${
                    darkMode
                      ? 'text-slate-200 hover:bg-red-900/30 border-slate-600 hover:border-red-600/50 active:scale-95'
                      : 'text-slate-700 hover:bg-red-50 border-slate-200 hover:border-red-300 active:scale-95'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                    <span className="font-medium">"{suggestion.text}"</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};