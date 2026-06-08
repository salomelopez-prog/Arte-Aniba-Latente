import { query } from '../config/db.js';
import { validateContactMessage, sanitizeString, sanitizeEmail, sanitizePhone } from '../utils/validators.js';
import { sendContactNotification } from '../services/email.js';

const list = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    const countSql = sql;
    sql += ' ORDER BY created_at DESC LIMIT $' + (paramIndex++) + ' OFFSET $' + (paramIndex++);
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query(countSql.replace(/SELECT \*/, 'SELECT COUNT(*)'), params.slice(0, -2));

    return res.json({
      messages: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('[Contacts] Error al listar:', error.message);
    return res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM contact_messages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    if (result.rows[0].status === 'new') {
      await query('UPDATE contact_messages SET status = $1 WHERE id = $2', ['read', id]);
    }

    return res.json({ message: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener mensaje' });
  }
};

const create = async (req, res) => {
  try {
    const data = req.body;
    const errors = validateContactMessage(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        sanitizeString(data.name, 150),
        sanitizeEmail(data.email),
        sanitizePhone(data.phone),
        sanitizeString(data.message, 2000),
      ]
    );

    sendContactNotification(data);

    return res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('[Contacts] Error al crear:', error.message);
    return res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

const markReplied = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const existing = await query('SELECT * FROM contact_messages WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    const result = await query(
      'UPDATE contact_messages SET status = $1, replied_at = NOW(), admin_notes = COALESCE($2, admin_notes) WHERE id = $3 RETURNING *',
      ['replied', sanitizeString(admin_notes || '', 1000), id]
    );

    return res.json({ message: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
};

export { list, getById, create, markReplied };
