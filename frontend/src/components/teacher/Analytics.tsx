import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { StudentActivity, FrequentQuestion, DailyStats } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Loader2,
  Calendar,
  HelpCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

interface AnalyticsProps {
  courseId: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ courseId }) => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState<{
    totalConversations: number;
    totalMessages: number;
    activeStudents: number;
    avgMessagesPerConversation: number;
  } | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentQuestion[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [activityByHour, setActivityByHour] = useState<Array<{ hour: number; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsData, activityData, questionsData, dailyData, hourlyData] = await Promise.all([
        analyticsService.getCourseStats(courseId),
        analyticsService.getStudentActivity(courseId),
        analyticsService.getFrequentQuestions(courseId),
        analyticsService.getDailyStats(courseId, 30),
        analyticsService.getActivityByHour(courseId)
      ]);
      
      setStats(statsData);
      setStudentActivity(activityData);
      setFrequentQuestions(questionsData);
      setDailyStats(dailyData);
      setActivityByHour(hourlyData);
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
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const messagesChartData = dailyStats.map(stat => ({
    fecha: format(new Date(stat.date), 'dd/MM'),
    mensajes: stat.totalMessages,
    estudiantes: stat.activeStudents
  }));

  const hourlyChartData = activityByHour.map(item => ({
    hora: `${item.hour}:00`,
    actividad: item.count
  }));

  const topStudentsData = studentActivity
    .slice(0, 5)
    .map(student => ({
      nombre: student.studentEmail.split('@')[0],
      mensajes: student.totalMessages
    }));

  const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'];

  return (
    <div className={`space-y-4 sm:space-y-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Dashboard completo - Mostrar todo */}
      <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6`}>
        <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          Resumen del curso
        </h3>
        
        {/* Estadísticas */}
        {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} p-4 sm:p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-xs sm:text-sm mb-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Total conversaciones</p>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalConversations}</p>
          </div>
          <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} p-4 sm:p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-slate-600' : 'bg-slate-100'} rounded-lg flex items-center justify-center`}>
                <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              </div>
            </div>
            <p className={`text-xs sm:text-sm mb-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Total mensajes</p>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.totalMessages}</p>
          </div>
          <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} p-4 sm:p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-cyan-900/30' : 'bg-cyan-100'} rounded-lg flex items-center justify-center`}>
                <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
            </div>
            <p className={`text-xs sm:text-sm mb-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Estudiantes activos</p>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeStudents}</p>
          </div>
          <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} p-4 sm:p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-xs sm:text-sm mb-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Promedio mensajes/conv</p>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.avgMessagesPerConversation.toFixed(1)}</p>
          </div>
        </div>
        )}

        {/* Botón para ver todas las analíticas */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowFullAnalytics(!showFullAnalytics)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200'
            } shadow-sm hover:shadow-md`}
          >
            <Eye className="w-5 h-5" />
            <span>{showFullAnalytics ? 'Ocultar análisis completo' : 'Ver análisis completo'}</span>
            {showFullAnalytics ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Gráficos - Solo mostrar si showFullAnalytics es true */}
        {showFullAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* Gráfico de mensajes por día */}
          {messagesChartData.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <TrendingUp className="w-5 h-5 text-red-600" />
                Actividad diaria (últimos 30 días)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={messagesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="fecha" 
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                      color: darkMode ? '#cbd5e1' : '#1e293b',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#64748b' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mensajes" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    dot={{ fill: '#dc2626', r: 4 }}
                    name="Mensajes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="estudiantes" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Estudiantes activos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de actividad por hora */}
          {hourlyChartData.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Clock className="w-5 h-5 text-red-600" />
                Actividad por hora del día
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="hora" 
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                      color: darkMode ? '#cbd5e1' : '#1e293b',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="actividad" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top estudiantes por mensajes */}
          {topStudentsData.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Users className="w-5 h-5 text-red-600" />
                Top 5 estudiantes más activos
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStudentsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                  <XAxis 
                    type="number"
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="nombre"
                    stroke={darkMode ? '#cbd5e1' : '#64748b'}
                    tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                      color: darkMode ? '#cbd5e1' : '#1e293b',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="mensajes" fill="#dc2626" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribución de conversaciones por estudiante */}
          {studentActivity.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <MessageSquare className="w-5 h-5 text-red-600" />
                Distribución de conversaciones
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentActivity.slice(0, 5).map(s => ({
                      name: s.studentEmail.split('@')[0],
                      value: s.conversationsCount
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentActivity.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                      color: darkMode ? '#cbd5e1' : '#1e293b',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        )}

        {/* Estudiantes - Solo mostrar si showFullAnalytics es true */}
        {showFullAnalytics && (
        <div className="mt-8">
          <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-5 h-5 text-red-600" />
            Estudiantes activos
          </h4>
        <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} rounded-xl border-2 overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className={`bg-gradient-to-r ${darkMode ? 'from-slate-700 to-red-900/30' : 'from-slate-50 to-red-50/30'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Estudiante
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Conversaciones
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Mensajes
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Última actividad
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'divide-slate-600' : 'bg-white divide-slate-200'}`}>
                {studentActivity.map((student) => (
                  <tr key={student.studentId} className={`${darkMode ? 'hover:bg-slate-700' : 'hover:bg-red-50/30'} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      {student.studentEmail === 'Cargando...' ? (
                        <span className={`${darkMode ? 'text-slate-400' : 'text-slate-400'} italic`}>Cargando...</span>
                      ) : (
                        student.studentEmail
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {student.conversationsCount}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {student.totalMessages}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Calendar className="w-3 h-3" />
                      {student.lastActivity.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {studentActivity.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Users className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className="font-medium">No hay actividad de estudiantes todavía</p>
            </div>
          )}
        </div>
        </div>
        )}

        {/* Preguntas frecuentes - Solo mostrar si showFullAnalytics es true */}
        {showFullAnalytics && (
        <div className="mt-8">
          <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <HelpCircle className="w-5 h-5 text-red-600" />
            Preguntas más frecuentes
          </h4>
        <div className="space-y-4">
          {frequentQuestions.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-white border-slate-200 text-slate-500'} rounded-xl border-2 border-dashed`}>
              <HelpCircle className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className="font-medium">No hay preguntas registradas todavía</p>
            </div>
          ) : (
            <>
              {/* Gráfico de barras para preguntas frecuentes */}
              <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'} rounded-xl border-2 p-4 sm:p-6 mb-4`}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={frequentQuestions.slice(0, 5).map((q, i) => ({
                    pregunta: `P${i + 1}`,
                    veces: q.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="pregunta"
                      stroke={darkMode ? '#cbd5e1' : '#64748b'}
                      tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke={darkMode ? '#cbd5e1' : '#64748b'}
                      tick={{ fill: darkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                        color: darkMode ? '#cbd5e1' : '#1e293b',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value} veces`, 'Frecuencia']}
                    />
                    <Bar dataKey="veces" fill="#dc2626" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Lista de preguntas */}
              {frequentQuestions.map((q, index) => (
                <div key={q.id} className={`${darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-red-600/50' : 'bg-white border-slate-200 hover:border-red-300'} p-5 rounded-xl border-2 hover:shadow-md transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 ${darkMode ? 'bg-gradient-to-br from-red-900/50 to-slate-800 border-red-800 text-red-300' : 'bg-gradient-to-br from-red-100 to-slate-100 border-red-200 text-red-700'} rounded-xl flex items-center justify-center font-bold text-sm border`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-3 leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>{q.question}</p>
                      <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Preguntada {q.count} vez{q.count !== 1 ? 'es' : ''}
                        </span>
                        <Circle className={`w-1 h-1 fill-current ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Última vez: {q.lastAsked.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
};