import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import { Link, useParams } from "react-router-dom";
import ActionModal from "../../components/ActionModal";
import IconDetail from "../../assets/icons/student_registers.svg";
import IconEdit from "../../assets/icons/edit.svg";
import IconDelete from "../../assets/icons/massive_delete.svg";

export default function HistoryList() {
  const { id } = useParams(); // student_id
  const [data, setData] = useState(null);
  const [editAction, setEditAction] = useState(null); // para modal de edición

  const load = useCallback(() => {
    fetch(`/api/students/${id}/history/`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "No se pudo cargar el historial" }));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!data) return <Layout><p>Cargando…</p></Layout>;
  if (data.error) return <Layout><p className="error">{data.error}</p></Layout>;

  const { student, actions } = data;

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

  return (
    <Layout rightHeader={<div className="right-title"> Historial — {student.first_name} {student.last_name}</div>}>
      <div className="card">
        <div className="table history">
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
          <Link className="btn ghost" to={`/students/profiles/${student.id}`}> Volver</Link>
        </div>
      </div>

      {editAction && (
        <ActionModal
          studentId={student.id}
          initial={editAction}
          onClose={() => setEditAction(null)}
          onSuccess={() => { setEditAction(null); load(); }} // recarga luego de editar
        />
      )}
    </Layout>
  );
}
