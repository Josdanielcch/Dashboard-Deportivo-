import { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  Check, 
  AlertCircle, 
  Loader2, 
  Search, 
  Trash2, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { courtService } from '../services/courtService';
import { customerService } from '../services/customerService';
import './BookingsPage.css';

export default function BookingsPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date filtering state
  const [filterDate, setFilterDate] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Availability status state
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('idle'); // 'idle' | 'available' | 'conflict'
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Quick Customer Registration States
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [custFullName, setCustFullName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custIdent, setCustIdent] = useState('');
  const [custCreating, setCustCreating] = useState(false);

  // Table status change loadings
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, courtsRes, customersRes] = await Promise.all([
        bookingService.getAll(),
        courtService.getAll(),
        customerService.getAll()
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (courtsRes.success) setCourts(courtsRes.data || []);
      if (customersRes.success) setCustomers(customersRes.data || []);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al cargar la información del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getAll();
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Check court slot availability in the backend
  const handleCheckAvailability = async () => {
    if (!selectedCourtId || !bookingDate || !startTime || !endTime) {
      alert('Por favor selecciona una cancha, fecha y horario completo para comprobar.');
      return;
    }
    
    setAvailabilityChecking(true);
    setAvailabilityStatus('idle');
    setAvailabilityMessage('');
    
    try {
      const res = await bookingService.checkAvailability({
        court_id: selectedCourtId,
        booking_date: bookingDate,
        start_time: startTime + ':00',
        end_time: endTime + ':00'
      });
      
      if (res.success) {
        if (res.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('¡La cancha está disponible en este horario!');
        } else {
          setAvailabilityStatus('conflict');
          setAvailabilityMessage('Horario ocupado. Hay otra reserva activa en ese rango.');
        }
      }
    } catch (err) {
      setAvailabilityStatus('conflict');
      setAvailabilityMessage(err.message || 'Conflicto de disponibilidad detectado.');
    } finally {
      setAvailabilityChecking(false);
    }
  };

  // Reset availability when crucial criteria changes
  const resetAvailability = () => {
    setAvailabilityStatus('idle');
    setAvailabilityMessage('');
  };

  // Quick register customer form submission
  const handleCreateCustomerQuick = async (e) => {
    e.preventDefault();
    if (!custFullName.trim() || !custPhone.trim()) {
      alert('Nombre completo y Teléfono son requeridos.');
      return;
    }

    setCustCreating(true);
    try {
      const res = await customerService.create({
        full_name: custFullName.trim(),
        phone: custPhone.trim(),
        email: custEmail.trim(),
        tax_id: custIdent.trim()
      });

      if (res.success && res.data) {
        setCustomers(prev => [...prev, res.data]);
        setSelectedCustomerId(res.data.id);
        
        // Reset customer sub-form
        setCustFullName('');
        setCustPhone('');
        setCustEmail('');
        setCustIdent('');
        setShowQuickCustomer(false);
      }
    } catch (err) {
      alert(err.message || 'Error al registrar el nuevo cliente.');
    } finally {
      setCustCreating(false);
    }
  };

  // Submit booking creation
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (availabilityStatus !== 'available') {
      alert('Debes comprobar y confirmar la disponibilidad de la cancha antes de guardar la reserva.');
      return;
    }

    if (!selectedCustomerId) {
      alert('Por favor selecciona o registra un cliente.');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await bookingService.create({
        customer_id: Number(selectedCustomerId),
        court_id: Number(selectedCourtId),
        booking_date: bookingDate,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        user_id: user.id
      });

      if (res.success) {
        await fetchBookings();
        setShowModal(false);
        // Reset states
        setSelectedCourtId('');
        setSelectedCustomerId('');
        setBookingDate('');
        setStartTime('');
        setEndTime('');
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
      }
    } catch (err) {
      alert(err.message || 'Error al registrar la reserva.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Change status (Confirmed, Cancelled, Completed)
  const handleUpdateStatus = async (bookingId, targetStatus) => {
    setActionLoadingId(bookingId);
    try {
      const res = await bookingService.updateStatus(bookingId, targetStatus);
      if (res.success && res.data) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: res.data.status } : b
        ));
      }
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado de la reserva.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper date and time formatters
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return dateStr;
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="booking-status-badge pending">Pendiente</span>;
      case 'Confirmed':
        return <span className="booking-status-badge confirmed">Confirmada</span>;
      case 'Completed':
        return <span className="booking-status-badge completed">Completada</span>;
      case 'Cancelled':
        return <span className="booking-status-badge cancelled">Cancelada</span>;
      case 'No_show':
        return <span className="booking-status-badge no_show">No Asistió</span>;
      default:
        return <span className="booking-status-badge">{status}</span>;
    }
  };

  // Filter bookings based on active date query
  const filteredBookings = filterDate
    ? bookings.filter(b => b.booking_date.startsWith(filterDate))
    : bookings;

  return (
    <div className="bookings-container">
      
      {/* Header */}
      <div className="bookings-header">
        <div className="bookings-title-group">
          <h1>Reservas de Canchas</h1>
          <p>Visualiza reservas, comprueba disponibilidad y asigna turnos horarias.</p>
        </div>
        
        <button className="btn-add-booking" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bookings-filters">
        <div className="filter-group">
          <Calendar size={16} style={{ color: '#10b981' }} />
          <label htmlFor="filter-date">Filtrar por Fecha:</label>
          <input 
            type="date" 
            id="filter-date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        
        {filterDate && (
          <button className="btn-clear-filter" onClick={() => setFilterDate('')}>
            Limpiar Filtro
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bookings-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchInitialData} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>Reintentar</button>
        </div>
      )}

      {/* Bookings List Table */}
      {loading ? (
        <div className="bookings-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo reservas de Neon.tech...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h3>No hay reservas registradas</h3>
          <p>{filterDate ? 'No se encontraron reservas para la fecha seleccionada.' : 'No hay reservas guardadas en el sistema. Registra la primera hoy.'}</p>
          {!filterDate && (
            <button className="btn-add-booking" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              <span>Registrar Reserva</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ fontWeight: '600' }}>{formatDate(booking.booking_date)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} style={{ color: '#94a3b8' }} />
                      <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                    </div>
                  </td>
                  <td>{booking.court_name}</td>
                  <td>{booking.customer_name}</td>
                  <td style={{ color: '#94a3b8' }}>{booking.phone}</td>
                  <td>{renderStatusBadge(booking.status)}</td>
                  <td>
                    <div className="table-actions">
                      {booking.status === 'Pending' && (
                        <button 
                          className="btn-table-action confirm"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                        >
                          Confirmar
                        </button>
                      )}
                      
                      {booking.status === 'Confirmed' && (
                        <button 
                          className="btn-table-action complete"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                        >
                          Completada
                        </button>
                      )}

                      {['Pending', 'Confirmed'].includes(booking.status) && (
                        <button 
                          className="btn-table-action cancel"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                        >
                          Cancelar
                        </button>
                      )}

                      {['Completed', 'Cancelled', 'No_show'].includes(booking.status) && (
                        <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Sin acciones</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Add Booking */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            
            <div className="modal-header">
              <h2>Registrar Reserva</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="modal-form">
              
              {/* Cancha Selector */}
              <div className="form-group">
                <label htmlFor="court-select">Cancha Deportiva</label>
                <select 
                  id="court-select"
                  value={selectedCourtId}
                  onChange={(e) => { setSelectedCourtId(e.target.value); resetAvailability(); }}
                  required
                >
                  <option value="">-- Selecciona una cancha --</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>
                      {court.court_name} ({court.status === 'Available' ? 'Disponible' : 'Ocupada/Mantenimiento'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente Selector or Quick Client Sub-form */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="customer-select">Cliente</label>
                  <button 
                    type="button" 
                    className="btn-toggle-quick"
                    onClick={() => setShowQuickCustomer(!showQuickCustomer)}
                  >
                    {showQuickCustomer ? "Seleccionar cliente existente" : "+ Registrar nuevo cliente"}
                  </button>
                </div>

                {!showQuickCustomer ? (
                  <select 
                    id="customer-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required={!showQuickCustomer}
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {customers.map(cust => (
                      <option key={cust.id} value={cust.id}>
                        {cust.full_name} ({cust.tax_id || 'Sin Cédula'})
                      </option>
                    ))}
                  </select>
                ) : (
                  // Quick Customer Form
                  <div className="quick-customer-section">
                    <h4>Registro Rápido de Cliente</h4>
                    <div className="form-row-2">
                      <div className="form-group">
                        <input 
                          type="text" 
                          placeholder="Nombre Completo" 
                          value={custFullName}
                          onChange={(e) => setCustFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input 
                          type="text" 
                          placeholder="Teléfono" 
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <input 
                          type="email" 
                          placeholder="Correo electrónico" 
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <input 
                          type="text" 
                          placeholder="Cédula/Documento" 
                          value={custIdent}
                          onChange={(e) => setCustIdent(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-check-availability" 
                      onClick={handleCreateCustomerQuick}
                      disabled={custCreating || !custFullName.trim() || !custPhone.trim()}
                      style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}
                    >
                      {custCreating ? <Loader2 size={12} className="spinner" /> : "Guardar Cliente"}
                    </button>
                  </div>
                )}
              </div>

              {/* Date & Time Selectors */}
              <div className="form-group">
                <label htmlFor="booking-date">Fecha de la Reserva</label>
                <input 
                  type="date" 
                  id="booking-date"
                  value={bookingDate}
                  onChange={(e) => { setBookingDate(e.target.value); resetAvailability(); }}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="start-time">Hora de Inicio</label>
                  <input 
                    type="time" 
                    id="start-time"
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); resetAvailability(); }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end-time">Hora de Finalización</label>
                  <input 
                    type="time" 
                    id="end-time"
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); resetAvailability(); }}
                    required
                  />
                </div>
              </div>

              {/* Availability check action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button"
                  className="btn-check-availability"
                  onClick={handleCheckAvailability}
                  disabled={availabilityChecking || !selectedCourtId || !bookingDate || !startTime || !endTime}
                >
                  {availabilityChecking ? (
                    <>
                      <Loader2 size={14} className="spinner" style={{ marginRight: '6px', display: 'inline' }} />
                      Comprobando Disponibilidad...
                    </>
                  ) : "Verificar Disponibilidad"}
                </button>

                {/* Status banner */}
                {availabilityStatus === 'available' && (
                  <div className="availability-banner available">
                    <CheckCircle size={16} />
                    <span>{availabilityMessage}</span>
                  </div>
                )}
                
                {availabilityStatus === 'conflict' && (
                  <div className="availability-banner conflict">
                    <AlertCircle size={16} />
                    <span>{availabilityMessage}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowModal(false)}
                  disabled={createLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={createLoading || availabilityStatus !== 'available' || !selectedCustomerId}
                >
                  {createLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Agendar Reserva</span>
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
