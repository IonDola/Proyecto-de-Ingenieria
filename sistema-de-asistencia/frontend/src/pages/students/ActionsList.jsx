import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/main.css";
import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import ActionModal from "../../components/ActionModal";
import Home from "../../components/HomeLink";

import Add from "../../assets/icons/new_doc.svg";
import MassRemove from "../../assets/icons/massive_delete.svg";
import ViewProfile from "../../assets/icons/descripcion-general.svg";
import StudentActions from "../../assets/icons/student_registers.svg";
import StudentIcon from "../../assets/icons/student.svg";
import StateIcon from "../../assets/icons/on_revision.svg";

export default function ActionsList() {
  const iconList = [
    { id: 1, image: StudentIcon, description: "Estudiantes" },
    { id: 2, image: StudentActions, description: "Acciones" },
  ];

  const columns = [
    { name: "", width: "100px" },         // checkbox
    { name: "Estado", width: "100px" },
    { name: "Tipo", width: "140px" },
    { name: "Fecha", width: "220px" },
    { name: "Carnet", width: "1fr" },
    { name: "Nombre", width: "2fr" },
    { name: "", width: "120px" },         // ver/editar/borrar
  ];

  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const t = sp.get("type") || ""; // filtro tipo
  const [selected, setSelected] = useState({});
  const [showCreate, setShowCreate] = useState(false);

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

  const toggleSel = (id, checked) => {
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const bulkDelete = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;
    if (!window.confirm(`¿Eliminar ${ids.length} acción(es)?`)) return;
    try {
      const r = await fetch("/api/actions/bulk-delete/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error al eliminar");
      setSelected({});
      load();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    }
  };

  const searchBox = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 200px" }}>
      <input
        className="search-box"
        type="search"
        name="q"
        placeholder="Buscar por carnet, nombre, actor o notas"
        defaultValue={q}
        onKeyDown={onSearch}
      />
      <select className="search-box" style={{ width: 160, height: 60 }} value={t} onChange={onFilterType}>
        <option value="">Todos</option>
        <option value="ingreso">Ingreso</option>
        <option value="abandono">Abandono</option>
        <option value="transferencia">Transferencia</option>
        <option value="egreso">Egreso</option>
      </select>
    </div>
  );

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool action={() => setShowCreate(true)}>
            <img src={Add} alt="Nueva acción" title="Nueva acción" className="w-icon" />
          </Tool>
          <Tool action={bulkDelete}>
            <img src={MassRemove} alt="Eliminar seleccionadas" className="w-icon" />
          </Tool>
        </div>

        <Listable columns={columns} searchBox={searchBox}>
          {rows.map((a) => (
            <div className="listable-row" key={a.id}>
              <div className="cb">
                <input type="checkbox" checked={!!selected[a.id]} onChange={(e) => toggleSel(a.id, e.target.checked)} />
              </div>
              <div><img src={StateIcon} id={a.on_revision ? "rev-yellow" : "rev-green"} alt="Estado" title={a.on_revision ? "En revisión" : "Revisado"} className="action-icon" /></div>
              <div>{a.type}</div>
              <div>{new Date(a.created_at).toLocaleString()}</div>
              <div className="mono">{a.student?.id_mep}</div>
              <div>{a.student ? `${a.student.first_name} ${a.student.surnames}` : "—"}</div>
              <div>
                <Link to={`/actions/enter/${a.id}`} target="_blank">
                  <button><img src={ViewProfile} alt="Detalle" className="w-icon action-icon" /></button>
                </Link>
              </div>
            </div>
          ))}
        </Listable>
      </main>

      {showCreate && (
        <ActionModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load(); }}
        />
      )}
    </>
  );
}
