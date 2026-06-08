'use client'

import { Plus, Package as PackageIcon } from 'lucide-react'

export default function ProductosView() {
  const productos = [
    { id: 1, nombre: 'Raqueta de Tenis Pro', sku: 'RAQ-001', precio: '$120', stock: 15, categoria: 'Equipamiento' },
    { id: 2, nombre: 'Balón de Fútbol Profesional', sku: 'BAL-001', precio: '$45', stock: 32, categoria: 'Balones' },
    { id: 3, nombre: 'Pala de Pádel Carbono', sku: 'PAL-001', precio: '$85', stock: 8, categoria: 'Equipamiento' },
    { id: 4, nombre: 'Botella de Agua 1L', sku: 'BOT-001', precio: '$15', stock: 50, categoria: 'Accesorios' },
    { id: 5, nombre: 'Casco de Protección', sku: 'CAS-001', precio: '$35', stock: 12, categoria: 'Seguridad' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu tienda de productos deportivos</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Producto</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">SKU</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Categoría</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Precio</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Stock</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground">
                    <div className="flex items-center gap-2">
                      <PackageIcon size={16} className="text-accent" />
                      {producto.nombre}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground font-mono">{producto.sku}</td>
                  <td className="py-4 px-6 text-foreground">{producto.categoria}</td>
                  <td className="py-4 px-6 text-accent font-semibold">{producto.precio}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      producto.stock > 20
                        ? 'bg-green-500/20 text-green-300'
                        : producto.stock > 5
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {producto.stock} unidades
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-accent hover:text-accent/80 transition-colors text-xs underline">
                      Editar
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
