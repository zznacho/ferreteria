import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/sales - Obtener todas las ventas
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
             COUNT(si.id) as total_items,
             SUM(si.quantity * si.price_at_time) as total_amount
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting sales:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET /api/sales/:id - Obtener detalle de venta
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const saleResult = await query('SELECT * FROM sales WHERE id = $1', [id]);
    const itemsResult = await query(`
      SELECT si.*, p.name as product_name, p.image_path, p.voltage, p.amperage, p.wattage
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
    `, [id]);
    
    res.json({
      ...saleResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error getting sale details:', error);
    res.status(500).json({ error: 'Error al obtener detalles de venta' });
  }
});

// POST /api/sales - Crear venta
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    const saleId = uuidv4();
    
    await query('BEGIN');
    
    await query('INSERT INTO sales (id) VALUES ($1)', [saleId]);
    
    for (const item of items) {
      const productResult = await query(
        'SELECT price, stock FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }
      
      const product = productResult.rows[0];
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${item.product_id}`);
      }
      
      await query(
        'INSERT INTO sale_items (id, sale_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), saleId, item.product_id, item.quantity, product.price]
      );
      
      await query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await query('COMMIT');
    
    const result = await query('SELECT * FROM sales WHERE id = $1', [saleId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating sale:', error);
    res.status(500).json({ error: error.message || 'Error al crear venta' });
  }
});

// PUT /api/sales/:id - Actualizar venta
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    await query('BEGIN');
    
    const originalItems = await query(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
      [id]
    );
    
    for (const item of originalItems.rows) {
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await query('DELETE FROM sale_items WHERE sale_id = $1', [id]);
    
    for (const item of items) {
      const productResult = await query(
        'SELECT price, stock FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }
      
      const product = productResult.rows[0];
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${item.product_id}`);
      }
      
      await query(
        'INSERT INTO sale_items (id, sale_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), id, item.product_id, item.quantity, product.price]
      );
      
      await query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await query('UPDATE sales SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    await query('COMMIT');
    
    const result = await query('SELECT * FROM sales WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating sale:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar venta' });
  }
});

// DELETE /api/sales/:id - Eliminar venta
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('BEGIN');
    
    const items = await query(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
      [id]
    );
    
    for (const item of items.rows) {
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await query('DELETE FROM sale_items WHERE sale_id = $1', [id]);
    await query('DELETE FROM sales WHERE id = $1', [id]);
    
    await query('COMMIT');
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Error al eliminar venta' });
  }
});

export default router;