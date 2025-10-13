import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import ActionModal from "../../components/ActionModal";

import IconStudent from "../../assets/icons/student.svg";
import IconProfiles from "../../assets/icons/student_profiles.svg";
import IconHistory from "../../assets/icons/descripcion-general.svg";
import IconNew from "../../assets/icons/new_doc.svg";
import IconDetail from "../../assets/icons/student_registers.svg";
import IconEdit from "../../assets/icons/edit.svg";
import IconDelete from "../../assets/icons/massive_delete.svg";
import IconBack from "../../assets/icons/devolverse.png";

export default function HistoryList() {
  const { id } = useParams();            // student_id
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editAction, setEditAction] = useState(null); // para modal de edición
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetch(`/api/students/${id}/history/`)
      .then(async (r) => {
        const ct = (r.headers.get("content-type") || "").toLowerCase();
        const text = await r.text();
        if (!ct.includes("application/json")) throw new Error(text || `HTTP ${r.status}`);
        const json = JSON.parse(text);
        if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
        return json;
      })
      .then(setData)
      .catch((e) => {
        setError(e.message || "No se pudo cargar el historial");
        setData(null);
      });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const doDelete = async (actionId) => {
    const ok = window.confirm("¿Eliminar esta acción? Esta operación no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`/api/actions/${actionId}/delete/`, { method: "DELETE" });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "Error al eliminar");
      }
      load(); // recargar lista
    } catch (e) {
      alert(e.message || "Error eliminando acción");
    }
  };

  const iconList = [
    { id: 1, image: IconStudent, description: "Estudiantes" },
    { id: 2, image: IconProfiles, description: "Perfiles" },
    { id: 3, image: IconHistory, description: "Historial" },
  ];

  if (error) {
    return (
      <Layout noSidebar={true} rightHeader={<div className="right-title">Historial</div>}>
        <div className="page--students">
          <PageHead icons={iconList} />
          <main>
            <div className="tools">
              <Home />
              <Tool>
                <button className="page-tool" onClick={() => navigate(`/students/profiles/${id}`)} title="Volver al perfil">
                  <img src={IconProfiles} alt="Volver" className="w-icon" />
                </button>
              </Tool>
            </div>
            <div className="card">
              <p className="error">{error}</p>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout noSidebar={true} rightHeader={<div className="right-title">Historial</div>}>
        <div className="page--students">
          <PageHead icons={iconList} />
          <main>
            <div className="tools">
              <Home />
              <Tool>
                <button className="page-tool" onClick={() => navigate(`/students/profiles/${id}`)} title="Volver al perfil">
                  <img src={IconProfiles} alt="Volver" className="w-icon" />
                </button>
              </Tool>
            </div>
            <div className="card"><p>Cargando…</p></div>
          </main>
        </div>
      </Layout>
    );
  }

  const { student, actions } = data;

  return (
    <Layout
      noSidebar={true}
      rightHeader={<div className="right-title">Historial — {student.first_name} {student.last_name}</div>}
    >
      <div className="page--students">
        <PageHead icons={iconList} />

        <main>
          {/* Toolbar superior, horizontal */}
          <div className="tools">
            <Home />
            <Tool>
              <button
                className="page-tool"
                onClick={() => setEditAction({ student: student.id, type: "ENTER" })}
                title="Nueva acción"
              >
                <img src={IconNew} alt="Nueva acción" className="w-icon" />
              </button>
            </Tool>
            <Tool>
              <button
                className="page-tool"
                onClick={() => navigate(`/students/profiles/${student.id}`)}
                title="Volver al perfil"
              >
                <img src={IconBack} alt="Volver" className="w-icon" />
              </button>
            </Tool>
          </div>

          <div className="card">
            <div className="section-header">Historial de acciones</div>

            <div className="table history">
              <div className="thead" role="rowgroup">
                <div className="th">Tipo</div>
                <div className="th">Fecha</div>
                <div className="th">Actor</div>
                <div className="th act">Acciones</div>
              </div>

              {actions.length === 0 && <div className="row empty">Sin acciones registradas</div>}

              {actions.map((a) => (
                <div className="row" key={a.id}>
                  <div className="td">{a.type}</div>
                  <div className="td">{new Date(a.created_at).toLocaleString()}</div>
                  <div className="td">{a.actor || "—"}</div>
                  <div className="td act">
                    {/* Detalle */}
                    <Link className="icon-btn2" to={`/actions/${a.id}`} title="Detalle">
                      <img src={IconDetail} alt="Ver detalle" className="icon2" />
                    </Link>

                    {/* Editar */}
                    <button
                      className="icon-btn2"
                      title="Editar"
                      onClick={() => setEditAction(a)}
                      aria-label="Editar acción"
                    >
                      <img src={IconEdit} alt="" aria-hidden="true" className="icon2" />
                    </button>

                    {/* Eliminar */}
                    <button
                      className="icon-btn2"
                      title="Eliminar"
                      onClick={() => doDelete(a.id)}
                      aria-label="Eliminar acción"
                    >
                      <img src={IconDelete} alt="" aria-hidden="true" className="icon2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions-inline">
              <Link className="btn ghost" to={`/students/profiles/${student.id}`}>Volver</Link>
            </div>
          </div>
        </main>
      </div>

      {editAction && (
        <ActionModal
          studentId={student.id}
          initial={editAction}
          onClose={() => setEditAction(null)}
          onSuccess={() => { setEditAction(null); load(); }}
        />
      )}
    </Layout>
  );
}
