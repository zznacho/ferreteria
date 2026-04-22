import React, { useEffect, useState } from 'react';

// Paleta de colores
const colors = {
  primary: '#263B6A',
  secondary: '#6984A9',
  accent: '#A0D585',
  light: '#EEFABD',
  white: '#FFFFFF',
  gray: '#F8FAFC'
};

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    totalSales: 0,
    lowStock: 0,
    recentSales: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    const recentSales = sales.slice(-5).reverse();
    
    setStats({
      products: products.length,
      sales: sales.length,
      totalSales: totalSales,
      lowStock: lowStock,
      recentSales: recentSales
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  
  const StatCard = ({ title, value, icon, trend }) => (
    <div style={{
      background: colors.white,
      padding: '24px',
      borderRadius: '16px',
      border: `1px solid ${colors.light}`,
      boxShadow: '0 2px 4px rgba(38,59,106,0.05)',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ 
            margin: '0 0 8px', 
            color: colors.secondary,
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </p>
          <h3 style={{ 
            margin: '0 0 4px', 
            fontSize: '32px', 
            fontWeight: '700',
            color: colors.primary
          }}>
            {typeof value === 'number' && title.includes('INGRESOS') 
              ? `$${value.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
              : value}
          </h3>
          {trend && (
            <p style={{ 
              margin: 0, 
              fontSize: '12px',
              color: trend > 0 ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs mes anterior</span>
            </p>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: colors.light,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard title="TOTAL PRODUCTOS" value={stats.products} icon="📦" trend={5} />
        <StatCard title="VENTAS TOTALES" value={stats.sales} icon="💰" trend={12} />
        <StatCard title="INGRESOS TOTALES" value={stats.totalSales} icon="💵" trend={8} />
        <StatCard title="STOCK BAJO" value={stats.lowStock} icon="⚠️" trend={-2} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        <div style={{
          background: colors.white,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.light}`
        }}>
          <h3 style={{ 
            margin: '0 0 20px', 
            fontSize: '16px', 
            fontWeight: '600',
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Últimas Ventas
          </h3>
          
          {stats.recentSales.length === 0 ? (
            <p style={{ color: colors.secondary, textAlign: 'center', padding: '40px' }}>
              No hay ventas registradas
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentSales.map((sale) => (
                <div key={sale.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: colors.gray,
                  borderRadius: '12px',
                  border: `1px solid ${colors.light}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.light;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.gray;
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: '600', color: colors.primary }}>
                      Venta #{sale.id}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: colors.secondary }}>
                      {formatDate(sale.date)} • {sale.items.length} productos
                    </p>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '700', 
                    color: colors.primary,
                    fontSize: '18px'
                  }}>
                    ${sale.total.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: colors.white,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${colors.light}`
        }}>
          <h3 style={{ 
            margin: '0 0 20px', 
            fontSize: '16px', 
            fontWeight: '600',
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Acciones Rápidas
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => window.location.href = '/products'}
              style={{
                padding: '16px 20px',
                background: colors.light,
                color: colors.primary,
                border: `1px solid ${colors.accent}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.accent;
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.light;
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '20px' }}>📦</span>
              <span>Gestionar Productos</span>
              <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/sales/new'}
              style={{
                padding: '16px 20px',
                background: colors.light,
                color: colors.primary,
                border: `1px solid ${colors.accent}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.accent;
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.light;
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '20px' }}>💰</span>
              <span>Nueva Venta</span>
              <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;