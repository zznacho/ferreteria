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
      SELECT si.*, p.name as product_name
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

// POST /api/sales - Crear venta (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const client = await query('BEGIN');
  
  try {
    const { items } = req.body;
    const saleId = uuidv4();
    
    // Crear la venta
    await query(
      'INSERT INTO sales (id) VALUES ($1)',
      [saleId]
    );
    
    // Procesar cada item
    for (const item of items) {
      // Obtener precio actual del producto
      const productResult = await query(
        'SELECT price, stock FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }
      
      const product = productResult.rows[0];
      
      // Verificar stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${item.product_id}`);
      }
      
      // Insertar item de venta
      await query(
        'INSERT INTO sale_items (id, sale_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), saleId, item.product_id, item.quantity, product.price]
      );
      
      // Actualizar stock
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

export default router;