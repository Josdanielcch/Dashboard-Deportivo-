import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  UserCog,
  AlertCircle,
  Loader2,
  Pencil,
  Shield,
  ShieldOff,
  Key,
  User,
  CheckCircle2
} from 'lucide-react';
import { userService } from '../services/userService';
import './UsersPage.css';

export default function UsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createRoleId, setCreateRoleId] = useState('1');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRoleId, setEditRoleId] = useState('1');
  const [editStatus, setEditStatus] = useState('Activated');
  const [editLoading, setEditLoading] = useState(false);

  // Status change loading
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const isAdmin = user && user.role_id === 1;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getAll();
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  // --- Create User ---
  const openCreateModal = () => {
    setCreateUsername('');
    setCreatePassword('');
    setCreateFirstName('');
    setCreateLastName('');
    setCreateRoleId('1');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => setShowCreateModal(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUsername.trim() || !createPassword || !createFirstName.trim() || !createLastName.trim()) return;

    setCreateLoading(true);
    try {
      const res = await userService.create({
        username: createUsername.trim(),
        password: createPassword,
        first_name: createFirstName.trim(),
        last_name: createLastName.trim(),
        role_id: Number(createRoleId)
      });
      if (res.success && res.data) {
        setUsers(prev => [...prev, res.data]);
        closeCreateModal();
      }
    } catch (err) {
      alert(err.message || 'Error al crear el usuario.');
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Edit User ---
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditFirstName(u.first_name || '');
    setEditLastName(u.last_name || '');
    setEditRoleId(String(u.role_id) || '1');
    setEditStatus(u.status || 'Activated');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await userService.update(editingUser.id, {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        role_id: Number(editRoleId),
        status: editStatus
      });
      if (res.success && res.data) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...res.data } : u));
        closeEditModal();
      }
    } catch (err) {
      alert(err.message || 'Error al actualizar el usuario.');
    } finally {
      setEditLoading(false);
    }
  };

  // --- Toggle Status ---
  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'Activated' ? 'Disabled' : 'Activated';
    setStatusLoadingId(targetUser.id);
    try {
      const res = await userService.updateStatus(targetUser.id, newStatus);
      if (res.success && res.data) {
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: res.data.status } : u));
      }
    } catch (err) {
      alert(err.message || 'Error al cambiar el estado.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const getRoleLabel = (roleId) => {
    switch (roleId) {
      case 1: return 'Administrador';
      default: return `Rol #${roleId}`;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Non-admin gate
  if (!isAdmin) {
    return (
      <div className="users-container">
        <div className="users-access-denied">
          <ShieldOff size={48} style={{ color: '#ef4444', marginBottom: '8px' }} />
          <h3>Acceso Restringido</h3>
          <p>Solo los administradores pueden gestionar los usuarios del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">

      {/* Header */}
      <div className="users-header">
        <div className="users-title-group">
          <h1>Usuarios del Sistema</h1>
          <p>Gestiona las cuentas de usuario, roles y permisos de acceso al dashboard.</p>
        </div>
        <button className="btn-add-user" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="users-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchUsers} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="users-loading-state">
          <Loader2 size={36} className="spinner" />
          <p>Obteniendo usuarios de Neon.tech...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="users-empty-state">
          <UserCog size={48} style={{ color: '#64748b', marginBottom: '4px' }} />
          <h3>No hay usuarios registrados</h3>
          <p>Crea el primer usuario del sistema.</p>
          <button className="btn-add-user" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Crear Usuario</span>
          </button>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.status === 'Disabled' ? 'row-disabled' : ''}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        <User size={14} />
                      </div>
                      <span style={{ fontWeight: '600' }}>{u.username}</span>
                    </div>
                  </td>
                  <td>{u.first_name || '—'}</td>
                  <td>{u.last_name || '—'}</td>
                  <td>
                    <span className="role-badge">
                      <Shield size={12} />
                      {getRoleLabel(u.role_id)}
                    </span>
                  </td>
                  <td>
                    <span className={`user-status-badge ${u.status === 'Activated' ? 'active' : 'disabled'}`}>
                      <span className="status-dot"></span>
                      {u.status === 'Activated' ? 'Activo' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="btn-user-action edit"
                        onClick={() => openEditModal(u)}
                        title="Editar usuario"
                      >
                        <Pencil size={12} />
                        Editar
                      </button>
                      {u.id !== user.id && (
                        <button
                          className={`btn-user-action ${u.status === 'Activated' ? 'disable' : 'enable'}`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={statusLoadingId === u.id}
                          title={u.status === 'Activated' ? 'Deshabilitar' : 'Activar'}
                        >
                          {statusLoadingId === u.id ? (
                            <Loader2 size={12} className="spinner" />
                          ) : u.status === 'Activated' ? (
                            <><ShieldOff size={12} /> Deshabilitar</>
                          ) : (
                            <><CheckCircle2 size={12} /> Activar</>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button className="btn-close-modal" onClick={closeCreateModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">

              <div className="form-group">
                <label htmlFor="user-username">
                  <User size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="user-username"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="Ej: jperez"
                  minLength={3}
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-password">
                  <Key size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Contraseña
                </label>
                <input
                  type="password"
                  id="user-password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="user-firstname">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="user-firstname"
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    placeholder="Ej: Juan"
                    minLength={2}
                    required
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <label htmlFor="user-lastname">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="user-lastname"
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    placeholder="Ej: Pérez López"
                    minLength={2}
                    required
                    disabled={createLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="user-role">
                  <Shield size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Rol
                </label>
                <select
                  id="user-role"
                  value={createRoleId}
                  onChange={(e) => setCreateRoleId(e.target.value)}
                  disabled={createLoading}
                >
                  <option value="1">Administrador</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeCreateModal} disabled={createLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={createLoading || !createUsername.trim() || !createPassword || !createFirstName.trim() || !createLastName.trim()}>
                  {createLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Crear Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button className="btn-close-modal" onClick={closeEditModal}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-user-info">
              <span className="edit-user-label">Usuario:</span>
              <span className="edit-user-value">{editingUser.username}</span>
            </div>

            <form onSubmit={handleEditUser} className="modal-form">

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="edit-firstname">Nombre</label>
                  <input
                    type="text"
                    id="edit-firstname"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    disabled={editLoading}
                  />
                </div>
                <div>
                  <label htmlFor="edit-lastname">Apellido</label>
                  <input
                    type="text"
                    id="edit-lastname"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-role">Rol</label>
                <select
                  id="edit-role"
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  disabled={editLoading}
                >
                  <option value="1">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Estado</label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={editLoading || editingUser.id === user.id}
                >
                  <option value="Activated">Activo</option>
                  <option value="Disabled">Deshabilitado</option>
                </select>
                {editingUser.id === user.id && (
                  <p className="form-hint">No puedes deshabilitarte a ti mismo.</p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeEditModal} disabled={editLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={editLoading}>
                  {editLoading ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Pencil size={15} />
                      <span>Guardar Cambios</span>
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
