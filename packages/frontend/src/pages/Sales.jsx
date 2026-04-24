import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const colors = {
  primary: '#263B6A', secondary: '#6984A9', accent: '#A0D585',
  light: '#EEFABD', white: '#FFFFFF', gray: '#F8FAFC'
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
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
      const formatted = savedSales.map(s => ({
        ...s,
        total_amount: Number(s.total_amount || s.total || 0),
        total_items: Number(s.total_items || s.items?.length || 0),
        items: s.items || []
      }));
      setSales(formatted);
    }
  };

  const handleViewSale = async (sale) => {
    if (selectedSale?.id === sale.id) {
      setSelectedSale(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales/${sale.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const detail = await response.json();
        setSelectedSale(detail);
        return;
      }
    } catch (error) {
      console.log('Cargando desde localStorage');
    }
    
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    const localSale = savedSales.find(s => s.id === sale.id);
    setSelectedSale(localSale || sale);
  };

  const filteredSales = () => {
    let filtered = [...sales].map(s => ({
      ...s,
      total_amount: Number(s.total_amount || s.total || 0),
      total_items: Number(s.total_items || s.items?.length || 0),
      items: s.items || []
    }));
    
    if (searchTerm) {
      filtered = filtered.filter(sale => String(sale.id).includes(searchTerm));
    }
    
    switch (sortBy) {
      case 'date-desc': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'date-asc': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'total-desc': filtered.sort((a, b) => b.total_amount - a.total_amount); break;
      case 'total-asc': filtered.sort((a, b) => a.total_amount - b.total_amount); break;
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
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    localStorage.setItem('sales', JSON.stringify(savedSales.filter(s => s.id !== saleId)));
    setSales(sales.filter(s => s.id !== saleId));
    setSelectedSale(null);
    alert('✅ Venta eliminada');
  };

  const filtered = filteredSales();
  const totalRevenue = filtered.reduce((sum, s) => sum + s.total_amount, 0);
  const totalItems = filtered.reduce((sum, s) => sum + s.total_items, 0);
  const averageTicket = filtered.length > 0 ? totalRevenue / filtered.length : 0;

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
          <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: colors.accent }}>${averageTicket.toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${colors.light}` }}>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Buscar por ID de venta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.secondary }}>✕</button>
          )}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ width: '100%', maxWidth: '280px', padding: '10px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
          <option value="date-desc">📅 Fecha (Más reciente)</option>
          <option value="date-asc">📅 Fecha (Más antigua)</option>
          <option value="total-desc">💰 Total (Mayor a Menor)</option>
          <option value="total-asc">💰 Total (Menor a Mayor)</option>
        </select>
        {searchTerm && (
          <div style={{ marginTop: '15px', color: colors.secondary, fontSize: '13px' }}>
            <strong>{filtered.length}</strong> venta(s) encontrada(s)
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSale ? '1fr 400px' : '1fr', gap: '20px', alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', border: `1px solid ${colors.light}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: colors.primary, color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Items</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Acciones</th>
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
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: colors.light, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: colors.primary, fontWeight: '600' }}>{sale.total_items} items</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>${sale.total_amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td>
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleViewSale(sale)}
                        style={{ marginRight: '8px', padding: '6px 12px', background: colors.secondary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        {selectedSale?.id === sale.id ? 'Ocultar' : '👁️ Ver'}
                      </button>
                      <button onClick={() => handleDeleteSale(sale.id)}
                        style={{ padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Panel de detalle */}
        {selectedSale && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: `1px solid ${colors.light}`, position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: colors.primary, margin: 0, fontSize: '16px' }}>📦 Productos de la Venta</h3>
              <button onClick={() => setSelectedSale(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.secondary }}>✕</button>
            </div>
            
            {selectedSale.items && selectedSale.items.length > 0 ? (
              <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                {selectedSale.items.map((item, index) => (
                  <div key={index} style={{ 
                    padding: '14px', 
                    background: index % 2 === 0 ? colors.white : colors.gray,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: `1px solid ${colors.light}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: colors.primary, fontSize: '14px' }}>
                          {item.name || item.product_name || 'Producto'}
                        </strong>
                        
                        <div style={{ marginTop: '6px', display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11px', color: colors.secondary }}>
                          <span>💲 <strong style={{ color: colors.primary }}>${Number(item.price || item.price_at_time || 0).toFixed(2)}</strong> c/u</span>
                          <span>📦 <strong style={{ color: colors.primary }}>x{item.quantity}</strong></span>
                        </div>
                        
                        {(item.voltage || item.amperage || item.wattage || item.weight || item.measure) && (
                          <div style={{ marginTop: '6px', fontSize: '11px', color: colors.secondary }}>
                            {item.voltage && <span style={{ marginRight: '8px' }}>⚡ {item.voltage}</span>}
                            {item.amperage && <span style={{ marginRight: '8px' }}>🔌 {item.amperage}</span>}
                            {item.wattage && <span style={{ marginRight: '8px' }}>💡 {item.wattage}</span>}
                            {item.weight && <span style={{ marginRight: '8px' }}>⚖️ {item.weight}</span>}
                            {item.measure && <span>📏 {item.measure}</span>}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: colors.primary, 
                        fontSize: '15px',
                        textAlign: 'right',
                        marginLeft: '10px',
                        whiteSpace: 'nowrap'
                      }}>
                        ${(Number(item.price || item.price_at_time || 0) * item.quantity).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: colors.secondary }}>
                <p>No hay detalles disponibles para esta venta.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Los datos pueden estar solo en localStorage.</p>
              </div>
            )}
            
            <div style={{ borderTop: `2px solid ${colors.light}`, paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span style={{ color: colors.primary }}>Total:</span>
              <span style={{ color: '#10B981' }}>
                ${selectedSale.items && selectedSale.items.length > 0
                  ? selectedSale.items.reduce((sum, item) => sum + (Number(item.price || item.price_at_time || 0) * item.quantity), 0).toLocaleString('es-ES', {minimumFractionDigits: 2})
                  : (Number(selectedSale.total_amount) || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;