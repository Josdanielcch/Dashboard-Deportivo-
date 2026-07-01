'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Zap, Clock, User as UserIcon } from 'lucide-react'
import { useSocket } from '@/contexts/socket-context'

export default function NotificationBell({ onNavigate }: { onNavigate?: (module: string) => void }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const { notifications, clearNotification, clearAllNotifications, connected } = useSocket()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<any>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const prevCountRef = useRef(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (notifications.length > prevCountRef.current && notifications.length > 0) {
      const diff = notifications.length - prevCountRef.current
      setUnreadCount(c => c + diff)
      const latest = notifications[0]
      setToast(latest)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 6000)
    }
    prevCountRef.current = notifications.length
  }, [notifications])

  const handleOpenDropdown = () => {
    setShowDropdown(v => !v)
    if (!showDropdown) setUnreadCount(0)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(toastTimer.current)
    }
  }, [])

  const handleDismissToast = () => {
    setToast(null)
    clearTimeout(toastTimer.current)
  }

  return (
    <>
      {/* Toast flotante */}
      {toast && (
        <div
          onClick={() => { handleDismissToast(); onNavigate?.('reservas') }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#ccff00]/20 rounded-2xl shadow-2xl shadow-[#ccff00]/10 p-4 cursor-pointer animate-in slide-in-from-bottom-4 duration-300 hover:border-[#ccff00]/40 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ccff00]/15 border border-[#ccff00]/25 flex items-center justify-center shrink-0 animate-pulse">
              <Zap size={18} className="text-[#ccff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#ccff00] uppercase tracking-wider">Nueva Reserva</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismissToast() }}
                  className="text-zinc-500 hover:text-white transition-colors p-0.5 rounded hover:bg-white/[0.05]"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-white font-bold text-sm mt-0.5 truncate">{toast.customer_name}</p>
              <div className="flex items-center gap-3 text-zinc-400 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <UserIcon size={10} />
                  {toast.court_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {toast.start_time?.slice(0, 5)} - {toast.end_time?.slice(0, 5)}
                </span>
              </div>
            </div>
            <div className="absolute top-2 right-10 h-2 w-2 rounded-full bg-[#ccff00] animate-ping" />
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#ccff00]/30 overflow-hidden">
            <div className="h-full w-full bg-[#ccff00] animate-[shrink_6s_linear]" />
          </div>
        </div>
      )}

    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="relative p-2 rounded-xl hover:bg-white/[0.05] transition-colors text-zinc-400 hover:text-white group"
        title={connected ? 'Conectado en tiempo real' : 'Desconectado'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ccff00] text-[9px] font-black text-[#0a0e27] animate-in zoom-in duration-200 shadow-lg shadow-[#ccff00]/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#060a1a] ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#1a1f3a] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1f3a]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Notificaciones</h3>
              <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${connected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {connected ? 'En vivo' : 'Desconectado'}
              </div>
            </div>
            {notifications.length > 0 && (
              <button onClick={clearAllNotifications} className="text-[10px] font-semibold text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]">
                Limpiar todo
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                  <Bell size={18} className="text-zinc-500" />
                </div>
                <p className="text-zinc-500 text-xs">No hay notificaciones nuevas</p>
                <p className="text-zinc-600 text-[10px] mt-1">Las reservas en tiempo real aparecerán aquí</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id || i}
                  onClick={() => {
                    setShowDropdown(false)
                    onNavigate?.('reservas')
                  }}
                  className="px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-[#1a1f3a]/50 last:border-0 group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap size={14} className="text-[#ccff00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#ccff00] uppercase tracking-wider">Nueva Reserva</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); clearNotification(n.id) }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all p-0.5 rounded hover:bg-white/[0.05]"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-white font-semibold text-sm mt-0.5 truncate">{n.customer_name}</p>
                      <div className="flex items-center gap-3 text-zinc-400 text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <UserIcon size={10} />
                          {n.court_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {n.start_time?.slice(0, 5)} - {n.end_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-[#1a1f3a]/50 bg-white/[0.01]">
                <p className="text-[10px] text-zinc-600 text-center">{notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
