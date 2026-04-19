import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NewSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = () => {
    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product || quantity > product.stock) {
      alert('Stock insuficiente');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        alert('Stock insuficiente');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert('Stock insuficiente');
      return;
    }
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
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
    
    // Actualizar también los productos que no están en la venta
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedAllProducts = allProducts.map(product => {
      const updated = updatedProducts.find(p => p.id === product.id);
      return updated || product;
    });
    
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('products', JSON.stringify(updatedAllProducts));

    alert(`✅ Venta completada! Total: $${sale.total.toFixed(2)}`);
    navigate('/sales');
  };

  // Componente de imagen por defecto
  const ProductImage = ({ product }) => {
    if (product.image) {
      return (
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '5px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '50px',
        height: '50px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px'
      }}>
        📦
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>🛒 Nueva Venta</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        {/* Productos disponibles */}
        <div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#555' }}>📦 Productos Disponibles</h2>
            
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px',
                fontSize: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              >
                <option value="">Seleccionar producto</option>
                {filteredProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price} (Stock: {product.stock})
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{
                  width: '80px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
              
              <button
                onClick={handleAddToCart}
                disabled={!selectedProduct}
                style={{
                  padding: '10px 20px',
                  background: selectedProduct ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: selectedProduct ? 'pointer' : 'not-allowed',
                  fontSize: '16px'
                }}
              >
                Agregar
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}></th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Producto</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Precio</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        <ProductImage product={product} />
                      </td>
                      <td style={{ padding: '10px' }}>{product.name}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        ${product.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          color: product.stock < 5 ? '#f5576c' : '#4caf50',
                          fontWeight: 'bold'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Carrito */}
        <div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#555' }}>🛒 Carrito</h2>
            
            {cart.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
                El carrito está vacío
              </p>
            ) : (
              <>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <ProductImage product={item} />
                      <div style={{ flex: 1 }}>
                        <strong>{item.name}</strong>
                        <br />
                        <small style={{ color: '#666' }}>${item.price.toFixed(2)} c/u</small>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '25px',
                            height: '25px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '25px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '25px',
                            height: '25px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          style={{
                            marginLeft: '5px',
                            padding: '5px 10px',
                            background: '#f5576c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  borderTop: '2px solid #ddd',
                  paddingTop: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#667eea' }}>
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteSale}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
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