import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/coursesService';
import { filesService } from '../../services/filesService';
import { Course, CourseFile, AppUser } from '../../types';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { Analytics } from './Analytics';

interface TeacherHomeProps {
  user: AppUser;
  onLogout: () => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'analytics'>('files');
  
  // Modal de crear curso
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await coursesService.getCoursesByTeacher(user.uid);
      setCourses(coursesData);
      
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  const loadFiles = useCallback(async () => {
    if (!selectedCourse) return;
    
    try {
      const filesData = await filesService.getCourseFiles(selectedCourse.id);
      setFiles(filesData);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    }
  }, [selectedCourse]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (selectedCourse) {
      loadFiles();
    }
  }, [selectedCourse, loadFiles]);

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      alert('El título del curso es obligatorio');
      return;
    }

    try {
      const newCourse = await coursesService.createCourse(
        newCourseTitle,
        newCourseDescription,
        user.uid,
        user.displayName || user.email || 'Profesor'
      );
      
      setCourses([...courses, newCourse]);
      setSelectedCourse(newCourse);
      setShowCreateModal(false);
      setNewCourseTitle('');
      setNewCourseDescription('');
    } catch (error) {
      console.error('Error creando curso:', error);
      alert('Error al crear el curso');
    }
  };

  const handleFileUploaded = (file: CourseFile) => {
    setFiles([...files, file]);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedCourse) return;
    
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      await filesService.deleteFile(selectedCourse.id, fileId, file.url);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const handleGoToChat = () => {
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.id}/chat`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Docente</h1>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          // Sin cursos - Mostrar crear
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No tienes cursos creados
            </h2>
            <p className="text-gray-600 mb-6">
              Crea tu primer curso para comenzar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Crear curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Lista de cursos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Mis cursos</h2>
                  {courses.length < 1 && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Crear
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {selectedCourse && (
                <div className="space-y-6">
                  {/* Header del curso */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedCourse.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                          {selectedCourse.description}
                        </p>
                      </div>
                      <button
                        onClick={handleGoToChat}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium"
                      >
                        Ir al chatbot
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="border-b border-gray-200">
                      <nav className="flex">
                        <button
                          onClick={() => setActiveTab('files')}
                          className={`px-6 py-4 text-sm font-medium ${
                            activeTab === 'files'
                              ? 'border-b-2 border-blue-500 text-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Archivos del curso
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className={`px-6 py-4 text-sm font-medium ${
                            activeTab === 'analytics'
                              ? 'border-b-2 border-blue-500 text-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Analíticas
                        </button>
                      </nav>
                    </div>

                    <div className="p-6">
                      {activeTab === 'files' ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Subir archivos
                            </h3>
                            <FileUpload
                              courseId={selectedCourse.id}
                              userId={user.uid}
                              onFileUploaded={handleFileUploaded}
                            />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Archivos subidos ({files.length})
                            </h3>
                            <FileList
                              files={files}
                              onDelete={handleDeleteFile}
                            />
                          </div>
                        </div>
                      ) : (
                        <Analytics courseId={selectedCourse.id} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Curso */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Crear nuevo curso</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del curso *
                </label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Algoritmos Avanzados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el curso..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Crear curso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};