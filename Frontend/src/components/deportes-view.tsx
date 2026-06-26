'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Dumbbell, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { sportService } from '@/services/sportService'
import { Modal } from '@/components/ui/modal'

export default function DeportesView() {
  const [sports, setSports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', image_url: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [infoModal, setInfoModal] = useState({ isOpen: false, message: '', title: '' })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [sportToDelete, setSportToDelete] = useState<any>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => { fetchSports() }, [])

  const fetchSports = async () => {
    try {
      setLoading(true)
      const res = await sportService.getAll()
      if (res.success) setSports(res.data || [])
    } catch (error) {
      console.error(error)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (formData.name && sports.some(s => s.name.toLowerCase() === formData.name.toLowerCase() && s.id !== editingId)) {
      setInfoModal({ isOpen: true, message: 'Este deporte ya está registrado en el sistema.', title: 'Deporte duplicado' });
      setIsSubmitting(false);
      return;
    }

    try {
      let res;
      if (editingId) res = await sportService.update(editingId, formData)
      else res = await sportService.create(formData)
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ name: '', image_url: '' })
        setEditingId(null)
        fetchSports()
      }
    } catch (error: any) {
      setInfoModal({ isOpen: true, message: error.message || 'Error al guardar el deporte', title: 'Error' })
    } finally { setIsSubmitting(false) }
  }

  const openEditModal = (sport: any) => {
    setEditingId(sport.id)
    setFormData({ name: sport.name, image_url: sport.image_url || '' })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ name: '', image_url: '' })
    setIsModalOpen(true)
  }

  const openDeleteModal = (sport: any) => {
    setSportToDelete(sport)
    setDeleteConfirmText('')
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sportToDelete) return
    setIsSubmitting(true)
    try {
      const res = await sportService.delete(sportToDelete.id)
      if (res.success) {
        setIsDeleteModalOpen(false)
        setSportToDelete(null)
        fetchSports()
      }
    } catch (error: any) {
      setInfoModal({ isOpen: true, message: error.message || 'Error al eliminar el deporte', title: 'Error' })
      setIsDeleteModalOpen(false)
    } finally { setIsSubmitting(false) }
  }

  const filteredSports = sports.filter(sport => 
    sport.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">Deportes</h1>
          <p className="text-zinc-400 text-sm font-medium">Administra los deportes disponibles para las canchas</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl hover:bg-[#b8e600] transition-all font-bold text-sm shadow-lg shadow-[#ccff00]/20 w-full md:w-auto">
          <Plus size={20} />
          Nuevo Deporte
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input type="text" placeholder="Buscar deporte por nombre..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1533] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#ccff00] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSports.map((sport) => (
            <div key={sport.id} className="group bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Dumbbell size={64} />
              </div>
              <div className="flex flex-col mb-4 relative z-10">
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{sport.name}</h3>
                
                {sport.image_url ? (
                  <div className="mt-4 rounded-xl overflow-hidden h-32 border border-[#1a1f3a] relative group/img">
                    <img src={sport.image_url} alt={sport.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <ImageIcon className="text-white" size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl h-32 bg-[#0a0e27] border border-[#1a1f3a] flex items-center justify-center text-zinc-600">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={24} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Sin imagen</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#1a1f3a] relative z-10">
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(sport)}
                    className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-[#ccff00]/10 text-zinc-400 hover:text-[#ccff00] transition-all">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => openDeleteModal(sport)}
                    className="p-2 rounded-lg bg-[#1a1f3a] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredSports.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#0f1533] border border-dashed border-[#1a1f3a] rounded-2xl">
              <Dumbbell size={40} className="mx-auto mb-3 text-zinc-600" />
              No se encontraron deportes que coincidan con los filtros.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Deporte' : 'Registrar Nuevo Deporte'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Nombre del Deporte (Identificación) *</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full bg-[#0a0e27] border ${
                formData.name && sports.some(s => s.name.toLowerCase() === formData.name.toLowerCase() && s.id !== editingId)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#1a1f3a] focus:border-[#ccff00]/50'
              } rounded-xl px-4 py-3 text-white focus:outline-none transition-all text-sm`}
              placeholder="Ej. Pádel, Tenis, Fútbol..." />
            {formData.name && sports.some(s => s.name.toLowerCase() === formData.name.toLowerCase() && s.id !== editingId) && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                Este deporte ya está registrado.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide flex items-center gap-1">
              <LinkIcon size={14} /> URL de Imagen de Ejemplo
            </label>
            <input type="url" value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00]/50 transition-all text-sm"
              placeholder="https://ejemplo.com/imagen.jpg" />
            <p className="text-[10px] text-zinc-500 mt-1.5">Esta imagen se mostrará en el sitio web para las canchas de este deporte si no tienen foto propia.</p>
          </div>

          {formData.image_url && (
             <div className="rounded-xl overflow-hidden h-32 border border-[#1a1f3a] relative mt-2">
                 <img src={formData.image_url} alt="Vista previa" className="w-full h-full object-cover" onError={(e) => {
                     (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwYTBlMjciLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzRmNWU3NCIgZm9udC1zaXplPSIxNHB4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yIGFsIGNhcmdhciBpbWFnZW48L3RleHQ+PC9zdmc+'
                 }}/>
                 <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] uppercase font-bold text-white backdrop-blur-sm">
                     Vista Previa
                 </div>
             </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#253050] transition-all text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" 
              disabled={isSubmitting || (formData.name ? sports.some(s => s.name.toLowerCase() === formData.name.toLowerCase() && s.id !== editingId) : false)}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar Deporte'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Eliminar Deporte">
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400">
            <Trash2 className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-bold mb-1">¡Esta acción es irreversible!</p>
              <p className="text-zinc-400">Estás a punto de eliminar <strong className="text-red-400">{sportToDelete?.name}</strong>. Si hay canchas asociadas a este deporte, el sistema bloqueará la eliminación.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-2">
            <label className="text-sm text-zinc-300 cursor-pointer select-none leading-tight">
              Escribe <strong className="text-white">{sportToDelete?.name}</strong> para confirmar:
            </label>
          </div>

          <div>
            <input type="text" value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={sportToDelete?.name}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all text-sm"
              onPaste={(e) => e.preventDefault()} />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#253050] transition-all text-sm font-medium">
              Cancelar
            </button>
            <button type="submit"
              disabled={isSubmitting || deleteConfirmText !== sportToDelete?.name}
              className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isSubmitting ? 'Eliminando...' : 'Eliminar Deporte'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} title={infoModal.title || "Información"}>
        <div className="flex flex-col gap-5">
          <p className="text-zinc-300 text-sm">{infoModal.message}</p>
          <div className="flex justify-end mt-2">
            <button onClick={() => setInfoModal({ ...infoModal, isOpen: false })} className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:bg-[#b8e600] transition-all text-sm">
              Aceptar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
