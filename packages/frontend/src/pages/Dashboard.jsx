import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    totalSales: 0
  });

  useEffect(() => {
    // Cargar estadísticas del localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    setStats({
      products: products.length,
      sales: sales.length,
      totalSales: totalSales
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Dashboard</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '25px',
          borderRadius: '10px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '10px', opacity: 0.9 }}>📦 Productos</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {stats.products}
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '25px',
          borderRadius: '10px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '10px', opacity: 0.9 }}>💰 Ventas Totales</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {stats.sales}
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '25px',
          borderRadius: '10px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '10px', opacity: 0.9 }}>💵 Ingresos</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            ${stats.totalSales.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div style={{
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>🚀 Acciones Rápidas</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/products'}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📦 Gestionar Productos
          </button>
          <button 
            onClick={() => window.location.href = '/sales/new'}
            style={{
              padding: '12px 24px',
              background: '#f5576c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            💰 Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;