'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Mail, Phone, Edit2, Trash2, Users } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { Modal } from '@/components/ui/modal'

export default function ClientesView() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
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
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">Clientes</h1>
          <p className="text-zinc-400 text-sm font-medium">Gestiona tu base de clientes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl hover:bg-[#b8e600] transition-all font-bold text-sm shadow-lg shadow-[#ccff00]/20 w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1533] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-2.5">
          <Filter size={18} className="text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="debt">Con deuda</option>
            <option value="paid">Al día</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#ccff00] border-t-transparent" />
        </div>
      ) : (
        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]/50">
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Nombre</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Documento</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Email</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Teléfono</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Deuda Pendiente</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                      <Users size={40} className="mx-auto mb-3 text-zinc-600" />
                      No se encontraron clientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-[#1a1f3a] hover:bg-[#0a0e27]/30 transition-colors last:border-b-0"
                    >
                      <td className="py-4 px-6">
                        <span className="text-white font-bold">{cliente.full_name}</span>
                      </td>
                      <td className="py-4 px-6 text-zinc-300">{cliente.identification_number || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Mail size={14} className="text-zinc-500" />
                          <span>{cliente.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Phone size={14} className="text-zinc-500" />
                          <span>{cliente.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            Number(cliente.pending_debt) > 0
                              ? 'bg-red-500/15 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          ${Number(cliente.pending_debt || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(cliente)}
                            className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-[#ccff00]/10 text-zinc-400 hover:text-[#ccff00] transition-all"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Nombre *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Apellido *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Cédula / Identificación</label>
            <input
              type="text"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
              placeholder="Ej. 123456789"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
              placeholder="Ej. +34 612 345 678"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#253050] transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
