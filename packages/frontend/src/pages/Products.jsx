import React, { useState, useEffect } from 'react';
import { localDB } from '../db/database';
import { productService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const result = localDB.query('SELECT * FROM products ORDER BY name');
    setProducts(result);
    setLoading(false);
  };

  const handleCreate = async (productData) => {
    const id = uuidv4();
    const product = {
      id,
      ...productData,
      updated_at: new Date().toISOString()
    };

    // Save locally
    localDB.execute(`
      INSERT INTO products (id, name, price, stock, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [id, productData.name, productData.price, productData.stock]);
    
    localDB.logChange('products', id, 'INSERT', product);
    await localDB.save();
    
    loadProducts();
    setShowForm(false);

    // Try to sync with server if online
    if (navigator.onLine) {
      try {
        await productService.create(product);
      } catch (error) {
        console.error('Error syncing product:', error);
      }
    }
  };

  const handleUpdate = async (id, productData) => {
    const product = {
      id,
      ...productData,
      updated_at: new Date().toISOString()
    };

    localDB.execute(`
      UPDATE products 
      SET name = ?, price = ?, stock = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [productData.name, productData.price, productData.stock, id]);
    
    localDB.logChange('products', id, 'UPDATE', product);
    await localDB.save();
    
    loadProducts();
    setEditingProduct(null);
    setShowForm(false);

    if (navigator.onLine) {
      try {
        await productService.update(id, product);
      } catch (error) {
        console.error('Error syncing product update:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    localDB.execute('DELETE FROM products WHERE id = ?', [id]);
    localDB.logChange('products', id, 'DELETE', { id });
    await localDB.save();
    
    loadProducts();

    if (navigator.onLine) {
      try {
        await productService.delete(id);
      } catch (error) {
        console.error('Error syncing product deletion:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Nuevo Producto
        </button>
      </div>

      {showForm && (
        <ProductForm
          onSubmit={editingProduct ? 
            (data) => handleUpdate(editingProduct.id, data) : 
            handleCreate
          }
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}
        />
      )}

      <ProductList
        products={products}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Products;