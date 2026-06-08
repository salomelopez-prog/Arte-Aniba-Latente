import { query } from '../config/db.js';
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../utils/validators.js';

const list = async (req, res) => {
  try {
    const { search, type, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      sql += ` AND customer_type = $${paramIndex++}`;
      params.push(type);
    }

    const countSql = sql;
    sql += ' ORDER BY created_at DESC LIMIT $' + (paramIndex++) + ' OFFSET $' + (paramIndex++);
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query(countSql.replace(/SELECT \*/, 'SELECT COUNT(*)'), params.slice(0, -2));

    return res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('[Customers] Error al listar:', error.message);
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const ordersResult = await query(
      'SELECT id, order_number, status, total, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20',
      [id]
    );

    return res.json({
      customer: result.rows[0],
      recentOrders: ordersResult.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Registro público de cliente (sin contraseña). Upsert por email o teléfono.
const register = async (req, res) => {
  try {
    const data = req.body || {};

    if (!data.first_name || sanitizeString(data.first_name, 100).length < 2) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const email = sanitizeEmail(data.email);
    const phone = sanitizePhone(data.phone);
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email o teléfono son requeridos' });
    }

    const fields = {
      first_name: sanitizeString(data.first_name, 100),
      last_name: sanitizeString(data.last_name || '', 100),
      email,
      phone,
      whatsapp: sanitizePhone(data.whatsapp) || phone,
      city: sanitizeString(data.city, 100),
      department: sanitizeString(data.department, 100),
      address: sanitizeString(data.address, 500),
    };

    const existing = await query(
      'SELECT id FROM customers WHERE (email = $1 AND $1 <> \'\') OR (phone = $2 AND $2 <> \'\') LIMIT 1',
      [email, phone]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await query(
        `UPDATE customers SET
          first_name = $1, last_name = $2, email = COALESCE(NULLIF($3, ''), email),
          phone = $4, whatsapp = $5, city = $6, department = $7, address = $8
         WHERE id = $9 RETURNING *`,
        [
          fields.first_name, fields.last_name, fields.email, fields.phone,
          fields.whatsapp, fields.city, fields.department, fields.address,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await query(
        `INSERT INTO customers (first_name, last_name, email, phone, whatsapp, city, department, address, customer_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'individual') RETURNING *`,
        [
          fields.first_name, fields.last_name, fields.email || null, fields.phone,
          fields.whatsapp, fields.city, fields.department, fields.address,
        ]
      );
    }

    return res.status(201).json({ customer: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    }
    console.error('[Customers] Error al registrar:', error.message);
    return res.status(500).json({ error: 'Error al registrar cliente' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const result = await query(
      `UPDATE customers SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        whatsapp = COALESCE($5, whatsapp),
        city = COALESCE($6, city),
        department = COALESCE($7, department),
        address = COALESCE($8, address),
        customer_type = COALESCE($9, customer_type),
        company_name = COALESCE($10, company_name),
        notes = COALESCE($11, notes)
       WHERE id = $12
       RETURNING *`,
      [
        data.first_name ? sanitizeString(data.first_name, 100) : null,
        data.last_name ? sanitizeString(data.last_name, 100) : null,
        data.email ? sanitizeEmail(data.email) : null,
        data.phone ? sanitizePhone(data.phone) : null,
        data.whatsapp ? sanitizePhone(data.whatsapp) : null,
        data.city ? sanitizeString(data.city, 100) : null,
        data.department ? sanitizeString(data.department, 100) : null,
        data.address ? sanitizeString(data.address, 500) : null,
        data.customer_type || null,
        data.company_name ? sanitizeString(data.company_name, 200) : null,
        data.notes ? sanitizeString(data.notes, 1000) : null,
        id,
      ]
    );

    return res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('[Customers] Error al actualizar:', error.message);
    return res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente: solo si no tiene pedidos (para conservar el historial de ventas).
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const orders = await query('SELECT COUNT(*)::int AS n FROM orders WHERE customer_id = $1', [id]);
    if (orders.rows[0].n > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: el cliente tiene ${orders.rows[0].n} pedido(s). Se conserva para mantener el historial de ventas.`,
      });
    }

    await query('DELETE FROM customers WHERE id = $1', [id]);
    return res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('[Customers] Error al eliminar:', error.message);
    return res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

export { register, list, getById, update, remove };
