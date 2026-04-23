import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const colors = {
  primary: '#263B6A', secondary: '#6984A9', accent: '#A0D585',
  light: '#EEFABD', white: '#FFFFFF', gray: '#F8FAFC'
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    // Cargar ventas
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
      setSales(savedSales);
    }
    // Cargar productos
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      setProducts(savedProducts);
    }
  };

  const filteredSales = () => {
    let filtered = [...sales];
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.id?.toString().includes(searchTerm)
      );
    }
    switch (sortBy) {
      case 'date-desc': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'date-asc': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'total-desc': filtered.sort((a, b) => (b.total_amount || b.total || 0) - (a.total_amount || a.total || 0)); break;
      case 'total-asc': filtered.sort((a, b) => (a.total_amount || a.total || 0) - (b.total_amount || b.total || 0)); break;
      default: break;
    }
    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta? Se restaurará el stock.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/sales/${saleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.log('Eliminación offline');
    }
    // Eliminar de localStorage también
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    localStorage.setItem('sales', JSON.stringify(savedSales.filter(s => s.id !== saleId)));
    setSales(sales.filter(s => s.id !== saleId));
    setSelectedSale(null);
    alert('✅ Venta eliminada');
  };

  const filtered = filteredSales();
  const totalRevenue = filtered.reduce((sum, s) => sum + (s.total_amount || s.total || 0), 0);
  const totalItems = filtered.reduce((sum, s) => sum + (s.total_items || s.items?.length || 0), 0);

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <h1 style={{ color: colors.primary, marginBottom: '20px' }}>📈 Historial de Ventas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: colors.white, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.light}` }}>
          <p style={{ margin: 0, color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Total Ventas</p>
          <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: colors.primary }}>{filtered.length}</p>
        </div>
        <div style={{ background: colors.white, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.light}` }}>
          <p style={{ margin: 0, color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Ingresos Totales</p>
          <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: '#10B981' }}>${totalRevenue.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
        </div>
        <div style={{ background: colors.white, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.light}` }}>
          <p style={{ margin: 0, color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Productos Vendidos</p>
          <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: colors.primary }}>{totalItems}</p>
        </div>
        <div style={{ background: colors.white, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.light}` }}>
          <p style={{ margin: 0, color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Ticket Promedio</p>
          <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: colors.accent }}>${filtered.length > 0 ? (totalRevenue / filtered.length).toLocaleString('es-ES', {minimumFractionDigits: 2}) : '0.00'}</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${colors.light}` }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Buscar por ID de venta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '2', minWidth: '200px', padding: '12px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ flex: '1', minWidth: '180px', padding: '12px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
            <option value="date-desc">📅 Fecha (Más reciente)</option>
            <option value="date-asc">📅 Fecha (Más antigua)</option>
            <option value="total-desc">💰 Total (Mayor a Menor)</option>
            <option value="total-asc">💰 Total (Menor a Mayor)</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', border: `1px solid ${colors.light}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: colors.primary, color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Items</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>No hay ventas registradas</td></tr>
            ) : (
              filtered.map(sale => (
                <tr key={sale.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                  <td style={{ padding: '12px', color: colors.secondary, fontSize: '12px' }}>#{String(sale.id).slice(-8)}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: colors.primary }}>{formatDate(sale.date)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ background: colors.light, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: colors.primary, fontWeight: '600' }}>{sale.total_items || sale.items?.length || 0} items</span></td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>${(sale.total_amount || sale.total || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteSale(sale.id)}
                      style={{ padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sales;