'use client'

import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'

export default function DashboardView() {
  const stats = [
    { label: 'Reservas Hoy', value: '24', icon: Calendar, color: 'text-accent' },
    { label: 'Ingresos', value: '$8,450', icon: DollarSign, color: 'text-accent' },
    { label: 'Clientes Activos', value: '157', icon: Users, color: 'text-accent' },
    { label: 'Ocupación', value: '87%', icon: TrendingUp, color: 'text-accent' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido a tu sistema de gestión de canchas deportivas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <Icon className={`${stat.color} opacity-80`} size={32} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reservas por Deporte */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reservas por Deporte</h3>
          <div className="space-y-4">
            {[
              { name: 'Fútbol', value: 45, percentage: 45 },
              { name: 'Pádel', value: 32, percentage: 32 },
              { name: 'Tenis', value: 18, percentage: 18 },
              { name: 'Basketball', value: 5, percentage: 5 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-accent">{item.value}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingresos Últimos 7 Días */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Ingresos Últimos 7 Días</h3>
          <div className="space-y-3">
            {[
              { day: 'Lunes', amount: '$1,200' },
              { day: 'Martes', amount: '$1,450' },
              { day: 'Miércoles', amount: '$1,100' },
              { day: 'Jueves', amount: '$1,600' },
              { day: 'Viernes', amount: '$2,100' },
              { day: 'Sábado', amount: '$2,600' },
              { day: 'Domingo', amount: '$1,400' },
            ].map((item) => (
              <div key={item.day} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.day}</span>
                <span className="text-sm font-semibold text-accent">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas Reservas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Últimas Reservas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Cancha</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Hora</th>
                <th className="text-left py-3 text-muted-foreground font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cliente: 'Juan García', cancha: 'Fútbol 5 - Cancha 1', hora: '15:00', estado: 'Confirmada' },
                { cliente: 'María López', cancha: 'Pádel - Cancha 3', hora: '17:30', estado: 'Pendiente' },
                { cliente: 'Carlos Rodríguez', cancha: 'Tenis - Cancha 2', hora: '10:00', estado: 'Confirmada' },
                { cliente: 'Ana Martínez', cancha: 'Basketball - Cancha 4', hora: '19:00', estado: 'Confirmada' },
                { cliente: 'Pedro Sánchez', cancha: 'Fútbol 7 - Cancha 5', hora: '20:30', estado: 'Cancelada' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-3 text-foreground">{row.cliente}</td>
                  <td className="py-3 text-foreground">{row.cancha}</td>
                  <td className="py-3 text-foreground">{row.hora}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.estado === 'Confirmada'
                        ? 'bg-green-500/20 text-green-300'
                        : row.estado === 'Pendiente'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
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
