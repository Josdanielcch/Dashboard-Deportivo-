import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, Globe, Trophy, Award, Check, KeyRound, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';
import { loginUser, registerUser, recoverPassword, resetPassword } from '../api';

interface AuthPageProps {
  onLoginSuccess: (user: UserType) => void;
  onCancel: () => void;
}

export default function AuthPage({ onLoginSuccess, onCancel }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'recover' | 'reset'>('register');
  const [token, setToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Recovery & Reset states
  const [recoverEmail, setRecoverEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check URL query parameters for token (e.g. ?token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setActiveTab('reset');
      // Clean up the URL to keep it pristine and secure
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Registration form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membership, setMembership] = useState<'standard' | 'pro'>('pro'); // default to PRO as encouraged by screenshot 1 and 3!
  const [error, setError] = useState('');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const payload = {
        username: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
      };
      const response = await registerUser(payload);

      const userSession: UserType = {
        name: response.user.full_name ?? `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        membershipLevel: membership,
        customerId: response.customer_id,
      };

      localStorage.setItem('courtconnect_token', response.token);
      localStorage.setItem('courtconnect_user_session', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cuenta. Intenta de nuevo.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor ingresar correo y contraseña.');
      return;
    }

    try {
      const payload = {
        username: loginEmail.trim().toLowerCase(),
        password: loginPassword.trim(),
      };
      const response = await loginUser(payload);
      const userSession: UserType = {
        name: response.user.full_name || response.user.username || loginEmail.trim(),
        email: response.user.email || loginEmail.trim().toLowerCase(),
        phone: response.user.phone || '',
        membershipLevel: membership,
        customerId: response.user.customer_id,
      };

      localStorage.setItem('courtconnect_token', response.token);
      localStorage.setItem('courtconnect_user_session', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    } catch (err: any) {
      setError(err?.message || 'Email o contraseña incorrectos.');
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoverEmail.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      const response = await recoverPassword(recoverEmail.trim().toLowerCase());
      setSuccessMessage(response.message || 'Enlace de recuperación enviado con éxito.');
      setRecoverEmail('');
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la solicitud de recuperación.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor ingresa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await resetPassword({ token, password: newPassword });
      setSuccessMessage(response.message || 'Contraseña restablecida correctamente.');
      setTimeout(() => {
        setActiveTab('login');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al restablecer la contraseña.');
    }
  };

  const handleSocialClick = (platform: string) => {
    // Immediate login with social for frictionless UX
    const socialUser: UserType = {
      name: `Jugador ${platform}`,
      email: `deporte.${platform.toLowerCase()}@courtconnect.com`,
      phone: '+52 55 9999 8888',
      membershipLevel: 'pro',
    };
    localStorage.setItem('courtconnect_user_session', JSON.stringify(socialUser));
    onLoginSuccess(socialUser);
  };

  return (
    <div className="max-w-[1200px] mx-auto bg-zinc-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col md:flex-row min-h-[600px] mb-12 relative z-10 animate-fade-in text-white">

      {/* LEFT COLUMN: Stadium branding and community metrics (Matches Image 3) */}
      <div className="w-full md:w-1/2 bg-black/95 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-white/5">

        {/* Background mesh glow and stadium image mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/70 to-zinc-950/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=1200&auto=format&fit=crop"
          alt="Branded Basketball Stadium"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />

        <div className="relative z-20">
          <span className="text-black bg-[#c0ff00] text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest inline-block mb-6 shadow ring-1 ring-[#c0ff00]/20 font-mono">
            Pro Community
          </span>

          <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tight leading-tight uppercase italic">
            Únete a la comunidad <span className="text-[#c0ff00]">CourtConnect</span>
            <br />
            Reserva en segundos
          </h2>

          <p className="text-sm text-zinc-300 mt-4 leading-relaxed max-w-md font-sans font-medium">
            Accede a las mejores canchas de la ciudad, conecta con otros jugadores y lleva tu juego al siguiente nivel con nuestra plataforma premium.
          </p>
        </div>

        {/* Dynamic community metrics stack (Matches Image 3) */}
        <div className="relative z-20 mt-12 md:mt-0 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3.5">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-zinc-900 object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop"
                alt="Player Avatar"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-base font-black text-[#c0ff00] font-headline uppercase">+2,500 jugadores</div>
              <p className="text-xs text-zinc-400 font-semibold">ya están reservando activamente hoy.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive login/register sheet (Matches Image 3) */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

        {/* Dual Tab navigation: Registrarse vs Iniciar Sesión */}
        <div className="bg-zinc-950/60 border border-white/5 p-1.5 rounded-2xl flex gap-1 mb-8" id="auth-tabs">
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'register'
                ? 'bg-[#c0ff00] text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-[#c0ff00]'
              }`}
          >
            Registrarse
          </button>

          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'login'
                ? 'bg-[#c0ff00] text-black shadow-lg font-black'
                : 'text-zinc-400 hover:text-[#c0ff00]'
              }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {activeTab === 'register' ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Nombres
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Apellidos
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Teléfono movil
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Email / Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Contraseña de acceso
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {/* Premium Membership Selection Toggle */}
            <div className="pt-2">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono mb-2 block">
                Nivel de Membresía
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMembership('standard')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${membership === 'standard'
                      ? 'border-zinc-700 bg-zinc-950/50 ring-1 ring-zinc-500'
                      : 'border-white/10'
                    }`}
                >
                  <div className="text-xs font-bold text-white">Estándar</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Acceso básico a reservas</div>
                  {membership === 'standard' && <Check className="h-4 w-4 text-zinc-400 absolute top-2.5 right-2.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMembership('pro')}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${membership === 'pro'
                      ? 'border-[#c0ff00] bg-[#c0ff00]/10 ring-1 ring-[#c0ff00]'
                      : 'border-white/10'
                    }`}
                >
                  <div className="text-xs font-black text-[#c0ff00] flex items-center gap-1 font-mono uppercase tracking-wide">
                    <Award className="h-3.5 w-3.5 text-[#c0ff00]" /> Pro Premium
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Ahorra 25% en reservas</div>
                  {membership === 'pro' && <Check className="h-4 w-4 text-[#c0ff00] absolute top-2.5 right-2.5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
              id="submit-register"
            >
              Crear Cuenta
            </button>
          </form>
        ) : activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('recover');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[9px] text-zinc-400 hover:text-[#c0ff00] hover:underline uppercase tracking-wider font-bold"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
              id="submit-login"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : activeTab === 'recover' ? (
          /* RECOVER PASSWORD FORM */
          <form onSubmit={handleRecoverSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-2">
              <KeyRound className="h-10 w-10 text-[#c0ff00] mx-auto animate-pulse" />
              <h3 className="text-base font-bold uppercase tracking-tight">¿Olvidaste tu contraseña?</h3>
              <p className="text-xs text-zinc-400 font-medium">Ingresa tu correo registrado y te enviaremos un enlace seguro para restablecerla.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}
            {successMessage && <p className="text-xs text-[#c0ff00] font-bold font-sans">✓ {successMessage}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
            >
              Enviar Enlace
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full flex items-center justify-center gap-1 text-[10px] font-black text-zinc-400 hover:text-[#c0ff00] transition-colors uppercase tracking-widest font-mono pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a iniciar sesión</span>
            </button>
          </form>
        ) : (
          /* RESET PASSWORD FORM */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="text-center space-y-2 mb-2">
              <Lock className="h-10 w-10 text-[#c0ff00] mx-auto animate-pulse" />
              <h3 className="text-base font-bold uppercase tracking-tight">Crear nueva contraseña</h3>
              <p className="text-xs text-zinc-400 font-medium">Define una nueva contraseña segura para tu cuenta.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#c0ff00] uppercase tracking-widest font-mono">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#c0ff00]/80 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/10 rounded-xl text-sm focus:border-[#c0ff00] outline-none font-semibold text-white"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-bold font-sans">⚠️ {error}</p>}
            {successMessage && <p className="text-xs text-[#c0ff00] font-bold font-sans">✓ {successMessage}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#c0ff00] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.03] transition-all shadow-lg shadow-[#c0ff00]/10 cursor-pointer"
            >
              Restablecer Contraseña
            </button>
          </form>
        )}

        {/* SOCIAL AUTH DIVIDER (Matches Image 3) */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative z-10 bg-zinc-900 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">
            o continúa con
          </span>
        </div>

        {/* Google & Facebook Direct login tags */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialClick('Google')}
            className="py-2.5 px-4 border border-white/10 rounded-xl text-xs font-bold text-white bg-zinc-950/40 hover:bg-zinc-800/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-sm"
          >
            {/* Google SVG Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => handleSocialClick('Facebook')}
            className="py-2.5 px-4 border border-white/10 rounded-xl text-xs font-bold text-white bg-zinc-950/40 hover:bg-zinc-800/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-sm"
          >
            {/* Facebook SVG Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-black text-zinc-500 hover:text-[#c0ff00] hover:underline text-center mt-6 transition-colors uppercase tracking-widest font-mono cursor-pointer"
        >
          Volver a las canchas
        </button>
      </div>
    </div>
  );
}
