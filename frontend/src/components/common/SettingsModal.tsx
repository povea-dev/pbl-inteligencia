import React, { useState, useEffect } from 'react';
import { AppUser } from '../../types';
import { X, User, Moon, Sun, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsModalProps {
  user: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (updatedUser: AppUser) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdate
}) => {
  const { darkMode, setDarkMode } = useTheme();
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      await updateDoc(userRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName
      });

      // Actualizar usuario local
      onUserUpdate({
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      setError('Error al actualizar el perfil. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in-up ${
          darkMode 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          darkMode 
            ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900' 
            : 'border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50'
        }`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <User className="w-5 h-5 text-emerald-600" />
            Configuración
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                : 'hover:bg-white/50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`p-6 space-y-6 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          {/* Perfil */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Perfil
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'border-slate-200 text-slate-900'
                  }`}
                  placeholder="Juan"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'border-slate-200 text-slate-900'
                  }`}
                  placeholder="Pérez"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className={`w-full border-2 rounded-xl px-4 py-3 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-slate-500' : ''
                  }`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  El correo electrónico no se puede cambiar
                </p>
              </div>
            </div>
          </div>

          {/* Apariencia */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Apariencia
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Sun className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Modo {darkMode ? 'Oscuro' : 'Claro'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cambiar entre tema oscuro y claro
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                {darkMode ? 'Claro' : 'Oscuro'}
              </button>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className={`border-2 rounded-xl p-3 flex items-start gap-3 ${
              darkMode
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`} />
              <p className={`text-sm font-medium ${
                darkMode ? 'text-red-300' : 'text-red-800'
              }`}>{error}</p>
            </div>
          )}

          {success && (
            <div className={`border-2 rounded-xl p-3 flex items-start gap-3 ${
              darkMode
                ? 'bg-emerald-900/20 border-emerald-800'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <p className={`text-sm font-medium ${
                darkMode ? 'text-emerald-300' : 'text-emerald-800'
              }`}>Perfil actualizado correctamente</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex gap-3 ${
          darkMode 
            ? 'border-slate-700 bg-slate-800' 
            : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 border-2 rounded-xl font-semibold transition-colors ${
              darkMode
                ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                : 'border-slate-200 hover:bg-white text-slate-700'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

