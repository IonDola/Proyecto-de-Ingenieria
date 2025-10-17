import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_LOGIN = "/api/auth/login/";

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
      if (ct.includes("application/json")) { try { data = JSON.parse(text); } catch { } }

      if (!r.ok) {
        alert(data?.error || `Error de autenticación (HTTP ${r.status})`);
        return;
      }

      // backend devuelve { token, nombre, rol }
      const token = data?.refresh;
      const nombre = data?.nombre || username;
      const rol = data?.rol || "admin";

      if (!token) {
        alert("Respuesta inválida del servidor (sin token)");
        return;
      }

      localStorage.setItem("access", token);
      localStorage.setItem("userName", nombre);
      localStorage.setItem("role", rol);

      nav("/home", { replace: true });
    } catch {
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
