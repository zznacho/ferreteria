import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulamos login (luego conectaremos con el backend real)
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ username, role: 'admin' }));
        window.location.href = '/dashboard';
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#333',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          🏪 Ferretería
        </h2>
        
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#555',
              fontWeight: 'bold'
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="admin"
              required
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#555',
              fontWeight: 'bold'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: '#999',
          fontSize: '14px'
        }}>
          Usuario: admin / Contraseña: admin123
        </p>
      </div>
    </div>
  );
}

export default Login;