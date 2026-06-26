'use client'

import { useState, useEffect } from 'react'
import { Plus, Key, Search, Filter, UserPlus, Shield } from 'lucide-react'
import { userService } from '@/services/userService'
import { Modal } from '@/components/ui/modal'
import { useAuthSafe } from './auth-context'

export default function UsuariosView() {
  const { user, updateContextUser } = useAuthSafe()
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
  const [infoModal, setInfoModal] = useState({ isOpen: false, message: '', title: '' })

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    role_id: '1',
    status: 'Activated'
  })

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, avatar_url: data.data.avatar_url } : u));
        if (editingUser && editingUser.id === userId) {
          setEditingUser({ ...editingUser, avatar_url: data.data.avatar_url });
        }
        if (user && user.id === userId) {
          updateContextUser({ avatar_url: data.data.avatar_url });
        }
      } else {
        alert(data.error || 'Error al subir la imagen');
      }
    } catch (err) {
      alert('Error de conexión al subir la imagen');
    }
  };

  async function fetchUsuarios() {
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

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (formData.username && usuarios.some(u => u.username === formData.username)) {
      setInfoModal({ isOpen: true, message: 'Este nombre de usuario ya está registrado en el sistema.', title: 'Usuario duplicado' });
      setIsSubmitting(false);
      return;
    }

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
      setInfoModal({ isOpen: true, message: error.message || 'Hubo un error al guardar el usuario', title: 'Error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleName = (roleId: number) => {
    if (roleId === 1) return 'Administrador'
    if (roleId === 2) return 'Recepcionista'
    if (roleId === 3) return 'Soporte'
    return `Rol ${roleId}`
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...editFormData,
        role_id: parseInt(editFormData.role_id)
      }
      const res = await userService.update(editingUser.id, payload)
      if (res.success) {
        setIsEditModalOpen(false)
        fetchUsuarios()
      } else {
        setInfoModal({ isOpen: true, message: 'Hubo un error al actualizar el usuario', title: 'Error' })
      }
    } catch (error: any) {
      console.error('Error actualizando usuario:', error)
      setInfoModal({ isOpen: true, message: error.message || 'Hubo un error al guardar los cambios', title: 'Error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (usuario: any) => {
    setEditingUser(usuario)
    setEditFormData({
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      role_id: usuario.role_id.toString(),
      status: usuario.status
    })
    setIsEditModalOpen(true)
  }

  const getStatusName = (status: string) => {
    if (status === 'Activated') return 'Activo'
    if (status === 'Disabled') return 'Inactivo'
    if (status === 'Pending') return 'Pendiente'
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
            <option value="Soporte" className="bg-[#0f1533]">Soporte</option>
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ccff00]/20 to-[#ccff00]/5 flex items-center justify-center text-[#ccff00] text-xs font-bold overflow-hidden">
                            {usuario.avatar_url ? (
                              <img src={`http://localhost:3000${usuario.avatar_url}`} alt={usuario.username} className="w-full h-full object-cover" />
                            ) : (
                              usuario.full_name?.charAt(0)?.toUpperCase() || '?'
                            )}
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
                            : usuario.status === 'Pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            usuario.status === 'Activated' ? 'bg-emerald-400' 
                            : usuario.status === 'Pending' ? 'bg-yellow-400'
                            : 'bg-red-400'
                          }`}></span>
                          {estadoNombre}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">{formatDate(usuario.created_at)}</td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => openEditModal(usuario)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#ccff00] hover:bg-[#ccff00]/10 transition-all border border-transparent hover:border-[#ccff00]/20"
                        >
                          <Key size={14} />
                          Editar
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
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Nombre de Usuario (Login / Identificación) *
            </label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className={`w-full bg-[#0a0e27] border ${
                formData.username && usuarios.some(u => u.username === formData.username)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#1a1f3a] focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30'
              } rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none transition-all`}
            />
            {formData.username && usuarios.some(u => u.username === formData.username) && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                Este nombre de usuario ya está registrado.
              </p>
            )}
          </div>

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
                <option value="3" className="bg-[#0a0e27]">Soporte</option>
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
                <option value="Pending" className="bg-[#0a0e27]">Pendiente</option>
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
              disabled={isSubmitting || (formData.username ? usuarios.some(u => u.username === formData.username) : false)}
              className="px-6 py-2.5 bg-[#ccff00] text-[#0a0e27] font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#ccff00]/10"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingUser && (
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          title="Editar Usuario"
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-[#0a0e27] p-4 rounded-xl border border-[#1a1f3a]">
              <div>
                <p className="text-sm text-zinc-400">Usuario</p>
                <p className="font-semibold text-white">@{editingUser.username}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1f3a] border-2 border-[#ccff00]/30 flex items-center justify-center text-white">
                  {editingUser.avatar_url ? (
                    <img src={`http://localhost:3000${editingUser.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold">{editingUser.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <input 
                  type="file" 
                  id="avatar-upload-edit" 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg" 
                  onChange={(e) => handleAvatarUpload(e, editingUser.id)} 
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById('avatar-upload-edit')?.click()}
                  className="text-[10px] px-2 py-1 rounded bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 hover:bg-[#ccff00]/20 transition-all"
                >
                  Cambiar Foto
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    Nombre *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
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
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                    className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    Rol
                  </label>
                  <select 
                    value={editFormData.role_id}
                    onChange={(e) => setEditFormData({...editFormData, role_id: e.target.value})}
                    className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all cursor-pointer"
                  >
                    <option value="1" className="bg-[#0a0e27]">Administrador</option>
                    <option value="2" className="bg-[#0a0e27]">Recepcionista</option>
                    <option value="3" className="bg-[#0a0e27]">Soporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                    Estado
                  </label>
                  <select 
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/30 transition-all cursor-pointer"
                  >
                    <option value="Activated" className="bg-[#0a0e27]">Activo</option>
                    <option value="Pending" className="bg-[#0a0e27]">Pendiente</option>
                    <option value="Disabled" className="bg-[#0a0e27]">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-transparent border border-[#1a1f3a] text-white rounded-xl hover:bg-[#0a0e27] transition-all font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#ccff00] text-[#0a0e27] font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#ccff00]/10"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

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
