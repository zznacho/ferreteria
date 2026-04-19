import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/products', label: '📦 Productos', icon: '📦' },
    { path: '/sales', label: '💰 Historial Ventas', icon: '💰' },
    { path: '/sales/new', label: '🛒 Nueva Venta', icon: '🛒' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>🏪 Ferretería</h2>
          <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '14px' }}>
            {user.username} ({user.role})
          </p>
        </div>

        <nav style={{ padding: '20px 0' }}>
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.3s',
                borderLeft: location.pathname === item.path ? '4px solid white' : '4px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.2)',
          position: 'absolute',
          bottom: 0,
          width: '210px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        marginLeft: '250px',
        background: '#f5f5f5',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '15px 30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '8px 16px',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              ← Volver
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🏠 Inicio
            </button>
          </div>
          <div style={{ color: '#666' }}>
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;