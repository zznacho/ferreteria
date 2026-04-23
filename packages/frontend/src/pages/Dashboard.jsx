import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';
const colors = {
  primary: '#263B6A', secondary: '#6984A9', accent: '#A0D585',
  light: '#EEFABD', white: '#FFFFFF', gray: '#F8FAFC'
};

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, sales: 0, totalSales: 0, lowStock: 0, recentSales: [] });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [prodRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/sales`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      let products = [];
      let sales = [];
      
      if (prodRes.ok) products = await prodRes.json();
      else products = JSON.parse(localStorage.getItem('products') || '[]');
      
      if (salesRes.ok) sales = await salesRes.json();
      else sales = JSON.parse(localStorage.getItem('sales') || '[]');
      
      const totalSales = sales.reduce((sum, s) => sum + (s.total_amount || s.total || 0), 0);
      const lowStock = products.filter(p => p.stock < 10).length;
      const recentSales = sales.slice(-5).reverse();
      
      setStats({ products: products.length, sales: sales.length, totalSales, lowStock, recentSales });
    } catch (error) {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      setStats({
        products: products.length,
        sales: sales.length,
        totalSales: sales.reduce((sum, s) => sum + (s.total || 0), 0),
        lowStock: products.filter(p => p.stock < 10).length,
        recentSales: sales.slice(-5).reverse()
      });
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ background: colors.white, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.light}` }}>
      <p style={{ margin: '0 0 8px', color: colors.secondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: colors.primary }}>
          {title === 'INGRESOS TOTALES' ? `$${value.toLocaleString('es-ES', {minimumFractionDigits: 2})}` : value}
        </h3>
        <div style={{ width: '48px', height: '48px', background: colors.light, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="TOTAL PRODUCTOS" value={stats.products} icon="📦" />
        <StatCard title="VENTAS TOTALES" value={stats.sales} icon="💰" />
        <StatCard title="INGRESOS TOTALES" value={stats.totalSales} icon="💵" />
        <StatCard title="STOCK BAJO" value={stats.lowStock} icon="⚠️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: colors.white, borderRadius: '16px', padding: '24px', border: `1px solid ${colors.light}` }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: colors.primary, textTransform: 'uppercase' }}>Últimas Ventas</h3>
          {stats.recentSales.length === 0 ? (
            <p style={{ color: colors.secondary, textAlign: 'center', padding: '40px' }}>No hay ventas registradas</p>
          ) : (
            stats.recentSales.map((sale, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: colors.gray, borderRadius: '12px', marginBottom: '8px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: colors.primary }}>Venta #{String(sale.id).slice(-8)}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.secondary }}>
                    {new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {sale.total_items || sale.items?.length || 0} productos
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: '700', color: '#10B981', fontSize: '18px' }}>${(sale.total_amount || sale.total || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
              </div>
            ))
          )}
        </div>

        <div style={{ background: colors.white, borderRadius: '16px', padding: '24px', border: `1px solid ${colors.light}` }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: colors.primary, textTransform: 'uppercase' }}>Acciones Rápidas</h3>
          <button onClick={() => window.location.href = '/products'} style={{ width: '100%', padding: '16px', marginBottom: '12px', background: colors.light, color: colors.primary, border: `1px solid ${colors.accent}`, borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = colors.accent}
            onMouseLeave={(e) => e.target.style.background = colors.light}>📦 Gestionar Productos →</button>
          <button onClick={() => window.location.href = '/sales/new'} style={{ width: '100%', padding: '16px', background: colors.light, color: colors.primary, border: `1px solid ${colors.accent}`, borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = colors.accent}
            onMouseLeave={(e) => e.target.style.background = colors.light}>💰 Nueva Venta →</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;