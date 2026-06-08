import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { sanitizeEmail } from '../utils/validators.js';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const result = await query('SELECT * FROM admin_users WHERE email = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador.' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 1000 / 60);
      return res.status(423).json({
        error: `Cuenta bloqueada. Intenta de nuevo en ${remaining} minuto(s).`,
        locked: true,
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      const newAttempts = user.failed_attempts + 1;
      if (newAttempts >= 10) {
        await query(
          'UPDATE admin_users SET failed_attempts = $1, locked_until = NOW() + INTERVAL \'30 minutes\' WHERE id = $2',
          [newAttempts, user.id]
        );
        return res.status(423).json({
          error: 'Cuenta bloqueada por 30 minutos debido a múltiples intentos fallidos.',
          locked: true,
        });
      }
      await query('UPDATE admin_users SET failed_attempts = $1 WHERE id = $2', [newAttempts, user.id]);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await query(
      'UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
    );

    const ipAddress = req.ip || req.connection.remoteAddress;
    await query(
      `INSERT INTO sessions (admin_user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken, ipAddress, req.headers['user-agent'] || null]
    );

    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Error en login:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const sessionResult = await query(
      'SELECT s.*, a.is_active FROM sessions s JOIN admin_users a ON s.admin_user_id = a.id WHERE s.token_hash = $1 AND s.expires_at > NOW()',
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }

    if (!sessionResult.rows[0].is_active) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const user = await query('SELECT id, email, name, role FROM admin_users WHERE id = $1', [decoded.id]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const newToken = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    return res.json({ token: newToken, user: user.rows[0] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado', code: 'REFRESH_EXPIRED' });
    }
    return res.status(500).json({ error: 'Error al renovar token' });
  }
};

const me = async (req, res) => {
  return res.json({ user: req.admin });
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query('DELETE FROM sessions WHERE token_hash = $1', [refreshToken]);
    }
    return res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, is_active, last_login, created_at FROM admin_users ORDER BY name ASC'
    );
    return res.json({ users: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear un nuevo usuario administrador (solo superadmin).
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const validRole = role === 'superadmin' ? 'superadmin' : 'editor';
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO admin_users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, email, name, role, is_active, created_at`,
      [cleanEmail, passwordHash, name.trim().substring(0, 150), validRole]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error('[Auth] Error al crear usuario:', error.message);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Activar/desactivar un usuario admin (solo superadmin). No se borra: es reversible.
const setUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active debe ser true o false' });
    }

    const target = await query('SELECT id, role FROM admin_users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No puedes desactivar tu propia cuenta.
    if (id === req.admin.id && !is_active) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    // Debe quedar al menos un superadmin activo.
    if (!is_active && target.rows[0].role === 'superadmin') {
      const count = await query(
        "SELECT COUNT(*)::int AS n FROM admin_users WHERE role = 'superadmin' AND is_active = TRUE"
      );
      if (count.rows[0].n <= 1) {
        return res.status(400).json({ error: 'Debe quedar al menos un superadmin activo' });
      }
    }

    const result = await query(
      'UPDATE admin_users SET is_active = $1 WHERE id = $2 RETURNING id, email, name, role, is_active, last_login, created_at',
      [is_active, id]
    );
    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('[Auth] Error al actualizar usuario:', error.message);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export { login, refresh, me, logout, listUsers, createUser, setUserActive };
