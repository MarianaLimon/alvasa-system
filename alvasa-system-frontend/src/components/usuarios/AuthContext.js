import React, { createContext, useContext, useEffect, useState } from "react";
import { me } from "./auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, nombre, email, role, role_id, permissions: [] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await me();
        const raw = data?.user ?? data ?? null;

        // 🔽 Mapea role_id → role (string)
        const roleMap = { 1: "MASTER", 2: "ADMIN", 3: "OPERADOR", 4: "LECTURA" };
        const normalized = raw
          ? {
              ...raw,
              role_id: raw.role_id ?? raw.roleId ?? raw.role, // tolerante
              role: raw.role || roleMap[raw.role_id ?? raw.roleId] || "OPERADOR",
              permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
            }
          : null;

        setUser(normalized);
        // console.log("USER NORMALIZED:", normalized);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔐 MASTER puede todo; acepta role string o role_id
  const hasPermission = (code) =>
    user?.role === "MASTER" || user?.role_id === 1 || !!user?.permissions?.includes(code);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
