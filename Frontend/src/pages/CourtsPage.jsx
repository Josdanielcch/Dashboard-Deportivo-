import { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  Activity, 
  Wrench, 
  AlertTriangle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { courtService } from '../services/courtService';
import './CourtsPage.css';

export default function CourtsPage({ user }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtStatus, setNewCourtStatus] = useState('Available');
  
  // Loading states for actions
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isAdmin = user && user.role_id === 1;

  // Load courts from backend API on mount
  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await courtService.getAll();
      if (res.success) {
        setCourts(res.data || []);
      } else {
        setError('No se pudo cargar la lista de canchas');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    if (!newCourtName.trim()) return;

    setCreateLoading(true);
    try {
      const res = await courtService.create(newCourtName.trim(), newCourtStatus);
      if (res.success && res.data) {
        setCourts(prev => [...prev, res.data]);
        setShowModal(false);
        setNewCourtName('');
        setNewCourtStatus('Available');
      }
    } catch (err) {
      alert(err.message || 'Error al intentar crear la cancha.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (courtId, currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return; // No change needed
    
    setActionLoadingId(courtId);
    try {
      const res = await courtService.updateStatus(courtId, targetStatus);
      if (res.success && res.data) {
        setCourts(prev => prev.map(court => 
          court.id === courtId ? { ...court, status: res.data.status } : court
        ));
      }
    } catch (err) {
      alert(err.message || 'Error al actualizar el estado de la cancha.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to render the status badge with appropriate styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="status-badge available">
            <span className="status-dot"></span>
            <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
            Disponible
          </span>
        );
      case 'Occupied':
        return (
          <span className="status-badge occupied">
            <span className="status-dot"></span>
            <Activity size={12} style={{ marginRight: '4px' }} />
            En Juego
          </span>
        );
      case 'Maintenance':
        return (
          <span className="status-badge maintenance">
            <span className="status-dot"></span>
            <Wrench size={12} style={{ marginRight: '4px' }} />
            Mantenimiento
          </span>
        );
      case 'Out_of_service':
        return (
          <span className="status-badge out_of_service">
            <span className="status-dot"></span>
            <AlertTriangle size={12} style={{ marginRight: '4px' }} />
            Inactiva
          </span>
        );
      default:
        return (
          <span className="status-badge">
            <span className="status-dot"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="courts-container">
      
      {/* Header section */}
      <div className="courts-header">
        <div className="courts-title-group">
          <h1>Canchas Deportivas</h1>
          <p>Supervisa, habilita o cambia el estado operacional de los complejos deportivos.</p>
        </div>
        
        {isAdmin && (
          <button 
            className="btn-add-court" 
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Añadir Cancha</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="courts-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchCourts} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>Reintentar</button>
        </div>
      )}

      {/* Main Grid View */}
      {loading ? (
        <div className="courts-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo canchas en tiempo real de Neon.tech...</p>
        </div>
      ) : courts.length === 0 ? (
        <div className="courts-empty-state">
          <h3>No hay canchas registradas</h3>
          <p>No se encontraron canchas en el sistema. {isAdmin ? 'Crea la primera para comenzar.' : ''}</p>
          {isAdmin && (
            <button className="btn-add-court" onClick={() => setShowModal(true)} style={{ marginTop: '10px' }}>
              <Plus size={16} />
              <span>Crear Cancha</span>
            </button>
          )}
        </div>
      ) : (
        <div className="courts-grid">
          {courts.map((court) => (
            <div key={court.id} className={`court-card status-${court.status}`}>
              
              <div className="court-card-header">
                <h3 className="court-name">{court.court_name}</h3>
                {renderStatusBadge(court.status)}
              </div>

              {/* Admin Actions Panel */}
              {isAdmin && (
                <div className="court-actions">
                  <span className="actions-label">Definir Estado</span>
                  <div className="actions-buttons">
                    <button 
                      className={`btn-status-change ${court.status === 'Available' ? 'active' : ''}`}
                      disabled={actionLoadingId === court.id}
                      onClick={() => handleUpdateStatus(court.id, court.status, 'Available')}
                    >
                      Disponible
                    </button>
                    <button 
                      className={`btn-status-change ${court.status === 'Maintenance' ? 'active' : ''}`}
                      disabled={actionLoadingId === court.id}
                      onClick={() => handleUpdateStatus(court.id, court.status, 'Maintenance')}
                    >
                      Mantenimiento
                    </button>
                    <button 
                      className={`btn-status-change ${court.status === 'Out_of_service' ? 'active' : ''}`}
                      disabled={actionLoadingId === court.id}
                      onClick={() => handleUpdateStatus(court.id, court.status, 'Out_of_service')}
                    >
                      Inactiva
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add Court */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Registrar Nueva Cancha</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCourt} className="modal-form">
              <div className="form-group">
                <label htmlFor="court-name">Nombre de la Cancha</label>
                <input 
                  type="text" 
                  id="court-name" 
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  placeholder="Ej: Cancha de Fútbol Rápido 1"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="court-status">Estado Inicial</label>
                <select 
                  id="court-status" 
                  value={newCourtStatus}
                  onChange={(e) => setNewCourtStatus(e.target.value)}
                  disabled={createLoading}
                >
                  <option value="Available">Disponible</option>
                  <option value="Maintenance">En Mantenimiento</option>
                  <option value="Out_of_service">Fuera de Servicio (Inactiva)</option>
                </select>
              </div>

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
                  disabled={createLoading || !newCourtName.trim()}
                >
                  {createLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Crear Cancha</span>
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
