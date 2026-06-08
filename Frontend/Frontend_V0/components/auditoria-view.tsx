'use client'

import { Eye, Filter } from 'lucide-react'

export default function AuditoriaView() {
  const logs = [
    { id: 1, usuario: 'Carlos Admin', accion: 'Crear cancha', entidad: 'Cancha - Basketball', timestamp: '2024-06-15 14:30', ip: '192.168.1.1' },
    { id: 2, usuario: 'Roberto Gerente', accion: 'Confirmar reserva', entidad: 'Reserva #254', timestamp: '2024-06-15 14:15', ip: '192.168.1.5' },
    { id: 3, usuario: 'Laura Recepción', accion: 'Crear cliente', entidad: 'Cliente - Pedro López', timestamp: '2024-06-15 13:50', ip: '192.168.1.3' },
    { id: 4, usuario: 'Carlos Admin', accion: 'Actualizar precio', entidad: 'Cancha - Pádel 1', timestamp: '2024-06-15 13:20', ip: '192.168.1.1' },
    { id: 5, usuario: 'Roberto Gerente', accion: 'Cancelar reserva', entidad: 'Reserva #251', timestamp: '2024-06-15 12:45', ip: '192.168.1.5' },
    { id: 6, usuario: 'Laura Recepción', accion: 'Registrar pago', entidad: 'Pago - $150', timestamp: '2024-06-15 12:10', ip: '192.168.1.3' },
    { id: 7, usuario: 'Carlos Admin', accion: 'Eliminar producto', entidad: 'Producto - Raqueta Vieja', timestamp: '2024-06-15 11:30', ip: '192.168.1.1' },
    { id: 8, usuario: 'Roberto Gerente', accion: 'Generar reporte', entidad: 'Reporte - Ventas Junio', timestamp: '2024-06-15 11:00', ip: '192.168.1.5' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Auditoría</h1>
        <p className="text-muted-foreground">Registro de todas las actividades del sistema</p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm">
          <Filter size={16} />
          Filtrar
        </button>
        <input
          type="text"
          placeholder="Buscar en auditoría..."
          className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Usuario</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acción</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Entidad</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha y Hora</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">IP</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground font-medium">{log.usuario}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-accent/10 text-accent">
                      {log.accion}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-foreground">{log.entidad}</td>
                  <td className="py-4 px-6 text-muted-foreground text-xs">{log.timestamp}</td>
                  <td className="py-4 px-6 text-muted-foreground font-mono text-xs">{log.ip}</td>
                  <td className="py-4 px-6">
                    <button className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-xs">
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mostrando 8 de 250 registros</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded text-sm transition-colors disabled:opacity-50">
            ← Anterior
          </button>
          <button className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded text-sm transition-colors">
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
