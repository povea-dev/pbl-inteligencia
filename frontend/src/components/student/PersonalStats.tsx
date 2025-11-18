import React, { useEffect, useState } from 'react';
import { personalStatsService } from '../../services/personalStatsService';
import { PersonalStats } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart3, MessageSquare, BookOpen, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PersonalStatsProps {
  userId: string;
  courseId?: string;
}

export const PersonalStats: React.FC<PersonalStatsProps> = ({ userId, courseId }) => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId, courseId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await personalStatsService.getPersonalStats(userId, courseId);
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        No hay estadísticas disponibles
      </div>
    );
  }

  // Formatear datos para gráficos
  const messagesChartData = stats.messagesByDay.map(item => ({
    fecha: format(new Date(item.date), 'dd/MM'),
    mensajes: item.count
  }));

  const activityChartData = stats.activityByHour.map(item => ({
    hora: `${item.hour}:00`,
    actividad: item.count
  }));

  return (
    <div className={`space-y-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total mensajes</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalMessages}</p>
        </div>

        <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <BookOpen className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Conversaciones</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalConversations}</p>
        </div>

        <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Promedio por conversación</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.averageMessagesPerConversation}</p>
        </div>

        <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <Clock className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tiempo estimado</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalTimeSpent} min</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensajes por día */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Mensajes por día
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messagesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
              <XAxis dataKey="fecha" stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  color: darkMode ? '#cbd5e1' : '#1e293b'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mensajes" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Actividad por hora */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Actividad por hora del día
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
              <XAxis dataKey="hora" stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  color: darkMode ? '#cbd5e1' : '#1e293b'
                }}
              />
              <Bar dataKey="actividad" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temas más frecuentes */}
      {stats.topTopics.length > 0 && (
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Temas más frecuentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.topTopics.map((topic, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode
                    ? 'bg-red-900/30 text-red-200 border border-red-800'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {topic.topic} ({topic.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

