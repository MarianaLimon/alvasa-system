const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const ROLE_ID_TO_NAME = { 1: 'MASTER', 2: 'ADMIN', 3: 'OPERADOR', 4: 'LECTURA' };

// === LOGIN ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.promise().query(
      'SELECT id, email, password_hash, nombre, role_id, activo FROM us_usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    if (user.activo !== 1) return res.status(401).json({ error: 'Usuario inactivo' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const role = ROLE_ID_TO_NAME[user.role_id] || 'OPERADOR';

    // 🔹 Token con TODO lo que el front necesita (sin consultar permisos)
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, role, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // en prod con HTTPS => true
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 🔹 Responde el usuario directo, igual a lo que /me regresará
    res.json({ id: user.id, email: user.email, nombre: user.nombre, role_id: user.role_id, role });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// === PERFIL / ME ===
// routes/auth.js  (handler de GET /auth/me)
router.get('/me', async (req, res) => {
  try {
    const raw = req.cookies?.token;
    if (!raw) return res.status(401).json({ error: 'No autenticado' });

    const payload = jwt.verify(raw, process.env.JWT_SECRET);
    // payload debe traer al menos: { id, email, role_id, role, nombre }

    const [rows] = await db.promise().query(`
      SELECT DISTINCT p.code
      FROM (
        SELECT rp.permission_id FROM us_role_permissions rp WHERE rp.role_id = ?
        UNION
        SELECT up.permission_id FROM us_user_permissions up WHERE up.user_id = ?
      ) a
      JOIN us_permissions p ON p.id = a.permission_id
      LEFT JOIN us_user_denies d ON d.permission_id = a.permission_id AND d.user_id = ?
      WHERE d.permission_id IS NULL
      ORDER BY p.code
    `, [payload.role_id, payload.id, payload.id]);

    const permissions = rows.map(r => r.code); // p.ej. ['clients.read','procesos.read',...]

    return res.json({
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
      role_id: payload.role_id,
      role: payload.role,
      permissions, // <— CLAVE
    });
  } catch (err) {
    console.error('GET /auth/me error:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
});


// === LOGOUT ===
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
