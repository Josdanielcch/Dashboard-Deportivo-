'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Coins, Clock, ArrowRight, Settings } from 'lucide-react'
import { paymentService } from '@/services/paymentService'

interface RateItem {
  id: number
  currency_code: string
  currency_name: string
  symbol: string
  rate_to_usd: string | number
  is_active: boolean
  updated_at?: string
}

interface ExchangeRateBadgeProps {
  onNavigate?: (module: string) => void
  compact?: boolean
}

export default function ExchangeRateBadge({ onNavigate, compact = false }: ExchangeRateBadgeProps) {
  const [rates, setRates] = useState<RateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 })

  const badgeRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const fetchRates = async () => {
    try {
      const res = await paymentService.getExchangeRates()
      if (res?.data && Array.isArray(res.data)) {
        setRates(res.data)
      }
    } catch (err) {
      console.error('Error al cargar tasa de cambio en header:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()

    // Recargar periódicamente cada 5 minutos
    const interval = setInterval(fetchRates, 5 * 60 * 1000)

    // Escuchar evento personalizado emitido al guardar tasas en Configuración
    const handleRatesUpdated = () => {
      fetchRates()
    }
    window.addEventListener('exchange-rates-updated', handleRatesUpdated)

    return () => {
      clearInterval(interval)
      window.removeEventListener('exchange-rates-updated', handleRatesUpdated)
    }
  }, [])

  // Posicionamiento dinámico del popover
  const handleToggle = () => {
    if (!showPopover && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right)
      })
    }
    setShowPopover(prev => !prev)
  }

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedInsideBadge = badgeRef.current?.contains(target)
      const clickedInsidePopover = popoverRef.current?.contains(target)
      if (!clickedInsideBadge && !clickedInsidePopover) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopover])

  // Filtrar activas y determinar la última tasa guardada
  const activeRates = rates.filter(r => r.is_active !== false)
  if (!loading && activeRates.length === 0) return null

  // Ordenar por updated_at más reciente
  const sortedRates = [...activeRates].sort((a, b) => {
    const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return timeB - timeA
  })

  // Priorizar VES si está activa, o la más recientemente guardada
  const primaryRate = activeRates.find(r => r.currency_code === 'VES') || sortedRates[0] || activeRates[0]

  if (!primaryRate) return null

  const formatRate = (val: string | number, code: string) => {
    const num = parseFloat(String(val))
    if (isNaN(num)) return '0.00'
    const decimals = code === 'COP' ? 0 : 2
    return num.toLocaleString('es-VE', { minimumFractionDigits: decimals, maximumFractionDigits: 4 })
  }

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Reciente'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ', ' +
             d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return 'Reciente'
    }
  }

  return (
    <>
      {compact ? (
        // Versión compacta para móvil
        <button
          ref={badgeRef}
          onClick={handleToggle}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 transition-colors"
          title={`Última tasa: 1$ = ${formatRate(primaryRate.rate_to_usd, primaryRate.currency_code)} ${primaryRate.symbol}`}
        >
          <Coins size={11} className="text-[#ccff00]" />
          <span className="text-[10px] font-mono font-medium">
            {formatRate(primaryRate.rate_to_usd, primaryRate.currency_code)} {primaryRate.symbol}
          </span>
        </button>
      ) : (
        // Versión elegante y discreta para el Header de escritorio (píldora independiente)
        <button
          ref={badgeRef}
          onClick={handleToggle}
          className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] transition-all text-left select-none shadow-sm cursor-pointer"
          title="Última tasa de cambio guardada. Clic para ver detalles."
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ccff00]/10 text-[#ccff00] group-hover:scale-105 transition-transform shrink-0">
            <Coins size={12} />
          </div>
          <span className="text-xs font-mono font-bold text-zinc-200 group-hover:text-white transition-colors">
            1$ = {formatRate(primaryRate.rate_to_usd, primaryRate.currency_code)} {primaryRate.symbol}
          </span>
        </button>
      )}

      {/* Popover con detalles de la última tasa y monedas secundarias */}
      {showPopover && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{ top: `${popoverPos.top}px`, right: `${popoverPos.right}px` }}
          className="fixed w-72 bg-[#0c122b]/95 backdrop-blur-md border border-[#1a1f3a] rounded-xl shadow-2xl shadow-black/70 p-3.5 z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header del Popover */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ccff00]/10 text-[#ccff00]">
                <Coins size={13} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-none">Tasas de Cambio</h4>
                <span className="text-[10px] text-zinc-400">Moneda base: USD ($)</span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Activa
            </span>
          </div>

          {/* Listado de tasas activas */}
          <div className="space-y-2 mb-3">
            {sortedRates.map(rate => (
              <div
                key={rate.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {rate.currency_name}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Clock size={9} />
                    {formatTimestamp(rate.updated_at)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#ccff00]">
                    1$ = {formatRate(rate.rate_to_usd, rate.currency_code)} {rate.symbol}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para navegar a configuración si tiene permisos */}
          {onNavigate && (
            <button
              onClick={() => {
                setShowPopover(false)
                onNavigate('configuracion')
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-all group"
            >
              <Settings size={12} className="text-zinc-400 group-hover:text-[#ccff00] transition-colors" />
              <span>Gestionar tasas</span>
              <ArrowRight size={11} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
