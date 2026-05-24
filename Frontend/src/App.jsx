import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <>
      {token && user ? (
        // Premium Dashboard Mock (Visible after successful login)
        <div className="dashboard-container animate-fade-in" style={styles.dashboardContainer}>
          
          {/* Header NavBar */}
          <header style={styles.header}>
            <div style={styles.logoGroup}>
              <div style={styles.logoBadge}>
                <Sparkles style={styles.logoSpark} />
                <span>OS</span>
              </div>
              <h2 style={styles.logoTitle}>SportSpaces</h2>
            </div>
            
            <div style={styles.userProfile}>
              <div style={styles.userInfo}>
                <span style={styles.fullName}>{user.full_name || 'Usuario'}</span>
                <span style={styles.roleLabel}>{user.role_id === 1 ? 'Administrador' : 'Gestor/Personal'}</span>
              </div>
              <div style={styles.avatar}>
                <UserIcon size={18} />
              </div>
              <button 
                onClick={handleLogout} 
                title="Cerrar Sesión" 
                style={styles.logoutBtn}
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          </header>

          {/* Main Grid Content */}
          <main style={styles.mainContent}>
            
            {/* Greeting */}
            <div style={styles.greetingRow}>
              <h1 style={styles.greetingTitle}>¡Hola de nuevo, {user.full_name || user.username}! 👋</h1>
              <p style={styles.greetingSub}>Bienvenido al panel central de SportSpaces OS. Todo listo para la jornada de hoy.</p>
            </div>

            {/* Metrics Cards */}
            <div style={styles.gridMetrics}>
              <div style={styles.cardGlass}>
                <div style={styles.metricHeader}>
                  <MapPin style={styles.metricIcon} />
                  <span style={styles.metricTitle}>Complejos Deportivos</span>
                </div>
                <div style={styles.metricVal}>4</div>
                <div style={styles.metricSub}>Canchas de Fútbol, Pádel y Tenis</div>
              </div>

              <div style={styles.cardGlass}>
                <div style={styles.metricHeader}>
                  <Calendar style={{...styles.metricIcon, color: '#3b82f6'}} />
                  <span style={styles.metricTitle}>Reservas para Hoy</span>
                </div>
                <div style={styles.metricVal}>18</div>
                <div style={styles.metricSub}>95% de ocupación en las canchas</div>
              </div>

              <div style={styles.cardGlass}>
                <div style={styles.metricHeader}>
                  <DollarSign style={{...styles.metricIcon, color: '#eab308'}} />
                  <span style={styles.metricTitle}>Ingresos de la Semana</span>
                </div>
                <div style={styles.metricVal}>$1,240</div>
                <div style={{...styles.metricSub, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <TrendingUp size={14} />
                  <span>+12.4% que la semana anterior</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Status */}
            <div style={styles.statusPanel}>
              <h3>Panel Informativo del Sistema</h3>
              <div style={styles.panelContent}>
                <div style={styles.statusBadge}>
                  <span style={styles.dotActive}></span>
                  <span>Servidor API Conectado: <strong>http://localhost:3000</strong></span>
                </div>
                <div style={styles.statusBadge}>
                  <span style={styles.dotActive}></span>
                  <span>Base de Datos Neon: <strong>postgresql://...neon.tech</strong></span>
                </div>
              </div>
            </div>

          </main>
        </div>
      ) : (
        // Authentication Page
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

// Inline styles for the beautiful premium dashboard layout
const styles = {
  dashboardContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    background: '#0b0f19',
    color: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    background: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '4px 10px',
    borderRadius: '99px',
    fontWeight: '700',
    fontSize: '11px',
    color: '#10b981',
    letterSpacing: '1px',
  },
  logoSpark: {
    width: '12px',
    height: '12px',
    marginRight: '4px',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.3px',
    color: '#f8fafc',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: '13px',
  },
  fullName: {
    fontWeight: '600',
    color: '#f8fafc',
  },
  roleLabel: {
    color: '#94a3b8',
    fontSize: '11px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  greetingRow: {
    textAlign: 'left',
  },
  greetingTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  greetingSub: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0,
  },
  gridMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  cardGlass: {
    background: 'rgba(17, 24, 39, 0.55)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  metricIcon: {
    color: '#10b981',
    width: '20px',
    height: '20px',
  },
  metricTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
  },
  metricVal: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '8px',
  },
  metricSub: {
    fontSize: '12px',
    color: '#64748b',
  },
  statusPanel: {
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px 24px',
    textAlign: 'left',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  panelContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  dotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
  }
};
