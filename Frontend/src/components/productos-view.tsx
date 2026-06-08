'use client'

import { useState, useEffect } from 'react'
import { Plus, Package as PackageIcon, Search, Filter, Edit2 } from 'lucide-react'
import { productService } from '@/services/productService'
import { Modal } from '@/components/ui/modal'

export default function ProductosView() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('Todos')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
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
      // Fallback a datos estáticos
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

  // Filtrado
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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu tienda de productos deportivos</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold w-full md:w-auto"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <Filter size={20} className="text-muted-foreground" />
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-card border-none text-foreground focus:outline-none cursor-pointer"
          >
            <option value="Todos">Niveles de Stock</option>
            <option value="Bajo">Stock Bajo (≤5)</option>
            <option value="Normal">Stock Normal (6-20)</option>
            <option value="Alto">Stock Alto (&gt;20)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Producto</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Precio</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Stock</th>
                <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    No se encontraron productos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((producto) => (
                  <tr key={producto.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-4 px-6 text-foreground">
                      <div className="flex items-center gap-2 font-medium">
                        <PackageIcon size={16} className="text-accent" />
                        {producto.product_name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-accent font-semibold">${Number(producto.price || 0).toFixed(2)}</td>
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
                      <button 
                        onClick={() => openEditModal(producto)}
                        className="text-accent hover:text-accent/80 transition-colors text-xs flex items-center gap-1 font-semibold"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo/Editar Producto */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Producto" : "Registrar Nuevo Producto"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nombre del Producto *
            </label>
            <input 
              type="text" 
              required
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Precio Unitario ($) *
              </label>
              <input 
                type="number" 
                step="0.01"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Stock Inicial
              </label>
              <input 
                type="number" 
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
              />
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
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
