'use client'

import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Activity, BarChart3, Sparkles, ArrowRight, Wallet, Target, Zap, CircleDollarSign, AlertCircle, Bell } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { statsService } from '@/services/statsService'
import { useSocket } from '@/contexts/socket-context'

interface DashboardViewProps {
  onNavigate?: (module: string) => void
}

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const duration = 800
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased
      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    prevValue.current = end
    requestAnimationFrame(tick)
  }, [value])

  return <>{count.toLocaleString('es-DO', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</>
}

function AnimatedBar({ height, amount, maxAmount, label, active = false, delay = 0 }: { height: number; amount: number; maxAmount: number; label: string; active?: boolean; delay?: number }) {
  const [h, setH] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setTimeout(() => setH(height), 200 + delay)
  }, [height, delay])

  const barHeight = maxAmount > 0 ? (amount / maxAmount) * 100 : 0

  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 group/bar">
      <div className="relative w-full flex justify-center flex-1">
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-3 py-2 shadow-2xl transition-all duration-200 whitespace-nowrap z-20 ${
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <p className="text-xs font-bold text-[#ccff00]">$ {amount.toLocaleString()}</p>
          {active && <p className="text-[10px] text-zinc-400 mt-0.5">Hoy</p>}
        </div>
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-full max-w-[32px] rounded-lg transition-all duration-1000 ease-out cursor-pointer relative self-end ${
            active
              ? 'bg-gradient-to-t from-[#ccff00] to-[#ccff00]/70 shadow-[0_0_20px_rgba(204,255,0,0.2)]'
              : amount > 0
                ? 'bg-gradient-to-t from-zinc-500/40 to-zinc-500/20 hover:from-zinc-500/50'
                : 'bg-zinc-800/30'
          }`}
          style={{ height: `${h}%`, minHeight: amount > 0 ? '4px' : '0px', maxHeight: '100%' }}
        >
          {active && (
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.6)]" />
          )}
        </div>
      </div>
      <span className={`text-[10px] font-bold transition-colors ${active ? 'text-[#ccff00]' : 'text-zinc-500 group-hover/bar:text-zinc-300'}`}>{label}</span>
    </div>
  )
}

function DonutChart({ percentage, size = 100, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const [offset, setOffset] = useState(circumference)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (Math.min(percentage, 100) / 100) * circumference)
      setAnimDone(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [percentage, circumference])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ccff00" strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-white">{animDone ? Math.round(percentage) : 0}<span className="text-xs text-zinc-500">%</span></span>
      </div>
    </div>
  )
}

function NotificationToast({ booking, onDismiss }: { booking: any; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onDismiss, 300)
    }, 6000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(onDismiss, 300)
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${visible && !exiting ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
      <div className="bg-gradient-to-br from-[#0f1533] to-[#0a0e27] border border-[#ccff00]/20 rounded-2xl p-4 shadow-2xl shadow-black/50 max-w-sm backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0 animate-bounce">
            <Zap size={18} className="text-[#ccff00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#ccff00] uppercase tracking-wider mb-1">Nueva Reserva</p>
            <p className="text-white font-bold text-sm truncate">{booking.customer_name}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{booking.court_name} • {booking.start_time?.slice(0, 5)}</p>
          </div>
          <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors p-0.5">
            <XCircle size={14} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ccff00] to-transparent rounded-full overflow-hidden">
          <div className="h-full bg-[#ccff00]/30 animate-[shrink_6s_linear_forwards]" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState('')
  const { notifications: socketNotifications, clearNotification } = useSocket()

  useEffect(() => { setMounted(true) }, [])

  const fetchStats = useCallback(async () => {
    try {
      setError('')
      const res = await statsService.getDashboard()
      if (res.success) {
        setStats(res.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (socketNotifications.length > 0) {
      fetchStats()
    }
  }, [socketNotifications.length, fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-[#1a1f3a] border-t-[#ccff00] animate-spin" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Cargando panel de control...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/15 rounded-2xl p-8 text-center max-w-md">
          <div className="h-14 w-14 mx-auto mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Error de conexión</h3>
          <p className="text-zinc-400 text-sm mb-5">{error}</p>
          <button onClick={fetchStats} className="px-6 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-colors text-sm">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const s = stats || {
    today: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, income: 0, inProgress: 0 },
    week: { income: 0, totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    month: { income: 0 },
    customers: { total: 0 },
    courts: { active: 0, total: 0, occupancy: 0 },
    occupancy: { avgDaily: 0, peakDay: 0 },
    incomeByDay: [],
    weeklyStats: { total: 0, avg: 0, max: 0, bestDay: { day: '-', amount: 0 } },
    courtDistribution: [],
    recentBookings: []
  }

  const statCards = [
    {
      label: 'Reservas Hoy', value: s.today.total, icon: Calendar,
      change: `${s.today.total > 0 ? '+' : ''}${s.today.total}`,
      positive: true, gradient: 'from-blue-500/15 to-blue-600/5', iconColor: 'text-blue-400',
      bgIcon: 'bg-blue-500/12 border-blue-500/20', sub: `${s.today.inProgress} en curso`
    },
    {
      label: 'Ingresos Hoy', value: s.today.income, icon: CircleDollarSign,
      change: s.week.income > 0 ? `$ ${s.week.income.toLocaleString()}` : '$ 0',
      positive: true, prefix: '$ ', gradient: 'from-emerald-500/15 to-emerald-600/5',
      iconColor: 'text-emerald-400', bgIcon: 'bg-emerald-500/12 border-emerald-500/20',
      sub: `Mes: $ ${s.month.income.toLocaleString()}`
    },
    {
      label: 'Clientes Registrados', value: s.customers.total, icon: Users,
      change: `Canchas: ${s.courts.active}/${s.courts.total}`,
      positive: true, gradient: 'from-purple-500/15 to-purple-600/5', iconColor: 'text-purple-400',
      bgIcon: 'bg-purple-500/12 border-purple-500/20', sub: `${s.week.totalBookings} reservas esta semana`
    },
    {
      label: 'Ocupación Promedio', value: s.occupancy.avgDaily, icon: TrendingUp,
      change: `Pico: ${s.occupancy.peakDay}`, positive: s.occupancy.avgDaily > 0,
      suffix: '%', gradient: 'from-amber-500/15 to-amber-600/5', iconColor: 'text-amber-400',
      bgIcon: 'bg-amber-500/12 border-amber-500/20', sub: 'ocupación diaria'
    },
  ]

  const maxIncome = Math.max(...s.incomeByDay.map((d: any) => d.amount), 1)

  return (
    <div className={`p-4 md:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Notifications - toast se oculta solo, no borra de la lista */}
      {socketNotifications.slice(0, 1).map((n) => (
        <NotificationToast key={`toast-${n.id}`} booking={n} onDismiss={() => {}} />
      ))}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
              <Sparkles size={14} className="text-[#ccff00]" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Panel de Control</span>
            <div className="h-3 w-px bg-zinc-700/50" />
            <span className="text-[10px] text-zinc-600 font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tight leading-none">
            Panel de <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Sistema de gestión deportiva — datos en tiempo real</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
          </span>
          <span className="text-xs text-zinc-500 font-medium">Tiempo real</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={stat.label}
              className="group relative bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/20 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/[0.02] group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] group-hover:text-zinc-400 transition-colors">{stat.label}</p>
                  <div className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl ${stat.bgIcon} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className={stat.iconColor} size={20} />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white group-hover:scale-105 origin-left transition-transform">
                    {stat.prefix}<AnimatedCounter value={stat.value} decimals={stat.label === 'Ingresos Hoy' ? 0 : 0} />
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${stat.positive ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400'}`}>
                    {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 font-medium">{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Court Distribution */}
        <div className="group bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
                <BarChart3 size={17} className="text-[#ccff00]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Reservas por Cancha</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Distribución de hoy</p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] font-medium hidden sm:block">
              {s.today.total} reservas
            </span>
          </div>
          {s.courtDistribution.length > 0 ? (
            <div className="space-y-4">
              {s.courtDistribution.slice(0, 6).map((item: any, i: number) => {
                const maxVal = Math.max(...s.courtDistribution.map((c: any) => c.booking_count))
                const pct = maxVal > 0 ? (item.booking_count / maxVal) * 100 : 0
                const colors = ['bg-[#ccff00]', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-emerald-400', 'bg-pink-400']
                return (
                  <div key={item.court_name} className="group/progress">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-zinc-300 font-semibold group-hover/progress:text-white transition-colors">{item.court_name}</span>
                      <span className="text-sm font-bold text-white">{item.booking_count}</span>
                    </div>
                    <div className="w-full bg-white/[0.03] rounded-full h-2.5 overflow-hidden border border-white/[0.06]">
                      <div className={`h-full rounded-full transition-all duration-1000 relative ${colors[i % colors.length]}`}
                        style={{ width: mounted ? `${pct}%` : '0%' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-sm">No hay reservas para hoy</div>
          )}
        </div>

        {/* Weekly Income */}
        <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                <Wallet size={17} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Ingresos Semanales</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Últimos 7 días</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total</p>
              <span className="text-xl md:text-2xl font-black text-[#ccff00]">$ <AnimatedCounter value={s.weeklyStats.total} /></span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Promedio</p>
              <p className="text-sm font-bold text-white mt-0.5">$ {s.weeklyStats.avg.toLocaleString()}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Mejor día</p>
              <p className="text-sm font-bold text-[#ccff00] mt-0.5">{s.weeklyStats.bestDay?.day || '-'}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Record</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">$ {s.weeklyStats.max.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-end h-40 gap-2.5 pt-3 pb-1 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-full h-px bg-white/[0.03]" />
              ))}
            </div>
            {s.incomeByDay.map((item: any, i: number) => (
              <AnimatedBar
                key={item.day}
                height={maxIncome > 0 ? (item.amount / maxIncome) * 100 : 0}
                amount={item.amount}
                maxAmount={maxIncome}
                label={item.day}
                active={item.isToday}
                delay={i * 80}
              />
            ))}
          </div>

          <div className="flex gap-2.5 mt-2">
            {s.incomeByDay.map((item: any) => (
              <div key={item.day} className="flex-1 text-center">
                <span className="text-[9px] text-zinc-600 font-medium">
                  {item.bookings} res.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gradient-to-br from-[#0f1533]/80 to-[#0a0e27]/80 border border-[#1a1f3a] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
              <Activity size={17} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Últimas Reservas</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Actividad reciente en el complejo</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.('reservas')}
            className="group/btn inline-flex items-center gap-2 text-xs font-bold text-[#ccff00] hover:text-[#b8e600] transition-colors px-3 py-2 rounded-lg hover:bg-[#ccff00]/5 border border-transparent hover:border-[#ccff00]/20">
            Ver todas
            <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {s.recentBookings.length > 0 ? (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm px-5 md:px-6">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Cliente', 'Cancha', 'Horario', 'Estado'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 md:px-6 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.15em] first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.recentBookings.map((row: any, idx: number) => {
                  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
                    Pending: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
                    Confirmed: { label: 'Confirmada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
                    Completed: { label: 'Completada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: CheckCircle },
                    Cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
                    No_show: { label: 'No Asistió', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: XCircle },
                  }
                  const st = statusMap[row.status] || statusMap.Pending
                  const Icon = st.icon
                  return (
                    <tr key={row.id || idx} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-200">
                      <td className="py-3.5 px-4 md:px-6 first:pl-5 md:first:pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00] text-xs font-bold border border-[#ccff00]/20 shrink-0">
                            {(row.customer_name || '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-white font-semibold text-sm">{row.customer_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-zinc-300 text-sm">{row.court_name}</td>
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Clock size={13} className="text-zinc-500 shrink-0" />
                          {row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 last:pr-5 md:last:pr-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border ${st.color}`}>
                          <Icon size={11} />
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-zinc-500 text-sm">No hay reservas recientes</div>
        )}
      </div>
    </div>
  )
}
