import { query } from '../config/db.js';
import { validateProduct, sanitizeString } from '../utils/validators.js';
import { uploadImageBuffer } from '../services/cloudinary.js';

const list = async (req, res) => {
  try {
    const { category, search, featured, active } = req.query;
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category && category !== 'Todos') {
      sql += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = TRUE`;
    }

    if (active === 'true' || active === undefined) {
      sql += ` AND p.is_active = TRUE`;
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.reference ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY p.sort_order ASC, p.name ASC';

    const result = await query(sql, params);
    return res.json({ products: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('[Products] Error al listar:', error.message);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json({ product: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json({ product: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Convierte valores de FormData (strings) o JSON a booleano.
const parseBool = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

const create = async (req, res) => {
  try {
    const data = req.body;
    const errors = validateProduct(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Si llegó un archivo, subirlo a Cloudinary y usar su URL.
    if (req.file) {
      data.image_url = await uploadImageBuffer(req.file.buffer);
    }

    const slug = data.slug || data.reference.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const result = await query(
      `INSERT INTO products (reference, name, slug, category_id, price, compare_price, description, short_description, material, size, dimensions, weight_grams, tone, image_url, gallery_images, stock_quantity, stock_alert_threshold, is_active, is_featured, sort_order, grupo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        data.reference, sanitizeString(data.name, 200), slug,
        data.category_id, data.price, data.compare_price || null,
        sanitizeString(data.description, 2000), sanitizeString(data.short_description, 300),
        sanitizeString(data.material, 500), sanitizeString(data.size, 100),
        sanitizeString(data.dimensions, 100), data.weight_grams || null,
        sanitizeString(data.tone, 60), data.image_url || null,
        JSON.stringify(data.gallery_images || []),
        data.stock_quantity ?? 0, data.stock_alert_threshold ?? 3,
        parseBool(data.is_active, true), parseBool(data.is_featured, false), data.sort_order ?? 0,
        data.grupo ? sanitizeString(data.grupo, 120) : null,
      ]
    );

    await logAudit(req, 'CREATE', 'products', result.rows[0].id, null, result.rows[0]);

    return res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con esa referencia o slug' });
    }
    console.error('[Products] Error al crear:', error.message);
    return res.status(500).json({ error: 'Error al crear producto' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const oldValues = existing.rows[0];

    // Si llegó un archivo, subirlo a Cloudinary y usar su URL.
    if (req.file) {
      data.image_url = await uploadImageBuffer(req.file.buffer);
    }

    // Booleanos opcionales: null => COALESCE conserva el valor actual.
    const isActive = data.is_active === undefined ? null : parseBool(data.is_active, null);
    const isFeatured = data.is_featured === undefined ? null : parseBool(data.is_featured, null);

    const result = await query(
      `UPDATE products SET
        reference = COALESCE($1, reference),
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        category_id = COALESCE($4, category_id),
        price = COALESCE($5, price),
        compare_price = $6,
        description = COALESCE($7, description),
        short_description = COALESCE($8, short_description),
        material = COALESCE($9, material),
        size = COALESCE($10, size),
        dimensions = COALESCE($11, dimensions),
        weight_grams = $12,
        tone = COALESCE($13, tone),
        image_url = COALESCE($14, image_url),
        gallery_images = COALESCE($15, gallery_images),
        stock_quantity = COALESCE($16, stock_quantity),
        stock_alert_threshold = COALESCE($17, stock_alert_threshold),
        is_active = COALESCE($18, is_active),
        is_featured = COALESCE($19, is_featured),
        sort_order = COALESCE($20, sort_order),
        grupo = CASE WHEN $21::text IS NULL THEN grupo ELSE NULLIF($21, '') END
       WHERE id = $22
       RETURNING *`,
      [
        data.reference, data.name, data.slug,
        data.category_id, data.price, data.compare_price ?? null,
        data.description, data.short_description, data.material,
        data.size, data.dimensions, data.weight_grams ?? null,
        data.tone, data.image_url || null,
        data.gallery_images ? JSON.stringify(data.gallery_images) : null,
        data.stock_quantity, data.stock_alert_threshold,
        isActive, isFeatured, data.sort_order,
        // undefined => no se tocó (CASE conserva); '' => desagrupar (NULL); texto => asignar grupo
        data.grupo === undefined ? null : sanitizeString(data.grupo, 120),
        id,
      ]
    );

    await logAudit(req, 'UPDATE', 'products', id, oldValues, result.rows[0]);

    return res.json({ product: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con esa referencia o slug' });
    }
    console.error('[Products] Error al actualizar:', error.message);
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await query('DELETE FROM products WHERE id = $1', [id]);
    await logAudit(req, 'DELETE', 'products', id, existing.rows[0], null);

    return res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('[Products] Error al eliminar:', error.message);
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC');
    return res.json({ categories: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const logAudit = async (req, action, entityType, entityId, oldValues, newValues) => {
  try {
    await query(
      `INSERT INTO audit_log (admin_user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.admin?.id || null,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req.ip || null,
      ]
    );
  } catch (err) {
    console.error('[Audit] Error al registrar:', err.message);
  }
};

export { list, getById, getBySlug, create, update, remove, getCategories };
