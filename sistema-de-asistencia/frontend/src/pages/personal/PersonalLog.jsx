import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "../../styles/main.css";
import "../../styles/personal-log.css";
import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

import IconRegisters from "../../assets/icons/student_registers.svg";
import IconDownload from "../../assets/icons/downloadd.png";

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function readAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("jwt_access") ||
    localStorage.getItem("access_token") ||
    ""
  );
}
function readRefreshToken() {
  return (
    localStorage.getItem("refresh") ||
    localStorage.getItem("jwt_refresh") ||
    localStorage.getItem("refresh_token") ||
    ""
  );
}

async function flexibleRefresh() {
  const refresh = readRefreshToken();
  if (!refresh) {
    console.warn("No hay refresh token en localStorage");
    return null;
  }
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
      const res = await fetch(c.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c.body),
      });
      const text = await res.text();
      if (!res.ok) {
        console.warn(`Refresh falló en ${c.url}:`, res.status, text);
        continue;
      }
      let data = {};
      try { data = JSON.parse(text || "{}"); } catch {}
      const newAccess = data.access || data.access_token || null;
      if (newAccess) {
        localStorage.setItem("access", newAccess);
        console.info(`Refresh OK via ${c.url}`);
        return newAccess;
      }
      console.warn(`Refresh en ${c.url} respondió sin access:`, data);
    } catch (e) {
      console.warn(`Refresh exception en ${c.url}:`, e);
    }
  }
  return null;
}

export default function PersonalLog() {
  const iconList = [{ id: 1, image: IconRegisters, description: "Bitácora personal" }];
  const columns = [
    { name: "Fecha/Hora", width: "0.8fr" },
    { name: "Acción", width: "1fr" },
    { name: "Tipo", width: "0.7fr" },
    { name: "Entidad", width: "1.2fr" },
    { name: "Estado", width: "0.6fr" },
    { name: "", width: "0.4fr" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const load = async (allowRetry = true) => {
    try {
      setLoading(true);
      setErrorMsg("");

      let access = readAccessToken();
      if (access) {
        const dec = decodeJwt(access);
        if (dec?.token_type?.toLowerCase() === "refresh") {
          console.warn("'access' contiene un refresh; normalizando -> move to 'refresh'");
          localStorage.setItem("refresh", access);
          localStorage.removeItem("access");
          access = "";
        }
      }

      if (!access && allowRetry && readRefreshToken()) {
        const newAccess = await flexibleRefresh();
        if (newAccess) access = newAccess;
      }

      const url = `/api/users/me/actions/?ordering=-timestamp&page_size=50&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        credentials: "include",
      });

      const text = await r.text();
      const ct = (r.headers.get("content-type") || "").toLowerCase();

      if (!r.ok) {
        if (r.status === 401 && allowRetry && text && text.includes("token_not_valid")) {
          console.warn("access token inválido, intentando refresh…");
          const newAccess = await flexibleRefresh();
          if (newAccess) return await load(false);
        }
        console.error("Bitácora error:", r.status, text);
        setRows([]);
        setErrorMsg(
          r.status === 401 || r.status === 403
            ? "No autorizado. Inicia sesión para ver tu bitácora."
            : `No se pudo cargar la bitácora (HTTP ${r.status}).`
        );
        return;
      }

      if (!ct.includes("application/json")) {
        console.error("Respuesta no JSON:", text);
        setRows([]);
        setErrorMsg("Respuesta inesperada del servidor.");
        return;
      }

      const data = JSON.parse(text || "{}");
      const results = Array.isArray(data) ? data : (data.results || []);

      results.sort((a, b) => {
        const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta; // descendente: mas reciente primero
      });

      setRows(results);
    } catch (e) {
      console.error("Error cargando bitácora:", e);
      setRows([]);
      setErrorMsg("Error de red cargando la bitácora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const n = q.toLowerCase();
    return rows.filter((r) =>
      [r.timestamp, r.action, r.type, r.entity, r.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(n))
    );
  }, [rows, q]);

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setSp({ q: e.target.value || "" });
  };

  const onExport = (row) => {
    const blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log_${row.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchBox = (
    <input
      className="search-box"
      type="search"
      name="q"
      placeholder="Buscar en bitácora (acción, tipo, entidad, estado)"
      defaultValue={q}
      onKeyDown={onSearch}
    />
  );

  const rowElements =
    filtered.length > 0
      ? filtered.map((r) => (
          <div className="listable-row" key={r.id}>
            <div>
              {typeof r.timestamp === "string" && /\d{4}-\d{2}-\d{2}T/.test(r.timestamp)
                ? new Date(r.timestamp).toLocaleString()
                : r.timestamp}
            </div>
            <div>
              <Link to={`/personal/${r.id}`} className="link">
                {r.action}
              </Link>
            </div>
            <div>{r.type}</div>
            <div>{r.entity}</div>
            <div>{r.status}</div>
            <div>
              <button className="page-tool" title="Exportar" onClick={() => onExport(r)}>
                <img src={IconDownload} alt="Exportar" className="w-icon" />
              </button>
            </div>
          </div>
        ))
      : [
          <div className="listable-row" key="empty">
            <div style={{ gridColumn: "1 / -1" }}>
              {errorMsg ? errorMsg : "Sin acciones"}
            </div>
          </div>,
        ];

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool key={"Tool-search"}> </Tool>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 12, marginRight: 25 }}>
            <em>Cargando…</em>
          </div>
        ) : (
          <Listable columns={columns} searchBox={searchBox}>
            {rowElements}
          </Listable>
        )}
      </main>
    </>
  );
}
