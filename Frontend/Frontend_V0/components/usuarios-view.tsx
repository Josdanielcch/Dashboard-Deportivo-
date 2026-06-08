'use client'

import { Plus, Key } from 'lucide-react'

export default function UsuariosView() {
  const usuarios = [
    { id: 1, nombre: 'Carlos Admin', email: 'admin@courtmanager.com', rol: 'Administrador', estado: 'Activo', fecha: '2024-01-15' },
    { id: 2, nombre: 'Roberto Gerente', email: 'gerente@courtmanager.com', rol: 'Gerente', estado: 'Activo', fecha: '2024-02-10' },
    { id: 3, nombre: 'Laura Recepción', email: 'recepcion@courtmanager.com', rol: 'Recepcionista', estado: 'Activo', fecha: '2024-03-05' },
    { id: 4, nombre: 'Juan Limpieza', email: 'mantenimiento@courtmanager.com', rol: 'Mantenimiento', estado: 'Activo', fecha: '2024-04-20' },
    { id: 5, nombre: 'María Inactiva', email: 'maria@courtmanager.com', rol: 'Recepcionista', estado: 'Inactivo', fecha: '2024-05-01' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona el acceso y permisos de tu equipo</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Nombre</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Email</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Rol</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Estado</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha Registro</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground font-medium">{usuario.nombre}</td>
                  <td className="py-4 px-6 text-muted-foreground">{usuario.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.estado === 'Activo'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">{usuario.fecha}</td>
                  <td className="py-4 px-6">
                    <button className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-xs">
                      <Key size={14} />
                      Permisos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
