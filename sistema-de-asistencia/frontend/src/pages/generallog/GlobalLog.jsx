import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "../../styles/main.css";
import "../../styles/personal-log.css";
import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

import IconLogs from "../../assets/icons/log.svg";
import IconDownload from "../../assets/icons/downloadd.png";
import Reporte from "../../assets/icons/report.svg"

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
    { url: "/api/token/refresh/", body: { refresh } },
    { url: "/api/auth/jwt/refresh/", body: { refresh } },
  ];
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c.body),
      });
      const text = await res.text();
      if (!res.ok) continue;
      let data = {};
      try {
        data = JSON.parse(text || "{}");
      } catch {}
      const newAccess = data.access || data.access_token || null;
      if (newAccess) {
        localStorage.setItem("access", newAccess);
        return newAccess;
      }
    } catch (e) {
      console.warn(`Refresh exception en ${c.url}:`, e);
    }
  }
  return null;
}

export default function GlobalLogs() {
  const iconList = [
    { id: 1, image: IconLogs, description: "Bitácora General" },
  ];

  const columns = [
    { name: "Fecha/Hora", width: "minmax(160px, 0.9fr)" },
    { name: "Usuario",    width: "minmax(140px, 0.9fr)" },
    { name: "Acción",     width: "1.1fr" },
    { name: "Tipo",       width: "minmax(120px, 0.8fr)" },
    { name: "Entidad",    width: "minmax(180px, 1.3fr)" },
    { name: "Estado",     width: "minmax(100px, 0.6fr)" },
    { name: "",           width: "minmax(72px, 0.4fr)" },
];


  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const dateFrom = sp.get("date_from") || "";
  const dateTo = sp.get("date_to") || "";
  const actionFilter = sp.get("action") || "";
  const typeFilter = sp.get("type") || "";

  const load = async (allowRetry = true) => {
    try {
      setLoading(true);
      setErrorMsg("");

      let access = readAccessToken();
      if (access) {
        const dec = decodeJwt(access);
        if (dec?.token_type?.toLowerCase() === "refresh") {
          localStorage.setItem("refresh", access);
          localStorage.removeItem("access");
          access = "";
        }
      }

      if (!access && allowRetry && readRefreshToken()) {
        const newAccess = await flexibleRefresh();
        if (newAccess) access = newAccess;
      }

      // Construir query params
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (actionFilter) params.set("action", actionFilter);
      if (typeFilter) params.set("type", typeFilter);
      params.set("page_size", "50");

      const url = `/api/logs/?${params.toString()}`;
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
        if (
          r.status === 401 &&
          allowRetry &&
          text &&
          text.includes("token_not_valid")
        ) {
          const newAccess = await flexibleRefresh();
          if (newAccess) return await load(false);
        }
        console.error("Bitácora general error:", r.status, text);
        setRows([]);
        setErrorMsg(
          r.status === 401 || r.status === 403
            ? "No autorizado. Solo Admin/Dev pueden acceder a la bitácora general."
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
      const results = Array.isArray(data) ? data : data.results || [];

      results.sort((a, b) => {
        const ta = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });

      setRows(results);
    } catch (e) {
      console.error("Error cargando bitácora general:", e);
      setRows([]);
      setErrorMsg("Error de red cargando la bitácora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dateFrom, dateTo, actionFilter, typeFilter]);

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const newParams = {};
    if (e.target.value) newParams.q = e.target.value;
    if (dateFrom) newParams.date_from = dateFrom;
    if (dateTo) newParams.date_to = dateTo;
    if (actionFilter) newParams.action = actionFilter;
    if (typeFilter) newParams.type = typeFilter;
    setSp(newParams);
  };

  const onExport = (row) => {
    const blob = new Blob([JSON.stringify(row, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log_${row.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchBox = (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        className="search-box"
        type="search"
        name="q"
        placeholder="Buscar (acción, tipo, entidad, usuario)"
        defaultValue={q}
        onKeyDown={onSearch}
        style={{ flex: 1 }}
      />
      <input
        type="date"
        className="search-box"
        placeholder="Desde"
        value={dateFrom}
        onChange={(e) => {
          const newParams = { q, date_from: e.target.value };
          if (dateTo) newParams.date_to = dateTo;
          if (actionFilter) newParams.action = actionFilter;
          if (typeFilter) newParams.type = typeFilter;
          setSp(newParams);
        }}
        style={{ width: "160px" }}
      />
      <input
        type="date"
        className="search-box"
        placeholder="Hasta"
        value={dateTo}
        onChange={(e) => {
          const newParams = { q, date_to: e.target.value };
          if (dateFrom) newParams.date_from = dateFrom;
          if (actionFilter) newParams.action = actionFilter;
          if (typeFilter) newParams.type = typeFilter;
          setSp(newParams);
        }}
        style={{ width: "160px" }}
      />
    </div>
  );

  const rowElements =
    rows.length > 0
      ? rows.map((r) => (
          <div className="listable-row" key={r.id}>
            <div>
              {typeof r.timestamp === "string" && /\d{4}-\d{2}-\d{2}T/.test(r.timestamp)
                ? new Date(r.timestamp).toLocaleString()
                : r.timestamp}
            </div>
            <div>
              {r.user?.full_name || r.user?.username || "—"}
              <br />
              <small style={{ opacity: 0.7 }}>
                {r.user?.role ? `(${r.user.role})` : ""}
              </small>
            </div>
            <div>
              <Link to={`/logs/${r.id}`} className="link">
                {r.action}
              </Link>
            </div>
            <div>{r.type}</div>
            <div>{r.entity}</div>
            <div>{r.status}</div>
            <div>
              <button
                className="page-tool"
                title="Exportar"
                onClick={() => onExport(r)}
              >
                <img src={IconDownload} alt="Exportar" className="w-icon" />
              </button>
            </div>
          </div>
        ))
      : [
          <div className="listable-row" key="empty">
            <div style={{ gridColumn: "1 / -1" }}>
              {errorMsg ? errorMsg : "Sin eventos"}
            </div>
          </div>,
        ];

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool key={"Tool-stats"}>
            <Link to="/logs/stats" title="Estadísticas">
              <img src={Reporte} alt="" className="w-icon" />
            </Link>
          </Tool>
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