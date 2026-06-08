import { query } from '../config/db.js';
import { sanitizeString } from '../utils/validators.js';

const getAll = async (req, res) => {
  try {
    const result = await query('SELECT key, value, description, updated_at FROM site_settings ORDER BY key ASC');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return res.json({ settings, raw: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

const getByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT * FROM site_settings WHERE key = $1', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    return res.json({ setting: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

const update = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'El valor es requerido' });
    }

    const existing = await query('SELECT * FROM site_settings WHERE key = $1', [key]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const result = await query(
      'UPDATE site_settings SET value = $1, updated_by = $2 WHERE key = $3 RETURNING *',
      [sanitizeString(String(value), 5000), req.admin?.id || null, key]
    );

    return res.json({ setting: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

const updateBulk = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Se requiere un objeto settings con clave: valor' });
    }

    const keys = Object.keys(settings);
    for (const key of keys) {
      await query(
        'UPDATE site_settings SET value = $1, updated_by = $2 WHERE key = $3',
        [sanitizeString(String(settings[key]), 5000), req.admin?.id || null, key]
      );
    }

    return res.json({ message: `${keys.length} ajustes actualizados` });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

export { getAll, getByKey, update, updateBulk };
