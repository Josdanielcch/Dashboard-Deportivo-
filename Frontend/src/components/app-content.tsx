import { useState, useEffect, Suspense, lazy } from 'react'
import { useAuth } from '@/components/auth-context'
import { SocketProvider } from '@/contexts/socket-context'
import LoginView from '@/components/login-view'
import Sidebar from '@/components/sidebar'
import NotificationBell from '@/components/notification-bell'
import { Menu } from 'lucide-react'

const DashboardView = lazy(() => import('@/components/dashboard-view'))
const CanchasView = lazy(() => import('@/components/canchas-view'))
const DeportesView = lazy(() => import('@/components/deportes-view'))
const ReservasView = lazy(() => import('@/components/reservas-view'))
const ClientesView = lazy(() => import('@/components/clientes-view'))
const ProductosView = lazy(() => import('@/components/productos-view'))
const VentasView = lazy(() => import('@/components/ventas-view'))
const ComprasView = lazy(() => import('@/components/compras-view'))
const CxcView = lazy(() => import('@/components/cxc-view'))
const CxpView = lazy(() => import('@/components/cxp-view'))
const UsuariosView = lazy(() => import('@/components/usuarios-view'))
const AuditoriaView = lazy(() => import('@/components/auditoria-view'))
const ProveedoresView = lazy(() => import('@/components/proveedores-view'))
const ConfiguracionView = lazy(() => import('@/components/configuracion-view'))

function ModuleLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl border border-[#ccff00]/20 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Cargando...</span>
      </div>
    </div>
  )
}

export default function AppContent() {
  const { isAuthenticated, login, user } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeModule])

  const navigateTo = (module: string) => {
    setActiveModule(module)
    setIsMobileMenuOpen(false)
  }

  const renderView = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardView onNavigate={navigateTo} />
      case 'canchas': return <CanchasView />
      case 'deportes': return <DeportesView />
      case 'reservas': return <ReservasView />
      case 'clientes': return <ClientesView />
      case 'proveedores': return <ProveedoresView />
      case 'productos': return <ProductosView />
      case 'ventas': return <VentasView />
      case 'compras': return <ComprasView />
      case 'cxc': return <CxcView />
      case 'cxp': return <CxpView />
      case 'usuarios': return <UsuariosView />
      case 'auditoria': return <AuditoriaView />
      case 'configuracion': return <ConfiguracionView />
      default: return <DashboardView onNavigate={navigateTo} />
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#060a1a] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#060a1a] text-white">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={(m) => {
          setActiveModule(m)
          setIsMobileMenuOpen(false)
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <SocketProvider>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
          {/* Background gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#ccff00]/3 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full bg-[#6366f1]/3 blur-[80px]" />
          </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#060a1a]/60 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Menu size={22} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white capitalize">
              Hola, {user?.full_name?.split(' ')[0] || user?.username || 'Admin'}
            </span>
            <span className="text-[10px] text-zinc-500">Panel de Administración</span>
          </div>
          <NotificationBell onNavigate={navigateTo} />
        </div>

        {/* Desktop/Tablet Header Info Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#060a1a]/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white capitalize">¡Hola, {user?.full_name || user?.username || 'Administrador'}!</span>
            <span className="text-xs text-zinc-400">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-4 bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/[0.05] shadow-sm">
            <NotificationBell onNavigate={navigateTo} />
            <div className="h-6 w-px bg-white/[0.06]" />
            <div className="text-right">
              <div className="text-sm font-semibold text-[#ccff00] capitalize">
                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-xs text-zinc-300 font-mono mt-0.5">
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[2200px] mx-auto overflow-x-auto relative z-10">
          <Suspense fallback={<ModuleLoader />}>
            {renderView()}
          </Suspense>
        </div>
      </main>
      </SocketProvider>
    </div>
  )
}
