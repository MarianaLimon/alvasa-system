import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

/**
 * Uso:
 * <PrivateRoute> <Componente/> </PrivateRoute> // solo requiere sesión
 * <PrivateRoute require="pagos_proveedores.write"> ... </PrivateRoute>  // además requiere permiso
 */
export default function PrivateRoute({ children, require }) {
  const { user, loading, hasPermission } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null; // aquí puedes renderizar un spinner si prefieres

  // No autenticado -> al login, guardando a dónde quería ir
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Si se pide permiso granular y no lo tiene -> 403
  if (require && !hasPermission(require)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}