import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Receipt,
  AlertCircle,
  Loader2,
  Eye,
  CreditCard,
  ShoppingCart,
  Trash2,
  Check,
  Clock
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { bookingService } from '../services/bookingService';
import './BillingPage.css';

export default function BillingPage({ user }) {
  const [billings, setBillings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [invoiceProducts, setInvoiceProducts] = useState([]); // [{product_id, quantity}]
  const [createLoading, setCreateLoading] = useState(false);

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailBilling, setDetailBilling] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const paymentMethods = [
    { id: 1, name: 'Efectivo' },
    { id: 2, name: 'Pago Móvil' },
    { id: 3, name: 'Transferencia' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    setError('');
    try {
      const [billingsRes, customersRes, productsRes, bookingsRes] = await Promise.all([
        billingService.getAll(),
        customerService.getAll(),
        productService.getAll(),
        bookingService.getAll()
      ]);
      if (billingsRes.success) setBillings(billingsRes.data || []);
      if (customersRes.success) setCustomers(customersRes.data || []);
      if (productsRes.success) setProducts(productsRes.data || []);
      if (bookingsRes.success) setBookings(bookingsRes.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  // --- Create Invoice ---
  const openCreateModal = () => {
    setSelectedCustomerId('');
    setSelectedPaymentMethodId('');
    setSelectedBookingId('');
    setInvoiceProducts([]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const addProductLine = () => {
    setInvoiceProducts(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  const updateProductLine = (index, field, value) => {
    setInvoiceProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeProductLine = (index) => {
    setInvoiceProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    let total = 0;
    for (const line of invoiceProducts) {
      const product = products.find(p => p.id === Number(line.product_id));
      if (product) {
        total += product.price * (line.quantity || 0);
      }
    }
    return total;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPaymentMethodId) {
      alert('Por favor selecciona un cliente y un método de pago.');
      return;
    }

    if (invoiceProducts.length === 0 && !selectedBookingId) {
      alert('Agrega al menos un producto o selecciona una reserva.');
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        customer_id: Number(selectedCustomerId),
        user_id: user.id,
        payment_method_id: Number(selectedPaymentMethodId),
        booking_id: selectedBookingId ? Number(selectedBookingId) : null,
        products: invoiceProducts
          .filter(p => p.product_id && p.quantity > 0)
          .map(p => ({ product_id: Number(p.product_id), quantity: Number(p.quantity) }))
      };

      const res = await billingService.create(payload);
      if (res.success) {
        await fetchInitialData();
        closeCreateModal();
      }
    } catch (err) {
      alert(err.message || 'Error al crear la factura.');
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Detail Modal ---
  const openDetailModal = async (billing) => {
    setDetailBilling(null);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await billingService.getById(billing.id);
      if (res.success) {
        setDetailBilling(res.data);
      }
    } catch (err) {
      alert(err.message || 'Error al cargar los detalles.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailBilling(null);
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Pending bookings for current customer
  const customerBookings = selectedCustomerId
    ? bookings.filter(b => b.customer_id === Number(selectedCustomerId) && ['Pending', 'Confirmed'].includes(b.status))
    : [];

  return (
    <div className="billing-container">

      {/* Header */}
      <div className="billing-header">
        <div className="billing-title-group">
          <h1>Facturación y Ventas</h1>
          <p>Registra facturas de ventas de productos y servicios de cancha.</p>
        </div>
        <button className="btn-add-billing" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="billing-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchInitialData} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="billing-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo facturas de Neon.tech...</p>
        </div>
      ) : billings.length === 0 ? (
        <div className="billing-empty-state">
          <Receipt size={48} style={{ color: '#64748b', marginBottom: '4px' }} />
          <h3>No hay facturas registradas</h3>
          <p>Comienza registrando la primera factura de venta.</p>
          <button className="btn-add-billing" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Crear Factura</span>
          </button>
        </div>
      ) : (
        <div className="billing-table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Método de Pago</th>
                <th>Productos</th>
                <th>Monto Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {billings.map((billing) => (
                <tr key={billing.id}>
                  <td style={{ fontWeight: '600', color: '#94a3b8' }}>#{billing.id}</td>
                  <td style={{ fontWeight: '600' }}>{billing.customer_name}</td>
                  <td>
                    <span className="payment-method-badge">
                      <CreditCard size={12} />
                      {billing.method_name}
                    </span>
                  </td>
                  <td>
                    <span className="product-count-badge">
                      <ShoppingCart size={12} />
                      {billing.product_count || 0}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(billing.total_amount)}</td>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      {formatDate(billing.payment_date)}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-billing-action detail"
                      onClick={() => openDetailModal(billing)}
                      title="Ver detalles"
                    >
                      <Eye size={12} />
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Nueva Factura</h2>
              <button className="btn-close-modal" onClick={closeCreateModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="modal-form">

              {/* Customer Selector */}
              <div className="form-group">
                <label htmlFor="bill-customer">Cliente</label>
                <select
                  id="bill-customer"
                  value={selectedCustomerId}
                  onChange={(e) => { setSelectedCustomerId(e.target.value); setSelectedBookingId(''); }}
                  required
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label htmlFor="bill-payment">Método de Pago</label>
                <select
                  id="bill-payment"
                  value={selectedPaymentMethodId}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona método --</option>
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>

              {/* Booking Selector (optional) */}
              {customerBookings.length > 0 && (
                <div className="form-group">
                  <label htmlFor="bill-booking">Reserva Asociada (Opcional)</label>
                  <select
                    id="bill-booking"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                  >
                    <option value="">-- Sin reserva --</option>
                    {customerBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        #{b.id} — {b.court_name} — {b.booking_date?.split('T')[0]} ({b.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Lines */}
              <div className="invoice-products-section">
                <div className="invoice-products-header">
                  <label>Productos</label>
                  <button type="button" className="btn-add-product-line" onClick={addProductLine}>
                    <Plus size={14} />
                    Agregar Producto
                  </button>
                </div>

                {invoiceProducts.length === 0 ? (
                  <p className="no-products-hint">No se han agregado productos. Agrega uno o selecciona una reserva.</p>
                ) : (
                  <div className="product-lines-list">
                    {invoiceProducts.map((line, index) => {
                      const selectedProduct = products.find(p => p.id === Number(line.product_id));
                      return (
                        <div key={index} className="product-line-row">
                          <select
                            value={line.product_id}
                            onChange={(e) => updateProductLine(index, 'product_id', e.target.value)}
                            className="product-line-select"
                          >
                            <option value="">-- Producto --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.product_name} — {formatCurrency(p.price)} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            max={selectedProduct ? selectedProduct.stock : 999}
                            value={line.quantity}
                            onChange={(e) => updateProductLine(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="product-line-qty"
                            placeholder="Cant."
                          />
                          <span className="product-line-subtotal">
                            {selectedProduct ? formatCurrency(selectedProduct.price * (line.quantity || 0)) : '$0.00'}
                          </span>
                          <button type="button" className="btn-remove-line" onClick={() => removeProductLine(index)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {invoiceProducts.length > 0 && (
                  <div className="invoice-subtotal-row">
                    <span>Subtotal Productos:</span>
                    <span className="subtotal-value">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeCreateModal} disabled={createLoading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={createLoading || !selectedCustomerId || !selectedPaymentMethodId}
                >
                  {createLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Generar Factura</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detalle de Factura</h2>
              <button className="btn-close-modal" onClick={closeDetailModal}>
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="billing-loading-state" style={{ padding: '40px 0' }}>
                <Loader2 size={28} className="spinner" />
                <p>Cargando detalles...</p>
              </div>
            ) : detailBilling ? (
              <div className="billing-detail-content">
                {/* Invoice Header Info */}
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Factura</span>
                    <span className="detail-value">#{detailBilling.billing.id}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Cliente</span>
                    <span className="detail-value">{detailBilling.billing.full_name}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Método de Pago</span>
                    <span className="detail-value">{detailBilling.billing.method_name}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Cajero</span>
                    <span className="detail-value">{detailBilling.billing.cashier}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Fecha</span>
                    <span className="detail-value">{formatDate(detailBilling.billing.payment_date)}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Total</span>
                    <span className="detail-value total">{formatCurrency(detailBilling.billing.total_amount)}</span>
                  </div>
                </div>

                {/* Product Details Table */}
                {detailBilling.details && detailBilling.details.length > 0 && (
                  <div className="detail-products-section">
                    <h4>Productos Vendidos</h4>
                    <table className="detail-products-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>P. Unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailBilling.details.map((d, i) => (
                          <tr key={i}>
                            <td>{d.product_name}</td>
                            <td>{d.quantity}</td>
                            <td>{formatCurrency(d.price_unit)}</td>
                            <td style={{ fontWeight: '600' }}>{formatCurrency(d.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(!detailBilling.details || detailBilling.details.length === 0) && (
                  <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                    Esta factura no incluye productos. Solo cubre el servicio de cancha.
                  </p>
                )}
              </div>
            ) : null}

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeDetailModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
