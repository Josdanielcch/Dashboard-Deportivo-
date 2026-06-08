'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Mail, Phone, Edit2 } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { Modal } from '@/components/ui/modal'

export default function ClientesView() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    email: '',
    tax_id: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const res = await customerService.getAll()
      if (res.success) {
        setClientes(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
      // Fallback a datos estáticos si el backend falla o no está corriendo
      setClientes([
        { id: 1, full_name: 'Juan García', email: 'juan@example.com', phone: '+34 612 345 678', pending_debt: 0 },
        { id: 2, full_name: 'María López', email: 'maria@example.com', phone: '+34 623 456 789', pending_debt: 50 },
        { id: 3, full_name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '+34 634 567 890', pending_debt: 0 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let res;
      if (editingId) {
        res = await customerService.update(editingId, formData)
      } else {
        res = await customerService.create(formData)
      }
      
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ first_name: '', last_name: '', phone: '', email: '', tax_id: '' })
        setEditingId(null)
        fetchClientes()
      }
    } catch (error: any) {
      console.error('Error guardando cliente:', error)
      alert(error.message || 'Hubo un error al guardar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (cliente: any) => {
    setEditingId(cliente.id)
    setFormData({
      first_name: cliente.first_name || '',
      last_name: cliente.last_name || '',
      phone: cliente.phone || '',
      email: cliente.email || '',
      tax_id: cliente.tax_id || ''
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ first_name: '', last_name: '', phone: '', email: '', tax_id: '' })
    setIsModalOpen(true)
  }

  // Filtrado
  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      cliente.full_name?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term) ||
      cliente.phone?.toLowerCase().includes(term) ||
      cliente.identification_number?.toLowerCase().includes(term)

    let matchesStatus = true
    if (statusFilter === 'debt') matchesStatus = Number(cliente.pending_debt) > 0
    if (statusFilter === 'paid') matchesStatus = Number(cliente.pending_debt) === 0 || !cliente.pending_debt

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Toolbar (Search) */}
      <div className="flex mb-8 gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border text-foreground rounded-lg px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="debt">Con deuda</option>
          <option value="paid">Al día</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Nombre</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Documento</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Email</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Teléfono</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Deuda Pendiente</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
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
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium">{cliente.full_name}</td>
                    <td className="py-4 px-6 text-foreground">{cliente.identification_number || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                        <Mail size={16} />
                        {cliente.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                        <Phone size={16} />
                        {cliente.phone || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        Number(cliente.pending_debt) > 0 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        ${Number(cliente.pending_debt || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => openEditModal(cliente)}
                        className="text-accent hover:text-accent/80 transition-colors text-xs flex items-center gap-1 font-semibold"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo/Editar Cliente */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Cliente" : "Registrar Nuevo Cliente"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nombre *
              </label>
              <input 
                type="text" 
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Apellido *
              </label>
              <input 
                type="text" 
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cédula / Identificación (Opcional)
            </label>
            <input 
              type="text" 
              value={formData.tax_id}
              onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Correo Electrónico (Opcional)
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Teléfono (Opcional)
            </label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
