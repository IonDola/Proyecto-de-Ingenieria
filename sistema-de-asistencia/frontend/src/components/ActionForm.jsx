import { useEffect, useState } from "react";
import "../styles/register-style.css";

import Tool from "./PageTool";
import Home from "./HomeLink";

import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete_doc.svg";
import markAsIcon from "../assets/icons/registered.svg";
import saveIcon from "../assets/icons/save_changes.svg";
import cancelIcon from "../assets/icons/cancel.svg";
import { CheckStudentId, HelpSave, MarkAsReviewed } from "./RegisterSaveHelper";

const ActionForm = ({ register, carnet = null, legalGuardians, actionId = null, isOnRevision,
  guestView = false, actionTag = "Ingreso", student, setStudent }) => {
  const [formData, setFormData] = useState({
    student: student || {},
    register: register || {},
    carnet: carnet || " ",
    leg_guardians: legalGuardians || {},
  });
  const isNew = actionId == null;
  const [onEdition, setOnEdition] = useState(isNew);
  const [onRevision, setOnRevision] = useState(isOnRevision || carnet != null);
  const [carnetBuble, setCarnetBuble] = useState(false);

  useEffect(() => {
    setFormData({
      carnet: carnet || {},
      student: student || {},
      register: register || {},
      leg_guardians: legalGuardians || {},
    });
  }, [register, carnet, legalGuardians]);

  const revStyle = {
    color: `var(${onRevision ? "--rev-yellow" : "--rev-green"})`,
    gridColumn: "3",
  };

  const handleChange = (section, key, value) => {
    setFormData((prev) => {
      if (section === "carnet") {
        return { ...prev, carnet: value };
      }
      return {
        ...prev,
        [section]: { ...prev[section], [key]: value },
      };
    });
  };

  // Alternar edición
  const toggleEdit = () => {
    if (!onRevision || guestView) return;
    setOnEdition((prev) => !prev)
    if (onEdition) {
      // cancelar edición: resetear datos
      setFormData({
        register: register || {},
        carnet: carnet || {},
        leg_guardians: legalGuardians || {},
      });
    }
  };

  // Guardar datos (corrige el orden de parámetros de HelpSave)
  const handleSave = async () => {
    try {
      const response = await HelpSave(
        formData,
        !!actionId,                   // isEdit
        formData.carnet || carnet,    // carnet
        actionId || null,             // initial (id de acción si existe)
        actionTag                     // tipo de acción
      );
      return response;
    } catch (err) {
      console.error("Error de red:", err);
      return { success: false, error: err };
    }
  };

  // Validar datos (consulta al backend) — quita el "Nuevo Estudiante" cuando SÍ existe
  const handleValidate = async () => {
    try {
      const carnetVal = (formData.carnet || "").trim();
      const students = await CheckStudentId(carnetVal);
      const input = document.querySelector('input[name="carnet"]');

      if (students.length > 0) {
        setStudent && setStudent(students[0]);
        if (input) {
          input.setCustomValidity("");
          input.reportValidity();
        }
      } else {
        if (input) {
          input.setCustomValidity("");
          input.reportValidity();
        }
      }
    } catch (err) {
      console.error("Error validando carnet:", err);
    }
  };

  const handleMarkReviewed = async () => {
    if (!actionId) return;
    const response = await MarkAsReviewed(actionId);
    if (response.success) {
      setOnRevision(false);
      setOnEdition(false);
      console.log("Marcado como revisado");
    } else {
      console.error("Error marcando como revisado:", response.message);
    }
  };

  const isValidISODate = (s) => {
    if (typeof s !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const t = new Date(s);
    return !isNaN(t.getTime());
  };

  const normalizeForDateInput = (v) => {
    if (!v && v !== 0) return "";
    if (v instanceof Date) {
      return isNaN(v.getTime()) ? "" : v.toISOString().split("T")[0];
    }
    if (typeof v === "string") {
      const maybeIso = v.split("T")[0].trim();
      if (isValidISODate(maybeIso)) return maybeIso;
    }
    return "";
  };

  const baseTools = (
    <>
      {/* Botón editar */}
      <Tool key={"Tool2"}>
        <img
          src={editIcon}
          alt="Editar"
          title="Editar"
          className="w-icon"
          onClick={toggleEdit}
        />
      </Tool>

      {/* Botón eliminar */}
      <Tool key={"Tool3"}>
        <img src={deleteIcon} alt="Eliminar" title="Eliminar" className="w-icon" />
      </Tool>

      {/* Botón marcar como revisado */}
      <Tool key={"Tool4"}>
        <img
          src={markAsIcon}
          alt="Marcar como Revisado"
          title="Marcar como Revisado"
          className="w-icon"
          onClick={handleMarkReviewed}
        />
      </Tool>
    </>
  );

  let sideTools = baseTools;
  if (onEdition) {
    sideTools = (
      <>
        {/* Botones de acción */}
        <Tool key={"Tool5"}>
          <img
            src={saveIcon}
            alt="Guardar"
            title="Guardar"
            className="w-icon"
            onClick={handleSave}
          />
        </Tool>
        <Tool key={"Tool6"}>
          <img
            src={cancelIcon}
            alt="Cancelar"
            title="Cancelar"
            className="w-icon"
            onClick={toggleEdit}
          />
        </Tool>
      </>
    );
  }
  if (guestView) {
    sideTools = (<></>);
  }

  return (
    <>
      <div className="tools">
        <Home />
        {sideTools}
      </div>

      <form id="register">
        <div id="carnet">
          <div id="inpt">
            <label>Carnet:</label>
            <input
              type="text"
              name="carnet"
              value={formData.carnet}
              onChange={(e) => handleChange("carnet", "carnet", e.target.value)}
              readOnly={!onEdition}
              className={onEdition ? "editing" : ""}
              required
            />
          </div>
          {!guestView &&
            <>
              <button type="button" onClick={handleValidate} style={{ gridColumn: "2" }}>
                Buscar
              </button>
              {
                !isNew &&
                <div style={revStyle}>{onRevision ? "En Revisión" : "Revisado"}</div>
              }
            </>
          }
        </div>

        <div id="st-table">
          <div className="st-h">
            <p>Registro de Acción</p>
          </div>

          <div>
            {Object.keys(formData.register).map((key) => {
              const rawValue = formData.register[key];
              const isDateField = key.toLowerCase().includes("fecha") || key.toLowerCase().includes("birth");

              const displayValue = isDateField
                ? normalizeForDateInput(rawValue)
                : (rawValue === undefined || rawValue === null ? "" : rawValue);

              return (
                <div className="st-data" key={key}>
                  <label>{key}</label>
                  <input
                    type={isDateField ? "date" : "text"}
                    value={displayValue}
                    readOnly={!onEdition}
                    onChange={(e) => {
                      const newVal = isDateField ? e.target.value : e.target.value;
                      handleChange("register", key, newVal);
                    }}
                    className={onEdition ? "editing" : ""}
                  />
                </div>
              );
            })}
          </div>
          <div className="st-h">
            <p>Estudiante</p>
          </div>

          <div>
            {Object.keys(formData.student).map((key) => {
              const rawValue = formData.student[key];
              const isDateField = key.toLowerCase().includes("fecha") || key.toLowerCase().includes("birth");

              const displayValue = isDateField
                ? normalizeForDateInput(rawValue)
                : (rawValue === undefined || rawValue === null ? "" : rawValue);

              return (
                <div className="st-data" key={key}>
                  <label>{key}</label>
                  <input
                    type={isDateField ? "date" : "text"}
                    value={displayValue}
                    readOnly={!onEdition}
                    onChange={(e) => {
                      const newVal = isDateField ? e.target.value : e.target.value;
                      handleChange("student", key, newVal); //cambio
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
            {Object.keys(formData.leg_guardians).map((key) => {
              const value = formData.leg_guardians[key] ?? "";

              return (
                <div className="st-data" key={key}>
                  <label>{key}</label>
                  <input
                    type={"text"}
                    value={value}
                    readOnly={!onEdition}
                    onChange={(e) => handleChange("leg_guardians", key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </>
  );
};

export default ActionForm;
