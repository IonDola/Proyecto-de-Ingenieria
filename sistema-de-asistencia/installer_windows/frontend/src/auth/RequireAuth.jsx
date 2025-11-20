import { Navigate, useLocation } from "react-router-dom";

/**
 * Pequeño guard de rutas.
 * - Valida la presencia de un token en localStorage ("access")
 * - (Opcional) valida expiracion si el token es JWT
 * - (Opcional) valida rol si pasas requiredRole
 *
 * Uso:
 * <Route path="/personal" element={<RequireAuth><PersonalLog/></RequireAuth>} />
 * <Route path="/admin" element={<RequireAuth requiredRole="admin"><Admin/></RequireAuth>} />
 */

function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json || null;
  } catch {
    return null;
  }
}

function isExpiredJwt(token) {
  const p = parseJwt(token);
  if (!p || !p.exp) return false; // si no podemos validar exp, no bloqueamos
  // exp viene en segundos desde epoch
  const nowSec = Math.floor(Date.now() / 1000);
  return p.exp <= nowSec;
}

export default function RequireAuth({ children, requiredRole }) {
  const location = useLocation();

  // TODO: si prefieres otro storage/clave, cambiar aca
  const token = localStorage.getItem("access") || "";

  const hasToken = !!token && !isExpiredJwt(token);

  const roleFromStorage = localStorage.getItem("role") || "";
  const roleFromJwt = (() => {
    const p = parseJwt(token);
    return (p && (p.role || p.rol)) || "";
  })();
  const effectiveRole = roleFromStorage || roleFromJwt;

  const roleOk = !requiredRole || (effectiveRole && effectiveRole === requiredRole);

  if (!hasToken || !roleOk) {
    // Redirige a /login y recuerda a donde queria ir
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
