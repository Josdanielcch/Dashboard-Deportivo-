'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Search, Filter } from 'lucide-react'
import { courtService } from '@/services/courtService'
import { Modal } from '@/components/ui/modal'

export default function CanchasView() {
  const [canchas, setCanchas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  // Modal State
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
      if (res.success) {
        setCanchas(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching canchas:', error)
      // Fallback a datos estáticos si el backend falla o no está corriendo
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
      if (editingId) {
        res = await courtService.updateStatus(editingId, formData.status)
      } else {
        res = await courtService.create(formData.court_name, formData.status)
      }
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ court_name: '', status: 'Available' })
        setEditingId(null)
        fetchCanchas() // Recargar tabla
      }
    } catch (error: any) {
      console.error('Error guardando cancha:', error)
      setSubmitError(error.message || 'Hubo un error al guardar la cancha')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (cancha: any) => {
    setEditingId(cancha.id)
    setFormData({
      court_name: cancha.court_name,
      status: cancha.status
    })
    setSubmitError('')
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ court_name: '', status: 'Available' })
    setSubmitError('')
    setIsModalOpen(true)
  }

  // Filtrado
  const filteredCanchas = canchas.filter((cancha) => {
    const matchesSearch = cancha.court_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Mapeo de estados del backend a español para el filtro
    let estadoEspanol = 'Disponible'
    if (cancha.status === 'Occupied') estadoEspanol = 'Ocupada'
    if (cancha.status === 'Maintenance') estadoEspanol = 'Mantenimiento'
    if (cancha.status === 'Out_of_service') estadoEspanol = 'Fuera de Servicio'

    const matchesStatus = statusFilter === 'Todos' || estadoEspanol === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Canchas</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de canchas deportivas</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold w-full md:w-auto"
        >
          <Plus size={20} />
          Nueva Cancha
        </button>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar cancha por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Filter size={20} className="text-muted-foreground" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Grid de Canchas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCanchas.map((cancha) => {
            let estadoEspanol = 'Disponible'
            if (cancha.status === 'Occupied') estadoEspanol = 'Ocupada'
            if (cancha.status === 'Maintenance') estadoEspanol = 'Mantenimiento'
            if (cancha.status === 'Out_of_service') estadoEspanol = 'Fuera de Servicio'

            return (
              <div key={cancha.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1 leading-tight">{cancha.court_name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} />
                      Cancha Deportiva
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    estadoEspanol === 'Disponible'
                      ? 'bg-green-500/20 text-green-300'
                      : estadoEspanol === 'Ocupada'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {estadoEspanol}
                  </span>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                  <button 
                    onClick={() => openEditModal(cancha)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors text-sm">
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
          
          {filteredCanchas.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-lg">
              No se encontraron canchas que coincidan con los filtros.
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva/Editar Cancha */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Cancha" : "Registrar Nueva Cancha"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nombre de la Cancha
            </label>
            <input 
              type="text" 
              required
              value={formData.court_name}
              onChange={(e) => setFormData({...formData, court_name: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej. Cancha Principal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Estado Inicial
            </label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="Available">Disponible</option>
              <option value="Maintenance">Mantenimiento</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cancha'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
