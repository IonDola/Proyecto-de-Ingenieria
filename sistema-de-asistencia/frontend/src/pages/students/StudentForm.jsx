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
    legal_guardians: {},
    name: " Cargando... ",
    going_year: "",
  });

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
    const stData = FormatStudentRegister(std);
    setFormData({
      student: stData.student || {},
      legal_guardians: stData.legal_guardians || {},
      name: stData.name || (isNew ? " *Nuevo Estudiante* " : ""),
      going_year: stData.going_year || "",
    });
  }, [std, id, isNew]);

  const switchActionModal = () => {
    setShowActionModal(!showActionModal);
  };

  const toggleEdit = () => {
    if (guestView) return;
    if (onEdition) {
      const stData = FormatStudentRegister(std);
      setFormData({
        student: stData.student || {},
        legal_guardians: stData.legal_guardians || {},
        name: stData.name || (isNew ? " *Nuevo Estudiante* " : ""),
        going_year: stData.going_year || "",
      });
    }
    if (!isNew) setOnEdition((prev) => !prev);
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

    // 1) cuerpo base
    const body = FormatStudentForDB(formData);

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          console.error(" /api/students/new|update error body:", text);
          try {
            const json = JSON.parse(text);
            throw json;
          } catch {
            throw { error: text || `HTTP ${r.status}` };
          }
        }
        return JSON.parse(text || "{}");
      })
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
      .catch((err) => {
        console.error(" Guardar estudiante:", err);
        setMsg(typeof err?.error === "string" ? err.error : JSON.stringify(err));
      });
  }

  const baseTools = (
    <>
      {!isNew && (
        <Tool action={switchActionModal}>
          <img src={IconNew} alt="Nueva acción" className="w-icon" />
        </Tool>
      )}
      {!isNew && (
        <Tool action={toggleEdit}>
          <img src={IconEdit} alt="Editar" className="w-icon" />
        </Tool>
      )}
      {!isNew && (
        <Tool>
          <Link to={`/students/profiles/${id}/history`} title="Ver historial" className="page-tool">
            <img src={IconHistory} alt="Historial" className="w-icon" />
          </Link>
        </Tool>
      )}
    </>
  );

  let sideTools = baseTools;
  if (onEdition && !isNew) {
    sideTools = (
      <>
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
          <div className="st-table">
            <div className="st-h">
              <p>Estudiante</p>
            </div>
            <div>
              {Object.keys(formData.student).map((key) => {
                const rawValue = formData.student[key];
                const isDateField = key.toLowerCase().includes("fecha");
                const isAgeField = key.toLowerCase().includes("edad");
                const isGenderField = key.toLowerCase().includes("género");
                return (
                  <div className="st-data" key={key}>
                    <a>{!isAgeField ? key : "Edad Cumplida al 15 de Febrero de " + formData.going_year}</a>
                    {(!isGenderField || !onEdition) ? (
                      <input
                        type={!isDateField ? "text" : "date"}
                        value={rawValue}
                        readOnly={!onEdition}
                        onChange={(e) => handleChange("student", key, e)}
                        className={onEdition ? "editing" : ""}
                      />
                    ) : (
                      <select
                        value={formData.student[key] || ""}
                        onChange={(e) => handleChange("student", key, e)}
                        className={onEdition ? "editing" : ""}
                        disabled={!onEdition}
                      >
                        <option value="Indefinido">Indefinido</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    )}

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
                    <a>{key}</a>
                    <input
                      type={"text"}
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
