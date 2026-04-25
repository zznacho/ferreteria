import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

const colors = {
  primary: '#263B6A',
  secondary: '#6984A9',
  accent: '#A0D585',
  light: '#EEFABD',
  white: '#FFFFFF',
  gray: '#F8FAFC'
};

function NewSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

const loadProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      // Convertir price y stock a números
      const formatted = data.map(p => ({
        ...p,
        price: Number(p.price),
        stock: Number(p.stock)
      }));
      setProducts(formatted.filter(p => p.stock > 0));
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts.filter(p => p.stock > 0));
  }
};

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCartQuantity = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = (product, change) => {
    const currentQty = getCartQuantity(product.id);
    const newQty = currentQty + change;
    
    if (newQty < 0) return;
    if (newQty > product.stock) {
      alert('Stock insuficiente');
      return;
    }
    
    if (newQty === 0) {
      setCart(cart.filter(item => item.id !== product.id));
    } else if (currentQty === 0) {
      setCart([...cart, {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: newQty,
      image: product.image_url || product.image,
      voltage: product.voltage,
      amperage: product.amperage,
      wattage: product.wattage
    }]);
    } else {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: newQty } : item
      ));
    }
  };

const calculateTotal = () => {
  return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
};

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const saleData = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    // Guardar en localStorage (offline-first)
    const sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: calculateTotal()
    };
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));

    // Actualizar productos en localStorage
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedAllProducts = allProducts.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });
    localStorage.setItem('products', JSON.stringify(updatedAllProducts));

    // Intentar guardar en backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });
      if (response.ok) {
        console.log('Venta guardada en el servidor');
      }
    } catch (error) {
      console.log('Venta guardada offline - se sincronizará después');
    }

    alert(`✅ Venta completada! Total: $${sale.total.toLocaleString('es-ES', {minimumFractionDigits: 2})}`);
    navigate('/sales');
  };

const ProductImage = ({ product }) => {
  if (product?.image_url || product?.image) {
    return <img src={product.image_url || product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />;
  }
  return <div style={{ width: '40px', height: '40px', background: colors.light, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, fontSize: '16px' }}>📦</div>;
};

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <h1 style={{ marginBottom: '20px', color: colors.primary, fontSize: '24px' }}>🛒 Nueva Venta</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', alignItems: 'start' }}>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.light}` }}>
            <h2 style={{ marginBottom: '15px', color: colors.primary, fontSize: '16px', fontWeight: '600' }}>📦 Productos Disponibles</h2>
            
            <input type="text" placeholder="🔍 Buscar por nombre, categoría o marca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${colors.light}`, borderRadius: '10px', marginBottom: '15px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = colors.accent} onBlur={(e) => e.target.style.borderColor = colors.light} />

            <div style={{ overflowX: 'auto',borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
                <thead>
                  <tr style={{ background: colors.primary, color: 'white' }}>
                    <th style={{ padding: '10px 6px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}></th>
                    <th style={{ padding: '10px 6px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '10px 6px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Especificaciones</th>
                    <th style={{ padding: '10px 6px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>Precio</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: colors.secondary }}>{searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}</td></tr>
                  ) : (
                    filteredProducts.map(product => {
                      const quantity = getCartQuantity(product.id);
                      return (
                        <tr key={product.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                          <td style={{ padding: '8px 6px' }}><ProductImage product={product} /></td>
                          <td style={{ padding: '8px 6px' }}>
                            <strong style={{ color: colors.primary, fontSize: '13px' }}>{product.name}</strong>
                            <div style={{ fontSize: '11px', color: colors.secondary, marginTop: '2px' }}>
                              {product.category && <span style={{ marginRight: '6px' }}>📁 {product.category}</span>}
                              {product.brand && <span>🏷️ {product.brand}</span>}
                            </div>
                            <div style={{ fontSize: '10px', color: colors.secondary, marginTop: '2px' }}>
                              Stock: <span style={{ color: product.stock < 5 ? '#EF4444' : '#10B981', fontWeight: '600' }}>{product.stock}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 6px', fontSize: '10px', color: colors.secondary }}>
                            {product.voltage && <div style={{ whiteSpace: 'nowrap' }}>⚡ {product.voltage}</div>}
                            {product.amperage && <div style={{ whiteSpace: 'nowrap' }}>🔌 {product.amperage}</div>}
                            {product.wattage && <div style={{ whiteSpace: 'nowrap' }}>💡 {product.wattage}</div>}
                            {product.weight && <div style={{ whiteSpace: 'nowrap' }}>⚖️ {product.weight}</div>}
                            {product.measure && <div style={{ whiteSpace: 'nowrap' }}>📏 {product.measure}</div>}
                            {!product.voltage && !product.amperage && !product.wattage && !product.weight && !product.measure && <span style={{ opacity: 0.5 }}>-</span>}
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', color: colors.primary, fontSize: '13px', whiteSpace: 'nowrap' }}>${product.price.toLocaleString('es-ES', {minimumFractionDigits: 2})}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: colors.gray, padding: '3px 6px', borderRadius: '16px' }}>
                              <button onClick={() => handleUpdateQuantity(product, -1)} disabled={quantity === 0}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: quantity === 0 ? '#E5E7EB' : colors.accent, color: quantity === 0 ? '#9CA3AF' : colors.primary, fontSize: '16px', fontWeight: 'bold', cursor: quantity === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: quantity > 0 ? colors.primary : colors.secondary }}>{quantity}</span>
                              <button onClick={() => handleUpdateQuantity(product, 1)} disabled={quantity >= product.stock}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: quantity >= product.stock ? '#E5E7EB' : colors.accent, color: quantity >= product.stock ? '#9CA3AF' : colors.primary, fontSize: '16px', fontWeight: 'bold', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ width: '340px', flexShrink: 0 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: `1px solid ${colors.light}`, position: 'sticky', top: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: colors.primary, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛒</span> Carrito
              {cart.length > 0 && <span style={{ marginLeft: 'auto', background: colors.accent, color: colors.primary, padding: '3px 8px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>}
            </h2>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 15px', color: colors.secondary }}>
                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>🛒</div>
                <p style={{ fontSize: '14px' }}>El carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '15px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.light}` }}>
                      <ProductImage product={item} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ color: colors.primary, fontSize: '13px' }}>{item.name}</strong>
                        <div style={{ fontSize: '10px', color: colors.secondary, marginTop: '2px' }}>
                          {item.voltage && <span style={{ marginRight: '5px' }}>⚡{item.voltage}</span>}
                          {item.amperage && <span style={{ marginRight: '5px' }}>🔌{item.amperage}</span>}
                          {item.wattage && <span>💡{item.wattage}</span>}
                        </div>
                        <span style={{ color: colors.secondary, fontSize: '12px' }}>${Number(item.price).toFixed(2)} x {item.quantity}</span>
                      </div>
                      <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: '14px', whiteSpace: 'nowrap' }}>${(Number(item.price) * item.quantity).toLocaleString('es-ES', {minimumFractionDigits: 2})}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: `2px solid ${colors.light}`, paddingTop: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                    <span style={{ color: colors.primary }}>Total:</span>
                    <span style={{ color: '#10B981' }}>${calculateTotal().toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <button onClick={handleCompleteSale}
                  style={{ width: '100%', padding: '14px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.background = colors.secondary}
                  onMouseLeave={(e) => e.target.style.background = colors.primary}>💰 Completar Venta</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewSale;