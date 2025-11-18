import React, { useState, useEffect } from 'react';
import { notificationsService, Notification } from '../../services/notificationsService';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, X, FileText, BookOpen, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadNotifications = async () => {
      try {
        const notifs = await notificationsService.getUserNotifications(userId);
        setNotifications(notifs);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Suscribirse a notificaciones en tiempo real
    const unsubscribe = notificationsService.subscribeToNotifications(userId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navegar al curso si es una notificación de archivo
    if (notification.type === 'file_uploaded' && notification.courseId) {
      navigate(`/course/${notification.courseId}/chat`);
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div 
        className={`absolute right-0 top-0 h-full w-full max-w-md sm:max-w-lg shadow-2xl ${
          darkMode 
            ? 'bg-slate-800 border-l border-slate-700' 
            : 'bg-white border-l border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <Bell className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Notificaciones
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-200 border-t-red-600 mx-auto mb-2"></div>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Cargando notificaciones...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <Bell className={`w-16 h-16 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mb-4`} />
              <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No hay notificaciones
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Te notificaremos cuando haya novedades
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-all ${
                    notification.read
                      ? darkMode 
                        ? 'bg-slate-800 hover:bg-slate-750' 
                        : 'bg-white hover:bg-slate-50'
                      : darkMode
                        ? 'bg-slate-700/50 hover:bg-slate-700'
                        : 'bg-red-50/50 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.type === 'file_uploaded'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {notification.type === 'file_uploaded' ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-semibold text-sm mb-1 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm leading-relaxed ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-2 ${
                            darkMode ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            {notification.createdAt.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

