import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { StudentActivity, FrequentQuestion } from '../../types';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'questions'>('overview');

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estudiantes
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preguntas frecuentes
          </button>
        </nav>
      </div>

      {/* Contenido según tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total conversaciones</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total mensajes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Estudiantes activos</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Promedio mensajes/conv</p>
            <p className="text-3xl font-bold text-gray-900">{stats.avgMessagesPerConversation}</p>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensajes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última actividad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentActivity.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.conversationsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.totalMessages}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActivity.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {studentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay actividad de estudiantes todavía
            </div>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {frequentQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              No hay preguntas registradas todavía
            </div>
          ) : (
            frequentQuestions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-2">{q.question}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Preguntada {q.count} vez{q.count !== 1 ? 'es' : ''}</span>
                      <span>·</span>
                      <span>Última vez: {q.lastAsked.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};