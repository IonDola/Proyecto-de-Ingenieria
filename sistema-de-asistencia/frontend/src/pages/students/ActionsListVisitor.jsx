import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/main.css";

import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Home from "../../components/VisitorHomeLink";

import StudentActions from "../../assets/icons/student_registers.svg";
import StudentIcon from "../../assets/icons/student.svg";
import StateIcon from "../../assets/icons/on_revision.svg";

export default function ActionsListVisitor() {
  const iconList = [
    { id: 1, image: StudentIcon, description: "Estudiantes" },
    { id: 2, image: StudentActions, description: "Acciones" },
  ];

  const columns = [
    { name: "", width: "100px" },   
    { name: "Estado", width: "220px" }, 
    { name: "Tipo", width: "200px" },  
    { name: "Fecha", width: "220px" },
    { name: "Carnet", width: "1fr" },
    { name: "Nombre", width: "2fr" },
    { name: "", width: "120px" },    
  ];

  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const t = sp.get("type") || "";

  const load = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (t) params.set("type", t);
    fetch(`/api/actions/?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setRows(d.results || []))
      .catch(() => setRows([]));
  };

  useEffect(() => { load(); }, [q, t]);

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const next = {};
    if (e.target.value) next.q = e.target.value;
    if (t) next.type = t;
    setSp(next);
  };

  const onFilterType = (e) => {
    const next = {};
    if (q) next.q = q;
    if (e.target.value) next.type = e.target.value;
    setSp(next);
  };

  const searchBox = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12 }}>
      <input
        className="search-box"
        type="search"
        name="q"
        placeholder="Buscar por carnet, nombre, actor o notas"
        defaultValue={q}
        onKeyDown={onSearch}
      />
      <select className="search-box" style={{ height: 60 }} value={t} onChange={onFilterType}>
        <option value="">Todos</option>
        <option value="ingreso">Ingreso</option>
        <option value="abandono">Abandono</option>
        <option value="transferencia">Transferencia</option>
        <option value="egreso">Egreso</option>
      </select>
    </div>
  );

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
        </div>

        <Listable columns={columns} searchBox={searchBox}>
          {rows.map((a) => (
            <div className="listable-row" key={a.id}>
              <div />

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={StateIcon}
                  id={a.on_revision ? "rev-yellow" : "rev-green"}
                  alt="Estado"
                  title={a.on_revision ? "En revisión" : "Revisado"}
                  className="action-icon"
                />
                <span>{a.on_revision ? "En revisión" : "Revisado"}</span>
              </div>

              <div>{a.type}</div>

              <div>{formatDateTime(a.created_at)}</div>

              <div className="mono">{a.student?.id_mep ?? "—"}</div>

              <div>{a.student ? `${a.student.first_name ?? ""} ${a.student.last_name ?? ""}`.trim() : "—"}</div>

              <div />
            </div>
          ))}
        </Listable>
      </main>
    </>
  );
}
