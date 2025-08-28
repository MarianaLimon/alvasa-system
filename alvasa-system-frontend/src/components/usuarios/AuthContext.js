import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { me } from "./auth";

export const AuthContext = createContext(null);

export const ROLE_NAME_TO_ID = { MASTER: 1, ADMIN: 2, OPERADOR: 3, LECTURA: 4 };
export const ROLE_ID_TO_NAME = { 1: "MASTER", 2: "ADMIN", 3: "OPERADOR", 4: "LECTURA" };

// Permisos que el ADMIN NO debe tener (MASTER sí)
const ADMIN_DENYLIST = [
  "USUARIOS_CREAR",
  "USUARIOS_EDITAR",
  "USUARIOS_ELIMINAR",
  "USUARIOS_ACTIVAR",
  "USUARIOS_DESACTIVAR",
  "USUARIOS_VER_CONFIG",
  "ROLES_EDITAR",
  "ROLES_CREAR",
  "ROLES_ELIMINAR",
];

function normalizeUser(input) {
  if (!input) return null;
  const raw = input.user ?? input;

  const rawRoleName = (raw.role ?? raw.role_name ?? "").toString().toUpperCase();
  const rawRoleId   = Number(raw.role_id ?? raw.roleId);

  const roleIdFromRaw =
    (Number.isFinite(rawRoleId) && rawRoleId) ||
    ROLE_NAME_TO_ID[rawRoleName];

  const roleNameFromRaw =
    rawRoleName ||
    ROLE_ID_TO_NAME[roleIdFromRaw] ||
    "OPERADOR";

  const role_id = roleIdFromRaw || ROLE_NAME_TO_ID[roleNameFromRaw] || 3;
  const role    = ROLE_ID_TO_NAME[role_id] || roleNameFromRaw;

  const rawPerms = raw.permissions ?? raw.permisos ?? [];
  const permissions = Array.isArray(rawPerms)
    ? rawPerms
        .map(p => typeof p === "string" ? p : (p?.code ?? p?.perm ?? p?.nombre ?? p?.clave))
        .filter(Boolean)
    : [];

  return { ...raw, role_id, role, permissions };
}

export function AuthProvider({ children }) {
  const [user, _setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (maybeRaw) => _setUser(normalizeUser(maybeRaw));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await me();
        _setUser(normalizeUser(data ?? null));
      } catch {
        _setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const api = useMemo(() => {
    const role    = user?.role ?? null;
    const role_id = user?.role_id ?? null;

    const isMaster = role === "MASTER" || role_id === 1;
    const isAdmin  = role === "ADMIN"  || role_id === 2;

    const perms = Array.isArray(user?.permissions) ? user.permissions : [];

    const hasRole = (...roles) => {
      if (!user) return false;
      const wanted = roles
        .map(r => (typeof r === "number" ? ROLE_ID_TO_NAME[r] : String(r)))
        .filter(Boolean)
        .map(s => s.toUpperCase());
      return wanted.includes(role);
    };

    // Helper: ADMIN puede todo excepto denylist
    const adminAllows = (code) => isAdmin && !ADMIN_DENYLIST.includes(String(code).toUpperCase());

    const hasPermission = (code) => {
      if (!user) return false;
      const c = String(code).toUpperCase();
      if (isMaster) return true;
      if (adminAllows(c)) return true;
      return perms.includes(c);
    };

    const hasAny = (...codes) => {
      if (!user) return false;
      if (isMaster) return true;
      const upper = codes.map(c => String(c).toUpperCase());
      if (isAdmin && upper.some(c => !ADMIN_DENYLIST.includes(c))) return true;
      return upper.some(c => perms.includes(c));
    };

    const hasAll = (...codes) => {
      if (!user) return false;
      if (isMaster) return true;
      const upper = codes.map(c => String(c).toUpperCase());
      if (isAdmin) {
        // ADMIN debe tener todas las que NO estén en denylist; si alguna requerida está en denylist, falla
        if (upper.some(c => ADMIN_DENYLIST.includes(c))) return false;
        return true; // pasa todas las demás
      }
      return upper.every(c => perms.includes(c));
    };

    // Útil para la UI (mostrar/ocultar botones de Usuarios)
    const canManageUsers = isMaster; // solo MASTER

    return { hasRole, hasPermission, hasAny, hasAll, isMaster, isAdmin, canManageUsers };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, ...api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
