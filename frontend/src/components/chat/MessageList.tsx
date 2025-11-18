import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { useTheme } from '../../contexts/ThemeContext';
import { Brain, Sparkles, HelpCircle, Lightbulb } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { darkMode } = useTheme();
  
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center max-w-lg">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border shadow-sm ${
            darkMode
              ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700/50'
              : 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200/50'
          }`}>
            <Brain className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-3 flex items-center justify-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Sparkles className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            Hola, soy Asistente PBL
          </h3>
          <p className={`mb-10 text-base leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Puedo ayudarte a analizar problemas usando el método de Aprendizaje Basado en Problemas.
            Hazme una pregunta para comenzar.
          </p>
          
          <div className="space-y-3 text-left">
            <div className={`text-sm p-4 rounded-xl cursor-pointer border-2 transition-all group ${
              darkMode
                ? 'text-slate-200 hover:bg-emerald-900/30 border-slate-600 hover:border-emerald-600/50'
                : 'text-slate-700 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
            }`}>
              <div className="flex items-start gap-3">
                <HelpCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <span className="font-medium">"¿Cómo analizo este problema paso a paso?"</span>
              </div>
            </div>
            <div className={`text-sm p-4 rounded-xl cursor-pointer border-2 transition-all group ${
              darkMode
                ? 'text-slate-200 hover:bg-emerald-900/30 border-slate-600 hover:border-emerald-600/50'
                : 'text-slate-700 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
            }`}>
              <div className="flex items-start gap-3">
                <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <span className="font-medium">"¿Qué aspectos debo considerar primero?"</span>
              </div>
            </div>
            <div className={`text-sm p-4 rounded-xl cursor-pointer border-2 transition-all group ${
              darkMode
                ? 'text-slate-200 hover:bg-emerald-900/30 border-slate-600 hover:border-emerald-600/50'
                : 'text-slate-700 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
            }`}>
              <div className="flex items-start gap-3">
                <Brain className={`w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <span className="font-medium">"¿Puedes guiarme por el método PBL?"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};