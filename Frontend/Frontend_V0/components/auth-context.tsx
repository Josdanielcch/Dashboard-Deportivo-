'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string
  userName: string
  login: (email: string, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedEmail = localStorage.getItem('userEmail')
    const savedName = localStorage.getItem('userName')

    if (savedEmail && savedName) {
      setUserEmail(savedEmail)
      setUserName(savedName)
      setIsAuthenticated(true)
    }
  }, [])

  const login = (email: string, name: string) => {
    setUserEmail(email)
    setUserName(name)
    setIsAuthenticated(true)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userName', name)
  }

  const logout = () => {
    setUserEmail('')
    setUserName('')
    setIsAuthenticated(false)
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      login: () => {},
      logout: () => {},
    }
  }
  return context
}

export function useAuthSafe() {
  const context = useContext(AuthContext)
  return context || {
    isAuthenticated: false,
    userEmail: '',
    userName: '',
    login: () => {},
    logout: () => {},
  }
}
