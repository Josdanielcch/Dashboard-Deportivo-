'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-context'
import LoginView from '@/components/login-view'
import Sidebar from '@/components/sidebar'
import DashboardView from '@/components/dashboard-view'
import CanchasView from '@/components/canchas-view'
import ReservasView from '@/components/reservas-view'
import ClientesView from '@/components/clientes-view'
import ProductosView from '@/components/productos-view'
import VentasView from '@/components/ventas-view'
import UsuariosView from '@/components/usuarios-view'
import AuditoriaView from '@/components/auditoria-view'

export default function AppContent() {
  const { isAuthenticated, login } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderView = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />
      case 'canchas':
        return <CanchasView />
      case 'reservas':
        return <ReservasView />
      case 'clientes':
        return <ClientesView />
      case 'productos':
        return <ProductosView />
      case 'ventas':
        return <VentasView />
      case 'usuarios':
        return <UsuariosView />
      case 'auditoria':
        return <AuditoriaView />
      default:
        return <DashboardView />
    }
  }

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1">
        {renderView()}
      </main>
    </div>
  )
}
