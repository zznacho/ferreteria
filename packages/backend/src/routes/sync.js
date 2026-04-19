import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = express.Router();

// Recibir cambios del cliente
router.post('/push', authenticateToken, requireAdmin, async (req, res) => {
  const client = await query('BEGIN');
  
  try {
    const { changes } = req.body;
    
    for (const change of changes) {
      const { table, action, data, recordId } = change;
      
      switch (action) {
        case 'INSERT':
          await handleInsert(table, data);
          break;
        case 'UPDATE':
          await handleUpdate(table, recordId, data);
          break;
        case 'DELETE':
          await handleDelete(table, recordId);
          break;
      }
    }
    
    await query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Sync push error:', error);
    res.status(500).json({ error: 'Error en sincronización' });
  }
});

// Enviar cambios al cliente
router.get('/pull', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { lastSync } = req.query;
    const timestamp = lastSync || '1970-01-01T00:00:00.000Z';
    
    const changes = {
      products: await getChanges('products', timestamp),
      sales: await getChanges('sales', timestamp),
      sale_items: await getChanges('sale_items', timestamp)
    };
    
    res.json({
      changes,
      syncTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync pull error:', error);
    res.status(500).json({ error: 'Error en sincronización' });
  }
});

async function handleInsert(table, data) {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  
  await query(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
    values
  );
}

async function handleUpdate(table, id, data) {
  const updates = Object.keys(data)
    .filter(key => key !== 'id')
    .map((key, i) => `${key} = $${i + 2}`)
    .join(', ');
  
  const values = [id, ...Object.values(data).filter((_, key) => key !== 'id')];
  
  await query(
    `UPDATE ${table} SET ${updates} WHERE id = $1`,
    values
  );
}

async function handleDelete(table, id) {
  await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

async function getChanges(table, since) {
  const result = await query(
    `SELECT * FROM ${table} WHERE updated_at > $1`,
    [since]
  );
  return result.rows;
}

export default router;