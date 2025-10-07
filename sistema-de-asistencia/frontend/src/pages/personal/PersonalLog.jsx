import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "../../styles/main.css";
import "../../styles/personal-log.css";
import "../../styles/student-ui.css";

import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

// Si tienes un ícono propio para bitácora, cámbialo aquí
import StudentIcon from "../../assets/icons/student.svg";

const iconList = [
  { id: 1, image: StudentIcon, description: "Bitácora personal" },
];

const FALLBACK = [
  { id: "a1", timestamp: "2025-09-27T21:02:00Z", action: "Registrar ingreso", type: "Creación",  entity: "Estudiante: Cristina Alfaro", status: "Exitoso" },
  { id: "a2", timestamp: "2025-09-25T19:32:00Z", action: "Editar acción",     type: "Edición",   entity: "Estudiante: Jose Díaz",      status: "Exitoso" },
  { id: "a3", timestamp: "2025-09-25T18:26:00Z", action: "Eliminar acción",   type: "Eliminación",entity: "Estudiante: Melany Chaves",  status: "Fallido" },
  { id: "a4", timestamp: "2025-09-20T16:33:00Z", action: "Consultar historial",type:"Consulta",  entity: "Estudiante: Adriana Rojas",  status: "Exitoso" },
];

export default function PersonalLog() {
  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const [loading, setLoading] = useState(true);

  const columns = [
    { name: "Fecha/Hora", width: "200px" },
    { name: "Acción", width: "1fr" },
    { name: "Tipo", width: "160px" },
    { name: "Entidad", width: "1fr" },
    { name: "Estado", width: "130px" },
    { name: "", width: "120px" }, // export
  ];

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access") || "";
      const url = `/api/users/me/actions/${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      const r = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      const data = r.ok ? await r.json() : null;
      const list = Array.isArray(data) ? data : data?.results;
      setRows(list && list.length ? list : FALLBACK);
    } catch {
      setRows(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [q]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const n = q.toLowerCase();
    return rows.filter(r =>
      [r.timestamp, r.action, r.type, r.entity, r.status]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(n))
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
    a.href = url; a.download = `log_${row.id}.json`; a.click();
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

  const rowElements = filtered.length
    ? filtered.map((r) => (
        <div className="listable-row" key={r.id}>
          <div>
            {typeof r.timestamp === "string" && /\d{4}-\d{2}-\d{2}T/.test(r.timestamp)
              ? new Date(r.timestamp).toLocaleString()
              : r.timestamp}
          </div>
          <div>
            <Link to={`/personal/${r.id}`} className="link">{r.action}</Link>
          </div>
          <div>{r.type}</div>
          <div>{r.entity}</div>
          <div>{r.status}</div>
          <div>
            <button className="page-tool" title="Exportar" onClick={() => onExport(r)}>
              <img src="/icons/report.svg" alt="Exportar" className="w-icon" />
            </button>
          </div>
        </div>
      ))
    : [
        <div className="listable-row" key="empty">
          <div style={{ gridColumn: "1 / -1" }}>Sin acciones</div>
        </div>,
      ];

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
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
