'use client'

import { useState, useEffect } from 'react'
import { Plus, Key, Search, Filter, UserPlus, Shield } from 'lucide-react'
import { userService } from '@/services/userService'
import { Modal } from '@/components/ui/modal'

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    role_id: '1',
    status: 'Activated'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const res = await userService.getAll()
      if (res.success) {
        setUsuarios(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      setUsuarios([
        { id: 1, full_name: 'Carlos Admin', username: 'admin', role_id: 1, status: 'Activated', created_at: '2024-01-15' },
        { id: 2, full_name: 'Laura Recepción', username: 'laura', role_id: 2, status: 'Disabled', created_at: '2024-03-05' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        role_id: parseInt(formData.role_id)
      }
      const res = await userService.create(payload)
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ first_name: '', last_name: '', username: '', password: '', role_id: '1', status: 'Activated' })
        fetchUsuarios()
      }
    } catch (error: any) {
      console.error('Error creando usuario:', error)
      alert(error.message || 'Hubo un error al guardar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleName = (roleId: number) => {
    if (roleId === 1) return 'Administrador'
    if (roleId === 2) return 'Recepcionista'
    if (roleId === 3) return 'Cajero'
    return `Rol ${roleId}`
  }

  const getStatusName = (status: string) => {
    if (status === 'Activated') return 'Activo'
    if (status === 'Disabled') return 'Inactivo'
    return status
  }

  const filteredUsuarios = usuarios.filter((usuario) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      usuario.full_name?.toLowerCase().includes(term) ||
      usuario.username?.toLowerCase().includes(term)
    const matchesRole = roleFilter === 'Todos' || getRoleName(usuario.role_id) === roleFilter
    return matchesSearch && matchesRole
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Usuarios</h1>
          <p className="text-zinc-400">Gestiona el acceso y permisos de tu equipo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-xl hover:brightness-110 transition-all font-semibold w-full md:w-auto shadow-lg shadow-[#ccff00]/10"
        >
          <UserPlus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Buscar usuario por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-3">
          <Filter size={18} className="text-zinc-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
          >
            <option value="Todos" className="bg-[#0f1533]">Todos los Roles</option>
            <option value="Administrador" className="bg-[#0f1533]">Administrador</option>
            <option value="Recepcionista" className="bg-[#0f1533]">Recepcionista</option>
            <option value="Cajero" className="bg-[#0f1533]">Cajero</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]">
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Nombre</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Usuario</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Rol</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Estado</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Fecha Registro</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold tracking-wider uppercase text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1f3a] border-t-[#ccff00]"></div>
                    </div>
                    <p className="mt-3 text-zinc-500 text-sm">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-zinc-600" />
                      <p>No se encontraron usuarios que coincidan con los filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario, index) => {
                  const rolNombre = getRoleName(usuario.role_id)
                  const estadoNombre = getStatusName(usuario.status)
                  
                  return (
                    <tr 
                      key={usuario.id} 
                      className="group border-b border-[#1a1f3a]/50 hover:bg-[#0a0e27]/60 transition-all cursor-pointer"
                    >
                      <td className="py-4 px-6 text-white font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 flex items-center justify-center text-[#ccff00] text-xs font-bold">
                            {usuario.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          {usuario.full_name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">@{usuario.username}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00] text-xs font-semibold border border-[#ccff00]/20">
                          <Shield size={12} />
                          {rolNombre}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          usuario.status === 'Activated'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            usuario.status === 'Activated' ? 'bg-emerald-400' : 'bg-red-400'
                          }`}></span>
                          {estadoNombre}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">{formatDate(usuario.created_at)}</td>
                      <td className="py-4 px-6">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#ccff00] hover:bg-[#ccff00]/10 transition-all border border-transparent hover:border-[#ccff00]/20">
                          <Key size={14} />
                          Permisos
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nuevo Usuario"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Nombre *
              </label>
              <input 
                type="text" 
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Apellido *
              </label>
              <input 
                type="text" 
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Nombre de Usuario (Login) *
            </label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Contraseña *
            </label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Rol
              </label>
              <select 
                value={formData.role_id}
                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all cursor-pointer"
              >
                <option value="1" className="bg-[#0a0e27]">Administrador</option>
                <option value="2" className="bg-[#0a0e27]">Recepcionista</option>
                <option value="3" className="bg-[#0a0e27]">Cajero</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Estado
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all cursor-pointer"
              >
                <option value="Activated" className="bg-[#0a0e27]">Activo</option>
                <option value="Disabled" className="bg-[#0a0e27]">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-transparent border border-[#1a1f3a] text-white rounded-xl hover:bg-[#0a0e27] transition-all font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#ccff00] text-[#0a0e27] font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#ccff00]/10"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
