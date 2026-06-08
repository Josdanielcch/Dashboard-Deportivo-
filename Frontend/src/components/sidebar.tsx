'use client'

import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  Users,
  Package,
  TrendingUp,
  UserCog,
  Shield,
  LogOut,
  X
} from 'lucide-react'
import { useAuthSafe } from './auth-context'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

export default function Sidebar({ activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const { userName, logout } = useAuthSafe()

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'canchas', label: 'Canchas', icon: Dumbbell },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'cxc', label: 'CxC', icon: Shield }, // CxC added
    { id: 'usuarios', label: 'Usuarios', icon: UserCog },
    { id: 'auditoria', label: 'Auditoría', icon: Shield },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border p-6 flex flex-col h-screen transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              CC
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">CourtManager</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {modules.map((module) => {
            const Icon = module.icon
            const isActive = activeModule === module.id
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
                <span className="text-sm font-medium">{module.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Profile & Theme */}
        <div className="border-t border-border pt-4 mt-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20 font-medium"
          >
            <LogOut size={18} />
            <span className="text-sm">Cerrar Sesión</span>
          </button>

          {/* Footer */}
          <p className="text-xs text-muted-foreground/60 text-center">
            © 2024 CourtManager
          </p>
        </div>
      </aside>
    </>
  )
}
