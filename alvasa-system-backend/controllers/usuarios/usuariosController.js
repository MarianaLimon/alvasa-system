// controllers/usuarios/usuariosController.js
// Envuelve a Promises sin modificar tu config/db.js
const rawDb = require('../../config/db');
const db = (rawDb && typeof rawDb.promise === 'function') ? rawDb.promise() : rawDb;

/**
 * GET /usuarios
 */
exports.getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.nombre, u.email, r.nombre AS rol
      FROM us_usuarios u
      JOIN us_roles r ON r.id = u.role_id
      ORDER BY u.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error('getUsuarios error:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * GET /permisos
 */
exports.getPermisos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, code, descripcion
      FROM us_permissions
      ORDER BY code
    `);
    res.json(rows);
  } catch (err) {
    console.error('getPermisos error:', err);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

/**
 * GET /usuarios/:id/permisos-efectivos
 * (Permisos del rol ∪ grants explícitos) − denies explícitos
 */
exports.getPermisosEfectivos = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      WITH role_perms AS (
        SELECT rp.permission_id
        FROM us_usuarios u
        JOIN us_role_permissions rp ON rp.role_id = u.role_id
        WHERE u.id = ?
      ),
      user_grants AS (
        SELECT permission_id
        FROM us_user_permissions
        WHERE user_id = ?
      ),
      user_denies AS (
        SELECT permission_id
        FROM us_user_denies
        WHERE user_id = ?
      ),
      union_grants AS (
        SELECT permission_id FROM role_perms
        UNION
        SELECT permission_id FROM user_grants
      )
      SELECT p.id, p.code, p.descripcion
      FROM us_permissions p
      JOIN union_grants ug ON ug.permission_id = p.id
      LEFT JOIN user_denies d ON d.permission_id = p.id
      WHERE d.permission_id IS NULL
      ORDER BY p.code
      `,
      [id, id, id]
    );

    res.json(rows);
  } catch (err) {
    console.error('getPermisosEfectivos error:', err);
    res.status(500).json({ error: 'Error al obtener permisos efectivos' });
  }
};

/**
 * PUT /usuarios/:id/permisos  { code, enabled }
 * Activa/Desactiva overrides individuales por usuario
 */
exports.togglePermiso = async (req, res) => {
  const { id } = req.params;
  const { code, enabled } = req.body;

  console.log('[PUT] /usuarios/%s/permisos =>', id, { code, enabled });

  if (!code || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Payload inválido' });
  }

  try {
    // 1) Resolver permission_id primero (fuera de la transacción para compatibilidad)
    const [[perm]] = await db.query(
      `SELECT id FROM us_permissions WHERE code = ?`,
      [code]
    );
    if (!perm) {
      return res.status(400).json({ error: 'Permiso no existe' });
    }

    // 2) Detectar si tenemos pool o conexión única
    const hasPoolGetConnection =
      (rawDb && typeof rawDb.getConnection === 'function') ||
      (db && typeof db.getConnection === 'function');

    if (hasPoolGetConnection) {
      // === Modo POOL: usar una conexión exclusiva con transacción ===
      const conn = await (db.getConnection ? db.getConnection() : rawDb.getConnection());
      try {
        await conn.beginTransaction();

        if (enabled) {
          await conn.query(
            `INSERT IGNORE INTO us_user_permissions(user_id, permission_id) VALUES (?, ?)`,
            [id, perm.id]
          );
          await conn.query(
            `DELETE FROM us_user_denies WHERE user_id=? AND permission_id=?`,
            [id, perm.id]
          );
        } else {
          await conn.query(
            `INSERT IGNORE INTO us_user_denies(user_id, permission_id) VALUES (?, ?)`,
            [id, perm.id]
          );
          await conn.query(
            `DELETE FROM us_user_permissions WHERE user_id=? AND permission_id=?`,
            [id, perm.id]
          );
        }

        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        if (typeof conn.release === 'function') conn.release();
      }
    } else {
      // === Modo CONEXIÓN ÚNICA: usar la misma conexión; si soporta transacciones, úsalas ===
      const conn = db; // misma referencia
      const canTx = typeof conn.beginTransaction === 'function' && typeof conn.commit === 'function';

      if (canTx) {
        await conn.beginTransaction();
      }

      try {
        if (enabled) {
          await conn.query(
            `INSERT IGNORE INTO us_user_permissions(user_id, permission_id) VALUES (?, ?)`,
            [id, perm.id]
          );
          await conn.query(
            `DELETE FROM us_user_denies WHERE user_id=? AND permission_id=?`,
            [id, perm.id]
          );
        } else {
          await conn.query(
            `INSERT IGNORE INTO us_user_denies(user_id, permission_id) VALUES (?, ?)`,
            [id, perm.id]
          );
          await conn.query(
            `DELETE FROM us_user_permissions WHERE user_id=? AND permission_id=?`,
            [id, perm.id]
          );
        }

        if (canTx) await conn.commit();
      } catch (e) {
        if (canTx && typeof conn.rollback === 'function') await conn.rollback();
        throw e;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('togglePermiso error:', err);
    return res.status(500).json({ error: 'Error al actualizar permiso' });
  }
};
