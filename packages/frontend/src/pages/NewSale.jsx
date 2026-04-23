import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts.filter(p => p.stock > 0));
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
        price: product.price,
        quantity: newQty,
        image: product.image,
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
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });

    const sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: calculateTotal()
    };

    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    sales.push(sale);
    
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedAllProducts = allProducts.map(product => {
      const updated = updatedProducts.find(p => p.id === product.id);
      return updated || product;
    });
    
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('products', JSON.stringify(updatedAllProducts));

    alert(`✅ Venta completada! Total: $${sale.total.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    navigate('/sales');
  };

  const ProductImage = ({ product }) => {
    if (product?.image) {
      return (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '45px',
            height: '45px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '45px',
        height: '45px',
        background: colors.light,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.primary,
        fontSize: '18px'
      }}>
        📦
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: colors.primary }}>🛒 Nueva Venta</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Productos Disponibles */}
        <div>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${colors.light}`
          }}>
            <h2 style={{ 
              marginBottom: '20px', 
              color: colors.primary,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              📦 Productos Disponibles
            </h2>
            
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, categoría o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${colors.light}`,
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '15px',
                outline: 'none',
                background: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.light}
            />

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {/* THEAD con mismo estilo que las otras pestañas */}
                <thead>
                  <tr style={{ 
                    background: colors.primary, 
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}></th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>Especificaciones</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Precio</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                        {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const quantity = getCartQuantity(product.id);
                      return (
                        <tr key={product.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                          <td style={{ padding: '10px 8px' }}>
                            <ProductImage product={product} />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <strong style={{ color: colors.primary }}>{product.name}</strong>
                            <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '2px' }}>
                              {product.category && <span style={{ marginRight: '8px' }}>📁 {product.category}</span>}
                              {product.brand && <span>🏷️ {product.brand}</span>}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.secondary, marginTop: '2px' }}>
                              Stock: <span style={{ 
                                color: product.stock < 5 ? '#EF4444' : '#10B981',
                                fontWeight: '600'
                              }}>{product.stock}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '11px', color: colors.secondary }}>
                            {product.voltage && <div>⚡ {product.voltage}</div>}
                            {product.amperage && <div>🔌 {product.amperage}</div>}
                            {product.wattage && <div>💡 {product.wattage}</div>}
                            {product.weight && <div>⚖️ {product.weight}</div>}
                            {product.measure && <div>📏 {product.measure}</div>}
                            {!product.voltage && !product.amperage && !product.wattage && !product.weight && !product.measure && (
                              <span style={{ opacity: 0.5 }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: colors.primary }}>
                            ${product.price.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '8px',
                              background: colors.gray,
                              padding: '4px 8px',
                              borderRadius: '20px'
                            }}>
                              <button
                                onClick={() => handleUpdateQuantity(product, -1)}
                                disabled={quantity === 0}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  border: 'none',
                                  background: quantity === 0 ? '#E5E7EB' : colors.accent,
                                  color: quantity === 0 ? '#9CA3AF' : colors.primary,
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  cursor: quantity === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                −
                              </button>
                              <span style={{ 
                                minWidth: '24px', 
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: quantity > 0 ? colors.primary : colors.secondary
                              }}>
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(product, 1)}
                                disabled={quantity >= product.stock}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  border: 'none',
                                  background: quantity >= product.stock ? '#E5E7EB' : colors.accent,
                                  color: quantity >= product.stock ? '#9CA3AF' : colors.primary,
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                +
                              </button>
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

        {/* Carrito */}
        <div>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${colors.light}`,
            position: 'sticky',
            top: '20px'
          }}>
            <h2 style={{ 
              marginBottom: '20px', 
              color: colors.primary,
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🛒</span>
              Carrito
              {cart.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: colors.accent,
                  color: colors.primary,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              )}
            </h2>
            
            {cart.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: colors.secondary
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}>🛒</div>
                <p>El carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '20px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: `1px solid ${colors.light}`
                    }}>
                      <ProductImage product={item} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: colors.primary, fontSize: '14px' }}>{item.name}</strong>
                        <div style={{ fontSize: '11px', color: colors.secondary, marginTop: '2px' }}>
                          {item.voltage && <span style={{ marginRight: '6px' }}>⚡{item.voltage}</span>}
                          {item.amperage && <span style={{ marginRight: '6px' }}>🔌{item.amperage}</span>}
                          {item.wattage && <span>💡{item.wattage}</span>}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: colors.secondary, fontSize: '13px' }}>
                            ${item.price.toFixed(2)} x {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: colors.primary,
                        fontSize: '15px'
                      }}>
                        ${(item.price * item.quantity).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  borderTop: `2px solid ${colors.light}`,
                  paddingTop: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    <span style={{ color: colors.primary }}>Total:</span>
                    <span style={{ color: '#10B981' }}>
                      ${calculateTotal().toLocaleString('es-ES', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteSale}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = colors.secondary}
                  onMouseLeave={(e) => e.target.style.background = colors.primary}
                >
                  💰 Completar Venta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewSale;