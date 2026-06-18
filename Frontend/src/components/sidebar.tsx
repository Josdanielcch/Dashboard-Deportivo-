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
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react'
import { useAuthSafe } from './auth-context'
import { useState } from 'react'
import ProfileSettingsModal from './profile-settings-modal'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

export default function Sidebar({ activeModule, setActiveModule, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const { logout, user } = useAuthSafe()
  const userName = user?.full_name || user?.username || ''
  const [collapsed, setCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'canchas', label: 'Canchas', icon: Dumbbell },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'cxc', label: 'CxC', icon: Shield },
    { id: 'usuarios', label: 'Usuarios', icon: UserCog },
    { id: 'auditoria', label: 'Auditoría', icon: Shield },
  ]

  const roleBadge = () => {
    const roleId = user?.role_id
    if (roleId === 1) return 'Administrador'
    if (roleId === 3) return 'Manager'
    if (roleId === 4) return 'Staff'
    if (roleId === 7 || roleId === 10) return 'Cliente'
    return 'Usuario'
  }

  const roleColor = () => {
    const roleId = user?.role_id
    if (roleId === 1) return 'from-[#ccff00] to-[#a6e000]'
    if (roleId === 3) return 'from-blue-400 to-blue-500'
    if (roleId === 4) return 'from-purple-400 to-purple-500'
    return 'from-zinc-400 to-zinc-500'
  }

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#060a1a]/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <aside className={`fixed inset-y-0 left-0 z-40 bg-[#060a1a] border-r border-white/[0.06] p-3 flex flex-col h-screen transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} ${collapsed ? 'w-[72px]' : 'w-64'}`}>

        {/* Logo Header */}
        <div className={`flex items-center mb-6 ${collapsed ? 'flex-col gap-2 pt-2' : 'justify-between px-1'}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'gap-3'}`}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ccff00] to-[#a6e000] text-[#060a1a] font-bold shadow-lg shadow-[#ccff00]/20 group">
              <Dumbbell size={collapsed ? 18 : 20} />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-black text-white leading-tight tracking-tight">CourtManager</h1>
                <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Sistema de Gestión</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all hidden md:block"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <button
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-white transition-all"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {collapsed && (
          <button
            className="mb-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all mx-auto"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Navigation */}
        <nav className={`space-y-0.5 flex-1 overflow-y-auto ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {modules.map((module) => {
            const Icon = module.icon
            const isActive = activeModule === module.id
            return (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id)
                  setIsMobileMenuOpen && setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ccff00]/10 to-transparent text-[#ccff00] border border-[#ccff00]/15'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.5)]" />
                )}
                <Icon size={20} className={`shrink-0 transition-all ${isActive ? 'text-[#ccff00]' : 'group-hover:text-zinc-300'}`} />
                {!collapsed && (
                  <span className="text-sm font-semibold">{module.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_6px_rgba(204,255,0,0.6)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/[0.06] pt-4 mt-4 space-y-3 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {/* User Profile */}
          <div className={`flex items-center ${collapsed ? 'flex-col' : 'gap-3'} px-1`}>
            <div className="relative">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${roleColor()} text-[#060a1a] text-sm font-bold shrink-0`}>
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#060a1a]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName || 'Usuario'}</p>
                <p className="text-[10px] text-[#ccff00] font-semibold uppercase tracking-wider">{roleBadge()}</p>
              </div>
            )}
          </div>

          {/* Actions: Settings & Logout */}
          <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-2 w-full`}>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all border border-white/[0.05] hover:border-white/[0.1] font-semibold text-sm group`}
              title="Configuración de Perfil"
            >
              <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
              {!collapsed && <span>Perfil</span>}
            </button>
            <button
              onClick={logout}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all border border-red-500/10 hover:border-red-500/20 font-semibold text-sm group`}
              title="Cerrar Sesión"
            >
              <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
              {!collapsed && <span>Salir</span>}
            </button>
          </div>

          {!collapsed && (
            <p className="text-[10px] text-zinc-600 text-center pt-1 font-medium">
              CourtManager v2.0
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
