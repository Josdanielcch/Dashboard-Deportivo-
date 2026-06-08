import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useAuth } from '@/components/auth-context'
import LoginView from '@/components/login-view'
import Sidebar from '@/components/sidebar'
import DashboardView from '@/components/dashboard-view'
import CanchasView from '@/components/canchas-view'
import ReservasView from '@/components/reservas-view'
import ClientesView from '@/components/clientes-view'
import ProductosView from '@/components/productos-view'
import VentasView from '@/components/ventas-view'
import CxcView from '@/components/cxc-view'
import UsuariosView from '@/components/usuarios-view'
import AuditoriaView from '@/components/auditoria-view'

export default function AppContent() {
  const { isAuthenticated, login } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      case 'cxc':
        return <CxcView />
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
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={(m) => {
          setActiveModule(m)
          setIsMobileMenuOpen(false)
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              CC
            </div>
            <span className="font-bold text-foreground">CourtManager</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-foreground"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 w-full max-w-screen-2xl mx-auto overflow-x-hidden">
          {renderView()}
        </div>
      </main>
    </div>
  )
}
