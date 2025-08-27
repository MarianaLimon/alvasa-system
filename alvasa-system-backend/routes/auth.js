const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Helper para firmar token
const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

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

    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ id: user.id, email: user.email, nombre: user.nombre, role_id: user.role_id });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// === PERFIL / ME ===
router.get('/me', (req, res) => {
  try {
    const raw = req.cookies?.token;
    if (!raw) return res.status(401).json({ error: 'No autenticado' });

    const payload = jwt.verify(raw, process.env.JWT_SECRET);
    res.json({ ok: true, user: payload });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// === LOGOUT ===
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
