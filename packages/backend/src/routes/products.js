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
    // Ruta relativa desde el archivo actual hasta uploads/products
    const uploadDir = path.join(__dirname, '../../../uploads/products');
    // Crear directorio si no existe
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
    cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM products ORDER BY name'
    );
    
    // Agregar URL completa a las imágenes
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

// POST /api/products - Crear producto con imagen
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const id = uuidv4();
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;
    
    await query(
      'INSERT INTO products (id, name, price, stock, image_path) VALUES ($1, $2, $3, $4, $5)',
      [id, name, price, stock, imagePath]
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
    const { name, price, stock } = req.body;
    
    // Obtener producto actual para saber si tiene imagen
    const currentProduct = await query('SELECT image_path FROM products WHERE id = $1', [id]);
    const oldImagePath = currentProduct.rows[0]?.image_path;
    
    let imagePath = oldImagePath;
    
    // Si se sube una nueva imagen
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
      
      // Eliminar imagen anterior si existe
      if (oldImagePath) {
        const fullPath = path.join(__dirname, '../../../', oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    
    await query(
      'UPDATE products SET name = $1, price = $2, stock = $3, image_path = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
      [name, price, stock, imagePath, id]
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
    
    // Obtener imagen para eliminarla
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

export default router;