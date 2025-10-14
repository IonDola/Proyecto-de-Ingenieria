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

export default function PersonalLog() {
  const iconList = [
    { id: 1, image: IconRegisters, description: "Bitácora personal" },
  ];

  const columns = [
    { name: "Fecha/Hora", width: "210px" },
    { name: "Acción", width: "1fr" },
    { name: "Tipo", width: "160px" },
    { name: "Entidad", width: "1fr" },
    { name: "Estado", width: "130px" },
    { name: "", width: "110px" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const load = async () => {
    try {
      setLoading(true);

      // tomamos el token guardado por el login (acepta "access" o "token" por si acaso)
      const token = localStorage.getItem("access") || localStorage.getItem("token") || "";

      const r = await fetch(`/api/users/me/actions/?q=${encodeURIComponent(q)}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      // si no está autenticado, dejamos vacío 
      if (!r.ok) {
        setRows([]);
        return;
      }

      const ct = (r.headers.get("content-type") || "").toLowerCase();
      const text = await r.text();
      if (!ct.includes("application/json")) throw new Error(`HTTP ${r.status}: respuesta no-JSON`);
      const data = JSON.parse(text);
      setRows(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setRows([]);
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
              <img src={IconDownload} alt="Exportar" className="w-icon" />
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
