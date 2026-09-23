'use client'

import { useState, useEffect } from 'react'
import { Plus, Package as PackageIcon, Search, Filter, Edit2, TrendingUp, DollarSign, Percent, AlertTriangle } from 'lucide-react'
import { productService } from '@/services/productService'
import { Modal } from '@/components/ui/modal'

export default function ProductosView() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('Todos')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    cost_price: '',
    price: '',
    stock: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [infoModal, setInfoModal] = useState({ isOpen: false, message: '', title: '' })

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const res = await productService.getAll()
      if (res.success) {
        setProductos(res.data || [])
      }
    } catch (error) {
      console.error('Error fetching productos:', error)
      setProductos([
        { id: 1, product_name: 'Raqueta de Tenis Pro', cost_price: 75, price: 120, stock: 15 },
        { id: 2, product_name: 'Balón de Fútbol Profesional', cost_price: 25, price: 45, stock: 32 },
        { id: 3, product_name: 'Pala de Pádel Carbono', cost_price: 50, price: 85, stock: 4 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const exists = formData.product_name && productos.some(p => p.product_name.toLowerCase() === formData.product_name.toLowerCase() && p.id !== editingId);
    if (exists) {
      setInfoModal({ isOpen: true, message: 'Este nombre de producto ya está registrado en el sistema.', title: 'Producto duplicado' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        product_name: formData.product_name,
        cost_price: parseFloat(formData.cost_price) || 0,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      }
      
      let res;
      if (editingId) {
        res = await productService.update(editingId, payload)
      } else {
        res = await productService.create(payload)
      }
      
      if (res.success) {
        setIsModalOpen(false)
        setFormData({ product_name: '', cost_price: '', price: '', stock: '' })
        setEditingId(null)
        fetchProductos()
      }
    } catch (error: any) {
      console.error('Error guardando producto:', error)
      setInfoModal({ isOpen: true, message: error.message || 'Hubo un error al guardar el producto', title: 'Error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (producto: any) => {
    setEditingId(producto.id)
    setFormData({
      product_name: producto.product_name || '',
      cost_price: producto.cost_price !== undefined && producto.cost_price !== null ? producto.cost_price.toString() : '0',
      price: producto.price ? producto.price.toString() : '',
      stock: producto.stock ? producto.stock.toString() : '0'
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ product_name: '', cost_price: '', price: '', stock: '' })
    setIsModalOpen(true)
  }

  const filteredProductos = productos.filter((producto) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = producto.product_name?.toLowerCase().includes(term)
    
    let matchesStock = true
    if (stockFilter === 'Bajo') matchesStock = producto.stock <= 5
    if (stockFilter === 'Normal') matchesStock = producto.stock > 5 && producto.stock <= 20
    if (stockFilter === 'Alto') matchesStock = producto.stock > 20

    return matchesSearch && matchesStock
  })

  // Cálculos dinámicos para el Modal en tiempo real
  const modalCost = parseFloat(formData.cost_price) || 0
  const modalPrice = parseFloat(formData.price) || 0
  const modalProfit = modalPrice - modalCost
  const modalMarkupPct = modalCost > 0 ? (modalProfit / modalCost) * 100 : (modalPrice > 0 ? 100 : 0)
  const modalSaleMarginPct = modalPrice > 0 ? (modalProfit / modalPrice) * 100 : 0

  // Métricas del catálogo general
  const totalStock = productos.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0)
  const totalInventoryCost = productos.reduce((acc, p) => acc + ((parseFloat(p.cost_price) || 0) * (parseInt(p.stock) || 0)), 0)
  const totalInventorySale = productos.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (parseInt(p.stock) || 0)), 0)
  const totalPotentialProfit = totalInventorySale - totalInventoryCost
  const catalogMargin = totalInventoryCost > 0 ? ((totalPotentialProfit / totalInventoryCost) * 100) : 0

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Productos e Inventario</h1>
          <p className="text-gray-400">Control de costos, precios de venta y márgenes de ganancia</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-lg hover:bg-[#b8e600] transition-colors font-bold w-full md:w-auto shadow-lg shadow-[#ccff00]/10"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Tarjetas de Métricas de Rentabilidad del Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <PackageIcon size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Total Productos</span>
            <span className="text-xl font-bold text-white">{productos.length} <span className="text-xs text-gray-400 font-normal">({totalStock} un.)</span></span>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Inversión a Costo</span>
            <span className="text-xl font-bold text-purple-300">${totalInventoryCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Valor Total Venta</span>
            <span className="text-xl font-bold text-[#ccff00]">${totalInventorySale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Margen Promedio</span>
            <span className="text-xl font-bold text-emerald-400">+{catalogMargin.toFixed(1)}% <span className="text-xs text-emerald-500/80 font-normal">(+${totalPotentialProfit.toFixed(0)})</span></span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0f1533] border border-[#1a1f3a] rounded-lg px-4 py-3">
          <Filter size={20} className="text-gray-400" />
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
          >
            <option value="Todos" className="bg-[#0f1533]">Niveles de Stock</option>
            <option value="Bajo" className="bg-[#0f1533]">Stock Bajo (&le;5)</option>
            <option value="Normal" className="bg-[#0f1533]">Stock Normal (6-20)</option>
            <option value="Alto" className="bg-[#0f1533]">Stock Alto (&gt;20)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1533] border border-[#1a1f3a] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1f3a] bg-[#0a0e27]/50">
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Producto</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Costo Compra</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Precio Venta</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Ganancia / Margen</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Stock</th>
                <th className="text-right py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ccff00]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500">
                    <PackageIcon size={40} className="mx-auto mb-3 opacity-30" />
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => {
                  const cost = Number(producto.cost_price || 0)
                  const price = Number(producto.price || 0)
                  const profit = price - cost
                  const markupPct = cost > 0 ? (profit / cost) * 100 : (price > 0 ? 100 : 0)
                  const isLoss = profit < 0

                  return (
                    <tr 
                      key={producto.id} 
                      className="border-b border-[#1a1f3a] hover:bg-[#1a1f3a]/40 transition-colors group"
                    >
                      <td className="py-4 px-6 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#ccff00]/10 flex items-center justify-center group-hover:bg-[#ccff00]/20 transition-colors">
                            <PackageIcon size={16} className="text-[#ccff00]" />
                          </div>
                          <span className="font-semibold text-white">{producto.product_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-300 font-medium">
                        ${cost.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-[#ccff00] font-bold text-base">
                        ${price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isLoss ? 'text-red-400' : 'text-emerald-400'}`}>
                              {profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isLoss 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {markupPct >= 0 ? `+${markupPct.toFixed(1)}%` : `${markupPct.toFixed(1)}%`}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {cost > 0 && price > 0 ? `${((profit / price) * 100).toFixed(0)}% s/venta` : 'Sin costo registrado'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          producto.stock > 20
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : producto.stock > 5
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            producto.stock > 20
                              ? 'bg-emerald-400'
                              : producto.stock > 5
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`} />
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => openEditModal(producto)}
                          className="text-gray-400 hover:text-[#ccff00] transition-colors p-2 hover:bg-[#ccff00]/10 rounded-lg"
                          title="Editar producto"
                        >
                          <Edit2 size={16} />
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
        title={editingId ? "Editar Producto" : "Registrar Nuevo Producto"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Nombre del Producto (Identificación) *
            </label>
            <input 
              type="text" 
              required
              placeholder="Ej: Raqueta de Tenis Pro"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className={`w-full bg-[#0a0e27] border ${
                formData.product_name && productos.some(p => p.product_name.toLowerCase() === formData.product_name.toLowerCase() && p.id !== editingId)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#1a1f3a] focus:border-[#ccff00] transition-colors'
              } rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none`}
            />
            {formData.product_name && productos.some(p => p.product_name.toLowerCase() === formData.product_name.toLowerCase() && p.id !== editingId) && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">
                Este nombre de producto ya está registrado.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Costo de Compra ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors font-mono"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">Precio al proveedor</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Precio de Venta ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors font-mono font-bold"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">Precio al cliente</span>
            </div>
          </div>

          {/* Tarjeta de Cálculo en Vivo de Margen y Ganancia */}
          {formData.price && (
            <div className={`p-4 rounded-xl border transition-all ${
              modalProfit < 0
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Rentabilidad por Unidad
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  modalProfit < 0
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {modalCost > 0 ? `${modalMarkupPct >= 0 ? '+' : ''}${modalMarkupPct.toFixed(1)}% Ganancia s/costo` : '100% Margen'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <span className="text-[11px] text-gray-400 block">Ganancia Neta</span>
                  <span className={`text-base font-bold ${modalProfit < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {modalProfit >= 0 ? `+$${modalProfit.toFixed(2)}` : `-$${Math.abs(modalProfit).toFixed(2)}`}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Margen sobre Venta</span>
                  <span className="text-base font-bold text-white">
                    {modalSaleMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
              {modalProfit < 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-semibold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>El precio de venta es menor al costo de compra (venta a pérdida).</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Stock Inicial
            </label>
            <input 
              type="number" 
              min="0"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[#1a1f3a] text-gray-300 rounded-lg hover:bg-[#222850] transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || (formData.product_name ? productos.some(p => p.product_name.toLowerCase() === formData.product_name.toLowerCase() && p.id !== editingId) : false)}
              className="px-5 py-2.5 bg-[#ccff00] text-[#0a0e27] font-bold rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a0e27]"></div>
                  Guardando...
                </span>
              ) : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </Modal>

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
