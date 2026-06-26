'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Phone, Mail, Edit2, Trash2, Building2 } from 'lucide-react'
import { supplierService } from '@/services/supplierService'
import { Modal } from '@/components/ui/modal'

export default function ProveedoresView() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSupplierId, setCurrentSupplierId] = useState<number | null>(null)
  const [infoModal, setInfoModal] = useState({ isOpen: false, message: '', title: '' })

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    tax_id: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await supplierService.getAll()
      if (res.success) {
        setSuppliers(res.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (supplier: any = null) => {
    if (supplier) {
      setIsEditing(true)
      setCurrentSupplierId(supplier.id)
      setFormData({
        name: supplier.name || '',
        contact_name: supplier.contact_name || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        tax_id: supplier.tax_id || ''
      })
    } else {
      setIsEditing(false)
      setCurrentSupplierId(null)
      setFormData({ name: '', contact_name: '', phone: '', email: '', address: '', tax_id: '' })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (formData.tax_id && suppliers.some(s => s.tax_id === formData.tax_id && s.id !== currentSupplierId)) {
      setInfoModal({ isOpen: true, message: 'Este RIF/NIT ya está registrado en el sistema.', title: 'Documento duplicado' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing && currentSupplierId) {
        await supplierService.update(currentSupplierId, formData)
      } else {
        await supplierService.create(formData)
      }
      setIsModalOpen(false)
      fetchSuppliers()
    } catch (error: any) {
      console.error(error)
      setInfoModal({ isOpen: true, message: error.message || 'Error al guardar proveedor', title: 'Error' });
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">Proveedores</h1>
          <p className="text-zinc-400 text-sm font-medium">Administra el listado de proveedores</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl hover:bg-[#b8e600] transition-all font-bold text-sm shadow-lg shadow-[#ccff00]/20 w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o RIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1533] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
          />
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
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Empresa</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Documento / RIF</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Contacto</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Email / Teléfono</th>
                  <th className="text-left py-4 px-6 text-zinc-400 font-bold uppercase tracking-wider text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-zinc-500">
                      <Building2 size={40} className="mx-auto mb-3 text-zinc-600" />
                      No se encontraron proveedores que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b border-[#1a1f3a] hover:bg-[#0a0e27]/30 transition-colors last:border-b-0"
                    >
                      <td className="py-4 px-6">
                        <span className="text-white font-bold">{supplier.name}</span>
                      </td>
                      <td className="py-4 px-6 text-zinc-300">{supplier.tax_id || '-'}</td>
                      <td className="py-4 px-6">
                        <span className="text-zinc-300">{supplier.contact_name || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-zinc-300">
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-zinc-500" />
                              <span className="text-xs">{supplier.email}</span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-zinc-500" />
                              <span className="text-xs">{supplier.phone}</span>
                            </div>
                          )}
                          {!supplier.email && !supplier.phone && <span>-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(supplier)}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">RIF/NIT / Identificación</label>
            <input
              type="text"
              value={formData.tax_id}
              onChange={e => setFormData({...formData, tax_id: e.target.value})}
              className={`w-full bg-[#0a0e27] border ${
                formData.tax_id && suppliers.some(s => s.tax_id === formData.tax_id && s.id !== currentSupplierId)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#1a1f3a] focus:border-[#ccff00]/50'
              } rounded-xl px-4 py-3 text-white focus:outline-none transition-all text-sm`}
              placeholder="Ej. J-12345678"
            />
            {formData.tax_id && suppliers.some(s => s.tax_id === formData.tax_id && s.id !== currentSupplierId) && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                Este documento o RIF/NIT ya está registrado.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Nombre de Empresa *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" placeholder="Ej. Inversiones X" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Contacto (Nombre)</label>
              <input type="text" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" placeholder="Ej. Carlos Pérez" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Teléfono</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" placeholder="+58..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" placeholder="proveedor@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Dirección</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" placeholder="Ej. Zona Industrial..." />
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
              disabled={isSubmitting || (formData.tax_id ? suppliers.some(s => s.tax_id === formData.tax_id && s.id !== currentSupplierId) : false)}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} title={infoModal.title || "Información"}>
        <div className="flex flex-col gap-5">
          <p className="text-zinc-300 text-sm">{infoModal.message}</p>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
