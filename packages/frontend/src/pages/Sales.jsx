import React, { useState, useEffect } from 'react';

function Sales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    setSales(savedSales.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>💰 Historial de Ventas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSale ? '1fr 400px' : '1fr', gap: '20px' }}>
        {/* Lista de ventas */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>{formatDate(sale.date)}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        {sale.items.length} productos
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#4caf50' }}>
                        ${sale.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
                          style={{
                            padding: '5px 15px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          {selectedSale?.id === sale.id ? 'Ocultar' : 'Ver Detalle'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalle de venta */}
        {selectedSale && (
          <div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#555' }}>Detalle de Venta</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <p style={{ color: '#666', marginBottom: '20px' }}>
                <strong>Fecha:</strong> {formatDate(selectedSale.date)}
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                {selectedSale.items.map((item, index) => (
                  <div key={index} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <strong>{item.name}</strong>
                      <br />
                      <small style={{ color: '#666' }}>
                        ${item.price.toFixed(2)} x {item.quantity}
                      </small>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                borderTop: '2px solid #ddd',
                paddingTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span style={{ color: '#4caf50' }}>
                  ${selectedSale.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;