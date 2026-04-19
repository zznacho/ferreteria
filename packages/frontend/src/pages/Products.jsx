import React, { useState, useEffect } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      id: editingProduct?.id || Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      updated_at: new Date().toISOString()
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? productData : p
      );
    } else {
      updatedProducts = [...products, productData];
    }

    localStorage.setItem('products', JSON.stringify(updatedProducts));
    loadProducts();
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      loadProducts();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    setShowForm(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ color: '#333' }}>📦 Gestión de Productos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '' });
            setShowForm(true);
          }}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Nuevo Producto
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#555' }}>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                Stock Inicial
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Precio</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Stock</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No hay productos. ¡Crea uno nuevo!
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{product.name}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <span style={{
                      color: product.stock < 10 ? '#f5576c' : '#4caf50',
                      fontWeight: 'bold'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        marginRight: '10px',
                        padding: '5px 15px',
                        background: '#4facfe',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '5px 15px',
                        background: '#f5576c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
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

export default Products;