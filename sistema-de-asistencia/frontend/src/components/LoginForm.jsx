import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_LOGIN = "/api/auth/login/";

// para normalizar tokens
function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

async function tryRefreshWith(refresh) {
  const candidates = [
    { url: "/api/users/token/refresh/", body: { refresh } },
    { url: "/api/token/refresh/",      body: { refresh } },
    { url: "/api/auth/jwt/refresh/",   body: { refresh } },
    { url: "/api/users/token/refresh/", body: { refresh_token: refresh } },
    { url: "/api/token/refresh/",       body: { refresh_token: refresh } },
    { url: "/api/auth/jwt/refresh/",    body: { refresh_token: refresh } },
  ];
  for (const c of candidates) {
    try {
      const r = await fetch(c.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c.body),
      });
      const txt = await r.text();
      if (!r.ok) {
        console.warn("refresh falló:", c.url, r.status, txt);
        continue;
      }
      let data = {};
      try { data = JSON.parse(txt || "{}"); } catch {}
      const access = data.access || data.access_token;
      if (access) return access;
    } catch (e) {
      console.warn("refresh error:", e);
    }
  }
  return null;
}

async function normalizeAndStoreTokens(loginData) {
  let access  = loginData.access  || loginData.access_token  || loginData.jwt_access  || null;
  let refresh = loginData.refresh || loginData.refresh_token || loginData.jwt_refresh || null;
  const token = loginData.token   || loginData.jwt           || null;

  // si el backend devuelve token generico, decide por token_type
  if (!access && !refresh && token) {
    const d = decodeJwt(token);
    const tt = d?.token_type?.toLowerCase();
    if (tt === "access") access = token;
    else if (tt === "refresh") refresh = token;
    else access = token; // si no etiqueta, asumimos access
  }

  // si no hay access pero si refresh then obtener access con refresh
  if (!access && refresh) {
    const newAccess = await tryRefreshWith(refresh);
    if (newAccess) access = newAccess;
  }

  // guardar de forma estandarizada
  if (access)  localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);

  const decAcc = decodeJwt(localStorage.getItem("access") || "");
  if (decAcc?.token_type === "refresh") {
    localStorage.setItem("refresh", localStorage.getItem("access") || "");
    localStorage.removeItem("access");
  }

  ["token","jwt","jwt_access","jwt_refresh","access_token","refresh_token"] // limpiar
    .forEach(k => localStorage.removeItem(k));
}

export default function LoginForm() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { alert("Favor indicar un nombre de usuario"); return; }
    if (!password) { alert("Favor ingresar la contraseña"); return; }

    try {
      setBusy(true);
      const r = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const ct = (r.headers.get("content-type") || "").toLowerCase();
      const text = await r.text();
      let data = null;
      if (ct.includes("application/json")) { try { data = JSON.parse(text); } catch {} }

      if (!r.ok) {
        alert(data?.error || `Error de autenticación (HTTP ${r.status})`);
        return;
      }

      const nombre = (data?.nombre || username);
      const rol    = (data?.rol || "admin");

      await normalizeAndStoreTokens(data || {});

      localStorage.setItem("userName", nombre);
      localStorage.setItem("role", rol);

      const role = (data?.rol || data?.role || "ADMIN").toUpperCase();
      localStorage.setItem("role", role);

      // redirección según rol
      if (role === "VISITOR") {
        nav("/home/visitor", { replace: true });
      } else {
        nav("/home", { replace: true });
      }
    } catch (e) {
      console.error(e);
      alert("Error al conectar con el servidor");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          placeholder="Nombre de Usuario"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button className="login-button" type="submit" disabled={busy}>
          {busy ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </div>
    </form>
  );
}
