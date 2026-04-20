import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY name');
    
    const products = result.rows.map(product => ({
      ...product,
      image_url: product.image_path ? `${process.env.API_URL || 'http://localhost:3001'}${product.image_path}` : null
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/products - Crear producto
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { 
      name, price, stock, category, brand, 
      weight, measure, voltage, description 
    } = req.body;
    
    const id = uuidv4();
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;
    
    // Guardar categoría si es nueva
    if (category) {
      await query(
        'INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [category]
      );
    }
    
    // Guardar marca si es nueva
    if (brand) {
      await query(
        'INSERT INTO product_brands (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [brand]
      );
    }
    
    // Guardar medida si es nueva
    if (measure) {
      await query(
        'INSERT INTO product_measures (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [measure]
      );
    }
    
    // Guardar voltaje si es nuevo
    if (voltage) {
      await query(
        'INSERT INTO product_voltages (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [voltage]
      );
    }
    
    await query(
      `INSERT INTO products 
       (id, name, price, stock, category, brand, weight, measure, voltage, description, image_path) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, name, price, stock, category, brand, weight, measure, voltage, description, imagePath]
    );
    
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0];
    
    res.status(201).json({
      ...product,
      image_url: product.image_path ? `${process.env.API_URL || 'http://localhost:3001'}${product.image_path}` : null
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, price, stock, category, brand, 
      weight, measure, voltage, description 
    } = req.body;
    
    const currentProduct = await query('SELECT image_path FROM products WHERE id = $1', [id]);
    const oldImagePath = currentProduct.rows[0]?.image_path;
    
    let imagePath = oldImagePath;
    
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
      if (oldImagePath) {
        const fullPath = path.join(__dirname, '../../../', oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    
    // Guardar opciones nuevas
    if (category) {
      await query(
        'INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [category]
      );
    }
    if (brand) {
      await query(
        'INSERT INTO product_brands (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [brand]
      );
    }
    if (measure) {
      await query(
        'INSERT INTO product_measures (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [measure]
      );
    }
    if (voltage) {
      await query(
        'INSERT INTO product_voltages (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [voltage]
      );
    }
    
    await query(
      `UPDATE products 
       SET name = $1, price = $2, stock = $3, category = $4, brand = $5, 
           weight = $6, measure = $7, voltage = $8, description = $9, 
           image_path = $10, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $11`,
      [name, price, stock, category, brand, weight, measure, voltage, description, imagePath, id]
    );
    
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    const product = result.rows[0];
    
    res.json({
      ...product,
      image_url: product.image_path ? `${process.env.API_URL || 'http://localhost:3001'}${product.image_path}` : null
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT image_path FROM products WHERE id = $1', [id]);
    const imagePath = result.rows[0]?.image_path;
    
    if (imagePath) {
      const fullPath = path.join(__dirname, '../../../', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// GET /api/products/options - Obtener opciones de selects
router.get('/options', async (req, res) => {
  try {
    const categories = await query('SELECT name FROM product_categories ORDER BY name');
    const brands = await query('SELECT name FROM product_brands ORDER BY name');
    const measures = await query('SELECT name FROM product_measures ORDER BY name');
    const voltages = await query('SELECT name FROM product_voltages ORDER BY name');
    
    res.json({
      categories: categories.rows.map(r => r.name),
      brands: brands.rows.map(r => r.name),
      measures: measures.rows.map(r => r.name),
      voltages: voltages.rows.map(r => r.name)
    });
  } catch (error) {
    console.error('Error getting options:', error);
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
});

export default router;