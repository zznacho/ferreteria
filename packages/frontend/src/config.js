// Configuración del frontend
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3001/uploads',
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

export default config;