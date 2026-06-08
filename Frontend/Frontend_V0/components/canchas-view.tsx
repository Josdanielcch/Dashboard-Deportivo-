'use client'

import { Plus, Edit2, Trash2, MapPin } from 'lucide-react'

export default function CanchasView() {
  const canchas = [
    { id: 1, nombre: 'Fútbol 5 - Cancha 1', deporte: 'Fútbol', superficie: 'Sintético', precio: '$50/hora', estado: 'Disponible' },
    { id: 2, nombre: 'Pádel - Cancha 3', deporte: 'Pádel', superficie: 'Cerámica', precio: '$60/hora', estado: 'Ocupada' },
    { id: 3, nombre: 'Tenis - Cancha 2', deporte: 'Tenis', superficie: 'Arcilla', precio: '$70/hora', estado: 'Disponible' },
    { id: 4, nombre: 'Basketball - Cancha 4', deporte: 'Basketball', superficie: 'Duela', precio: '$55/hora', estado: 'Disponible' },
    { id: 5, nombre: 'Fútbol 7 - Cancha 5', deporte: 'Fútbol', superficie: 'Pasto Natural', precio: '$65/hora', estado: 'Mantenimiento' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Canchas</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de canchas deportivas</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
          <Plus size={20} />
          Nueva Cancha
        </button>
      </div>

      {/* Grid de Canchas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canchas.map((cancha) => (
          <div key={cancha.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">{cancha.nombre}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} />
                  {cancha.deporte}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                cancha.estado === 'Disponible'
                  ? 'bg-green-500/20 text-green-300'
                  : cancha.estado === 'Ocupada'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {cancha.estado}
              </span>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <p className="text-sm">
                <span className="text-muted-foreground">Superficie:</span>
                <span className="text-foreground ml-2">{cancha.superficie}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Tarifa:</span>
                <span className="text-accent ml-2 font-semibold">{cancha.precio}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors text-sm">
                <Edit2 size={16} />
                Editar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors text-sm">
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
