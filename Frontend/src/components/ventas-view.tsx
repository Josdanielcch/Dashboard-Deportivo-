'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Search, Filter, Plus, Trash2 } from 'lucide-react'
import { billingService } from '@/services/billingService'
import { customerService } from '@/services/customerService'
import { productService } from '@/services/productService'
import { bookingService } from '@/services/bookingService'
import { Modal } from '@/components/ui/modal'

export default function VentasView() {
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('Todos')

  // Selectores
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    payment_method_id: '1',
  })
  const [bookingId, setBookingId] = useState('')
  const [cart, setCart] = useState<{product_id: string, product_name: string, price: number, quantity: number}[]>([])
  const [currentProduct, setCurrentProduct] = useState('')
  const [currentQty, setCurrentQty] = useState('1')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resVentas, resClientes, resProductos, resBookings] = await Promise.all([
        billingService.getAll().catch(() => ({ success: false })),
        customerService.getAll().catch(() => ({ success: false })),
        productService.getAll().catch(() => ({ success: false })),
        bookingService.getAll().catch(() => ({ success: false }))
      ])

      if (resVentas.success) setVentas(resVentas.data || [])
      if (resClientes.success) setClientes(resClientes.data || [])
      if (resProductos.success) setProductos(resProductos.data || [])
      if (resBookings.success) setBookings(resBookings.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!currentProduct || parseInt(currentQty) <= 0) return
    const p = productos.find(x => x.id.toString() === currentProduct)
    if (!p) return

    setCart(prev => {
      const existing = prev.find(x => x.product_id === currentProduct)
      if (existing) {
        return prev.map(x => x.product_id === currentProduct ? { ...x, quantity: x.quantity + parseInt(currentQty) } : x)
      }
      return [...prev, { product_id: currentProduct, product_name: p.product_name, price: Number(p.price), quantity: parseInt(currentQty) }]
    })
    setCurrentProduct('')
    setCurrentQty('1')
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(x => x.product_id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0 && !bookingId) {
      alert('Debes agregar al menos un producto o asociar una reserva.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id),
        user_id: 1, // Default, assuming cashier ID 1
        payment_method_id: parseInt(formData.payment_method_id),
        booking_id: bookingId ? parseInt(bookingId) : undefined,
        products: cart.map(c => ({
          product_id: parseInt(c.product_id),
          quantity: c.quantity
        }))
      }
      const res = await billingService.create(payload)
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ customer_id: '', payment_method_id: '1' })
        setCart([])
        setBookingId('')
        fetchData()
      }
    } catch (error: any) {
      console.error('Error creando venta:', error)
      alert(error.message || 'Hubo un error al registrar la venta. Verifica el stock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewInvoice = async (id: number) => {
    setIsInvoiceModalOpen(true)
    setLoadingInvoice(true)
    try {
      const res = await billingService.getById(id.toString())
      if (res.success) {
        setSelectedInvoice(res.data)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Error al cargar la factura')
      setIsInvoiceModalOpen(false)
    } finally {
      setLoadingInvoice(false)
    }
  }

  // Filtrado
  const filteredVentas = ventas.filter((venta) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      venta.customer_name?.toLowerCase().includes(term) ||
      venta.id?.toString().includes(term)

    const matchesMethod = methodFilter === 'Todos' || venta.method_name === methodFilter

    return matchesSearch && matchesMethod
  })

  // Estadísticas
  const totalVentasValor = filteredVentas.reduce((acc, v) => acc + Number(v.total_amount || 0), 0)
  const totalVentas = `$${totalVentasValor.toFixed(2)}`
  const promedioValor = filteredVentas.length > 0 ? totalVentasValor / filteredVentas.length : 0
  const promedio = `$${promedioValor.toFixed(2)}`

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const dateObj = new Date(dateStr)
    return new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
  }

  const pendingBookings = bookings.filter(b => b.status === 'Pending' && b.customer_id?.toString() === formData.customer_id)
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Ventas</h1>
          <p className="text-muted-foreground">Seguimiento de tus ventas y pagos</p>
        </div>
        <button 
          onClick={() => {
            setCart([])
            setBookingId('')
            setFormData({ customer_id: '', payment_method_id: '1' })
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Ingresos Totales</p>
              <p className="text-3xl font-bold text-foreground">{totalVentas}</p>
            </div>
            <DollarSign className="text-accent opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Ventas Realizadas</p>
              <p className="text-3xl font-bold text-foreground">{filteredVentas.length}</p>
            </div>
            <TrendingUp className="text-accent opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Promedio por Venta</p>
              <p className="text-3xl font-bold text-foreground">{promedio}</p>
            </div>
            <DollarSign className="text-accent opacity-80" size={32} />
          </div>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Filter size={20} className="text-muted-foreground" />
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Pago Móvil">Pago Móvil</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Zelle">Zelle</option>
            <option value="Crédito">Crédito</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Cliente</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Fecha</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Total</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Método de Pago</th>
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
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-6 text-foreground font-mono">#{venta.id}</td>
                    <td className="py-4 px-6 text-foreground font-medium">{venta.customer_name}</td>
                    <td className="py-4 px-6 text-muted-foreground">{formatDate(venta.payment_date)}</td>
                    <td className="py-4 px-6 text-foreground font-semibold">${Number(venta.total_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                        {venta.method_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleViewInvoice(venta.id)}
                        className="text-accent hover:underline text-xs font-semibold"
                      >
                        Ver Factura
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Venta */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Nueva Venta"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cliente *
            </label>
            <select 
              required
              value={formData.customer_id}
              onChange={(e) => {
                setFormData({...formData, customer_id: e.target.value})
                setBookingId('') // Reset booking if customer changes
              }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="" disabled>Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          {/* Booking Selector */}
          {formData.customer_id && pendingBookings.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Asociar Reserva (Opcional)
              </label>
              <select 
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Sin reserva</option>
                {pendingBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    Reserva #{b.id} - {formatDate(b.booking_date)} ({b.start_time})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cart Form */}
          <div className="bg-secondary/30 p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-3">Agregar Productos</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Producto</label>
                <select 
                  value={currentProduct}
                  onChange={(e) => setCurrentProduct(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="" disabled>Selecciona producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name} - ${Number(p.price).toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-muted-foreground mb-1">Cant.</label>
                <input 
                  type="number" 
                  min="1"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={!currentProduct}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            {/* Cart List */}
            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground text-xs">
                      <th className="pb-2">Producto</th>
                      <th className="pb-2">Cant.</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 text-foreground">{c.product_name}</td>
                        <td className="py-2 text-foreground">{c.quantity}</td>
                        <td className="py-2 text-foreground text-right">${(c.price * c.quantity).toFixed(2)}</td>
                        <td className="py-2 text-right">
                          <button type="button" onClick={() => removeFromCart(c.product_id)} className="text-red-500 hover:text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Productos</p>
              <p className="text-xl font-bold text-foreground">${cartTotal.toFixed(2)}</p>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Método de Pago *
              </label>
              <select 
                required
                value={formData.payment_method_id}
                onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="1">Efectivo</option>
                <option value="2">Pago Móvil</option>
                <option value="3">Transferencia</option>
                <option value="5">Zelle</option>
                <option value="9">Crédito</option>
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
              {isSubmitting ? 'Procesando...' : 'Completar Venta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Factura */}
      <Modal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        title="Detalle de Factura"
      >
        {loadingInvoice ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : selectedInvoice ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 bg-secondary/50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Factura Nº</p>
                <p className="font-mono text-foreground font-semibold">#{selectedInvoice.billing.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-foreground">{formatDate(selectedInvoice.billing.payment_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-foreground font-medium">{selectedInvoice.billing.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Método de Pago</p>
                <p className="text-foreground">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    {selectedInvoice.billing.method_name}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-2">Desglose</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Concepto</th>
                      <th className="pb-2 font-medium">Cant.</th>
                      <th className="pb-2 font-medium">Precio Unit.</th>
                      <th className="pb-2 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Reserva si existe */}
                    {selectedInvoice.billing.booking_id && (
                      <tr className="border-t border-border/50">
                        <td className="py-2 text-foreground">Reserva de Cancha (#{selectedInvoice.billing.booking_id})</td>
                        <td className="py-2 text-foreground">1</td>
                        <td className="py-2 text-muted-foreground">-</td>
                        <td className="py-2 text-foreground text-right font-medium">
                           {/* El costo de la reserva está implícito en la diferencia del total */}
                           Ver Total
                        </td>
                      </tr>
                    )}
                    {/* Productos */}
                    {selectedInvoice.details.map((detail: any) => (
                      <tr key={detail.id} className="border-t border-border/50">
                        <td className="py-2 text-foreground">{detail.product_name}</td>
                        <td className="py-2 text-foreground">{detail.quantity}</td>
                        <td className="py-2 text-muted-foreground">${Number(detail.price_unit).toFixed(2)}</td>
                        <td className="py-2 text-foreground text-right font-medium">${Number(detail.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Pagado</p>
                <p className="text-2xl font-bold text-accent">${Number(selectedInvoice.billing.total_amount).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No se encontraron detalles.</p>
        )}
      </Modal>
    </div>
  )
}
