'use client'

import { useState, useEffect } from 'react'
import { Plus, Key, Search, Filter } from 'lucide-react'
import { userService } from '@/services/userService'
import { Modal } from '@/components/ui/modal'

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')

  // Modal State
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
      // Fallback a datos estáticos
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

  // Helper para mostrar rol
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

  // Filtrado
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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona el acceso y permisos de tu equipo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar usuario por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Filter size={20} className="text-muted-foreground" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Recepcionista">Recepcionista</option>
            <option value="Cajero">Cajero</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Nombre</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Usuario</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Rol</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Estado</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha Registro</th>
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
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron usuarios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => {
                  const rolNombre = getRoleName(usuario.role_id)
                  const estadoNombre = getStatusName(usuario.status)
                  
                  return (
                    <tr key={usuario.id} className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="py-4 px-6 text-foreground font-medium">{usuario.full_name}</td>
                      <td className="py-4 px-6 text-muted-foreground">@{usuario.username}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                          {rolNombre}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.status === 'Activated'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {estadoNombre}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{formatDate(usuario.created_at)}</td>
                      <td className="py-4 px-6">
                        <button className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-xs">
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

      {/* Modal Nuevo Usuario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nuevo Usuario"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
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
              Nombre de Usuario (Login) *
            </label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Contraseña *
            </label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Rol
              </label>
              <select 
                value={formData.role_id}
                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="1">Administrador</option>
                <option value="2">Recepcionista</option>
                <option value="3">Cajero</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Estado
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Activated">Activo</option>
                <option value="Disabled">Inactivo</option>
              </select>
            </div>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
