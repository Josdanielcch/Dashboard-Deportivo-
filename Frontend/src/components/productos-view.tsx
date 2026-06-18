'use client'

import { useState, useEffect } from 'react'
import { Plus, Package as PackageIcon, Search, Filter, Edit2, Trash2 } from 'lucide-react'
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
    price: '',
    stock: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        { id: 1, product_name: 'Raqueta de Tenis Pro', price: 120, stock: 15 },
        { id: 2, product_name: 'Balón de Fútbol Profesional', price: 45, stock: 32 },
        { id: 3, product_name: 'Pala de Pádel Carbono', price: 85, stock: 4 },
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
        product_name: formData.product_name,
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
        setFormData({ product_name: '', price: '', stock: '' })
        setEditingId(null)
        fetchProductos()
      }
    } catch (error: any) {
      console.error('Error guardando producto:', error)
      alert(error.message || 'Hubo un error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (producto: any) => {
    setEditingId(producto.id)
    setFormData({
      product_name: producto.product_name || '',
      price: producto.price ? producto.price.toString() : '',
      stock: producto.stock ? producto.stock.toString() : '0'
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ product_name: '', price: '', stock: '' })
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

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Productos</h1>
          <p className="text-gray-400">Gestiona tu tienda de productos deportivos</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0a0e27] px-6 py-3 rounded-lg hover:bg-[#b8e600] transition-colors font-bold w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Precio</th>
                <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Stock</th>
                <th className="text-right py-4 px-6 text-gray-400 font-semibold uppercase tracking-wider text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ccff00]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-500">
                    <PackageIcon size={40} className="mx-auto mb-3 opacity-30" />
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto, index) => (
                  <tr 
                    key={producto.id} 
                    className="border-b border-[#1a1f3a] hover:bg-[#1a1f3a]/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#ccff00]/10 flex items-center justify-center group-hover:bg-[#ccff00]/20 transition-colors">
                          <PackageIcon size={16} className="text-[#ccff00]" />
                        </div>
                        <span className="font-medium">{producto.product_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#ccff00] font-bold text-base">
                      ${Number(producto.price || 0).toFixed(2)}
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
                ))
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Nombre del Producto *
            </label>
            <input 
              type="text" 
              required
              placeholder="Ej: Raqueta de Tenis Pro"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Precio Unitario ($) *
              </label>
              <input 
                type="number" 
                step="0.01"
                required
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-[#0a0e27] border border-[#1a1f3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors"
              />
            </div>
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
              disabled={isSubmitting}
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
    </div>
  )
}
