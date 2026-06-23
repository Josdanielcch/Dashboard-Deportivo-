'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingDown, Search, Filter, Plus, Trash2, X, ShoppingCart, Eye, ChevronRight, Package, Printer } from 'lucide-react'
import { purchaseService } from '@/services/purchaseService'
import { supplierService } from '@/services/supplierService'
import { productService } from '@/services/productService'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Modal } from '@/components/ui/modal'
import { printInvoice } from '@/utils/printUtils'

export default function ComprasView() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('Todos')

  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // Modal Nueva Compra
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    supplier_id: '',
    payment_method_id: '1',
    invoice_number: ''
  })
  
  const [cart, setCart] = useState<{product_id: string, description: string, unit_cost: number, quantity: number}[]>([])
  const [currentProductId, setCurrentProductId] = useState('')
  const [currentDesc, setCurrentDesc] = useState('')
  const [currentQty, setCurrentQty] = useState('1')
  const [currentCost, setCurrentCost] = useState('0')

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
      const [resPurchases, resSuppliers, resProducts] = await Promise.all([
        purchaseService.getAll().catch(() => ({ success: false })),
        supplierService.getAll().catch(() => ({ success: false })),
        productService.getAll().catch(() => ({ success: false }))
      ])

      if (resPurchases.success) setPurchases(resPurchases.data || [])
      if (resSuppliers.success) setSuppliers(resSuppliers.data || [])
      if (resProducts.success) setProducts(resProducts.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!currentDesc && !currentProductId) return
    const p = products.find(x => x.id.toString() === currentProductId)
    
    setCart(prev => [
      ...prev, 
      {
        product_id: currentProductId,
        description: p ? p.product_name : currentDesc,
        quantity: parseInt(currentQty),
        unit_cost: parseFloat(currentCost)
      }
    ])
    
    setCurrentProductId('')
    setCurrentDesc('')
    setCurrentQty('1')
    setCurrentCost('0')
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert('Debes agregar al menos un ítem a la compra.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        supplier_id: parseInt(formData.supplier_id),
        user_id: 1,
        invoice_number: formData.invoice_number,
        payment_method_id: parseInt(formData.payment_method_id),
        products: cart.map(c => ({
          product_id: c.product_id ? parseInt(c.product_id) : undefined,
          description: c.description,
          quantity: c.quantity,
          unit_cost: c.unit_cost
        }))
      }
      const res = await purchaseService.create(payload)
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ supplier_id: '', payment_method_id: '1', invoice_number: '' })
        setCart([])
        fetchData()
      }
    } catch (error: any) {
      console.error('Error creando compra:', error)
      alert(error.message || 'Hubo un error al registrar la compra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewInvoice = async (id: number) => {
    setIsInvoiceModalOpen(true)
    setLoadingInvoice(true)
    try {
      const res = await purchaseService.getById(id)
      if (res.success) {
        setSelectedInvoice(res.data)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Error al cargar la compra')
      setIsInvoiceModalOpen(false)
    } finally {
      setLoadingInvoice(false)
    }
  }

  const handlePrintCompra = (format: 'a4' | 'ticket') => {
    if (!selectedInvoice) return;
    
    const details = selectedInvoice.details.map((d: any) => ({
      name: d.product_name || d.description,
      quantity: d.quantity,
      price: Number(d.unit_cost),
      subtotal: Number(d.subtotal)
    }));

    printInvoice({
      type: 'compra',
      id: selectedInvoice.purchase.id,
      date: selectedInvoice.purchase.purchase_date,
      entityName: selectedInvoice.purchase.supplier_name,
      methodName: selectedInvoice.purchase.method_name || 'Crédito',
      total: Number(selectedInvoice.purchase.total_amount),
      details: details
    }, format);
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      purchase.supplier_name?.toLowerCase().includes(term) ||
      purchase.id?.toString().includes(term) ||
      purchase.invoice_number?.toLowerCase().includes(term)

    const matchesMethod = methodFilter === 'Todos' || purchase.method_name === methodFilter

    return matchesSearch && matchesMethod
  })

  const totalComprasValor = filteredPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
  const totalCompras = `$${totalComprasValor.toFixed(2)}`
  const promedioValor = filteredPurchases.length > 0 ? totalComprasValor / filteredPurchases.length : 0
  const promedio = `$${promedioValor.toFixed(2)}`

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const dateObj = new Date(dateStr)
    return new Date(dateObj.getTime() + Math.abs(dateObj.getTimezoneOffset() * 60000)).toLocaleDateString()
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.unit_cost * item.quantity), 0)

  return (
    <div className="min-h-screen bg-[#0a0e27] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Compras y Gastos</h1>
          <p className="text-zinc-400">Registra facturas de proveedores y entradas de inventario</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCart([])
              setFormData({ supplier_id: '', payment_method_id: '1', invoice_number: '' })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#ccff00] text-[#0a0e27] px-5 py-2.5 rounded-xl hover:brightness-110 transition-all font-bold shadow-lg shadow-[#ccff00]/20"
          >
            <Plus size={20} />
            Nueva Compra
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Egresos Totales</p>
              <p className="text-3xl font-bold text-white">{totalCompras}</p>
            </div>
            <div className="bg-rose-500/10 p-3 rounded-xl">
              <DollarSign className="text-rose-400" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Compras Realizadas</p>
              <p className="text-3xl font-bold text-white">{filteredPurchases.length}</p>
            </div>
            <div className="bg-[#ccff00]/10 p-3 rounded-xl">
              <TrendingDown className="text-[#ccff00]" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-2xl p-6 hover:border-[#ccff00]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Promedio por Compra</p>
              <p className="text-3xl font-bold text-white">{promedio}</p>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-xl">
              <DollarSign className="text-indigo-400" size={28} />
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
            placeholder="Buscar por proveedor, ID o factura..."
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
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Proveedor</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Nro Factura</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Total</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Método de Pago</th>
                <th className="text-left py-4 px-6 text-zinc-400 font-semibold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ccff00] border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    No se encontraron compras que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-[#1a1f3a] hover:bg-[#0a0e27]/60 transition-colors group">
                    <td className="py-4 px-6 text-white font-mono font-medium">#{purchase.id}</td>
                    <td className="py-4 px-6 text-white font-medium">{purchase.supplier_name}</td>
                    <td className="py-4 px-6 text-zinc-400">{formatDate(purchase.purchase_date)}</td>
                    <td className="py-4 px-6 text-zinc-400">{purchase.invoice_number || '-'}</td>
                    <td className="py-4 px-6 text-white font-bold">${Number(purchase.total_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                        {purchase.method_name || 'Crédito'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleViewInvoice(purchase.id)}
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

      {/* Modal Nueva Compra */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Registrar Compra o Gasto"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Proveedor *
              </label>
              <SearchableSelect
                required
                value={formData.supplier_id}
                onChange={(val) => setFormData({...formData, supplier_id: val.toString()})}
                placeholder="Selecciona un proveedor"
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer flex justify-between items-center text-left"
                options={suppliers.map(s => ({
                  value: s.id,
                  label: s.name,
                  sublabel: s.contact_email,
                  searchString: `${s.name} ${s.contact_email} ${s.tax_id}`
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Factura Nro (Opcional)
              </label>
              <input 
                type="text"
                value={formData.invoice_number}
                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00]/50 transition-colors"
              />
            </div>
          </div>

          {/* Cart Form */}
          <div className="bg-[#0a0e27]/60 border border-[#1a1f3a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={16} className="text-[#ccff00]" />
              <h4 className="font-semibold text-sm text-white">Agregar Ítems</h4>
            </div>
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <label className="block text-xs text-zinc-500 mb-1">Producto (Inventario)</label>
                <SearchableSelect
                  value={currentProductId}
                  onChange={(val) => {
                    setCurrentProductId(val.toString())
                    setCurrentDesc('')
                  }}
                  placeholder="Gasto General (Sin inv.)"
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer flex justify-between items-center text-left"
                  options={[
                    { value: '', label: 'Gasto General (Sin inv.)', searchString: 'gasto general sin inv' },
                    ...products.map(p => ({
                      value: p.id,
                      label: p.product_name,
                      sublabel: `Stock: ${p.stock}`,
                      searchString: `${p.product_name}`
                    }))
                  ]}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-zinc-500 mb-1">Descripción</label>
                <input 
                  type="text" 
                  value={currentDesc} 
                  onChange={e => setCurrentDesc(e.target.value)} 
                  disabled={!!currentProductId} 
                  placeholder={currentProductId ? 'Auto' : 'Ej: Pago de Luz'} 
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-2 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus:border-[#ccff00]/50 transition-colors" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Cant.</label>
                <input 
                  type="number" 
                  min="1"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Costo Unit.</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={currentCost}
                  onChange={(e) => setCurrentCost(e.target.value)}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/50 transition-colors"
                />
              </div>
              <div className="col-span-1">
                <button 
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-[#ccff00] text-[#0a0e27] py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1a1f3a]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Ítem</th>
                      <th className="pb-2 font-semibold">Cant.</th>
                      <th className="pb-2 font-semibold text-right">Subtotal</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c, i) => (
                      <tr key={i} className="border-b border-[#1a1f3a]/50 last:border-0">
                        <td className="py-2 text-white flex items-center gap-2">
                          {c.product_id ? <Package size={14} className="text-[#ccff00]"/> : <DollarSign size={14} className="text-zinc-500"/>}
                          {c.description}
                        </td>
                        <td className="py-2 text-white">{c.quantity}</td>
                        <td className="py-2 text-white text-right font-medium">${(c.unit_cost * c.quantity).toFixed(2)}</td>
                        <td className="py-2 text-right">
                          <button type="button" onClick={() => removeFromCart(i)} className="text-red-500 hover:text-red-400 transition-colors p-1">
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
              <p className="text-sm text-zinc-400 mb-1">Total Compra</p>
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
                <option value="3" className="bg-[#0a0e27]">Transferencia</option>
                <option value="5" className="bg-[#0a0e27]">Zelle</option>
                <option value="9" className="bg-[#0a0e27]">Crédito (CxP)</option>
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
              {isSubmitting ? 'Procesando...' : 'Completar Registro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Compra */}
      <Modal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        title="Detalle de Compra"
      >
        {loadingInvoice ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ccff00] border-t-transparent"></div>
          </div>
        ) : selectedInvoice ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 bg-[#0a0e27]/80 border border-[#1a1f3a] rounded-xl p-5">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Registro Nº</p>
                <p className="font-mono text-white font-bold text-lg">#{selectedInvoice.purchase.id}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Fecha</p>
                <p className="text-white">{formatDate(selectedInvoice.purchase.purchase_date)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Proveedor</p>
                <p className="text-white font-medium">{selectedInvoice.purchase.supplier_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Método de Pago</p>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                  {selectedInvoice.purchase.method_name || 'Crédito'}
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
                    {selectedInvoice.details.map((detail: any) => (
                      <tr key={detail.id} className="border-t border-[#1a1f3a]/50">
                        <td className="py-2.5 text-white">{detail.product_name || detail.description}</td>
                        <td className="py-2.5 text-white">{detail.quantity}</td>
                        <td className="py-2.5 text-zinc-400">${Number(detail.unit_cost).toFixed(2)}</td>
                        <td className="py-2.5 text-white text-right font-medium">${Number(detail.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1a1f3a]">
              <div className="text-right">
                <p className="text-sm text-zinc-400 mb-1">Total Compra</p>
                <p className="text-3xl font-bold text-[#ccff00]">${Number(selectedInvoice.purchase.total_amount).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => handlePrintCompra('ticket')}
                className="px-4 py-2 bg-[#0f1533] border border-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#1a1f3a] hover:text-white transition-all font-medium flex items-center gap-2 text-sm"
              >
                <Printer size={16} />
                Ticket
              </button>
              <button 
                type="button" 
                onClick={() => handlePrintCompra('a4')}
                className="px-4 py-2 bg-[#0f1533] border border-[#1a1f3a] text-zinc-300 rounded-xl hover:bg-[#1a1f3a] hover:text-white transition-all font-medium flex items-center gap-2 text-sm"
              >
                <Printer size={16} />
                A4
              </button>
              <button 
                type="button" 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-5 py-2.5 bg-[#0a0e27] border border-[#1a1f3a] text-zinc-400 rounded-xl hover:bg-[#1a1f3a] hover:text-white transition-all font-medium ml-2"
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
