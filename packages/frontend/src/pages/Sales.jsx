import React, { useState, useEffect } from 'react';

const colors = {
  primary: '#263B6A',
  secondary: '#6984A9',
  accent: '#A0D585',
  light: '#EEFABD',
  white: '#FFFFFF',
  gray: '#F8FAFC'
};

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setSales(savedSales.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setProducts(savedProducts);
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

  const handleDeleteSale = (saleId) => {
    if (window.confirm('¿Estás seguro de eliminar esta venta? Se restaurará el stock de los productos.')) {
      const saleToDelete = sales.find(s => s.id === saleId);
      
      // Restaurar stock
      const updatedProducts = products.map(product => {
        const saleItem = saleToDelete.items.find(item => item.id === product.id);
        if (saleItem) {
          return { ...product, stock: product.stock + saleItem.quantity };
        }
        return product;
      });
      
      // Eliminar venta
      const updatedSales = sales.filter(s => s.id !== saleId);
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      localStorage.setItem('sales', JSON.stringify(updatedSales));
      
      setProducts(updatedProducts);
      setSales(updatedSales);
      
      if (selectedSale?.id === saleId) {
        setSelectedSale(null);
      }
      
      alert('✅ Venta eliminada y stock restaurado');
    }
  };

  const handleEditSale = (sale) => {
    setEditingSale({ 
      ...sale, 
      items: sale.items.map(item => ({ ...item })) 
    });
    setShowEditModal(true);
  };

  const handleUpdateSaleItem = (itemId, newQuantity) => {
    const product = products.find(p => p.id === itemId);
    const originalItem = editingSale.items.find(i => i.id === itemId);
    
    if (!product || !originalItem) return;
    
    const quantityDiff = newQuantity - originalItem.quantity;
    
    if (quantityDiff > 0 && product.stock < quantityDiff) {
      alert('Stock insuficiente');
      return;
    }
    
    if (newQuantity <= 0) {
      setEditingSale({
        ...editingSale,
        items: editingSale.items.filter(i => i.id !== itemId)
      });
    } else {
      setEditingSale({
        ...editingSale,
        items: editingSale.items.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        )
      });
    }
  };

  const handleAddItemToEdit = (productId) => {
    const product = products.find(p => p.id.toString() === productId);
    if (!product) return;
    
    const existingItem = editingSale.items.find(i => i.id === product.id);
    if (existingItem) {
      alert('El producto ya está en la venta');
      return;
    }
    
    if (product.stock < 1) {
      alert('Stock insuficiente');
      return;
    }
    
    setEditingSale({
      ...editingSale,
      items: [...editingSale.items, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }]
    });
  };

  const handleSaveEdit = () => {
    if (editingSale.items.length === 0) {
      alert('La venta debe tener al menos un producto');
      return;
    }
    
    const originalSale = sales.find(s => s.id === editingSale.id);
    
    // Actualizar stock
    const updatedProducts = products.map(product => {
      const originalItem = originalSale.items.find(i => i.id === product.id);
      const newItem = editingSale.items.find(i => i.id === product.id);
      
      if (originalItem && !newItem) {
        return { ...product, stock: product.stock + originalItem.quantity };
      } else if (!originalItem && newItem) {
        return { ...product, stock: product.stock - newItem.quantity };
      } else if (originalItem && newItem) {
        const diff = originalItem.quantity - newItem.quantity;
        return { ...product, stock: product.stock + diff };
      }
      return product;
    });
    
    // Actualizar venta
    const updatedSale = {
      ...editingSale,
      total: editingSale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      updated_at: new Date().toISOString()
    };
    
    const updatedSales = sales.map(s => s.id === editingSale.id ? updatedSale : s);
    
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    localStorage.setItem('sales', JSON.stringify(updatedSales));
    
    setProducts(updatedProducts);
    setSales(updatedSales);
    setShowEditModal(false);
    setEditingSale(null);
    
    if (selectedSale?.id === editingSale.id) {
      setSelectedSale(updatedSale);
    }
    
    alert('✅ Venta actualizada correctamente');
  };

  const ProductImage = ({ product }) => {
    if (product?.image) {
      return (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '6px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '50px',
        height: '50px',
        background: colors.light,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.primary,
        fontSize: '20px'
      }}>
        📦
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: colors.primary }}>📈 Historial de Ventas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSale ? '1fr 400px' : '1fr', gap: '20px' }}>
        {/* Lista de ventas */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${colors.light}`
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.primary, color: 'white' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (
                  sales.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                      <td style={{ padding: '15px' }}>{formatDate(sale.date)}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        {sale.items.length} productos
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>
                        ${sale.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            background: colors.secondary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {selectedSale?.id === sale.id ? 'Ocultar' : 'Ver'}
                        </button>
                        <button
                          onClick={() => handleEditSale(sale)}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            background: colors.accent,
                            color: colors.primary,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
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
              borderRadius: '12px',
              border: `1px solid ${colors.light}`,
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: colors.primary }}>Detalle de Venta</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: colors.secondary
                  }}
                >
                  ✕
                </button>
              </div>
              
              <p style={{ color: colors.secondary, marginBottom: '20px' }}>
                <strong>Fecha:</strong> {formatDate(selectedSale.date)}
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                {selectedSale.items.map((item, index) => (
                  <div key={index} style={{
                    padding: '12px 0',
                    borderBottom: `1px solid ${colors.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ProductImage product={item} />
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                      <br />
                      <small style={{ color: colors.secondary }}>
                        ${item.price.toFixed(2)} x {item.quantity}
                      </small>
                    </div>
                    <div style={{ fontWeight: 'bold', color: colors.primary }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                borderTop: `2px solid ${colors.light}`,
                paddingTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span style={{ color: '#10B981' }}>
                  ${selectedSale.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && editingSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px', color: colors.primary }}>✏️ Editar Venta</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: colors.primary, fontWeight: '600' }}>
                Agregar Producto
              </label>
              <select
                onChange={(e) => handleAddItemToEdit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `2px solid ${colors.light}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Seleccionar producto...</option>
                {products.filter(p => 
                  !editingSale.items.find(i => i.id === p.id) && p.stock > 0
                ).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', color: colors.primary }}>Productos en la venta</h3>
              {editingSale.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: colors.gray,
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <ProductImage product={item} />
                  <div style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    <br />
                    <small style={{ color: colors.secondary }}>${item.price.toFixed(2)} c/u</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleUpdateSaleItem(item.id, item.quantity - 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        background: colors.light,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateSaleItem(item.id, item.quantity + 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        background: colors.light,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ fontWeight: 'bold', color: colors.primary, minWidth: '80px', textAlign: 'right' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: `2px solid ${colors.light}`,
              paddingTop: '15px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span style={{ color: '#10B981' }}>
                ${editingSale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSale(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: colors.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '10px 20px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;