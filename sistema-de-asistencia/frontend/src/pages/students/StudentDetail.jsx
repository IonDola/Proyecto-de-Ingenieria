import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import ActionModal from "../../components/ActionModal";
import "../../styles/student-ui.css";

import IconStudent from "../../assets/icons/student.svg";
import IconBack from "../../assets/icons/devolverse.png";
import IconProfile from "../../assets/icons/student_profiles.svg";
import IconHistory from "../../assets/icons/descripcion-general.svg";
import IconEdit from "../../assets/icons/edit.svg";
import IconNew from "../../assets/icons/new_doc.svg";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${id}/`)
      .then((r) => {
        if (!r.ok) return r.text().then(t => { throw new Error(t || `HTTP ${r.status}`); });
        return r.json();
      })
      .then(setS)
      .catch((e) => setErr(`No se pudo cargar el estudiante: ${e.message}`));
  }, [id]);

  const onCreated = () => navigate(`/students/profiles/${id}/history`);

  const iconList = [
    { id: 1, image: IconStudent, description: "Estudiantes" },
    { id: 2, image: IconProfile, description: "Perfiles" },
  ];

  return (
    <div className="page--students">
      <PageHead icons={iconList} />

      <main>
        <div className="tools">
          <Home />
          <Tool>
            <button className="page-tool" onClick={() => setShowActionModal(true)} title="Nueva acción">
              <img src={IconNew} alt="Nueva acción" className="w-icon" />
            </button>
          </Tool>
          <Tool>
            <Link to={`/students/profiles/${id}/edit`} title="Editar perfil" className="page-tool">
              <img src={IconEdit} alt="Editar" className="w-icon" />
            </Link>
          </Tool>
          <Tool>
            <Link to={`/students/profiles/${id}/history`} title="Ver historial" className="page-tool">
              <img src={IconHistory} alt="Historial" className="w-icon" />
            </Link>
          </Tool>
          <Tool>
            <Link to="/students/profiles" title="Volver al listado" className="page-tool">
              <img src={IconBack} alt="Volver" className="w-icon" />
            </Link>
          </Tool>
        </div>

        <div className="card">
          {err && <p className="error">{err}</p>}
          {!s && !err && <p>Cargando…</p>}
          {s && (
            <>
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

              <div className="section-header">Accesos rápidos</div>
              <div className="actions-inline">
                <button className="btn" onClick={() => setShowActionModal(true)}>Nueva acción</button>
                <Link className="btn ghost" to={`/students/profiles/${id}/edit`}>Editar perfil</Link>
                <Link className="btn ghost" to={`/students/profiles/${id}/history`}>Ver historial</Link>
                <Link className="btn ghost" to="/students/profiles">Volver</Link>
              </div>
            </>
          )}
        </div>
      </main>

      {showActionModal && (
        <ActionModal
          studentId={id}
          onClose={() => setShowActionModal(false)}
          onSuccess={onCreated}
        />
      )}
    </div>
  );
}
