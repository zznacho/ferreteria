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
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Productos', icon: '📦' },
    { path: '/sales', label: 'Historial Ventas', icon: '📈' },
    { path: '/sales/new', label: 'Nueva Venta', icon: '💰' },
  ];

  // Paleta de colores
  const colors = {
    primary: '#263B6A',
    secondary: '#6984A9',
    accent: '#A0D585',
    light: '#EEFABD',
    white: '#FFFFFF',
    gray: '#F3F4F6'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.gray }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: colors.primary,
        color: colors.white,
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '28px 24px', 
          borderBottom: `1px solid ${colors.secondary}40`
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '700',
            color: colors.light,
            letterSpacing: '0.5px'
          }}>
            Ferretería Pro
          </h1>
          <p style={{ 
            margin: '4px 0 0', 
            fontSize: '11px', 
            color: colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            opacity: 0.9
          }}>
            SISTEMA DE GESTIÓN
          </p>
        </div>

        {/* Usuario */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.secondary}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: colors.accent,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p style={{ 
                margin: 0, 
                fontSize: '15px', 
                fontWeight: '600',
                color: colors.white
              }}>
                {user.username}
              </p>
              <p style={{ 
                margin: '2px 0 0', 
                fontSize: '11px', 
                color: colors.accent,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {user.role || 'ADMIN'}
              </p>
            </div>
          </div>
        </div>

        {/* Menú */}
        <nav style={{ padding: '20px 16px' }}>
          <p style={{ 
            padding: '0 8px', 
            margin: '0 0 16px', 
            fontSize: '11px', 
            color: colors.secondary,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: '600'
          }}>
            MENÚ PRINCIPAL
          </p>
          
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: '6px',
                background: location.pathname === item.path 
                  ? colors.accent 
                  : 'transparent',
                border: 'none',
                color: location.pathname === item.path ? colors.primary : `${colors.white}cc`,
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: location.pathname === item.path ? '600' : '400',
                cursor: 'pointer',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = `${colors.secondary}40`;
                  e.target.style.color = colors.white;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = `${colors.white}cc`;
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ 
                color: location.pathname === item.path ? colors.primary : colors.secondary,
                fontWeight: '300',
                fontSize: '12px'
              }}>
                {index + 1}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ 
          padding: '20px 24px',
          borderTop: `1px solid ${colors.secondary}40`,
          position: 'absolute',
          bottom: 0,
          width: '280px',
          background: colors.primary
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: `1px solid ${colors.secondary}60`,
              color: colors.light,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.secondary;
              e.target.style.borderColor = colors.secondary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = `${colors.secondary}60`;
            }}
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ 
        flex: 1, 
        marginLeft: '280px',
        minHeight: '100vh',
        background: colors.gray
      }}>
        {/* Header */}
        <header style={{
          background: colors.white,
          padding: '20px 32px',
          borderBottom: `1px solid ${colors.light}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '26px', 
              fontWeight: '600',
              color: colors.primary
            }}>
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/products' && 'Gestión de Productos'}
              {location.pathname === '/sales' && 'Historial de Ventas'}
              {location.pathname === '/sales/new' && 'Nueva Venta'}
            </h1>
            <p style={{ 
              margin: '4px 0 0', 
              color: colors.secondary,
              fontSize: '14px'
            }}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div style={{
            padding: '8px 16px',
            background: colors.light,
            borderRadius: '20px',
            color: colors.primary,
            fontSize: '13px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              background: colors.accent,
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            Sistema en línea
          </div>
        </header>

        {/* Contenido */}
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;