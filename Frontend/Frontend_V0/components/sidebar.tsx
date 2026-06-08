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
} from 'lucide-react'
import { useAuthSafe } from './auth-context'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
}

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const { userName, logout } = useAuthSafe()

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'canchas', label: 'Canchas', icon: Dumbbell },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'usuarios', label: 'Usuarios', icon: UserCog },
    { id: 'auditoria', label: 'Auditoría', icon: Shield },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-border p-6 flex flex-col h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          CC
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">CourtManager</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {modules.map((module) => {
          const Icon = module.icon
          const isActive = activeModule === module.id
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary text-opacity-70 hover:text-opacity-100'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{module.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Profile & Theme */}
      <div className="border-t border-border pt-4 space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          © 2024 CourtManager
        </p>
      </div>
    </aside>
  )
}
