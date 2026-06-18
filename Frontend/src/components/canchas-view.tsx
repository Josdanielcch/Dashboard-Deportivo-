'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Search, Filter, Dumbbell } from 'lucide-react'
import { courtService } from '@/services/courtService'
import { Modal } from '@/components/ui/modal'

export default function CanchasView() {
  const [canchas, setCanchas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ court_name: '', status: 'Available' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetchCanchas()
  }, [])

  const fetchCanchas = async () => {
    try {
      setLoading(true)
      const res = await courtService.getAll()
      if (res.success) setCanchas(res.data || [])
    } catch (error) {
      setCanchas([
        { id: 1, court_name: 'Fútbol 5 - Cancha 1', status: 'Available' },
        { id: 2, court_name: 'Pádel - Cancha 3', status: 'Occupied' },
        { id: 3, court_name: 'Tenis - Cancha 2', status: 'Maintenance' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    try {
      let res;
      if (editingId) res = await courtService.updateStatus(editingId, formData.status)
      else res = await courtService.create(formData.court_name, formData.status)
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ court_name: '', status: 'Available' })
        setEditingId(null)
        fetchCanchas()
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Error al guardar la cancha')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (cancha: any) => {
    setEditingId(cancha.id)
    setFormData({ court_name: cancha.court_name, status: cancha.status })
    setSubmitError('')
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ court_name: '', status: 'Available' })
    setSubmitError('')
    setIsModalOpen(true)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Available': return { label: 'Disponible', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' }
      case 'Occupied': return { label: 'Ocupada', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
      case 'Maintenance': return { label: 'Mantenimiento', color: 'bg-red-500/15 text-red-400 border-red-500/20' }
      case 'Out_of_service': return { label: 'Fuera de Servicio', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20' }
      default: return { label: status, color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20' }
    }
  }

  const filteredCanchas = canchas.filter((cancha) => {
    const matchesSearch = cancha.court_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const estadoLabel = getStatusInfo(cancha.status).label
    const matchesStatus = statusFilter === 'Todos' || estadoLabel === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">Canchas</h1>
          <p className="text-zinc-400 text-sm font-medium">Administra todas tus canchas deportivas</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl hover:bg-[#b8e600] transition-all font-bold text-sm shadow-lg shadow-[#ccff00]/20 w-full md:w-auto"
        >
          <Plus size={20} />
          Nueva Cancha
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input type="text" placeholder="Buscar cancha por nombre..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1533] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-2.5">
          <Filter size={18} className="text-zinc-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-sm">
            <option value="Todos">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#ccff00] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCanchas.map((cancha) => {
            const statusInfo = getStatusInfo(cancha.status)
            return (
              <div key={cancha.id} className="group bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 group-hover:bg-[#ccff00]/20 transition-all">
                      <Dumbbell className="text-[#ccff00]" size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white leading-tight">{cancha.court_name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        Cancha Deportiva
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a1f3a]">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(cancha)}
                      className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-[#ccff00]/10 text-zinc-400 hover:text-[#ccff00] transition-all">
                      <Edit2 size={15} />
                    </button>
                    <button className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {filteredCanchas.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#0f1533] border border-dashed border-[#1a1f3a] rounded-2xl">
              <Dumbbell size={40} className="mx-auto mb-3 text-zinc-600" />
              No se encontraron canchas que coincidan con los filtros.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Cancha' : 'Registrar Nueva Cancha'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Nombre de la Cancha</label>
            <input type="text" required value={formData.court_name}
              onChange={(e) => setFormData({...formData, court_name: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
              placeholder="Ej. Cancha Principal" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Estado</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm cursor-pointer">
              <option value="Available">Disponible</option>
              <option value="Maintenance">Mantenimiento</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#253050] transition-all text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar Cancha'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
