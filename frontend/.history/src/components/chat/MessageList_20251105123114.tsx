import React from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { Lightbulb, Search, Puzzle, MessageSquare, Zap } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        <div className="text-center max-w-2xl p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold mb-6 text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Comienza tu Análisis PBL
          </h2>
          
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            Analiza el problema utilizando el método de Aprendizaje Basado en Problemas. 
            Escribe tu razonamiento paso a paso para recibir retroalimentación personalizada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Identificación</h3>
              </div>
              <p className="text-sm text-slate-600">Analiza y define el problema central</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Descomposición</h3>
              </div>
              <p className="text-sm text-slate-600">Divide el problema en componentes</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Soluciones</h3>
              </div>
              <p className="text-sm text-slate-600">Propone alternativas creativas</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Justificación</h3>
              </div>
              <p className="text-sm text-slate-600">Fundamenta tu razonamiento</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-1 shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Consejo de inicio
              </h4>
              <p className="text-sm text-slate-600">
                Comienza describiendo tu entendimiento del problema y los conceptos clave involucrados. 
                La IA te guiará a través del proceso PBL paso a paso.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};