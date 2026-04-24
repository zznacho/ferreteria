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
  const [editingSale, setEditingSale] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/sales`, { headers: getHeaders() }),
        fetch(`${API_URL}/products`, { headers: getHeaders() })
      ]);
      
      if (salesRes.ok) {
        const data = await salesRes.json();
        setSales(data.map(s => ({
          ...s,
          total_amount: Number(s.total_amount || 0),
          total_items: Number(s.total_items || 0)
        })).sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.map(p => ({ ...p, price: Number(p.price), stock: Number(p.stock) })));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = async (sale) => {
    setShowEditModal(false);
    setEditingSale(null);
    
    if (selectedSale?.id === sale.id) {
      setSelectedSale(null);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/sales/${sale.id}`, { headers: getHeaders() });
      if (response.ok) {
        const detail = await response.json();
        setSelectedSale(detail);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  const handleEditSale = async (sale) => {
    setSelectedSale(null);
    
    try {
      const response = await fetch(`${API_URL}/sales/${sale.id}`, { headers: getHeaders() });
      if (response.ok) {
        const detail = await response.json();
        setEditingSale({
          ...detail,
          items: (detail.items || []).map(item => ({
            ...item,
            price: Number(item.price_at_time || item.price || 0),
            name: item.product_name || item.name || 'Producto',
            image_url: item.image_path ? `http://localhost:3001${item.image_path}` : null
          }))
        });
      } else {
        setEditingSale({ ...sale, items: [] });
      }
    } catch (error) {
      setEditingSale({ ...sale, items: [] });
    }
    
    setEditSearchTerm('');
    setShowEditModal(true);
  };

  const handleUpdateSaleItem = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setEditingSale({ ...editingSale, items: editingSale.items.filter(i => i.id !== itemId) });
    } else {
      setEditingSale({ ...editingSale, items: editingSale.items.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i) });
    }
  };

  const handleAddItemToEdit = (productId) => {
    if (!productId) return;
    const product = products.find(p => p.id.toString() === productId);
    if (!product) return;
    if (editingSale.items.find(i => i.id === product.id)) { alert('Ya está en la venta'); return; }
    if (product.stock < 1) { alert('Stock insuficiente'); return; }
    
    setEditingSale({
      ...editingSale,
      items: [...editingSale.items, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url || product.image,
        voltage: product.voltage,
        amperage: product.amperage,
        wattage: product.wattage,
        weight: product.weight,
        measure: product.measure
      }]
    });
  };

  const handleSaveEdit = async () => {
    if (editingSale.items.length === 0) { alert('Debe tener al menos un producto'); return; }
    
    try {
      const response = await fetch(`${API_URL}/sales/${editingSale.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          items: editingSale.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });
      
      if (response.ok) {
        await loadData();
        setShowEditModal(false);
        setEditingSale(null);
        alert('✅ Venta actualizada correctamente');
      } else {
        const err = await response.json();
        alert('Error: ' + (err.error || 'No se pudo actualizar'));
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('¿Eliminar venta? Se restaurará el stock.')) return;
    
    try {
      const response = await fetch(`${API_URL}/sales/${saleId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (response.ok) {
        await loadData();
        setSelectedSale(null);
        alert('✅ Venta eliminada y stock restaurado');
      } else {
        alert('Error al eliminar la venta');
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };

  const filteredSales = () => {
    let filtered = [...sales];
    if (searchTerm) filtered = filtered.filter(s => String(s.id).includes(searchTerm));
    switch (sortBy) {
      case 'date-desc': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'date-asc': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'total-desc': filtered.sort((a, b) => b.total_amount - a.total_amount); break;
      case 'total-asc': filtered.sort((a, b) => a.total_amount - b.total_amount); break;
    }
    return filtered;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

  const filtered = filteredSales();
  const totalRevenue = filtered.reduce((s, i) => s + i.total_amount, 0);
  const totalItems = filtered.reduce((s, i) => s + i.total_items, 0);

  const filteredEditProducts = products.filter(p =>
    !editingSale?.items?.find(i => i.id === p.id) &&
    p.stock > 0 &&
    p.name.toLowerCase().includes(editSearchTerm.toLowerCase())
  );

  const ProductImage = ({ product }) => {
    const src = product?.image_url 
      || product?.image 
      || (product?.image_path ? `http://localhost:3001${product.image_path}` : null);
    if (src) return <img src={src} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />;
    return <div style={{ width: '40px', height: '40px', background: colors.light, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: colors.primary }}>📦</div>;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: colors.secondary, fontSize: '18px' }}>⏳ Cargando ventas...</div>;

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <h1 style={{ color: colors.primary, marginBottom: '20px' }}>📈 Historial de Ventas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        {[{ t: 'Total Ventas', v: filtered.length, c: colors.primary },
          { t: 'Ingresos Totales', v: `$${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, c: '#10B981' },
          { t: 'Productos Vendidos', v: totalItems, c: colors.primary },
          { t: 'Ticket Promedio', v: `$${(filtered.length > 0 ? totalRevenue / filtered.length : 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, c: colors.accent }
        ].map((s, i) => (
          <div key={i} style={{ background: colors.white, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.light}` }}>
            <p style={{ margin: 0, color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' }}>{s.t}</p>
            <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: '700', color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${colors.light}` }}>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <input placeholder="🔍 Buscar por ID de venta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.secondary }}>✕</button>}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ width: '100%', maxWidth: '280px', padding: '10px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
          <option value="date-desc">📅 Fecha (Más reciente)</option>
          <option value="date-asc">📅 Fecha (Más antigua)</option>
          <option value="total-desc">💰 Total (Mayor a Menor)</option>
          <option value="total-asc">💰 Total (Menor a Mayor)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSale ? '1fr 420px' : '1fr', gap: '20px', alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', border: `1px solid ${colors.light}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead><tr style={{ background: colors.primary, color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Items</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>No hay ventas</td></tr> :
                filtered.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                    <td style={{ padding: '12px', color: colors.secondary, fontSize: '12px' }}>#{String(sale.id).slice(-8)}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: colors.primary }}>{formatDate(sale.date)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ background: colors.light, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: colors.primary, fontWeight: '600' }}>{sale.total_items} items</span></td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>${sale.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleViewSale(sale)} style={{ marginRight: '4px', padding: '5px 10px', background: colors.secondary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{selectedSale?.id === sale.id ? 'Ocultar' : '👁️'}</button>
                      <button onClick={() => handleEditSale(sale)} style={{ marginRight: '4px', padding: '5px 10px', background: colors.accent, color: colors.primary, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>✏️</button>
                      <button onClick={() => handleDeleteSale(sale.id)} style={{ padding: '5px 10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {selectedSale && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: `1px solid ${colors.light}`, position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: colors.primary, margin: 0, fontSize: '16px' }}>📦 Productos de la Venta</h3>
              <button onClick={() => setSelectedSale(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.secondary }}>✕</button>
            </div>
            {(selectedSale.items || []).length > 0 ? (
              <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                {(selectedSale.items || []).map((item, i) => (
                  <div key={i} style={{ padding: '14px', background: i % 2 === 0 ? colors.white : colors.gray, borderRadius: '8px', marginBottom: '8px', border: `1px solid ${colors.light}` }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ProductImage product={item} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: colors.primary, fontSize: '14px' }}>{item.product_name || item.name || 'Producto'}</strong>
                        <div style={{ marginTop: '4px', fontSize: '11px', color: colors.secondary }}>
                          💲 <strong style={{ color: colors.primary }}>${Number(item.price_at_time || item.price || 0).toFixed(2)}</strong> c/u | 📦 x{item.quantity}
                        </div>
                        {(item.voltage || item.amperage || item.wattage || item.weight || item.measure) && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: colors.secondary }}>
                            {item.voltage && <span style={{ marginRight: '6px' }}>⚡{item.voltage}</span>}
                            {item.amperage && <span style={{ marginRight: '6px' }}>🔌{item.amperage}</span>}
                            {item.wattage && <span style={{ marginRight: '6px' }}>💡{item.wattage}</span>}
                            {item.weight && <span style={{ marginRight: '6px' }}>⚖️{item.weight}</span>}
                            {item.measure && <span>📏{item.measure}</span>}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: '15px', whiteSpace: 'nowrap' }}>
                        ${(Number(item.price_at_time || item.price || 0) * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ textAlign: 'center', color: colors.secondary, padding: '30px' }}>Sin detalles disponibles</p>}
            <div style={{ borderTop: `2px solid ${colors.light}`, paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span style={{ color: colors.primary }}>Total:</span>
              <span style={{ color: '#10B981' }}>
                ${(Number(selectedSale.total_amount) || (selectedSale.items || []).reduce((s, i) => s + Number(i.price_at_time || i.price || 0) * i.quantity, 0)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {showEditModal && editingSale && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '750px', maxHeight: '85vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '20px', color: colors.primary }}>✏️ Editar Venta #{String(editingSale.id).slice(-8)}</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.primary, fontWeight: '600' }}>🔍 Buscar y agregar producto</label>
              <input type="text" placeholder="Buscar producto por nombre..." value={editSearchTerm} onChange={e => setEditSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: `1px solid ${colors.light}`, borderRadius: '8px' }}>
                {filteredEditProducts.length === 0 ? (
                  <p style={{ padding: '15px', textAlign: 'center', color: colors.secondary, fontSize: '13px' }}>
                    {editSearchTerm ? 'No se encontraron productos' : 'No hay más productos disponibles'}
                  </p>
                ) : (
                  filteredEditProducts.map(product => (
                    <div key={product.id} onClick={() => { handleAddItemToEdit(product.id); setEditSearchTerm(''); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${colors.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.light} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <span style={{ fontSize: '13px', color: colors.primary }}>{product.name}</span>
                      <span style={{ fontSize: '12px', color: colors.secondary }}>${Number(product.price).toFixed(2)} (Stock: {product.stock})</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: colors.primary }}>📦 Productos en la venta ({editingSale.items.length})</h3>
              {editingSale.items.length === 0 ? (
                <p style={{ textAlign: 'center', color: colors.secondary, padding: '20px' }}>No hay productos</p>
              ) : (
                editingSale.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.gray, borderRadius: '8px', marginBottom: '8px' }}>
                    <ProductImage product={item} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13px' }}>{item.name}</strong>
                      <div style={{ fontSize: '10px', color: colors.secondary }}>
                        {item.voltage && <span style={{ marginRight: '5px' }}>⚡{item.voltage}</span>}
                        {item.amperage && <span style={{ marginRight: '5px' }}>🔌{item.amperage}</span>}
                        {item.wattage && <span style={{ marginRight: '5px' }}>💡{item.wattage}</span>}
                      </div>
                      <small style={{ color: colors.secondary }}>${Number(item.price).toFixed(2)} c/u</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => handleUpdateSaleItem(item.id, item.quantity - 1)}
                        style={{ width: '28px', height: '28px', background: colors.accent, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: colors.primary }}>−</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateSaleItem(item.id, item.quantity + 1)}
                        style={{ width: '28px', height: '28px', background: colors.accent, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: colors.primary }}>+</button>
                    </div>
                    <div style={{ fontWeight: 'bold', color: colors.primary, minWidth: '70px', textAlign: 'right', fontSize: '14px' }}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: `2px solid ${colors.light}`, paddingTop: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#10B981' }}>${editingSale.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEditModal(false); setEditingSale(null); }}
                style={{ padding: '10px 20px', background: colors.secondary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveEdit}
                style={{ padding: '10px 20px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;