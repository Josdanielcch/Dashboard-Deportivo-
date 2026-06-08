'use client'

import { Plus, Mail, Phone } from 'lucide-react'

export default function ClientesView() {
  const clientes = [
    { id: 1, nombre: 'Juan García', email: 'juan@example.com', telefono: '+34 612 345 678', ciudad: 'Madrid', reservas: 12 },
    { id: 2, nombre: 'María López', email: 'maria@example.com', telefono: '+34 623 456 789', ciudad: 'Barcelona', reservas: 8 },
    { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos@example.com', telefono: '+34 634 567 890', ciudad: 'Valencia', reservas: 15 },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', telefono: '+34 645 678 901', ciudad: 'Bilbao', reservas: 6 },
    { id: 5, nombre: 'Pedro Sánchez', email: 'pedro@example.com', telefono: '+34 656 789 012', ciudad: 'Sevilla', reservas: 20 },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
          <Plus size={20} />
          Nuevo Cliente
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
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Teléfono</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Ciudad</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Reservas</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground font-medium">{cliente.nombre}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                      <Mail size={16} />
                      {cliente.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                      <Phone size={16} />
                      {cliente.telefono}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-foreground">{cliente.ciudad}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                      {cliente.reservas}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-accent hover:text-accent/80 transition-colors text-xs underline">
                      Ver Perfil
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
