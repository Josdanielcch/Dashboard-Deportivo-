'use client'

import { DollarSign, TrendingUp } from 'lucide-react'

export default function VentasView() {
  const ventas = [
    { id: 1, producto: 'Raqueta de Tenis Pro', cantidad: 2, precio: '$240', cliente: 'Juan García', fecha: '2024-06-15', estado: 'Completada' },
    { id: 2, producto: 'Balón de Fútbol', cantidad: 5, precio: '$225', cliente: 'Club Deportivo Centro', fecha: '2024-06-14', estado: 'Completada' },
    { id: 3, producto: 'Pala de Pádel Carbono', cantidad: 1, precio: '$85', cliente: 'María López', fecha: '2024-06-13', estado: 'Completada' },
    { id: 4, producto: 'Botella de Agua 1L', cantidad: 10, precio: '$150', cliente: 'Ana Martínez', fecha: '2024-06-12', estado: 'Pendiente' },
    { id: 5, producto: 'Casco de Protección', cantidad: 3, precio: '$105', cliente: 'Pedro Sánchez', fecha: '2024-06-11', estado: 'Completada' },
  ]

  const totalVentas = '$805'
  const ventasMes = '$12,450'
  const promedio = '$161'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Ventas</h1>
        <p className="text-muted-foreground">Seguimiento de tus ventas de productos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Ventas Hoy</p>
              <p className="text-3xl font-bold text-accent">{totalVentas}</p>
            </div>
            <DollarSign className="text-accent opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Ventas Este Mes</p>
              <p className="text-3xl font-bold text-accent">{ventasMes}</p>
            </div>
            <TrendingUp className="text-accent opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Promedio por Venta</p>
              <p className="text-3xl font-bold text-accent">{promedio}</p>
            </div>
            <DollarSign className="text-accent opacity-80" size={32} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Producto</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cantidad</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Total</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cliente</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-4 px-6 text-foreground">{venta.producto}</td>
                  <td className="py-4 px-6 text-foreground">{venta.cantidad}</td>
                  <td className="py-4 px-6 text-accent font-semibold">{venta.precio}</td>
                  <td className="py-4 px-6 text-foreground">{venta.cliente}</td>
                  <td className="py-4 px-6 text-muted-foreground">{venta.fecha}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      venta.estado === 'Completada'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {venta.estado}
                    </span>
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
