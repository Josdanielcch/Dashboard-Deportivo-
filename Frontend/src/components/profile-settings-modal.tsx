import { useState, useEffect } from 'react';
import { X, Save, Key, User as UserIcon, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuthSafe } from './auth-context';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateContextUser } = useAuthSafe();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize fields with current user data
  useEffect(() => {
    if (isOpen && user) {
      // Intentar extraer first_name y last_name, si no existen en 'user', quizás están en full_name
      let fn = user.first_name || '';
      let ln = user.last_name || '';
      
      if (!fn && !ln && user.full_name) {
        const parts = user.full_name.split(' ');
        fn = parts[0];
        ln = parts.slice(1).join(' ');
      }

      setFirstName(fn);
      setLastName(ln);
      setCurrentPassword('');
      setNewPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await userService.updateMyProfile({
        first_name: firstName,
        last_name: lastName,
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.success && res.data) {
        setSuccess('Perfil actualizado correctamente.');
        updateContextUser(res.data);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060a1a]/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#0b1126] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserIcon size={18} className="text-[#ccff00]" />
            Configuración de Perfil
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-sm rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 block">Nombre</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2.5 bg-[#060a1a] border border-white/[0.06] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 block">Apellido</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full px-3 py-2.5 bg-[#060a1a] border border-white/[0.06] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-3">
                <Key size={14} />
                Seguridad (Opcional)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300 block">Contraseña Actual</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Requerida solo si vas a cambiarla"
                    className="w-full px-3 py-2.5 bg-[#060a1a] border border-white/[0.06] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300 block">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2.5 bg-[#060a1a] border border-white/[0.06] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all text-sm"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-bold text-[#060a1a] bg-gradient-to-r from-[#ccff00] to-[#a6e000] hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
