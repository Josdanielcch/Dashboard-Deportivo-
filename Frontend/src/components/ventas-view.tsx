'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Search, Filter, Plus, Trash2, X, ShoppingCart, Eye, ChevronRight } from 'lucide-react'
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

  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

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
        user_id: 1,
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

  const filteredVentas = ventas.filter((venta) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      venta.customer_name?.toLowerCase().includes(term) ||
      venta.id?.toString().includes(term)

    const matchesMethod = methodFilter === 'Todos' || venta.method_name === methodFilter

    return matchesSearch && matchesMethod
  })

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
    <div className="min-h-screen bg-[#0a0e27] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Ventas</h1>
          <p className="text-zinc-400">Seguimiento de tus ventas y pagos</p>
        </div>
        <button 
          onClick={() => {
            setCart([])
            setBookingId('')
            setFormData({ customer_id: '', payment_method_id: '1' })
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 bg-[#ccff00] text-[#0a0e27] px-5 py-2.5 rounded-xl hover:brightness-110 transition-all font-bold shadow-lg shadow-[#ccff00]/20"
        >
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Ingresos Totales</p>
              <p className="text-3xl font-bold text-white">{totalVentas}</p>
            </div>
            <div className="bg-[#ccff00]/10 p-3 rounded-xl">
              <DollarSign className="text-[#ccff00]" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Ventas Realizadas</p>
              <p className="text-3xl font-bold text-white">{filteredVentas.length}</p>
            </div>
            <div className="bg-[#ccff00]/10 p-3 rounded-xl">
              <TrendingUp className="text-[#ccff00]" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Promedio por Venta</p>
              <p className="text-3xl font-bold text-white">{promedio}</p>
            </div>
            <div className="bg-[#ccff00]/10 p-3 rounded-xl">
              <DollarSign className="text-[#ccff00]" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-xl px-4 py-2.5">
          <Filter size={18} className="text-zinc-500" />
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
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
      <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]/50">
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">ID</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Total</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Método de Pago</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ccff00] border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    No se encontraron ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-[#1a1f3a] hover:bg-[#0a0e27]/60 transition-colors group">
                    <td className="py-4 px-6 text-white font-mono font-medium">#{venta.id}</td>
                    <td className="py-4 px-6 text-white font-medium">{venta.customer_name}</td>
                    <td className="py-4 px-6 text-zinc-400">{formatDate(venta.payment_date)}</td>
                    <td className="py-4 px-6 text-white font-bold">${Number(venta.total_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                        {venta.method_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleViewInvoice(venta.id)}
                        className="flex items-center gap-1.5 text-[#ccff00] hover:text-white transition-colors text-xs font-semibold bg-[#ccff00]/10 hover:bg-[#ccff00]/20 px-3 py-1.5 rounded-lg"
                      >
                        <Eye size={14} />
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Cliente *
            </label>
            <select 
              required
              value={formData.customer_id}
              onChange={(e) => {
                setFormData({...formData, customer_id: e.target.value})
                setBookingId('')
              }}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer"
            >
              <option value="" disabled className="bg-[#0a0e27]">Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0a0e27]">{c.full_name}</option>
              ))}
            </select>
          </div>

          {formData.customer_id && pendingBookings.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Asociar Reserva (Opcional)
              </label>
              <select 
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer"
              >
                <option value="" className="bg-[#0a0e27]">Sin reserva</option>
                {pendingBookings.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#0a0e27]">
                    Reserva #{b.id} - {formatDate(b.booking_date)} ({b.start_time})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cart Form */}
          <div className="bg-[#0a0e27]/60 border border-[#1a1f3a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={16} className="text-[#ccff00]" />
              <h4 className="font-semibold text-sm text-white">Agregar Productos</h4>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 mb-1">Producto</label>
                <select 
                  value={currentProduct}
                  onChange={(e) => setCurrentProduct(e.target.value)}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0a0e27]">Selecciona producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0a0e27]">{p.product_name} - ${Number(p.price).toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-zinc-500 mb-1">Cant.</label>
                <input 
                  type="number" 
                  min="1"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                />
              </div>
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={!currentProduct}
                className="bg-[#ccff00] text-[#0a0e27] px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1a1f3a]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Producto</th>
                      <th className="pb-2 font-semibold">Cant.</th>
                      <th className="pb-2 font-semibold text-right">Subtotal</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c, i) => (
                      <tr key={i} className="border-b border-[#1a1f3a]/50 last:border-0">
                        <td className="py-2 text-white">{c.product_name}</td>
                        <td className="py-2 text-white">{c.quantity}</td>
                        <td className="py-2 text-white text-right font-medium">${(c.price * c.quantity).toFixed(2)}</td>
                        <td className="py-2 text-right">
                          <button type="button" onClick={() => removeFromCart(c.product_id)} className="text-red-500 hover:text-red-400 transition-colors p-1">
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Total Productos</p>
              <p className="text-2xl font-bold text-white">${cartTotal.toFixed(2)}</p>
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Método de Pago *
              </label>
              <select 
                required
                value={formData.payment_method_id}
                onChange={(e) => setFormData({...formData, payment_method_id: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer"
              >
                <option value="1" className="bg-[#0a0e27]">Efectivo</option>
                <option value="2" className="bg-[#0a0e27]">Pago Móvil</option>
                <option value="3" className="bg-[#0a0e27]">Transferencia</option>
                <option value="5" className="bg-[#0a0e27]">Zelle</option>
                <option value="9" className="bg-[#0a0e27]">Crédito</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#0a0e27] border border-[#1a1f3a] text-zinc-400 rounded-xl hover:bg-[#1a1f3a] hover:text-white transition-all font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ccff00]/20"
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
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ccff00] border-t-transparent"></div>
          </div>
        ) : selectedInvoice ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 bg-[#0a0e27]/80 border border-[#1a1f3a] rounded-xl p-5">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Factura Nº</p>
                <p className="font-mono text-white font-bold text-lg">#{selectedInvoice.billing.id}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Fecha</p>
                <p className="text-white">{formatDate(selectedInvoice.billing.payment_date)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Cliente</p>
                <p className="text-white font-medium">{selectedInvoice.billing.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Método de Pago</p>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                  {selectedInvoice.billing.method_name}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 border-b border-[#1a1f3a] pb-3 flex items-center gap-2">
                <ChevronRight size={16} className="text-[#ccff00]" />
                Desglose
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Concepto</th>
                      <th className="pb-3 font-semibold">Cant.</th>
                      <th className="pb-3 font-semibold">Precio Unit.</th>
                      <th className="pb-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.billing.booking_id && (
                      <tr className="border-t border-[#1a1f3a]/50">
                        <td className="py-2.5 text-white">Reserva de Cancha (#{selectedInvoice.billing.booking_id})</td>
                        <td className="py-2.5 text-white">1</td>
                        <td className="py-2.5 text-zinc-400">-</td>
                        <td className="py-2.5 text-white text-right font-medium">
                           Ver Total
                        </td>
                      </tr>
                    )}
                    {selectedInvoice.details.map((detail: any) => (
                      <tr key={detail.id} className="border-t border-[#1a1f3a]/50">
                        <td className="py-2.5 text-white">{detail.product_name}</td>
                        <td className="py-2.5 text-white">{detail.quantity}</td>
                        <td className="py-2.5 text-zinc-400">${Number(detail.price_unit).toFixed(2)}</td>
                        <td className="py-2.5 text-white text-right font-medium">${Number(detail.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1a1f3a]">
              <div className="text-right">
                <p className="text-sm text-zinc-400 mb-1">Total Pagado</p>
                <p className="text-3xl font-bold text-[#ccff00]">${Number(selectedInvoice.billing.total_amount).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-5 py-2.5 bg-[#0a0e27] border border-[#1a1f3a] text-zinc-400 rounded-xl hover:bg-[#1a1f3a] hover:text-white transition-all font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-12">No se encontraron detalles.</p>
        )}
      </Modal>
    </div>
  )
}
