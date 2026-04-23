import React, { useState } from 'react';

const colors = {
  primary: '#263B6A',
  secondary: '#6984A9',
  accent: '#A0D585',
  light: '#EEFABD',
  white: '#FFFFFF'
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } else {
      setError(data.error || 'Usuario o contraseña incorrectos');
    }
  } catch (err) {
    setError('Error de conexión con el servidor');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: colors.white,
        padding: '48px 40px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(38,59,106,0.15)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 20px',
            background: colors.light,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: colors.primary
          }}>
            🏪
          </div>
          <h2 style={{ 
            margin: '0 0 4px', 
            fontSize: '28px', 
            fontWeight: '700',
            color: colors.primary
          }}>
            Ferretería Pro
          </h2>
          <p style={{ 
            margin: 0, 
            color: colors.secondary,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Sistema de Gestión
          </p>
        </div>
        
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: colors.primary,
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${colors.light}`,
                borderRadius: '12px',
                fontSize: '16px',
                background: colors.white,
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="admin"
              required
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.light}
            />
          </div>
          
          <div style={{ marginBottom: '28px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: colors.primary,
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `2px solid ${colors.light}`,
                borderRadius: '12px',
                fontSize: '16px',
                background: colors.white,
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="••••••••"
              required
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.light}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = colors.secondary;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = colors.primary;
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: colors.light,
          borderRadius: '12px'
        }}>
          <p style={{ 
            margin: 0, 
            textAlign: 'center', 
            color: colors.primary,
            fontSize: '13px'
          }}>
            <strong>Demo:</strong> admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;