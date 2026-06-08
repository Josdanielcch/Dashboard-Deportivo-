'use client'

import { Plus, Clock, User } from 'lucide-react'

export default function ReservasView() {
  const reservas = [
    { id: 1, cliente: 'Juan García', cancha: 'Fútbol 5 - Cancha 1', fecha: '2024-06-15', hora: '15:00', duracion: '1 hora', estado: 'Confirmada' },
    { id: 2, cliente: 'María López', cancha: 'Pádel - Cancha 3', fecha: '2024-06-15', hora: '17:30', duracion: '1.5 horas', estado: 'Pendiente' },
    { id: 3, cliente: 'Carlos Rodríguez', cancha: 'Tenis - Cancha 2', fecha: '2024-06-16', hora: '10:00', duracion: '2 horas', estado: 'Confirmada' },
    { id: 4, cliente: 'Ana Martínez', cancha: 'Basketball - Cancha 4', fecha: '2024-06-16', hora: '19:00', duracion: '1.5 horas', estado: 'Confirmada' },
    { id: 5, cliente: 'Pedro Sánchez', cancha: 'Fútbol 7 - Cancha 5', fecha: '2024-06-17', hora: '20:30', duracion: '2 horas', estado: 'Cancelada' },
    { id: 6, cliente: 'Laura González', cancha: 'Pádel - Cancha 1', fecha: '2024-06-18', hora: '14:00', duracion: '1 hora', estado: 'Confirmada' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Reservas</h1>
          <p className="text-muted-foreground">Gestiona todas las reservas de tu complejo</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cliente</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cancha</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Hora</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Duración</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Estado</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-accent" />
                      {reserva.cliente}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-foreground">{reserva.cancha}</td>
                  <td className="py-4 px-6 text-foreground">{reserva.fecha}</td>
                  <td className="py-4 px-6 text-foreground">{reserva.hora}</td>
                  <td className="py-4 px-6 text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      {reserva.duracion}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reserva.estado === 'Confirmada'
                        ? 'bg-green-500/20 text-green-300'
                        : reserva.estado === 'Pendiente'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {reserva.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-accent hover:text-accent/80 transition-colors text-xs underline">
                      Ver Detalles
                    </button>
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
