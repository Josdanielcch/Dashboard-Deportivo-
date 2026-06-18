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

  const navigateTo = (module: string) => {
    setActiveModule(module)
    setIsMobileMenuOpen(false)
  }

  const renderView = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardView onNavigate={navigateTo} />
      case 'canchas': return <CanchasView />
      case 'reservas': return <ReservasView />
      case 'clientes': return <ClientesView />
      case 'productos': return <ProductosView />
      case 'ventas': return <VentasView />
      case 'cxc': return <CxcView />
      case 'usuarios': return <UsuariosView />
      case 'auditoria': return <AuditoriaView />
      default: return <DashboardView />
    }
  }

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />
  }

  return (
    <div className="flex min-h-screen bg-[#060a1a] text-white">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={(m) => {
          setActiveModule(m)
          setIsMobileMenuOpen(false)
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#ccff00]/3 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full bg-[#6366f1]/3 blur-[80px]" />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#060a1a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccff00] to-[#a6e000] text-[#060a1a] font-bold text-xs shadow-lg shadow-[#ccff00]/20">
              CC
            </div>
            <span className="font-bold text-white text-sm">CourtManager</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden relative z-10">
          {renderView()}
        </div>
      </main>
    </div>
  )
}
