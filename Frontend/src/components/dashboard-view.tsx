'use client'

import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Activity, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface DashboardViewProps {
  onNavigate?: (module: string) => void
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = value / 60
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 25)
    return () => clearInterval(timer)
  }, [value])

  return <>{count.toLocaleString()}{suffix}</>
}

function MiniBar({ height, active = false }: { height: number; active?: boolean }) {
  const [h, setH] = useState(0)
  useEffect(() => { setTimeout(() => setH(height), 200) }, [height])

  return (
    <div className="flex-1 flex items-end justify-center">
      <div
        className={`w-full max-w-[22px] rounded-t-md transition-all duration-1000 ease-out relative ${
          active
            ? 'bg-gradient-to-t from-[#ccff00]/80 to-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.3)]'
            : 'bg-gradient-to-t from-zinc-600/30 to-zinc-500/20'
        }`}
        style={{ height: `${h}%`, minHeight: h > 0 ? '6px' : '0px' }}
      >
        {active && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ccff00] animate-ping" />
        )}
      </div>
    </div>
  )
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const stats = [
    { label: 'Reservas Hoy', value: 24, icon: Calendar, change: '+12%', positive: true, gradient: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-400', bgIcon: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Ingresos', value: 8450, icon: DollarSign, change: '+8.5%', positive: true, prefix: '$', gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-400', bgIcon: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Clientes Activos', value: 157, icon: Users, change: '+3.2%', positive: true, gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-400', bgIcon: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Ocupación', value: 87, icon: TrendingUp, change: '-2.1%', positive: false, suffix: '%', gradient: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-400', bgIcon: 'bg-amber-500/10 border-amber-500/20' },
  ]

  const sportsData = [
    { name: 'Fútbol', value: 45, color: 'bg-[#ccff00]', shadow: 'shadow-[#ccff00]/20' },
    { name: 'Pádel', value: 32, color: 'bg-blue-400', shadow: 'shadow-blue-400/20' },
    { name: 'Tenis', value: 18, color: 'bg-purple-400', shadow: 'shadow-purple-400/20' },
    { name: 'Basketball', value: 5, color: 'bg-orange-400', shadow: 'shadow-orange-400/20' },
  ]

  const weekDays = [
    { day: 'Lun', amount: 1200, height: 42 },
    { day: 'Mar', amount: 1450, height: 52 },
    { day: 'Mié', amount: 1100, height: 38 },
    { day: 'Jue', amount: 1600, height: 58 },
    { day: 'Vie', amount: 2100, height: 78 },
    { day: 'Sáb', amount: 2600, height: 100 },
    { day: 'Dom', amount: 1400, height: 50 },
  ]

  const recentBookings = [
    { cliente: 'Juan García', cancha: 'Fútbol 5 - Cancha 1', hora: '15:00', estado: 'Confirmada' },
    { cliente: 'María López', cancha: 'Pádel - Cancha 3', hora: '17:30', estado: 'Pendiente' },
    { cliente: 'Carlos Rodríguez', cancha: 'Tenis - Cancha 2', hora: '10:00', estado: 'Confirmada' },
    { cliente: 'Ana Martínez', cancha: 'Basketball - Cancha 4', hora: '19:00', estado: 'Confirmada' },
    { cliente: 'Pedro Sánchez', cancha: 'Fútbol 7 - Cancha 5', hora: '20:30', estado: 'Cancelada' },
  ]

  const totalIncome = weekDays.reduce((acc, d) => acc + d.amount, 0)

  return (
    <div className={`p-6 md:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
              <Sparkles size={14} className="text-[#ccff00]" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Panel de Control</span>
            <div className="h-3 w-px bg-zinc-700/50" />
            <span className="text-[10px] text-zinc-600 font-medium">Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-1 tracking-tight leading-none">
            Panel de <span className="bg-gradient-to-r from-[#ccff00] to-[#a6e000] bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Bienvenido a tu sistema de gestión deportiva</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
          </span>
          <span className="text-xs text-zinc-500 font-medium">Todos los sistemas operativos</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/20 transition-all duration-500 overflow-hidden"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
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
                    {stat.prefix}<AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                    stat.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {stat.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-8">
        {/* Sports Distribution */}
        <div className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 border border-[#ccff00]/20">
                <BarChart3 size={17} className="text-[#ccff00]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Reservas por Deporte</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Distribución semanal</p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] font-medium hidden sm:block">Esta semana</span>
          </div>
          <div className="space-y-5">
            {sportsData.map((item, i) => (
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
            ))}
          </div>
        </div>

        {/* Weekly Income */}
        <div className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                <TrendingUp size={17} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Ingresos Semanales</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Últimos 7 días</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total</p>
              <span className="text-xl md:text-2xl font-black text-[#ccff00]">${totalIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-end h-44 gap-1.5 md:gap-2 pt-4">
            {weekDays.map((item, i) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div className="w-full flex justify-center relative" style={{ height: '100%' }}>
                  <div className="absolute -top-7 text-[10px] text-zinc-500 font-medium opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.06] backdrop-blur-sm shadow-lg">
                    ${item.amount.toLocaleString()}
                  </div>
                  <MiniBar height={item.height} active={i === 5} />
                </div>
                <span className={`text-[11px] font-semibold transition-colors ${i === 5 ? 'text-[#ccff00]' : 'text-zinc-500'}`}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:border-[#ccff00]/10 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
              <Activity size={17} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Últimas Reservas</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Actividad reciente</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('reservas')}
            className="group/btn inline-flex items-center gap-2 text-xs font-bold text-[#ccff00] hover:text-[#b8e600] transition-colors px-3 py-2 rounded-lg hover:bg-[#ccff00]/5 border border-transparent hover:border-[#ccff00]/20"
          >
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
              {recentBookings.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-200">
                  <td className="py-3.5 px-4 md:px-6 first:pl-5 md:first:pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00] text-xs font-bold border border-[#ccff00]/20 shrink-0">
                        {row.cliente.split(' ').map(w => w[0]).join('').slice(0, 2)}
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
                      row.estado === 'Confirmada'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : row.estado === 'Pendiente'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {row.estado === 'Confirmada' ? <CheckCircle size={11} /> : row.estado === 'Cancelada' ? <XCircle size={11} /> : <Clock size={11} />}
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
