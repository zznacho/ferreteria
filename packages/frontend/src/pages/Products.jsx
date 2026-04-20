import React, { useState, useEffect, useRef } from 'react';

// Paleta de colores
const colors = {
  primary: '#263B6A',
  secondary: '#6984A9',
  accent: '#A0D585',
  light: '#EEFABD',
  white: '#FFFFFF',
  gray: '#F8FAFC'
};

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Estados para opciones de selects
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [voltages, setVoltages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    weight: '',
    measure: '',
    voltage: '',
    description: '',
    image: null
  });

  useEffect(() => {
    loadProducts();
    loadSelectOptions();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy]);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  };

  const loadSelectOptions = () => {
    // Cargar opciones guardadas de localStorage
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    const savedBrands = JSON.parse(localStorage.getItem('brands') || '[]');
    const savedMeasures = JSON.parse(localStorage.getItem('measures') || '[]');
    const savedVoltages = JSON.parse(localStorage.getItem('voltages') || '[]');
    
    setCategories(savedCategories);
    setBrands(savedBrands);
    setMeasures(savedMeasures);
    setVoltages(savedVoltages);
  };

  const saveSelectOption = (type, value) => {
    if (!value || value.trim() === '') return;
    
    let savedOptions = [];
    let setter;
    
    switch(type) {
      case 'category':
        savedOptions = JSON.parse(localStorage.getItem('categories') || '[]');
        if (!savedOptions.includes(value)) {
          savedOptions.push(value);
          localStorage.setItem('categories', JSON.stringify(savedOptions));
          setCategories(savedOptions);
        }
        break;
      case 'brand':
        savedOptions = JSON.parse(localStorage.getItem('brands') || '[]');
        if (!savedOptions.includes(value)) {
          savedOptions.push(value);
          localStorage.setItem('brands', JSON.stringify(savedOptions));
          setBrands(savedOptions);
        }
        break;
      case 'measure':
        savedOptions = JSON.parse(localStorage.getItem('measures') || '[]');
        if (!savedOptions.includes(value)) {
          savedOptions.push(value);
          localStorage.setItem('measures', JSON.stringify(savedOptions));
          setMeasures(savedOptions);
        }
        break;
      case 'voltage':
        savedOptions = JSON.parse(localStorage.getItem('voltages') || '[]');
        if (!savedOptions.includes(value)) {
          savedOptions.push(value);
          localStorage.setItem('voltages', JSON.stringify(savedOptions));
          setVoltages(savedOptions);
        }
        break;
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por nombre, categoría o marca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
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
    
    // Guardar opciones de selects si son nuevas
    if (formData.category) saveSelectOption('category', formData.category);
    if (formData.brand) saveSelectOption('brand', formData.brand);
    if (formData.measure) saveSelectOption('measure', formData.measure);
    if (formData.voltage) saveSelectOption('voltage', formData.voltage);
    
    const productData = {
      id: editingProduct?.id || Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category || null,
      brand: formData.brand || null,
      weight: formData.weight || null,
      measure: formData.measure || null,
      voltage: formData.voltage || null,
      description: formData.description || null,
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
    setFormData({ 
      name: '', 
      price: '', 
      stock: '', 
      category: '', 
      brand: '', 
      weight: '', 
      measure: '', 
      voltage: '', 
      description: '', 
      image: null 
    });
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
      category: product.category || '',
      brand: product.brand || '',
      weight: product.weight || '',
      measure: product.measure || '',
      voltage: product.voltage || '',
      description: product.description || '',
      image: product.image || null
    });
    setImagePreview(product.image || null);
    setShowForm(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const DefaultProductImage = () => (
    <div style={{
      width: '60px',
      height: '60px',
      background: colors.light,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.primary,
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
        <h1 style={{ color: colors.primary }}>📦 Gestión de Productos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ 
              name: '', 
              price: '', 
              stock: '', 
              category: '', 
              brand: '', 
              weight: '', 
              measure: '', 
              voltage: '', 
              description: '', 
              image: null 
            });
            setImagePreview(null);
            setShowForm(true);
          }}
          style={{
            padding: '12px 24px',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Barra de búsqueda y ordenamiento */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: `1px solid ${colors.light}`
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
              placeholder="🔍 Buscar por nombre, categoría o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: `2px solid ${colors.light}`,
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.light}
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
                  color: colors.secondary
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ color: colors.primary, fontWeight: '600' }}>Ordenar:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px',
                border: `2px solid ${colors.light}`,
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'white',
                outline: 'none'
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
            background: colors.light,
            borderRadius: '8px',
            color: colors.primary
          }}>
            <strong>{filteredProducts.length}</strong> producto(s) encontrado(s)
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: `1px solid ${colors.light}`
        }}>
          <h2 style={{ marginBottom: '20px', color: colors.primary }}>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '20px' }}>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Categoría
                  </label>
                  <input
                    type="text"
                    list="categories-list"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                  <datalist id="categories-list">
                    {categories.map((cat, i) => (
                      <option key={i} value={cat} />
                    ))}
                  </datalist>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Marca
                  </label>
                  <input
                    type="text"
                    list="brands-list"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                  <datalist id="brands-list">
                    {brands.map((brand, i) => (
                      <option key={i} value={brand} />
                    ))}
                  </datalist>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                </div>
              </div>

              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
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
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
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
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Peso
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Ej: 2.5 kg"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Medida
                  </label>
                  <input
                    type="text"
                    list="measures-list"
                    value={formData.measure}
                    onChange={(e) => setFormData({...formData, measure: e.target.value})}
                    placeholder="Ej: 10x20 cm"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                  <datalist id="measures-list">
                    {measures.map((measure, i) => (
                      <option key={i} value={measure} />
                    ))}
                  </datalist>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                    Voltaje
                  </label>
                  <input
                    type="text"
                    list="voltages-list"
                    value={formData.voltage}
                    onChange={(e) => setFormData({...formData, voltage: e.target.value})}
                    placeholder="Ej: 220V"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${colors.light}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.light}
                  />
                  <datalist id="voltages-list">
                    {voltages.map((voltage, i) => (
                      <option key={i} value={voltage} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>
                  Imagen
                </label>
                
                <div style={{
                  width: '100%',
                  height: '200px',
                  border: `2px dashed ${colors.light}`,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  background: colors.gray
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
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                      <p style={{ color: colors.secondary }}>Sin imagen</p>
                    </>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: '10px', width: '100%' }}
                />
                <small style={{ color: colors.secondary, display: 'block', marginTop: '5px' }}>
                  Máx 5MB (Opcional)
                </small>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
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
                  background: colors.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
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
        borderRadius: '12px',
        overflow: 'auto',
        border: `1px solid ${colors.light}`
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: colors.primary, color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}></th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Producto</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Categoría</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Marca</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Precio</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Stock</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos. ¡Crea uno nuevo!'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                  <td style={{ padding: '10px' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <DefaultProductImage />
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong>{product.name}</strong>
                    {product.description && (
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: colors.secondary }}>
                        {product.description.substring(0, 50)}...
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: colors.secondary }}>{product.category || '-'}</td>
                  <td style={{ padding: '12px', color: colors.secondary }}>{product.brand || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: colors.primary }}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span style={{
                      color: product.stock === 0 ? '#EF4444' : product.stock < 10 ? '#F59E0B' : '#10B981',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: product.stock === 0 ? '#FEE2E2' : product.stock < 10 ? '#FEF3C7' : '#D1FAE5'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(product)} style={{ marginRight: '8px', padding: '6px 12px', background: colors.accent, color: colors.primary, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{ padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
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
  );
}

export default Products;