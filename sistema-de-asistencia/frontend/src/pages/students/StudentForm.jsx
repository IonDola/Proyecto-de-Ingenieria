import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/register-style.css";

import ActionModal from "../../components/ActionModal";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead";
import { FormatStudentRegister } from "../../components/GUIFormats";
import { FormatStudentForDB } from "../../components/SystemFormats";

import saveIcon from "../../assets/icons/save_changes.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
import IconBack from "../../assets/icons/devolverse.png";
import IconProfile from "../../assets/icons/student_profiles.svg";
import IconHistory from "../../assets/icons/report.svg";
import IconEdit from "../../assets/icons/edit.svg";
import IconNew from "../../assets/icons/new_doc.svg";

const StudentForm = ({ }) => {
  const iconList = [
    { id: 1, image: IconProfile, description: "Perfiles" },
  ];
  const { id } = useParams();
  const guestView = false; // TODO: detectar cuando es visitante
  const isNew = !Boolean(id) && !guestView;
  const [onEdition, setOnEdition] = useState(Boolean(isNew));
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [std, setS] = useState(null);
  const navigate = useNavigate();
  const [showActionModal, setShowActionModal] = useState(false);
  const [formData, setFormData] = useState({
    student: {},
    carnet: " ",
    legal_guardians: {},
    name: " Cargando... ",
  });
  // Carga del Estudiante
  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}/`)
      .then((r) => {
        if (!r.ok) return r.text().then(t => { throw new Error(t || `HTTP ${r.status}`); });
        return r.json();
      })
      .then(setS)
      .catch((e) => setErr(`No se pudo cargar el estudiante: ${e.message}`));
  }, [id]);
  useEffect(() => {
    if (std == null && id) return;
    const stData = FormatStudentRegister({ student: std, withCarnet: true });
    setFormData({
      student: stData.student,
      carnet: stData.carnet,
      legal_guardians: stData.legal_guardians,
      name: stData.name,
    });
  }, [std]);

  const switchActionModal = () => {
    setShowActionModal(!showActionModal);
  };

  // Alternar edición
  const toggleEdit = () => {
    if (guestView) return;
    if (onEdition) {
      // resetear datos previos
      const stData = FormatStudentRegister({ student: std, withCarnet: true });
      setFormData({
        student: stData.student || {},
        legal_guardians: stData.legal_guardians || {},
        name: stData.name || " *Nuevo Estudiante* ",
      });
    }
    if (!isNew)
      setOnEdition((prev) => !prev)

  };

  const onCreated = () => navigate(`/students/profiles/${id}/history`);

  const handleChange = (section, key, event) => {
    const { value } = event.target;
    setFormData((prev) => {
      return {
        ...prev,
        [section]: { ...prev[section], [key]: value },
      };
    });
  };

  // Guardar
  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    const method = !isNew ? "PATCH" : "POST";
    const url = !isNew ? `/api/students/${id}/update/` : `/api/students/new/`;
    const body = FormatStudentForDB(formData, true);
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (r) =>
        (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((data) => {
        if (isNew) {
          setMsg("Estudiante creado con éxito");
          navigate(`/students/profiles/${data.id}`);
          window.location.reload(true);
        } else {
          setMsg("Cambios guardados con éxito");
          setOnEdition(false);
          window.location.reload(true);
        }
      })
      .catch((err) => setMsg(err?.error || "Error al guardar los cambios"));
  }

  const baseTools = (
    <>
      <Tool action={switchActionModal}>
        <img src={IconNew} alt="Nueva acción" className="w-icon" />
      </Tool>
      <Tool action={toggleEdit}>
        <img src={IconEdit} alt="Editar" className="w-icon" />
      </Tool>
      <Tool>
        <Link to={`/students/profiles/${id}/history`} title="Ver historial" className="page-tool">
          <img src={IconHistory} alt="Historial" className="w-icon" />
        </Link>
      </Tool>
      {/* Botón marcar como revisado */}
    </>
  );

  let sideTools = baseTools;
  if (onEdition && !isNew) {
    sideTools = (
      <>
        {/* Botones de acción */}
        <Tool action={handleSubmit} type={"submit"}>
          <img src={saveIcon} alt="Guardar" title="Guardar" className="w-icon" />
        </Tool>
        <Tool action={toggleEdit}>
          <img src={cancelIcon} alt="Cancelar" title="Cancelar" className="w-icon" />
        </Tool>
      </>
    );
  }
  if (isNew) {
    sideTools = (
      <>
        {/* Botones de acción */}
        <Tool action={handleSubmit} type={"submit"}>
          <img src={saveIcon} alt="Guardar" title="Guardar" className="w-icon" />
        </Tool >
        <Tool action={toggleEdit}>
          <img src={cancelIcon} alt="Cancelar" title="Cancelar" className="w-icon" />
        </Tool>
      </>
    );
  }
  if (guestView) {
    sideTools = (<></>);
  }
  return (
    <>
      <PageHead icons={iconList} name={formData.name} />
      <main>
        <div className="tools">
          <Home />
          <Tool>
            <Link to="/students/profiles" title="Volver al listado" className="page-tool">
              <img src={IconBack} alt="Volver" className="w-icon" />
            </Link>
          </Tool>
          {sideTools}

        </div>

        <form id="register" onSubmit={handleSubmit}>
          <div id="st-table">
            <div className="st-h">
              <p>Estudiante</p>
            </div>
            <div>
              {Object.keys(formData.student).map((key) => {
                const rawValue = formData.student[key];
                const isDateField = key.toLowerCase().includes("fecha");
                // value seguro para pasar a <input>
                return (
                  <div className="st-data" key={key}>
                    <label>{key}</label>
                    <input
                      type={!isDateField ? "text" : "date"}
                      value={rawValue}
                      readOnly={!onEdition}
                      onChange={(e) => {
                        handleChange("student", key, e);
                      }}
                      className={onEdition ? "editing" : ""}
                    />
                  </div>
                );
              })}
            </div>

            <div className="st-h">
              <p>Encargados Legales</p>
            </div>
            <div>
              {Object.keys(formData.legal_guardians).map((key) => {
                const value = formData.legal_guardians[key] ?? "";
                return (
                  <div className="st-data" key={key}>
                    <label>{key}</label>
                    <input
                      type={"test"}
                      value={value}
                      readOnly={!onEdition}
                      onChange={(e) => {
                        handleChange("legal_guardians", key, e);
                      }}
                      className={onEdition ? "editing" : ""}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </main>
      {showActionModal && (
        <ActionModal
          studentId={id}
          onClose={() => setShowActionModal(false)}
          onSuccess={onCreated}
        />
      )}
    </>
  );
};

export default StudentForm;
