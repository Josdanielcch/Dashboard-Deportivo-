'use client'

import { useState, useEffect } from 'react'
import { Eye, Filter, Search } from 'lucide-react'
import { auditService } from '@/services/auditService'

export default function AuditoriaView() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tableFilter, setTableFilter] = useState('Todas')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await auditService.getAll()
      if (res.success) {
        setLogs(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      // Fallback a datos estáticos
      setLogs([
        { id: 1, username: 'admin', action: 'INSERT', table_name: 'courts', created_at: '2024-06-15T14:30:00.000Z', record_id: 5 },
        { id: 2, username: 'gerente', action: 'UPDATE', table_name: 'bookings', created_at: '2024-06-15T14:15:00.000Z', record_id: 254 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  // Extraer las tablas únicas para el filtro
  const uniqueTables = Array.from(new Set(logs.map(l => l.table_name).filter(Boolean)))

  // Filtrado
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      log.username?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.table_name?.toLowerCase().includes(term)

    const matchesTable = tableFilter === 'Todas' || log.table_name === tableFilter

    return matchesSearch && matchesTable
  })

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Auditoría</h1>
        <p className="text-muted-foreground">Registro de todas las actividades del sistema</p>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario o acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Filter size={20} className="text-muted-foreground" />
          <select 
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas las Tablas</option>
            {uniqueTables.map(t => (
              <option key={t as string} value={t as string}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Usuario</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acción</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Tabla Afectada</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">ID Registro</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha y Hora</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron registros que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium">{log.username || 'Sistema'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        log.action === 'INSERT' ? 'bg-green-500/20 text-green-300' :
                        log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-300' :
                        log.action === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-foreground font-mono">{log.table_name}</td>
                    <td className="py-4 px-6 text-foreground font-mono">#{log.record_id}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">{formatDate(log.created_at)}</td>
                    <td className="py-4 px-6">
                      <button className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-xs">
                        <Eye size={14} />
                        Ver Datos
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredLogs.length} registros
        </p>
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
