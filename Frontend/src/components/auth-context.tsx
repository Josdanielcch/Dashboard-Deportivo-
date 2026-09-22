'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { setToken as setApiToken } from '../services/api'

interface User {
  id?: number | string
  username?: string
  full_name?: string
  email?: string
  role_id?: number
  avatar_url?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  updateContextUser: (updatedData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Limpiar residuos antiguos de token sensible en localStorage
    localStorage.removeItem('token')

    let isMounted = true

    // Silent refresh al cargar o recargar (F5) usando la cookie HttpOnly
    const checkAuth = async () => {
      try {
        const res: any = await authService.refreshToken()
        if (isMounted && res?.success && res?.token) {
          setToken(res.token)
          setApiToken(res.token)
          setUser(res.user)
          setIsAuthenticated(true)
        }
      } catch (err) {
        // No hay sesión activa o expiró el refresh token
      } finally {
        if (isMounted) setMounted(true)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setApiToken(newToken)
    setUser(newUser)
    setIsAuthenticated(true)
    // El token de acceso vive únicamente en memoria (seguridad OWASP)
    localStorage.removeItem('token')
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const updateContextUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      setToken(null)
      setApiToken(null)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#060a1a' }} />
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, updateContextUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      isAuthenticated: false,
      token: null,
      user: null,
      login: () => {},
      logout: async () => {},
      updateContextUser: () => {},
    }
  }
  return context
}

export function useAuthSafe() {
  const context = useContext(AuthContext)
  return context || {
    isAuthenticated: false,
    token: null,
    user: null,
    login: () => {},
    logout: async () => {},
    updateContextUser: () => {},
  }
}
