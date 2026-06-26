'use client'

import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Activity, BarChart3, Sparkles, ArrowRight, Zap, Wallet } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { dashboardService } from '@/services/dashboardService'
import { useSocket } from '@/contexts/socket-context'

interface DashboardViewProps {
  onNavigate?: (module: string) => void
}

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    // Evitar dividir por 0
    if (value === 0) {
      setCount(0);
      return;
    }
    const increment = value / 60
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return <>{count.toLocaleString('es-DO', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</>
}

function MiniBar({ height, active, amount }: { height: number; active: boolean; amount: number }) {
  const [h, setH] = useState(0)
  useEffect(() => {
    setTimeout(() => setH(height), 200)
  }, [height])

  return (
    <div className={`w-full max-w-[24px] rounded-t-lg transition-all duration-1000 ease-out relative ${
      active
        ? 'bg-gradient-to-t from-[#ccff00] to-[#ccff00]/70 shadow-[0_0_15px_rgba(204,255,0,0.2)]'
        : 'bg-gradient-to-t from-zinc-500/30 to-zinc-500/10 hover:from-zinc-500/40'
    }`}
    style={{ height: `${h}%`, minHeight: '4px' }}>
      <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-extrabold whitespace-nowrap transition-all duration-1000 ${
        active ? 'text-[#ccff00]' : 'text-zinc-400'
      }`}>
        ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
      {active && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.6)]" />
      )}
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

// Dummy array to force Tailwind to compile these classes that come from the backend
const SAFELIST = [
  'bg-[#ccff00]', 'shadow-[#ccff00]/20',
  'bg-blue-400', 'shadow-blue-400/20',
  'bg-purple-400', 'shadow-purple-400/20',
  'bg-orange-400', 'shadow-orange-400/20',
  'bg-emerald-400', 'shadow-emerald-400/20'
];

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { notifications } = useSocket()

  const [statsData, setStatsData] = useState({
    reservasHoy: 0,
    ingresos: 0,
    clientesActivos: 0,
    ocupacion: 0,
    gastosTotales: 0,
    cxcPendiente: 0,
    cxpPendiente: 0,
    proveedoresActivos: 0
  });

  const [sportsData, setSportsData] = useState<{name: string, value: number, color: string, shadow: string}[]>([]);
  const [weekDays, setWeekDays] = useState<{day: string, amount: number, height: number}[]>([]);
  const [recentBookings, setRecentBookings] = useState<{cliente: string, cancha: string, hora: string, estado: string}[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        const d = res.data;
        setStatsData({
          reservasHoy: d.reservasHoy || 0,
          ingresos: d.ingresos || 0,
          clientesActivos: d.clientesActivos || 0,
          ocupacion: d.ocupacion || 0,
          gastosTotales: d.gastosTotales || 0,
          cxcPendiente: d.cxcPendiente || 0,
          cxpPendiente: d.cxpPendiente || 0,
          proveedoresActivos: d.proveedoresActivos || 0
        });
        setSportsData(d.sportsDistribution || []);
        setWeekDays(d.weekIncome || []);
        setRecentBookings(d.recentBookings || []);
        
        const total = (d.weekIncome || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setTotalIncome(total);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: 'Reservas Hoy', value: statsData.reservasHoy, icon: Calendar, change: '', positive: true, gradient: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-400', bgIcon: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Ingresos (Ventas)', value: statsData.ingresos, icon: DollarSign, change: '', positive: true, prefix: '$', gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-400', bgIcon: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Gastos (Compras)', value: statsData.gastosTotales, icon: DollarSign, change: '', positive: false, prefix: '$', gradient: 'from-rose-500/10 to-rose-600/5', iconColor: 'text-rose-400', bgIcon: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Por Cobrar (CxC)', value: statsData.cxcPendiente, icon: TrendingUp, change: '', positive: true, prefix: '$', gradient: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-400', bgIcon: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Por Pagar (CxP)', value: statsData.cxpPendiente, icon: TrendingUp, change: '', positive: false, prefix: '$', gradient: 'from-orange-500/10 to-orange-600/5', iconColor: 'text-orange-400', bgIcon: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Clientes Activos', value: statsData.clientesActivos, icon: Users, change: '', positive: true, gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-400', bgIcon: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Proveedores', value: statsData.proveedoresActivos, icon: Users, change: '', positive: true, gradient: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-400', bgIcon: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Ocupación Hoy', value: statsData.ocupacion, icon: Activity, change: '', positive: true, suffix: '%', gradient: 'from-[#ccff00]/10 to-[#ccff00]/5', iconColor: 'text-[#ccff00]', bgIcon: 'bg-[#ccff00]/10 border-[#ccff00]/20' },
  ]

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ccff00]"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Notifications - toast se oculta solo, no borra de la lista */}
      {notifications.slice(0, 1).map((n) => (
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
        {stats.map((stat, i) => {
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
                    {(stat as any).prefix}<AnimatedCounter value={stat.value} suffix={(stat as any).suffix} decimals={stat.label === 'Ingresos Hoy' ? 0 : 0} />
                  </span>
                  {stat.change && (
                    <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                      stat.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {stat.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {stat.change}
                    </div>
                  )}
                </div>
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
                <p className="text-[11px] text-zinc-500 font-medium">Distribución histórica</p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] font-medium hidden sm:block">Actividad Real</span>
          </div>
          <div className="space-y-5">
            {sportsData.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">No hay datos de distribución disponibles.</p>
            ) : (
              sportsData.map((item, i) => (
                <div key={item.name} className="group/progress">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-zinc-300 font-semibold group-hover/progress:text-white transition-colors">{item.name}</span>
                    <span className="text-sm font-black text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-white/[0.03] rounded-full h-3 overflow-hidden border border-white/[0.06] relative">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative ${item.color}`}
                      style={{ width: mounted ? `${item.value}%` : '0%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Semana</p>
              <span className="text-xl md:text-2xl font-black text-[#ccff00]">${totalIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-end h-44 gap-1.5 md:gap-2 pt-4">
            {weekDays.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 w-full text-center">No hay ingresos registrados en los últimos 7 días.</p>
            ) : (
              weekDays.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full">
                  <div className="w-full flex justify-center items-end relative flex-1">
                    <MiniBar height={item.height} active={i === weekDays.length - 1} amount={item.amount} />
                  </div>
                  <span className={`text-[11px] font-semibold transition-colors ${i === weekDays.length - 1 ? 'text-[#ccff00]' : 'text-zinc-500'}`}>{item.day}</span>
                </div>
              ))
            )}
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
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm px-5 md:px-6">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Cliente', 'Cancha', 'Hora', 'Estado'].map((h) => (
                  <th key={h} className="text-left py-3.5 px-4 md:px-6 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.15em] first:pl-5 md:first:pl-6 last:pr-5 md:last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500 text-sm">No hay reservas recientes.</td>
                </tr>
              ) : (
                recentBookings.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-200">
                    <td className="py-3.5 px-4 md:px-6 first:pl-5 md:first:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00] text-xs font-bold border border-[#ccff00]/20 shrink-0 uppercase">
                          {row.cliente.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'CL'}
                        </div>
                        <span className="text-white font-semibold text-sm">{row.cliente}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 text-zinc-300 text-sm">{row.cancha}</td>
                    <td className="py-3.5 px-4 md:px-6">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Clock size={13} className="text-zinc-500 shrink-0" />
                        {row.hora}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 last:pr-5 md:last:pr-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                        row.estado === 'Confirmada' || row.estado === 'Completada'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : row.estado === 'Pendiente'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {row.estado === 'Confirmada' || row.estado === 'Completada' ? <CheckCircle size={11} /> : row.estado === 'Cancelada' || row.estado === 'No asiste' ? <XCircle size={11} /> : <Clock size={11} />}
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
