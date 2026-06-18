'use client'

import { useState } from 'react'
import { LogIn, Mail, Lock, Dumbbell, Calendar, Users, Activity, CheckCircle, Clock } from 'lucide-react'

interface LoginViewProps {
  onLogin: (token: string, user: any) => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      const { authService } = await import('@/services/authService')
      
      if (isSignUp) {
        setError('El registro directo no está habilitado contacte a un admin.')
        return
      }

      const data = await authService.login(email, password)
      
      onLogin(data.token, data.user)
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex font-sans text-white">
      {/* SECCIÓN IZQUIERDA - Información del Sistema */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1c] flex-col justify-between p-12 relative border-r border-white/5">
        
        {/* Decoración de fondo */}
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-[#c0ff00]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* Logo y Título */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c0ff00] text-black shadow-[0_0_20px_rgba(192,255,0,0.3)]">
              <Dumbbell size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">CourtManager</h2>
              <p className="text-[#c0ff00] font-bold text-[10px] uppercase tracking-widest mt-1">Sistema de Gestión Integral</p>
            </div>
          </div>

          {/* Grid de Estadísticas */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="bg-[#121827]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-black text-[#c0ff00]">150+</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Canchas Registradas</div>
            </div>
            <div className="bg-[#121827]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-black text-[#c0ff00]">5,000+</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Clientes Activos</div>
            </div>
            <div className="bg-[#121827]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-black text-[#c0ff00]">99.9%</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Uptime del Sistema</div>
            </div>
            <div className="bg-[#121827]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-black text-[#c0ff00]">24/7</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Soporte Técnico</div>
            </div>
          </div>

          {/* Características en lista */}
          <div className="space-y-6 pt-4">
            <div className="flex gap-5 bg-[#121827]/40 p-4 rounded-2xl border border-white/5 items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#c0ff00]/10 border border-[#c0ff00]/20 flex-shrink-0">
                <Dumbbell className="text-[#c0ff00]" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gestión de Canchas</h3>
                <p className="text-zinc-400 text-xs mt-1">Administra todas tus canchas deportivas de forma eficiente</p>
              </div>
            </div>

            <div className="flex gap-5 bg-[#121827]/40 p-4 rounded-2xl border border-white/5 items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#c0ff00]/10 border border-[#c0ff00]/20 flex-shrink-0">
                <Calendar className="text-[#c0ff00]" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reservas en Tiempo Real</h3>
                <p className="text-zinc-400 text-xs mt-1">Controla disponibilidad y reservas de tu complejo</p>
              </div>
            </div>

            <div className="flex gap-5 bg-[#121827]/40 p-4 rounded-2xl border border-white/5 items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#c0ff00]/10 border border-[#c0ff00]/20 flex-shrink-0">
                <Users className="text-[#c0ff00]" size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gestión de Clientes</h3>
                <p className="text-zinc-400 text-xs mt-1">Administra toda tu cartera de clientes y usuarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex flex-col gap-4 mt-8 pt-8 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#c0ff00] animate-pulse"></div>
            <span className="text-xs text-zinc-400 font-medium">Sistema en línea</span>
          </div>
          <p className="text-xs text-zinc-500">
            © 2024 CourtManager. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative bg-[#0a0f1c]">
        {/* Decoración de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c0ff00]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div className="bg-[#121827]/90 border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c0ff00]/20 bg-[#c0ff00]/10 text-[#c0ff00]">
                  <LogIn size={26} />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                {isSignUp ? 'Crear Cuenta' : <>Bienvenido de <span className="text-[#c0ff00]">vuelta</span></>}
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                {isSignUp ? 'Registrate para acceder' : 'Inicia sesión en tu cuenta'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-white mb-2 tracking-wide uppercase">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0f1c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c0ff00] focus:ring-1 focus:ring-[#c0ff00] transition-all text-sm"
                  />
                </div>
              )}

              {/* Campo Email / Usuario */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 tracking-wide uppercase">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-[#c0ff00]/80" size={18} />
                  {/* SE USA type="text" PARA EVITAR LA VALIDACIÓN NATIVA QUE EXIGE EL '@' */}
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@example.com o usuario"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0a0f1c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c0ff00] focus:ring-1 focus:ring-[#c0ff00] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 tracking-wide uppercase">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-[#c0ff00]/80" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0a0f1c] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c0ff00] focus:ring-1 focus:ring-[#c0ff00] transition-all text-sm tracking-widest"
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  {error}
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full px-4 py-3.5 rounded-xl bg-[#c0ff00] text-black font-black uppercase tracking-wider hover:bg-[#a6e000] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-8 text-sm shadow-[0_0_20px_rgba(192,255,0,0.2)]"
              >
                <LogIn size={18} />
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divisor */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-zinc-500 font-medium">O</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Link para cambiar entre login y signup */}
            <p className="text-center text-xs text-zinc-400 font-medium">
              {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setName('')
                }}
                className="text-[#c0ff00] font-bold hover:underline ml-1 transition-all"
              >
                {isSignUp ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>

            {/* Demo credentials */}
            <div className="mt-8 p-4 rounded-xl bg-[#0a0f1c]/50 border border-white/5 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c0ff00]"></div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Credenciales de prueba</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#c0ff00]"></div>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono font-medium text-[#c0ff00]">
                <span>demo@example.com</span>
                <span className="text-zinc-600">/</span>
                <span>password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
