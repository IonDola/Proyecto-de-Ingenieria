import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/main.css";

import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink"

import StudentIcon from "../../assets/icons/student.svg";
import StudentProfile from "../../assets/icons/student_profiles.svg";
import ViewProfile from "../../assets/icons/descripcion-general.svg";
import Add from "../../assets/icons/new_person.svg";
import MassRemove from "../../assets/icons/massive_delete.svg";

export default function StudentsList() {
  const iconList = [
    { id: 1, image: StudentIcon, description: "Estudiantes" },
    { id: 2, image: StudentProfile, description: "Perfiles" },
  ];

  const columns = [
    { name: "", width: "100px" },
    { name: "Carnet", width: "1fr" },
    { name: "Nombre", width: "1fr" },
    { name: "", width: "100px" },
  ];

  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const [selected, setSelected] = useState({});
  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const load = () => {
    fetch(`/api/students/?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.results || []);
        // limpiar selección de los que ya no están en pantalla
        setSelected((prev) => {
          const next = {};
          (d.results || []).forEach((s) => { if (prev[s.id]) next[s.id] = true; });
          return next;
        });
      })
      .catch(() => setRows([]));
  };

  useEffect(() => { load(); }, [q]);

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setSp({ q: e.target.value || "" });
  };

  const toggleSel = (id, checked) => {
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const bulkDelete = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;
    if (!window.confirm(`¿Eliminar ${ids.length} estudiante(s)? Se eliminarán también sus acciones.`)) return;
    try {
      const r = await fetch("/api/students/bulk-delete/", {
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
    <input
      className="search-box"
      type="search"
      name="q"
      placeholder="Buscar por carnet o nombre"
      defaultValue={q}
      onKeyDown={onSearch}
    />
  );

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool key={"Tool" + 2}>
            <Link to="/students/profiles/new" target="_blank">
              <img src={Add} alt="Añadir estudiante" title="Añadir estudiante" className="w-icon" />
            </Link>
          </Tool>
          <Tool key={"Tool" + 3}>
            <button className="page-tool" onClick={bulkDelete} disabled={!anySelected} title="Remover seleccionados">
              <img src={MassRemove} alt="Remover múltiples registros" className="w-icon" />
            </button>
          </Tool>
        </div>

        <Listable columns={columns} searchBox={searchBox}>
          {rows.map((st) => (
            <div className="listable-row" key={st.id}>
              <div className="cb">
                <input
                  type="checkbox"
                  checked={!!selected[st.id]}
                  onChange={(e) => toggleSel(st.id, e.target.checked)}
                />
              </div>
              <div>{st.id_mep}</div>
              <div>{st.first_name + " " + st.last_name}</div>
              <Link to={`/students/profiles/${st.id}`} target="_blank">
                <button><img src={ViewProfile} alt="Ver perfil" className="w-icon" /></button>
              </Link>
            </div>
          ))}
        </Listable>
      </main>
    </>
  );
}
