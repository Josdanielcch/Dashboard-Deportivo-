'use client'

import { useState } from 'react'
import { LogIn, Mail, Lock, Dumbbell, Calendar, Users } from 'lucide-react'

interface LoginViewProps {
  onLogin: (email: string, name: string) => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (isSignUp && !name) {
      setError('Por favor ingresa tu nombre')
      return
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un correo válido')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const displayName = isSignUp ? name : 'Juan Pérez'
    onLogin(email, displayName)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* SECCIÓN IZQUIERDA - Información del Sistema */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-background to-primary/10 flex-col justify-between p-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="relative z-10">
          {/* Logo y Título */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Dumbbell size={28} />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-foreground">CourtManager</h2>
                <p className="text-primary font-semibold text-sm">Sistema de Gestión Integral</p>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
                  <Dumbbell className="text-primary" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Gestión de Canchas</h3>
                <p className="text-muted-foreground text-sm mt-1">Administra todas tus canchas deportivas de forma eficiente</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
                  <Calendar className="text-primary" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reservas en Tiempo Real</h3>
                <p className="text-muted-foreground text-sm mt-1">Controla disponibilidad y reservas de tu complejo</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
                  <Users className="text-primary" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Gestión de Clientes</h3>
                <p className="text-muted-foreground text-sm mt-1">Administra toda tu cartera de clientes y usuarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen alusiva */}
        <div className="relative z-10 mt-8">
          <img
            src="/login-sports.png"
            alt="Sistemas de Gestión de Canchas Deportivas"
            className="w-full h-48 object-cover rounded-xl shadow-2xl border border-primary/20"
          />
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            © 2024 CourtManager. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <LogIn size={32} />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {isSignUp ? 'Crear Cuenta' : 'Bienvenido'}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {isSignUp ? 'Registrate para acceder' : 'Inicia sesión en tu cuenta'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nombre (solo registro) */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              )}

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 mt-6"
              >
                <LogIn size={20} />
                {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divisor */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">O</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Link para cambiar entre login y signup */}
            <p className="text-center text-sm text-muted-foreground">
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
                className="text-primary font-semibold hover:underline"
              >
                {isSignUp ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">Credenciales de prueba:</p>
              <p className="text-xs font-mono text-foreground">demo@example.com</p>
              <p className="text-xs font-mono text-foreground">password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
