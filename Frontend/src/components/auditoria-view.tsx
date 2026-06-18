'use client'

import { useState, useEffect } from 'react'
import { Eye, Filter, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
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

  const uniqueTables = Array.from(new Set(logs.map(l => l.table_name).filter(Boolean)))

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      log.username?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.table_name?.toLowerCase().includes(term)

    const matchesTable = tableFilter === 'Todas' || log.table_name === tableFilter

    return matchesSearch && matchesTable
  })

  const actionColors: Record<string, string> = {
    INSERT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#ccff00]/10 rounded-lg">
            <Activity size={24} className="text-[#ccff00]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Auditoría</h1>
        </div>
        <p className="text-zinc-400 ml-11">Registro de todas las actividades del sistema</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por usuario o acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/40 focus:ring-1 focus:ring-[#ccff00]/20 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-2 min-w-[200px]">
          <Filter size={20} className="text-zinc-400 shrink-0" />
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full bg-transparent border-none text-white focus:outline-none cursor-pointer py-2"
          >
            <option value="Todas" className="bg-[#0f1533]">Todas las Tablas</option>
            {uniqueTables.map(t => (
              <option key={t as string} value={t as string} className="bg-[#0f1533]">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]/50">
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Acción</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Tabla Afectada</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">ID Registro</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Fecha y Hora</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1f3a]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
                      <span className="text-zinc-400 text-sm">Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-zinc-600" />
                      <span className="text-zinc-400">No se encontraron registros que coincidan con los filtros.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className="group transition-all duration-200 hover:bg-[#1a1f3a]/50 cursor-default"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1f3a] flex items-center justify-center text-xs font-bold text-[#ccff00] group-hover:bg-[#ccff00]/10 transition-colors">
                          {(log.username || 'S')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{log.username || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${
                        actionColors[log.action] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-mono text-xs bg-[#0a0e27] px-2.5 py-1 rounded-md border border-[#1a1f3a]">
                        {log.table_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-mono text-xs bg-[#0a0e27] px-2.5 py-1 rounded-md border border-[#1a1f3a]">
                        #{log.record_id}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                    <td className="py-4 px-6">
                      <button className="flex items-center gap-1.5 text-[#ccff00] hover:text-white px-3 py-1.5 rounded-lg bg-[#1a1f3a] hover:bg-[#ccff00]/10 transition-all duration-200 text-xs font-medium">
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
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-6 py-4">
        <p className="text-sm text-zinc-400">
          Mostrando <span className="text-white font-medium">{filteredLogs.length}</span> registros
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 text-white rounded-lg text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft size={16} />
            Anterior
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 text-white rounded-lg text-sm transition-all duration-200">
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
