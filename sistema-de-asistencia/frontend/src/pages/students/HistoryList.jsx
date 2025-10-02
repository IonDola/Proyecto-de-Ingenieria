import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Link, useParams } from "react-router-dom";

export default function HistoryList() {
  const { id } = useParams(); // student_id
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/students/${id}/history/`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "No se pudo cargar el historial" }));
  }, [id]);

  if (!data) return <Layout><p>Cargando…</p></Layout>;
  if (data.error) return <Layout><p className="error">{data.error}</p></Layout>;

  const { student, actions } = data;

  return (
    <Layout rightHeader={<div className="right-title"> Historial — {student.first_name} {student.last_name}</div>}>
      <div className="card">
        <div className="table">
          <div className="thead">
            <div className="th">Tipo</div>
            <div className="th">Fecha</div>
            <div className="th">Actor</div>
            <div className="th act"></div>
          </div>
          {actions.length === 0 && <div className="row empty">Sin acciones registradas</div>}
          {actions.map((a) => (
            <div className="row" key={a.id}>
              <div className="td">{a.type}</div>
              <div className="td">{new Date(a.created_at).toLocaleString()}</div>
              <div className="td">{a.actor || "—"}</div>
              <div className="td act">
                <Link className="icon-btn" to={`/actions/${a.id}`} title="Detalle">📄</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="actions-inline">
          <Link className="btn ghost" to={`/students/profiles/${student.id}`}> Volver</Link>
        </div>
      </div>
    </Layout>
  );
}
