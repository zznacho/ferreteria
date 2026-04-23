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
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        alert('Stock insuficiente');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }]);
    }
  };

  const handleUpdateQuantity = (productId, change) => {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!cartItem || !product) return;
    
    const newQuantity = cartItem.quantity + change;
    
    if (newQuantity > product.stock) {
      alert('Stock insuficiente');
      return;
    }
    
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
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
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '50px',
        height: '50px',
        background: colors.light,
        borderRadius: '8px',
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
            
            {/* Barra de búsqueda simple */}
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
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

            {/* Lista de productos */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.light}` }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: colors.secondary, fontSize: '13px', fontWeight: '600' }}></th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: colors.secondary, fontSize: '13px', fontWeight: '600' }}>Producto</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: colors.secondary, fontSize: '13px', fontWeight: '600' }}>Precio</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: colors.secondary, fontSize: '13px', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: colors.secondary, fontSize: '13px', fontWeight: '600' }}></th>
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
                      const cartItem = cart.find(item => item.id === product.id);
                      return (
                        <tr key={product.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                          <td style={{ padding: '10px 8px' }}>
                            <ProductImage product={product} />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <strong style={{ color: colors.primary }}>{product.name}</strong>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: colors.primary }}>
                            ${product.price.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <span style={{
                              color: product.stock < 5 ? '#EF4444' : '#10B981',
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>
                              {product.stock}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {cartItem ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => handleUpdateQuantity(product.id, -1)}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: `2px solid ${colors.accent}`,
                                    background: 'white',
                                    color: colors.primary,
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = colors.accent;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ 
                                  minWidth: '24px', 
                                  textAlign: 'center',
                                  fontWeight: '600',
                                  color: colors.primary
                                }}>
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(product.id, 1)}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: `2px solid ${colors.accent}`,
                                    background: 'white',
                                    color: colors.primary,
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = colors.accent;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(product)}
                                style={{
                                  padding: '6px 16px',
                                  background: colors.accent,
                                  color: colors.primary,
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = colors.primary;
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = colors.accent;
                                  e.target.style.color = colors.primary;
                                }}
                              >
                                Agregar
                              </button>
                            )}
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
                <p style={{ fontSize: '13px', marginTop: '8px' }}>
                  Agrega productos desde la lista
                </p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
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
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px'
                        }}>
                          <span style={{ color: colors.secondary, fontSize: '13px' }}>
                            ${item.price.toFixed(2)} c/u
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: `2px solid ${colors.accent}`,
                                background: 'white',
                                color: colors.primary,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = colors.accent;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                              }}
                            >
                              −
                            </button>
                            <span style={{ 
                              minWidth: '20px', 
                              textAlign: 'center',
                              fontWeight: '600',
                              color: colors.primary
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: `2px solid ${colors.accent}`,
                                background: 'white',
                                color: colors.primary,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = colors.accent;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'white';
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: colors.primary,
                        fontSize: '15px',
                        minWidth: '70px',
                        textAlign: 'right'
                      }}>
                        ${(item.price * item.quantity).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                      ${calculateTotal().toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colors.secondary;
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.primary;
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <span>💰</span>
                  Completar Venta
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