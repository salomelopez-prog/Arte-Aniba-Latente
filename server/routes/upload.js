import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';
import { uploadImageBuffer } from '../services/cloudinary.js';

const router = Router();

// Subida genérica de una imagen a Cloudinary (admin). Devuelve { url }.
// Se usa para la galería del Inicio y cualquier contenido editable.
router.post(
  '/',
  authenticate,
  requireRole('superadmin', 'editor'),
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
      const url = await uploadImageBuffer(req.file.buffer);
      return res.status(201).json({ url });
    } catch (error) {
      console.error('[Upload] Error:', error.message);
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }
  },
);

export default router;
