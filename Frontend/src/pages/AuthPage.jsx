import { useState, useEffect } from 'react';
import { 
  LogIn, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  KeyRound 
} from 'lucide-react';
import { authService } from '../services/authService';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'recover', 'reset'
  const [token, setToken] = useState('');
  
  // Form Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);

  // Check URL query parameters for token (e.g. ?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setView('reset');
      // Clean up the URL to keep it pristine and secure
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Show error with a shake animation
  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return triggerError('Por favor ingresa todos los campos');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login(username, password);
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 1200);
    } catch (err) {
      triggerError(err.message || 'Error en las credenciales');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return triggerError('Por favor ingresa tu correo electrónico');
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await authService.recoverPassword(email);
      setSuccess(data.message || '¡Enlace de recuperación enviado con éxito!');
      setEmail('');
    } catch (err) {
      triggerError(err.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return triggerError('Por favor ingresa todos los campos');
    }
    if (newPassword.length < 6) {
      return triggerError('La contraseña debe tener al menos 6 caracteres');
    }
    if (newPassword !== confirmPassword) {
      return triggerError('Las contraseñas no coinciden');
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await authService.resetPassword(token, newPassword);
      setSuccess(data.message || '¡Contraseña restablecida correctamente!');
      setTimeout(() => {
        setView('login');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      triggerError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const changeView = (newView) => {
    setError('');
    setSuccess('');
    setView(newView);
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className={`auth-card-glass ${shake ? 'animate-shake' : ''}`}>
        
        {/* Card Header */}
        <div className="auth-header">
          <div className="logo-badge">
            <Sparkles className="logo-spark" />
            <span>OS</span>
          </div>
          <h1>SportSpaces</h1>
          <p className="subtitle">Gestión de Complejos Deportivos</p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="alert alert-danger">
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* View 1: Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form" id="login-form">
            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_alex"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Contraseña</label>
                <button 
                  type="button" 
                  className="text-link forgot-btn"
                  onClick={() => changeView('recover')}
                  disabled={loading}
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Ingresar a la cancha</span>
                  <LogIn size={18} className="btn-icon-right" />
                </>
              )}
            </button>
          </form>
        )}

        {/* View 2: Recover Password Form */}
        {view === 'recover' && (
          <form onSubmit={handleRecoverSubmit} className="auth-form" id="recover-form">
            <div className="form-info">
              <KeyRound className="info-icon" />
              <h3>¿Olvidaste tu contraseña?</h3>
              <p>No te preocupes. Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecerla de inmediato.</p>
            </div>

            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <span>Enviar enlace de recuperación</span>
              )}
            </button>

            <button 
              type="button" 
              className="btn-text-back"
              onClick={() => changeView('login')}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Volver al inicio de sesión</span>
            </button>
          </form>
        )}

        {/* View 3: Reset Password Form */}
        {view === 'reset' && (
          <form onSubmit={handleResetSubmit} className="auth-form" id="reset-form">
            <div className="form-info">
              <Lock className="info-icon" />
              <h3>Crear nueva contraseña</h3>
              <p>Define una contraseña segura que recuerdes con facilidad para ingresar a tu cuenta.</p>
            </div>

            <div className="input-group">
              <label htmlFor="new-password">Nueva Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="new-password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caracteres"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="confirm-password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <span>Restablecer mi contraseña</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
