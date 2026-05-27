import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  Search,
  Pencil,
  DollarSign,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { customerService } from '../services/customerService';
import './CustomersPage.css';

export default function CustomersPage({ user }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Add/Edit Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null = add new
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isAdmin = user && user.role_id === 1;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerService.getAll();
      if (res.success) setCustomers(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search against the API
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      fetchCustomers();
      return;
    }
    setSearchLoading(true);
    try {
      const res = await customerService.search(query.trim());
      if (res.success) setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Open add modal
  const openAddModal = () => {
    setEditingCustomer(null);
    setFormFullName('');
    setFormPhone('');
    setFormEmail('');
    setFormTaxId('');
    setShowFormModal(true);
  };

  // Open edit modal
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormFullName(customer.full_name || '');
    setFormPhone(customer.phone || '');
    setFormEmail(customer.email || '');
    setFormTaxId(customer.tax_id || '');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCustomer(null);
  };

  // Submit add/edit form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formFullName.trim()) return;

    setFormLoading(true);
    try {
      const payload = {
        full_name: formFullName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        tax_id: formTaxId.trim()
      };

      let res;
      if (editingCustomer) {
        res = await customerService.update(editingCustomer.id, payload);
        if (res.success && res.data) {
          setCustomers(prev =>
            prev.map(c => c.id === editingCustomer.id ? { ...c, ...res.data } : c)
          );
        }
      } else {
        res = await customerService.create(payload);
        if (res.success && res.data) {
          setCustomers(prev => [res.data, ...prev]);
        }
      }
      closeFormModal();
    } catch (err) {
      alert(err.message || 'Error al guardar los datos del cliente.');
    } finally {
      setFormLoading(false);
    }
  };

  // Open payment modal
  const openPaymentModal = (customer) => {
    setPayingCustomer(customer);
    setPaymentAmount('');
    setPaymentSuccess(false);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPayingCustomer(null);
    setPaymentSuccess(false);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto de pago válido.');
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await customerService.recordPayment(payingCustomer.id, amount);
      if (res.success && res.data) {
        // Update customer balance in the list
        setCustomers(prev =>
          prev.map(c =>
            c.id === payingCustomer.id
              ? { ...c, outstanding_balance: res.data.outstanding_balance }
              : c
          )
        );
        setPayingCustomer(prev => ({ ...prev, outstanding_balance: res.data.outstanding_balance }));
        setPaymentSuccess(true);
        setPaymentAmount('');
      }
    } catch (err) {
      alert(err.message || 'Error al registrar el pago.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="customers-container">

      {/* Header */}
      <div className="customers-header">
        <div className="customers-title-group">
          <h1>Clientes</h1>
          <p>Gestiona el registro de clientes, sus datos de contacto y el seguimiento de deudas pendientes.</p>
        </div>
        <button className="btn-add-customer" onClick={openAddModal}>
          <Plus size={16} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="customers-search-bar">
        {searchLoading ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o teléfono..."
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
        <div className="customers-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchCustomers} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="customers-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo clientes de Neon.tech...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="customers-empty-state">
          <h3>No se encontraron clientes</h3>
          <p>{searchQuery ? 'Ningún cliente coincide con tu búsqueda.' : 'No hay clientes registrados. ¡Agrega el primero!'}</p>
          {!searchQuery && (
            <button className="btn-add-customer" onClick={openAddModal}>
              <Plus size={16} />
              <span>Añadir Cliente</span>
            </button>
          )}
        </div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Deuda Pendiente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const balance = parseFloat(customer.outstanding_balance) || 0;
                return (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: '600' }}>{customer.full_name}</td>
                    <td style={{ color: '#94a3b8' }}>{customer.tax_id || '—'}</td>
                    <td>{customer.phone || '—'}</td>
                    <td style={{ color: '#94a3b8' }}>{customer.email || '—'}</td>
                    <td>
                      <span className={balance > 0 ? 'balance-positive' : 'balance-zero'}>
                        {formatCurrency(balance)}
                      </span>
                    </td>
                    <td>
                      <div className="customer-actions">
                        <button
                          className="btn-customer-action edit"
                          onClick={() => openEditModal(customer)}
                          title="Editar cliente"
                        >
                          <Pencil size={12} />
                          Editar
                        </button>
                        {balance > 0 && (
                          <button
                            className="btn-customer-action pay"
                            onClick={() => openPaymentModal(customer)}
                            title="Registrar pago de deuda"
                          >
                            <DollarSign size={12} />
                            Cobrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
              <button className="btn-close-modal" onClick={closeFormModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="modal-form">

              <div className="form-group">
                <label htmlFor="cust-fullname">
                  <User size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="cust-fullname"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ej: María García López"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cust-taxid">
                  <CreditCard size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Cédula / Documento (Tax ID)
                </label>
                <input
                  type="text"
                  id="cust-taxid"
                  value={formTaxId}
                  onChange={(e) => setFormTaxId(e.target.value)}
                  placeholder="Ej: V-12345678"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cust-phone">
                  <Phone size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Teléfono
                </label>
                <input
                  type="text"
                  id="cust-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ej: 0414-1234567"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cust-email">
                  <Mail size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="cust-email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ej: cliente@correo.com"
                  disabled={formLoading}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeFormModal} disabled={formLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading || !formFullName.trim()}>
                  {formLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      {editingCustomer ? <Pencil size={15} /> : <Plus size={15} />}
                      <span>{editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && payingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Registrar Cobro de Deuda</h2>
              <button className="btn-close-modal" onClick={closePaymentModal}>
                <X size={18} />
              </button>
            </div>

            {/* Customer info */}
            <div className="payment-info-card">
              <div className="customer-name">{payingCustomer.full_name}</div>
              <div className="debt-row">
                <span>Saldo pendiente actual:</span>
                <span className="debt-amount">{formatCurrency(payingCustomer.outstanding_balance)}</span>
              </div>
            </div>

            {paymentSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#10b981', fontSize: '14px', fontWeight: '500', marginTop: '16px' }}>
                <CheckCircle2 size={18} />
                <span>
                  ¡Pago registrado! Nuevo saldo: {formatCurrency(payingCustomer.outstanding_balance)}
                </span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="modal-form" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label htmlFor="payment-amount">Monto a Cobrar (USD)</label>
                <input
                  type="number"
                  id="payment-amount"
                  value={paymentAmount}
                  onChange={(e) => { setPaymentAmount(e.target.value); setPaymentSuccess(false); }}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  max={payingCustomer.outstanding_balance}
                  required
                  disabled={paymentLoading}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closePaymentModal} disabled={paymentLoading}>
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={paymentLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  {paymentLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <DollarSign size={15} />
                      <span>Registrar Cobro</span>
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
