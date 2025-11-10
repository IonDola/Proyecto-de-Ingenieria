import React, { useEffect, useState, useCallback, act } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import ActionModal from "../../components/ActionModal";
import Listable from "../../components/Listable";

import IconStudent from "../../assets/icons/student.svg";
import IconProfiles from "../../assets/icons/student_profiles.svg";
import IconHistory from "../../assets/icons/descripcion-general.svg";
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
      <div className="page--students">
        <PageHead icons={iconList} />
        <main>
          <div className="tools">
            <Home />
            <Tool>
              <button
                className="page-tool"
                onClick={() => navigate(`/students/profiles/${id}`)}
                title="Volver al perfil"
              >
                <img src={IconProfiles} alt="Volver" className="w-icon" />
              </button>
            </Tool>
          </div>
          <div className="card">
            <p className="error">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page--students">
        <PageHead icons={iconList} />
        <main>
          <div className="tools">
            <Home />
            <Tool>
              <button
                className="page-tool"
                onClick={() => navigate(`/students/profiles/${id}`)}
                title="Volver al perfil"
              >
                <img src={IconProfiles} alt="Volver" className="w-icon" />
              </button>
            </Tool>
          </div>
          <div className="card"><p>Cargando…</p></div>
        </main>
      </div>
    );
  }

  const { student, actions } = data;
  const columns = [
    { name: "Tipo", width: "100px" },
    { name: "Fecha", width: "200px" },
    { name: "Actor", width: "1fr" },
    { name: "Acciones", width: "150px" },
  ];

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool>
            <Link to={`/students/profiles/${student.id}`} title="Volver a perfil" className="page-tool">
              <img src={IconBack} alt="Volver a Perfil" className="w-icon" />
            </Link>
          </Tool>
        </div>
        {actions.length === 0 &&
          <div className="row empty">Sin acciones registradas</div>}
        {actions.length > 0 &&
          <Listable columns={columns}>
            {actions.map((a) => (
              <div className="listable-row" key={a.id}>
                <div>{a.type}</div>
                <div>{new Date(a.created_at).toLocaleString()}</div>
                <div>{a.actor || "—"}</div>
                <div>
                  <Link className="icon-btn2" to={`/actions/${a.id}`} title="Ver Detalle">
                    <img src={IconDetail} alt="Ver detalle" className="icon2" />
                  </Link>

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
          </Listable>}
      </main>
    </>
  )
}
