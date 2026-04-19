import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/products - Crear producto (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const id = uuidv4();
    
    await query(
      'INSERT INTO products (id, name, price, stock) VALUES ($1, $2, $3, $4)',
      [id, name, price, stock]
    );
    
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar producto (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    
    await query(
      'UPDATE products SET name = $1, price = $2, stock = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [name, price, stock, id]
    );
    
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;