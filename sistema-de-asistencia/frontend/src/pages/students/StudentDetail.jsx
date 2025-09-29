import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Link, useParams } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/students/${id}/`)
      .then((r) => r.json())
      .then(setS)
      .catch(() => setErr("No se pudo cargar el estudiante"));
  }, [id]);

  const Title = () =>
    s ? <div className="right-title"> {s.first_name} {s.last_name}</div> : null;

  if (err) {
    return (
      <Layout>
        <p className="error">{err}</p>
      </Layout>
    );
  }
  if (!s) {
    return (
      <Layout>
        <p>Cargando…</p>
      </Layout>
    );
  }

  return (
    <Layout rightHeader={<Title />}>
      <div className="card">
        <div className="section-header">Información</div>
        <div className="grid">
          <div className="cell label">Carnet</div>
          <div className="cell value mono">{s.id_mep}</div>

          <div className="cell label">Nombre</div>
          <div className="cell value">{s.first_name}</div>

          <div className="cell label">Apellidos</div>
          <div className="cell value">{s.last_name}</div>

          <div className="cell label">Sección</div>
          <div className="cell value">{s.section || "—"}</div>

          <div className="cell label">Activo</div>
          <div className="cell value">{s.active ? "Sí" : "No"}</div>
        </div>

        <div className="section-header">Acciones</div>
        <div className="actions-inline">
          <Link className="btn" to={`/students/${s.id}/edit`}> Editar</Link>
          <Link className="btn ghost" to={`/students/${s.id}/history`}> Ver historial</Link>
          <Link className="btn ghost" to="/students">↩ Volver</Link>
        </div>
      </div>
    </Layout>
  );
}
