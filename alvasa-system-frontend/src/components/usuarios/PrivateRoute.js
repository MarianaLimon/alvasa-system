import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

/**
 * Uso:
 * <PrivateRoute><Componente/></PrivateRoute>                 // solo requiere sesión
 * <PrivateRoute require="pagos_proveedores.write">...</PrivateRoute>  // además requiere permiso
 * <PrivateRoute requirePermission="cotizaciones.read">...</PrivateRoute> // alias compatible
 */
export default function PrivateRoute({ children, require, requirePermission }) {
  const { user, loading, hasPermission } = useContext(AuthContext);
  const location = useLocation();
  const needed = require ?? requirePermission; // soporta ambos nombres

  // Mientras carga el perfil, no renderizamos (podrías poner un spinner aquí)
  if (loading) return null;

  // No autenticado -> al login (guardando a dónde quería ir)
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Si se pide permiso granular y no lo tiene -> 403
  if (needed && !hasPermission(needed)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
