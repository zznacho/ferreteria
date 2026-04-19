import React, { useState, useEffect, useRef } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: null // Base64 de la imagen
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy]);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por nombre
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-desc':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
  alert('La imagen no debe superar los 5MB');
  return;
}

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: reader.result});
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({...formData, image: null});
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      id: editingProduct?.id || Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image || null,
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
    setProducts(updatedProducts);
    setShowForm(false);
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({ name: '', price: '', stock: '', image: null });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image || null
    });
    setImagePreview(product.image || null);
    setShowForm(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Componente de imagen por defecto
  const DefaultProductImage = () => (
    <div style={{
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    }}>
      📦
    </div>
  );

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
            setFormData({ name: '', price: '', stock: '', image: null });
            setImagePreview(null);
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

      {/* Barra de búsqueda y ordenamiento */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto', 
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ color: '#666', fontWeight: 'bold' }}>Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="name">📝 Nombre (A-Z)</option>
              <option value="price-asc">💰 Precio (Menor a Mayor)</option>
              <option value="price-desc">💰 Precio (Mayor a Menor)</option>
              <option value="stock-asc">📦 Stock (Menor a Mayor)</option>
              <option value="stock-desc">📦 Stock (Mayor a Menor)</option>
            </select>
          </div>
        </div>

        {searchTerm && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: '#f0f0f0',
            borderRadius: '5px',
            color: '#666'
          }}>
            <strong>{filteredProducts.length}</strong> producto(s) encontrado(s) para "{searchTerm}"
          </div>
        )}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px' }}>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                    Nombre *
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
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
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
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
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
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                  Imagen (opcional)
                </label>
                
                <div style={{
                  width: '100%',
                  height: '200px',
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#fafafa'
                }}>
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#f5576c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                      <p style={{ color: '#999', marginBottom: '10px' }}>
                        Sin imagen
                      </p>
                    </>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    marginTop: '10px',
                    width: '100%'
                  }}
                />
                <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
                  Formatos: JPG, PNG, GIF, WebP. Máx 5MB
                </small>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
                  setImagePreview(null);
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
              <th style={{ padding: '15px', textAlign: 'left', width: '80px' }}>Imagen</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Precio</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Stock</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  {searchTerm ? 'No se encontraron productos con ese nombre' : 'No hay productos. ¡Crea uno nuevo!'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <DefaultProductImage />
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <strong>{product.name}</strong>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <span style={{
                      color: product.stock === 0 ? '#f5576c' : product.stock < 10 ? '#ff9800' : '#4caf50',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: product.stock === 0 ? '#fee' : product.stock < 10 ? '#fff3e0' : '#e8f5e9'
                    }}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        background: '#4facfe',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#f5576c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas rápidas */}
      {filteredProducts.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'white',
          borderRadius: '10px',
          display: 'flex',
          gap: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <span style={{ color: '#666' }}>Total productos: </span>
            <strong>{filteredProducts.length}</strong>
          </div>
          <div>
            <span style={{ color: '#666' }}>Valor total del inventario: </span>
            <strong style={{ color: '#667eea' }}>
              ${filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
            </strong>
          </div>
          <div>
            <span style={{ color: '#666' }}>Productos con imagen: </span>
            <strong style={{ color: '#4caf50' }}>
              {filteredProducts.filter(p => p.image).length}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;