import { useState, useEffect } from 'react';
import {
  ShieldOff,
  AlertCircle,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { auditService } from '../services/auditService';
import './AuditPage.css';

export default function AuditPage({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterTable, setFilterTable] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const isAdmin = user && user.role_id === 1;

  const tableNames = [
    { value: '', label: 'Todas las tablas' },
    { value: 'users', label: 'Usuarios' },
    { value: 'courts', label: 'Canchas' },
    { value: 'customers', label: 'Clientes' },
    { value: 'bookings', label: 'Reservas' },
    { value: 'products', label: 'Productos' },
    { value: 'billings', label: 'Facturas' },
    { value: 'pending_charges', label: 'Cargos Pendientes' },
    { value: 'sale_details', label: 'Detalle de Ventas' }
  ];

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, []);

  async function fetchLogs(tableFilter = '') {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (tableFilter) filters.table_name = tableFilter;
      const res = await auditService.getLogs(filters);
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los logs de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilterTable(value);
    fetchLogs(value);
  };

  const handleRefresh = () => {
    fetchLogs(filterTable);
  };

  const toggleExpand = (logId) => {
    setExpandedLogId(prev => prev === logId ? null : logId);
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'INSERT': return 'action-insert';
      case 'UPDATE': return 'action-update';
      case 'DELETE': return 'action-delete';
      default: return '';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'INSERT': return 'Creación';
      case 'UPDATE': return 'Actualización';
      case 'DELETE': return 'Eliminación';
      default: return action;
    }
  };

  const getTableLabel = (tableName) => {
    const found = tableNames.find(t => t.value === tableName);
    return found ? found.label : tableName;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatJSON = (jsonStr) => {
    if (!jsonStr) return null;
    try {
      const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  };

  // Non-admin gate
  if (!isAdmin) {
    return (
      <div className="audit-container">
        <div className="audit-access-denied">
          <ShieldOff size={48} style={{ color: '#ef4444', marginBottom: '8px' }} />
          <h3>Acceso Restringido</h3>
          <p>Solo los administradores pueden visualizar los logs de auditoría del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-container">

      {/* Header */}
      <div className="audit-header">
        <div className="audit-title-group">
          <h1>Auditoría del Sistema</h1>
          <p>Registro de todas las acciones realizadas en la base de datos del sistema.</p>
        </div>
        <button className="btn-refresh-audit" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <Filter size={16} style={{ color: '#10b981' }} />
          <label htmlFor="audit-table-filter">Filtrar por Tabla:</label>
          <select
            id="audit-table-filter"
            value={filterTable}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            {tableNames.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {filterTable && (
          <button className="btn-clear-filter" onClick={() => handleFilterChange('')}>
            Limpiar Filtro
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="audit-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={handleRefresh} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <div className="audit-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo logs de auditoría de Neon.tech...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="audit-empty-state">
          <FileText size={48} style={{ color: '#64748b', marginBottom: '4px' }} />
          <h3>No hay registros de auditoría</h3>
          <p>{filterTable ? 'No se encontraron logs para la tabla seleccionada.' : 'El sistema aún no ha generado logs de auditoría.'}</p>
        </div>
      ) : (
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Acción</th>
                <th>Tabla</th>
                <th>Registro ID</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      className={`audit-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleExpand(log.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td>
                        <span className={`audit-action-badge ${getActionBadgeClass(log.action_type)}`}>
                          {getActionLabel(log.action_type)}
                        </span>
                      </td>
                      <td>
                        <span className="audit-table-name">{getTableLabel(log.table_name)}</span>
                      </td>
                      <td style={{ color: '#94a3b8', fontWeight: '600' }}>#{log.record_id}</td>
                      <td>{log.username || '—'}</td>
                      <td style={{ color: '#94a3b8', fontSize: '13px' }}>{formatDate(log.created_at)}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-detail`} className="audit-detail-row">
                        <td colSpan={6}>
                          <div className="audit-detail-content">
                            {log.old_value && (
                              <div className="audit-json-block">
                                <span className="json-label old">Valor Anterior</span>
                                <pre className="json-pre">{formatJSON(log.old_value)}</pre>
                              </div>
                            )}
                            {log.new_value && (
                              <div className="audit-json-block">
                                <span className="json-label new">Valor Nuevo</span>
                                <pre className="json-pre">{formatJSON(log.new_value)}</pre>
                              </div>
                            )}
                            {!log.old_value && !log.new_value && (
                              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                                No hay datos de cambio disponibles para este registro.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
