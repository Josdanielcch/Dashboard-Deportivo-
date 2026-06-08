import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Search,
  Pencil,
  Package,
  AlertCircle,
  Loader2,
  DollarSign,
  Hash,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';
import { productService } from '../services/productService';
import './ProductsPage.css';

export default function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search (local filter)
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Stock Adjustment Modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const [stockSuccess, setStockSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getAll();
      if (res.success) setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered products based on search
  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // --- Add / Edit Modal ---
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormStock('0');
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.product_name || '');
    setFormPrice(product.price || '');
    setFormStock(product.stock ?? '0');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingProduct(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '') return;

    setFormLoading(true);
    try {
      const payload = {
        product_name: formName.trim(),
        price: parseFloat(formPrice),
        stock: parseInt(formStock) || 0
      };

      let res;
      if (editingProduct) {
        res = await productService.update(editingProduct.id, payload);
        if (res.success && res.data) {
          setProducts(prev =>
            prev.map(p => p.id === editingProduct.id ? { ...p, ...res.data } : p)
          );
        }
      } else {
        res = await productService.create(payload);
        if (res.success && res.data) {
          setProducts(prev => [res.data, ...prev]);
        }
      }
      closeFormModal();
    } catch (err) {
      alert(err.message || 'Error al guardar el producto.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Stock Adjustment Modal ---
  const openStockModal = (product) => {
    setStockProduct(product);
    setStockQuantity('');
    setStockSuccess(false);
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setStockProduct(null);
    setStockSuccess(false);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const qty = parseInt(stockQuantity);
    if (!qty || qty === 0) {
      alert('Ingresa una cantidad válida (positiva o negativa).');
      return;
    }

    setStockLoading(true);
    try {
      const res = await productService.updateStock(stockProduct.id, qty);
      if (res.success && res.data) {
        setProducts(prev =>
          prev.map(p =>
            p.id === stockProduct.id ? { ...p, stock: res.data.stock } : p
          )
        );
        setStockProduct(prev => ({ ...prev, stock: res.data.stock }));
        setStockSuccess(true);
        setStockQuantity('');
      }
    } catch (err) {
      alert(err.message || 'Error al ajustar el stock.');
    } finally {
      setStockLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="products-container">

      {/* Header */}
      <div className="products-header">
        <div className="products-title-group">
          <h1>Productos y Artículos</h1>
          <p>Gestiona el inventario de productos disponibles para la venta en el complejo deportivo.</p>
        </div>
        <button className="btn-add-product" onClick={openAddModal}>
          <Plus size={16} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="products-search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="products-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchProducts} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="products-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo productos de Neon.tech...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-empty-state">
          <Package size={48} style={{ color: '#64748b', marginBottom: '4px' }} />
          <h3>No se encontraron productos</h3>
          <p>{searchQuery ? 'Ningún producto coincide con tu búsqueda.' : 'No hay productos registrados. ¡Agrega el primero!'}</p>
          {!searchQuery && (
            <button className="btn-add-product" onClick={openAddModal}>
              <Plus size={16} />
              <span>Añadir Producto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = parseInt(product.stock) || 0;
                const isLowStock = stock > 0 && stock < 5;
                const isOutOfStock = stock <= 0;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        <Package size={16} className="product-icon" />
                        <span style={{ fontWeight: '600' }}>{product.product_name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(product.price)}</td>
                    <td>
                      <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                        {stock} {stock === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="btn-product-action edit"
                          onClick={() => openEditModal(product)}
                          title="Editar producto"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                        <button
                          className="btn-product-action stock"
                          onClick={() => openStockModal(product)}
                          title="Ajustar stock"
                        >
                          <ArrowUpDown size={12} />
                          Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
              <button className="btn-close-modal" onClick={closeFormModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="modal-form">

              <div className="form-group">
                <label htmlFor="prod-name">
                  <Package size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  id="prod-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Agua Mineral 500ml"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-price">
                  <DollarSign size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Precio (USD)
                </label>
                <input
                  type="number"
                  id="prod-price"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-stock">
                  <Hash size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Stock Inicial
                </label>
                <input
                  type="number"
                  id="prod-stock"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={formLoading}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeFormModal} disabled={formLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading || !formName.trim() || formPrice === ''}>
                  {formLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      {editingProduct ? <Pencil size={15} /> : <Plus size={15} />}
                      <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && stockProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajustar Stock</h2>
              <button className="btn-close-modal" onClick={closeStockModal}>
                <X size={18} />
              </button>
            </div>

            {/* Product info */}
            <div className="stock-info-card">
              <div className="stock-product-name">{stockProduct.product_name}</div>
              <div className="stock-current-row">
                <span>Stock actual:</span>
                <span className="stock-current-value">{stockProduct.stock} unidades</span>
              </div>
            </div>

            {stockSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#10b981', fontSize: '14px', fontWeight: '500', marginTop: '16px' }}>
                <CheckCircle2 size={18} />
                <span>
                  ¡Stock actualizado! Nuevo stock: {stockProduct.stock} unidades
                </span>
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="modal-form" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label htmlFor="stock-qty">Cantidad a Ajustar</label>
                <p className="form-hint">Usa valores positivos para agregar y negativos para restar.</p>
                <input
                  type="number"
                  id="stock-qty"
                  value={stockQuantity}
                  onChange={(e) => { setStockQuantity(e.target.value); setStockSuccess(false); }}
                  placeholder="Ej: 10 ó -5"
                  required
                  disabled={stockLoading}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeStockModal} disabled={stockLoading}>
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={stockLoading || !stockQuantity || parseInt(stockQuantity) === 0}
                >
                  {stockLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <ArrowUpDown size={15} />
                      <span>Ajustar Stock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
