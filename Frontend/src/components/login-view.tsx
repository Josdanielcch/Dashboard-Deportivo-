'use client'

import { useState, useEffect, useRef } from 'react'
import { LogIn, Mail, Lock, Dumbbell, Calendar, Users, UserPlus, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff, Sparkles, Shield, Zap, Award } from 'lucide-react'

interface LoginViewProps {
  onLogin: (token: string, user: any) => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Reset password state
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      setResetToken(urlToken)
      setActiveTab('reset')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }
    setIsSubmitting(true)
    try {
      const { authService } = await import('@/services/authService')
      const data = await authService.login(email, password)
      onLogin(data.token, data.user)
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !lastName || !email || !phone || !password || !username) {
      setError('Por favor completa todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsSubmitting(true)
    try {
      const { authService } = await import('@/services/authService')
      const data = await authService.register({
        first_name: name, last_name: lastName, email, phone, password, username
      })
      if (data.success) {
        setSuccess('Registro exitoso. Tu cuenta debe ser aprobada por un administrador antes de iniciar sesión.')
        setActiveTab('login')
        setEmail(username)
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }
    setIsSubmitting(true)
    try {
      const { authService } = await import('@/services/authService')
      const data = await authService.recoverPassword(email)
      if (data.success) {
        setSuccess(data.message || 'Te hemos enviado un enlace de recuperación a tu correo.')
        setEmail('')
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!newPassword || !confirmNewPassword) {
      setError('Por favor completa todos los campos')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsSubmitting(true)
    try {
      const { authService } = await import('@/services/authService')
      const data = await authService.resetPassword(resetToken, newPassword)
      if (data.success) {
        setSuccess(data.message || 'Contraseña restablecida correctamente.')
        setTimeout(() => {
          setActiveTab('login')
          setNewPassword('')
          setConfirmNewPassword('')
          setSuccess('')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchTab = (tab: 'login' | 'register' | 'forgot' | 'reset') => {
    setActiveTab(tab)
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-[#060a1a] flex font-sans text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#ccff00]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#ccff00]/3 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#6366f1]/5 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[200px] h-[200px] rounded-full bg-[#ccff00]/5 blur-[60px]" />
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-[#ccff00]/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `float ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite`, opacity: 0.3 + Math.random() * 0.4 }} />
        ))}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ccff00" strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative border-r border-white/[0.03] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} transition-all duration-1000`}>
        <div className="relative z-10 space-y-12">
          <div className="flex items-center gap-4 group">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ccff00] to-[#a6e000] text-[#060a1a] shadow-[0_0_30px_rgba(204,255,0,0.2)] group-hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all duration-500">
              <Dumbbell size={30} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">CourtManager</h2>
              <p className="text-[#ccff00] font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Sistema de Gestión Integral</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[
              { value: '150+', label: 'Canchas Registradas', icon: Dumbbell },
              { value: '5,000+', label: 'Clientes Activos', icon: Users },
              { value: '99.9%', label: 'Uptime del Sistema', icon: Shield },
              { value: '24/7', label: 'Soporte Técnico', icon: Zap },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm hover:bg-white/[0.05] hover:border-[#ccff00]/20 transition-all duration-500">
                  <Icon className="text-[#ccff00] mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" size={20} />
                  <div className="text-2xl font-black text-[#ccff00] group-hover:scale-105 transition-transform">{stat.value}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-medium group-hover:text-zinc-400 transition-colors">{stat.label}</div>
                </div>
              )
            })}
          </div>

          <div className="space-y-4 pt-4">
            {[
              { icon: Dumbbell, title: 'Gestión de Canchas', desc: 'Administra todas tus canchas deportivas de forma eficiente' },
              { icon: Calendar, title: 'Reservas en Tiempo Real', desc: 'Controla disponibilidad y reservas de tu complejo' },
              { icon: Users, title: 'Gestión de Clientes', desc: 'Administra toda tu cartera de clientes y usuarios' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex gap-5 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06] items-center hover:bg-white/[0.04] hover:border-[#ccff00]/10 transition-all duration-500 group">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex-shrink-0 group-hover:bg-[#ccff00]/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="text-[#ccff00]" size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#ccff00] transition-colors">{item.title}</h3>
                    <p className="text-zinc-500 text-xs mt-0.5 group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4 mt-8 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
            </span>
            <span className="text-xs text-zinc-500 font-medium">Todos los sistemas operativos</span>
          </div>
          <p className="text-xs text-zinc-600">© 2025 CourtManager. Todos los derechos reservados.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        <div className={`w-full max-w-md relative z-10 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700 delay-300`}>
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#ccff00]/30 to-transparent" />

            {/* Tabs */}
            {activeTab !== 'reset' && (
              <div className="relative flex bg-white/[0.03] rounded-xl p-1 mb-8 border border-white/[0.06]">
                {[
                  { id: 'login' as const, label: 'Iniciar Sesión', icon: LogIn },
                  { id: 'register' as const, label: 'Registrarse', icon: UserPlus },
                  { id: 'forgot' as const, label: 'Recuperar', icon: KeyRound },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => switchTab(tab.id)}
                      className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive ? 'text-[#060a1a]' : 'text-zinc-500 hover:text-zinc-300'
                      }`}>
                      {isActive && <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#ccff00] to-[#a6e000] shadow-lg shadow-[#ccff00]/20 animate-in fade-in zoom-in" />}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon size={14} /> {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Reset Password Banner */}
            {activeTab === 'reset' && (
              <div className="mb-8 px-4 py-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-center">
                <p className="text-xs text-[#ccff00] font-semibold">Token de recuperación detectado. Crea una nueva contraseña.</p>
              </div>
            )}

            {/* Login */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 text-[#ccff00]"><LogIn size={28} /></div>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Bienvenido de <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">vuelta</span></h1>
                  <p className="text-zinc-500 text-sm font-medium">Inicia sesión en tu cuenta</p>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Correo o Usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm font-medium" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm tracking-widest" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" /> {error}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting}
                  className="relative w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-[#a6e000] text-[#060a1a] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-6 text-sm shadow-[0_0_25px_rgba(204,255,0,0.15)] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#060a1a] border-t-transparent" /> : <><LogIn size={18} /> Iniciar Sesión</>}
                </button>

                <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Credenciales de prueba</p>
                  <div className="flex items-center justify-center gap-3 text-[11px] font-mono font-medium">
                    <span className="text-[#ccff00]">demo@example.com</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-[#ccff00]">password123</span>
                  </div>
                </div>
              </form>
            )}

            {/* Register */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 text-[#ccff00]"><UserPlus size={28} /></div>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Crear <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">Cuenta</span></h1>
                  <p className="text-zinc-500 text-sm font-medium">Regístrate para acceder al sistema</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Nombre</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Apellido</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Pérez"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Nombre de Usuario</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="juan.perez"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Teléfono</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+58 412 123 4567"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Contraseña</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••"
                        className="w-full px-4 pr-12 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Confirmar Contraseña</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••"
                      className="w-full px-4 pr-12 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" /> {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <CheckCircle size={16} className="shrink-0" /> {success}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting}
                  className="relative w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-[#a6e000] text-[#060a1a] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 text-sm shadow-[0_0_25px_rgba(204,255,0,0.15)] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#060a1a] border-t-transparent" /> : <><UserPlus size={18} /> Crear Cuenta</>}
                </button>
              </form>
            )}

            {/* Forgot Password */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 text-[#ccff00]"><KeyRound size={28} /></div>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">¿Olvidaste tu <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">contraseña</span>?</h1>
                  <p className="text-zinc-500 text-sm font-medium">Ingresa tu correo registrado y te enviaremos un enlace seguro</p>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" /> {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <CheckCircle size={16} className="shrink-0" /> {success}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting}
                  className="relative w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-[#a6e000] text-[#060a1a] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 text-sm shadow-[0_0_25px_rgba(204,255,0,0.15)] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#060a1a] border-t-transparent" /> : <><KeyRound size={18} /> Enviar Enlace</>}
                </button>

                <div className="text-center mt-4">
                  <button type="button" onClick={() => switchTab('login')}
                    className="text-xs text-zinc-500 hover:text-[#ccff00] transition-colors flex items-center justify-center gap-1 mx-auto font-medium group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}

            {/* Reset Password */}
            {activeTab === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 text-[#ccff00]"><Lock size={28} /></div>
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Nueva <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">Contraseña</span></h1>
                  <p className="text-zinc-500 text-sm font-medium">Define una nueva contraseña segura para tu cuenta</p>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 caracteres"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 tracking-wide uppercase group-focus-within:text-[#ccff00] transition-colors">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ccff00] transition-colors" size={18} />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.05] transition-all text-sm" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" /> {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                    <CheckCircle size={16} className="shrink-0" /> {success}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting}
                  className="relative w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#ccff00] to-[#a6e000] text-[#060a1a] font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 text-sm shadow-[0_0_25px_rgba(204,255,0,0.15)] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#060a1a] border-t-transparent" /> : <><Lock size={18} /> Restablecer Contraseña</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
