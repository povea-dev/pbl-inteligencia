import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { StudentActivity, FrequentQuestion } from '../../types';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Loader2,
  Calendar,
  HelpCircle,
  Circle
} from 'lucide-react';

interface AnalyticsProps {
  courseId: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ courseId }) => {
  const [stats, setStats] = useState<{
    totalConversations: number;
    totalMessages: number;
    activeStudents: number;
    avgMessagesPerConversation: number;
  } | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsData, activityData, questionsData] = await Promise.all([
        analyticsService.getCourseStats(courseId),
        analyticsService.getStudentActivity(courseId),
        analyticsService.getFrequentQuestions(courseId)
      ]);
      
      setStats(statsData);
      setStudentActivity(activityData);
      setFrequentQuestions(questionsData);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard completo - Mostrar todo */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Resumen del curso
        </h3>
        
        {/* Estadísticas */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">Total conversaciones</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalConversations}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">Total mensajes</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalMessages}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">Estudiantes activos</p>
            <p className="text-3xl font-bold text-slate-900">{stats.activeStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">Promedio mensajes/conv</p>
            <p className="text-3xl font-bold text-slate-900">{stats.avgMessagesPerConversation.toFixed(1)}</p>
          </div>
        </div>
        )}

        {/* Estudiantes */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Estudiantes activos
          </h4>
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-emerald-50/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Conversaciones
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mensajes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Última actividad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {studentActivity.map((student) => (
                  <tr key={student.studentId} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {student.studentEmail === 'Cargando...' ? (
                        <span className="text-slate-400 italic">Cargando...</span>
                      ) : (
                        student.studentEmail
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {student.conversationsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {student.totalMessages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {student.lastActivity.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {studentActivity.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="font-medium">No hay actividad de estudiantes todavía</p>
            </div>
          )}
        </div>

        {/* Preguntas frecuentes */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Preguntas más frecuentes
          </h4>
        <div className="space-y-4">
          {frequentQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="font-medium">No hay preguntas registradas todavía</p>
            </div>
          ) : (
            frequentQuestions.map((q, index) => (
              <div key={q.id} className="bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 mb-3 leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Preguntada {q.count} vez{q.count !== 1 ? 'es' : ''}
                      </span>
                      <Circle className="w-1 h-1 fill-current text-slate-400" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Última vez: {q.lastAsked.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};