import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/main.css";

import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/VisitorHomeLink"

import StudentIcon from "../../assets/icons/student.svg";
import StudentProfile from "../../assets/icons/student_profiles.svg";
import ViewProfile from "../../assets/icons/descripcion-general.svg";

export default function StudentsListVisitor() {
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
        </div>

        <Listable columns={columns} searchBox={searchBox}>
          {rows.map((st) => (
            <div className="listable-row" key={st.id}>
              <div />
              <div>{st.id_mep}</div>
              <div>{`${st.first_name ?? ""} ${st.last_name ?? ""}`.trim()}</div>
              <div />
            </div>
          ))}
        </Listable>
      </main>
    </>
  );
}
