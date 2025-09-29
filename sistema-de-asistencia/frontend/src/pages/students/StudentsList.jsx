import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Link, useSearchParams } from "react-router-dom";

export default function StudentsList() {
  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const load = () => {
    fetch(`/api/students/?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setRows(d.results || []))
      .catch(() => setRows([]));
  };

  useEffect(() => { load(); }, [q]);

  const onSearch = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSp({ q: fd.get("q") || "" });
  };

  return (
    <Layout>
      <div className="card">
        <form className="searchbar" onSubmit={onSearch}>
          <img className="big-ico" src="/icons/search.svg" alt="Buscar" />
          <input
            className="search-input"
            name="q"
            placeholder="Buscar por carnet o nombre"
            defaultValue={q}
          />
          <button className="btn" type="submit">Buscar</button>
          <Link className="btn ghost" to="/students/new">+ Nuevo</Link>
        </form>

        <div className="table">
          <div className="thead">
            <div className="th chk"></div>
            <div className="th">Carnet</div>
            <div className="th">Nombre</div>
            <div className="th act"></div>
          </div>

          {rows.length === 0 && <div className="row empty">Sin datos</div>}

          {rows.map((s) => (
            <div className="row" key={s.id}>
              <div className="td chk">
                <input type="checkbox" aria-label={`Seleccionar ${s.id_mep}`} />
              </div>
              <div className="td mono">{s.id_mep}</div>
              <div className="td">{s.last_name}, {s.first_name}</div>
              <div className="td act">
                <Link className="icon-btn" to={`/students/${s.id}`} title="Ver">
                  <img className="icon" src="/icons/student_profiles.svg" alt="Ver" />
                </Link>
                <Link className="icon-btn" to={`/students/${s.id}/edit`} title="Editar">
                  <img className="icon" src="/icons/edit.svg" alt="Editar" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
