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

// Opciones predefinidas
const CATEGORIES = [
  'Carpintería',
  'Construcción',
  'Electricidad',
  'Mueble',
  'Jardinería',
  'Fijación',
  'Herramientas'
];

const WEIGHT_UNITS = ['kg', 'g', 'mg', 'L', 'mL'];
const MEASURE_UNITS = ['metros', 'centímetros', 'milímetros', 'metros cuadrados'];
const VOLTAGE_OPTIONS = ['12V', '24V', '110V', '220V', '380V'];
const AMPERAGE_OPTIONS = ['1A', '2A', '5A', '10A', '15A', '20A', '30A'];
const WATTAGE_OPTIONS = ['5W', '10W', '15W', '25W', '40W', '60W', '100W', '200W'];

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [brands, setBrands] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    weightValue: '',
    weightUnit: 'kg',
    measureValue: '',
    measureUnit: 'metros',
    voltage: '',
    amperage: '',
    wattage: '',
    description: '',
    image: null
  });

  useEffect(() => {
    loadProducts();
    loadBrands();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  };

  const loadBrands = () => {
    const savedBrands = JSON.parse(localStorage.getItem('brands') || '[]');
    setBrands(savedBrands);
  };

  const saveBrand = (value) => {
    if (!value || value.trim() === '') return;
    const savedBrands = JSON.parse(localStorage.getItem('brands') || '[]');
    if (!savedBrands.includes(value)) {
      savedBrands.push(value);
      localStorage.setItem('brands', JSON.stringify(savedBrands));
      setBrands(savedBrands);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    switch (sortBy) {
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'stock-asc': filtered.sort((a, b) => a.stock - b.stock); break;
      case 'stock-desc': filtered.sort((a, b) => b.stock - a.stock); break;
      default: break;
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.brand) saveBrand(formData.brand);
    const weight = formData.weightValue ? `${formData.weightValue} ${formData.weightUnit}` : null;
    const measure = formData.measureValue ? `${formData.measureValue} ${formData.measureUnit}` : null;
    
    const productData = {
      id: editingProduct?.id || Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category || null,
      brand: formData.brand || null,
      weight: weight,
      measure: measure,
      voltage: formData.voltage || null,
      amperage: formData.amperage || null,
      wattage: formData.wattage || null,
      description: formData.description || null,
      image: formData.image || null,
      updated_at: new Date().toISOString()
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      updatedProducts = [...products, productData];
    }

    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setShowForm(false);
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({ 
      name: '', price: '', stock: '', category: '', brand: '', 
      weightValue: '', weightUnit: 'kg', measureValue: '', measureUnit: 'metros', 
      voltage: '', amperage: '', wattage: '', description: '', image: null 
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
    let weightValue = '', weightUnit = 'kg';
    if (product.weight) {
      const parts = product.weight.split(' ');
      weightValue = parts[0] || '';
      weightUnit = parts[1] || 'kg';
    }
    let measureValue = '', measureUnit = 'metros';
    if (product.measure) {
      const parts = product.measure.split(' ');
      measureValue = parts[0] || '';
      measureUnit = parts[1] || 'metros';
    }
    setFormData({
      name: product.name, price: product.price, stock: product.stock,
      category: product.category || '', brand: product.brand || '',
      weightValue, weightUnit, measureValue, measureUnit,
      voltage: product.voltage || '', amperage: product.amperage || '',
      wattage: product.wattage || '', description: product.description || '',
      image: product.image || null
    });
    setImagePreview(product.image || null);
    setShowForm(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const clearSearch = () => setSearchTerm('');
  const clearCategoryFilter = () => setSelectedCategory('');

  const DefaultProductImage = () => (
    <div style={{
      width: '40px', height: '40px', background: colors.light,
      borderRadius: '6px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: colors.primary, fontSize: '18px'
    }}>
      📦
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '10px', border: `2px solid ${colors.light}`,
    borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white'
  };

  const selectStyle = {
    width: '100%', padding: '10px', border: `2px solid ${colors.light}`,
    borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', cursor: 'pointer'
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: colors.primary }}>📦 Gestión de Productos</h1>
        <button onClick={() => {
          setEditingProduct(null);
          setFormData({ name: '', price: '', stock: '', category: '', brand: '', weightValue: '', weightUnit: 'kg', measureValue: '', measureUnit: 'metros', voltage: '', amperage: '', wattage: '', description: '', image: null });
          setImagePreview(null);
          setShowForm(true);
        }} style={{ padding: '12px 24px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
          + Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${colors.light}` }}>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Buscar por nombre, marca o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = colors.accent} onBlur={(e) => e.target.style.borderColor = colors.light} />
          {searchTerm && (
            <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.secondary }}>✕</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ flex: '1', minWidth: '180px', padding: '10px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', cursor: 'pointer' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ flex: '1', minWidth: '200px', padding: '10px', border: `2px solid ${colors.light}`, borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', cursor: 'pointer' }}>
            <option value="name">📝 Nombre (A-Z)</option>
            <option value="price-asc">💰 Precio (Menor a Mayor)</option>
            <option value="price-desc">💰 Precio (Mayor a Menor)</option>
            <option value="stock-asc">📦 Stock (Menor a Mayor)</option>
            <option value="stock-desc">📦 Stock (Mayor a Menor)</option>
          </select>
        </div>
        {(searchTerm || selectedCategory) && (
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: colors.secondary, fontSize: '13px' }}>Filtros activos:</span>
            {selectedCategory && (
              <span style={{ background: colors.accent, color: colors.primary, padding: '6px 12px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Categoría: {selectedCategory}
                <button onClick={clearCategoryFilter} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>✕</button>
              </span>
            )}
            <span style={{ color: colors.secondary, fontSize: '13px' }}><strong>{filteredProducts.length}</strong> producto(s)</span>
          </div>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: `1px solid ${colors.light}`, maxHeight: '80vh', overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '20px', color: colors.primary }}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '20px' }}>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Nombre *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.accent} onBlur={(e) => e.target.style.borderColor = colors.light} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Categoría</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={selectStyle}>
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Marca</label>
                  <input type="text" list="brands-list" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.accent} onBlur={(e) => e.target.style.borderColor = colors.light} />
                  <datalist id="brands-list">{brands.map((brand, i) => <option key={i} value={brand} />)}</datalist>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Peso</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Valor" value={formData.weightValue} onChange={(e) => setFormData({...formData, weightValue: e.target.value})} style={{ ...inputStyle, width: '60%' }} />
                    <select value={formData.weightUnit} onChange={(e) => setFormData({...formData, weightUnit: e.target.value})} style={{ ...selectStyle, width: '40%' }}>
                      {WEIGHT_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Voltaje</label>
                  <select value={formData.voltage} onChange={(e) => setFormData({...formData, voltage: e.target.value})} style={selectStyle}>
                    <option value="">Seleccionar voltaje</option>
                    {VOLTAGE_OPTIONS.map(volt => <option key={volt} value={volt}>{volt}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Precio *</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={inputStyle} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Stock *</label>
                  <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} style={inputStyle} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Medida</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Valor" value={formData.measureValue} onChange={(e) => setFormData({...formData, measureValue: e.target.value})} style={{ ...inputStyle, width: '60%' }} />
                    <select value={formData.measureUnit} onChange={(e) => setFormData({...formData, measureUnit: e.target.value})} style={{ ...selectStyle, width: '40%' }}>
                      {MEASURE_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Amperaje</label>
                  <select value={formData.amperage} onChange={(e) => setFormData({...formData, amperage: e.target.value})} style={selectStyle}>
                    <option value="">Seleccionar amperaje</option>
                    {AMPERAGE_OPTIONS.map(amp => <option key={amp} value={amp}>{amp}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Potencia (Watts)</label>
                  <select value={formData.wattage} onChange={(e) => setFormData({...formData, wattage: e.target.value})} style={selectStyle}>
                    <option value="">Seleccionar potencia</option>
                    {WATTAGE_OPTIONS.map(watt => <option key={watt} value={watt}>{watt}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, resize: 'vertical', minHeight: '50px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: colors.primary, fontWeight: '600' }}>Imagen</label>
                <div style={{ width: '100%', height: '200px', border: `2px dashed ${colors.light}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: colors.gray }}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={handleRemoveImage} style={{ position: 'absolute', top: '5px', right: '5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                      <p style={{ color: colors.secondary }}>Sin imagen</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: '10px', width: '100%' }} />
                <small style={{ color: colors.secondary, display: 'block', marginTop: '5px' }}>Máx 5MB (Opcional)</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" style={{ padding: '12px 24px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>{editingProduct ? 'Actualizar' : 'Crear'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); setImagePreview(null); }} style={{ padding: '12px 24px', background: colors.secondary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de productos */}
      <div style={{ background: 'white', borderRadius: '12px', overflowX: 'auto', overflowY: 'visible', border: `1px solid ${colors.light}`, maxWidth: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: colors.primary, color: 'white' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}></th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}>Producto</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}>Categoría</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}>Marca</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}>Especificaciones</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '13px', whiteSpace: 'nowrap' }}>Precio</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '13px', whiteSpace: 'nowrap' }}>Stock</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '13px', whiteSpace: 'nowrap' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                  {searchTerm || selectedCategory ? 'No se encontraron productos' : 'No hay productos. ¡Crea uno nuevo!'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: `1px solid ${colors.light}` }}>
                  <td style={{ padding: '8px' }}>
                    {product.image ? <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} /> : <DefaultProductImage />}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <strong style={{ fontSize: '14px' }}>{product.name}</strong>
                    {product.description && <p style={{ margin: '2px 0 0', fontSize: '11px', color: colors.secondary }}>{product.description.substring(0, 40)}...</p>}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {product.category && <span style={{ background: colors.light, padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: colors.primary, whiteSpace: 'nowrap' }}>{product.category}</span>}
                  </td>
                  <td style={{ padding: '8px', color: colors.secondary, fontSize: '13px' }}>{product.brand || '-'}</td>
                  <td style={{ padding: '8px', fontSize: '11px', color: colors.secondary }}>
                    {product.voltage && <div style={{ whiteSpace: 'nowrap' }}>⚡ {product.voltage}</div>}
                    {product.amperage && <div style={{ whiteSpace: 'nowrap' }}>🔌 {product.amperage}</div>}
                    {product.wattage && <div style={{ whiteSpace: 'nowrap' }}>💡 {product.wattage}</div>}
                    {product.weight && <div style={{ whiteSpace: 'nowrap' }}>⚖️ {product.weight}</div>}
                    {product.measure && <div style={{ whiteSpace: 'nowrap' }}>📏 {product.measure}</div>}
                    {!product.voltage && !product.amperage && !product.wattage && !product.weight && !product.measure && (
                      <span style={{ opacity: 0.5 }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: colors.primary, fontSize: '14px', whiteSpace: 'nowrap' }}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <span style={{ color: product.stock === 0 ? '#EF4444' : product.stock < 10 ? '#F59E0B' : '#10B981', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: product.stock === 0 ? '#FEE2E2' : product.stock < 10 ? '#FEF3C7' : '#D1FAE5', fontSize: '13px', whiteSpace: 'nowrap' }}>{product.stock}</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button onClick={() => handleView(product)} style={{ marginRight: '4px', padding: '4px 8px', background: colors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }} title="Ver detalles">👁️</button>
                    <button onClick={() => handleEdit(product)} style={{ marginRight: '4px', padding: '4px 8px', background: colors.accent, color: colors.primary, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }} title="Editar producto">✏️</button>
                    <button onClick={() => handleDelete(product.id)} style={{ padding: '4px 8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} title="Eliminar producto">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas */}
      {filteredProducts.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px 20px', background: 'white', borderRadius: '12px', display: 'flex', gap: '30px', border: `1px solid ${colors.light}` }}>
          <div><span style={{ color: colors.secondary }}>Total productos: </span><strong style={{ color: colors.primary }}>{filteredProducts.length}</strong></div>
          <div><span style={{ color: colors.secondary }}>Valor inventario: </span><strong style={{ color: colors.primary }}>${filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}</strong></div>
          <div><span style={{ color: colors.secondary }}>Categorías: </span><strong style={{ color: colors.primary }}>{[...new Set(filteredProducts.map(p => p.category).filter(Boolean))].length}</strong></div>
        </div>
      )}

      {/* Modal de Ver Producto */}
      {showViewModal && viewingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setShowViewModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '35px', width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowViewModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: '#FEE2E2', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

            <div style={{ display: 'flex', gap: '25px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '12px', overflow: 'hidden', background: colors.gray, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.light}` }}>
                {viewingProduct.image ? (
                  <img src={viewingProduct.image} alt={viewingProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '64px', opacity: 0.4 }}>📦</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h2 style={{ margin: '0 0 5px', color: colors.primary, fontSize: '22px', paddingRight: '40px' }}>{viewingProduct.name}</h2>
                {viewingProduct.category && (
                  <span style={{ background: colors.light, color: colors.primary, padding: '5px 12px', borderRadius: '20px', fontSize: '13px', display: 'inline-block', marginBottom: '15px' }}>{viewingProduct.category}</span>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                  <div style={{ background: colors.gray, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>Precio</p>
                    <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: colors.primary, fontSize: '20px' }}>${viewingProduct.price.toFixed(2)}</p>
                  </div>
                  <div style={{ background: colors.gray, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>Stock</p>
                    <p style={{ margin: '5px 0 0', fontWeight: 'bold', color: viewingProduct.stock === 0 ? '#EF4444' : viewingProduct.stock < 10 ? '#F59E0B' : '#10B981', fontSize: '20px' }}>{viewingProduct.stock} unidades</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: colors.gray, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px', color: colors.primary, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Especificaciones Técnicas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {viewingProduct.brand && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>🏷️ Marca</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.brand}</p></div>}
                {viewingProduct.voltage && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>⚡ Voltaje</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.voltage}</p></div>}
                {viewingProduct.amperage && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>🔌 Amperaje</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.amperage}</p></div>}
                {viewingProduct.wattage && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>💡 Potencia</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.wattage}</p></div>}
                {viewingProduct.weight && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>⚖️ Peso</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.weight}</p></div>}
                {viewingProduct.measure && <div style={{ padding: '10px', background: 'white', borderRadius: '8px' }}><p style={{ margin: 0, color: colors.secondary, fontSize: '11px' }}>📏 Medida</p><p style={{ margin: '3px 0 0', fontWeight: '600', color: colors.primary }}>{viewingProduct.measure}</p></div>}
                {!viewingProduct.brand && !viewingProduct.voltage && !viewingProduct.amperage && !viewingProduct.wattage && !viewingProduct.weight && !viewingProduct.measure && <p style={{ color: colors.secondary, gridColumn: '1 / -1', textAlign: 'center' }}>Sin especificaciones técnicas</p>}
              </div>
            </div>

            {viewingProduct.description && (
              <div style={{ background: colors.light, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px', color: colors.primary, fontSize: '16px' }}>📝 Descripción</h3>
                <p style={{ margin: 0, color: colors.primary, lineHeight: '1.6' }}>{viewingProduct.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowViewModal(false); handleEdit(viewingProduct); }}
                style={{ padding: '10px 20px', background: colors.accent, color: colors.primary, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>✏️ Editar</button>
              <button onClick={() => setShowViewModal(false)}
                style={{ padding: '10px 20px', background: colors.secondary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;