import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await query(
      'SELECT * FROM email_log ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM email_log');
    return res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('[EmailLog] Error:', error.message);
    return res.status(500).json({ error: 'Error al obtener historial de emails' });
  }
});

export default router;
