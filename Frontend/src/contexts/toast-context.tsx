'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
  confirmAction: (message: string, onConfirm: () => void) => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  confirmAction: () => {},
})

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/15 border-red-500/30 text-red-300',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
}

const iconStyles = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<{
    message: string
    onConfirm: () => void
  } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const confirmAction = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm })
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, confirmAction }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
          {toasts.map(toast => {
            const Icon = icons[toast.type]
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl animate-in slide-in-from-right duration-300 ${styles[toast.type]}`}
              >
                <Icon size={18} className={`shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-zinc-400 hover:text-white transition-colors p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body
      )}
      {confirmState && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">{confirmState.message}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm()
                  setConfirmState(null)
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-[#060a1a] bg-gradient-to-r from-[#ccff00] to-[#a6e000] hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
