import { useEffect, useState } from "react";
import "../styles/register-style.css";

import Tool from "./PageTool";
import Home from "./HomeLink";

import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete_doc.svg";
import markAsIcon from "../assets/icons/registered.svg";
import saveIcon from "../assets/icons/save_changes.svg";
import cancelIcon from "../assets/icons/cancel.svg";

const RegisterForm = ({ register, carnet, legalGuardians, isOnRevision, onSave, onMarkReviewed }) => {
  const [formData, setFormData] = useState({
    register: register || {},
    carnet: carnet || {},
    leg_guardians: legalGuardians || {},
  });

  const [onEdition, setOnEdition] = useState(false);
  const [onRevision, setOnRevision] = useState(isOnRevision);

  useEffect(() => {
    setFormData({
      register: register || {},
      carnet: carnet || {},
      leg_guardians: legalGuardians || {},
    });
  }, [register, carnet, legalGuardians]);

  const revStyle = {
    color: `var(${onRevision ? "--rev-yellow" : "--rev-green"})`,
    gridColumn: "3",
  };

  // ✅ Maneja cambios en inputs
  const handleChange = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // ✅ Alternar edición
  const toggleEdit = () => {
    if (!onRevision) return;
    setOnEdition((prev) => !prev)
  };

  // ✅ Guardar datos
  const handleSave = async () => {
    if (onSave) {
      try {
        const response = await onSave(formData);
        if (response.success) {
          setOnEdition(false);
          console.log("Guardado correctamente");
        } else {
          console.error("Error guardando:", response.message);
        }
      } catch (err) {
        console.error("Error de red:", err);
      }
    }
  };

  // ✅ Validar datos (consulta al backend)
  const handleValidate = async () => {
    console.log("Validando...");
    // TODO: llamar al backend aquí
  };

  const handleMarkReviewed = async () => {
    setOnRevision(false);
    setOnEdition(false);
    if (onMarkReviewed) {
      try {
        const result = await onMarkReviewed();
        if (result.success) {
        }
      } catch (err) {
        console.error("Error al marcar como revisado:", err);
      }
    }
  };

  const isValidISODate = (s) => {
    if (typeof s !== "string") return false;
    // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const t = new Date(s);
    return !isNaN(t.getTime());
  };

  const normalizeForDateInput = (v) => {
    if (!v && v !== 0) return ""; // undefined, null, empty -> empty string for date input
    // si viene como Date
    if (v instanceof Date) {
      return isNaN(v.getTime()) ? "" : v.toISOString().split("T")[0];
    }
    // si viene con hora tipo "2021-08-20T00:00:00Z" o "2021-08-20 00:00:00"
    if (typeof v === "string") {
      const maybeIso = v.split("T")[0].trim();
      if (isValidISODate(maybeIso)) return maybeIso;
      // a veces la fecha viene como "20210820" u otro formato -> no intentar parsear: devolver ""
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
            alt="Editar"
            title="Editar"
            className="w-icon"
            onClick={handleSave}
          />
        </Tool>
        <Tool key={"Tool6"}>
          <img
            src={cancelIcon}
            alt="Editar"
            title="Editar"
            className="w-icon"
            onClick={toggleEdit}
          />
        </Tool>
      </>
    );
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
              value={formData.carnet ?? ""}
              onChange={(e) => handleChange("carnet", "carnet", e.target.value)}
              readOnly={!onEdition}
              className={onEdition ? "editing" : ""}
            />
          </div>
          <button type="button" onClick={handleValidate} style={{ gridColumn: "2" }}>
            Verificar
          </button>
          <div style={revStyle}>{onRevision ? "En Revisión" : "Revisado"}</div>
        </div>

        <div id="st-table">
          <div className="st-h">
            <p>Información</p>
          </div>

          <div>
            {Object.keys(formData.register).map((key) => {
              const rawValue = formData.register[key];
              const isDateField = key.toLowerCase().includes("fecha") || key.toLowerCase().includes("birth");

              // value seguro para pasar a <input>
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
                      // para fechas el input devuelve YYYY-MM-DD o "", guardamos tal cual
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
            <p>Encargados Legales</p>
          </div>

          <div>
            {Object.keys(formData.leg_guardians).map((key) => {
              const value = formData.leg_guardians[key] ?? "";
              const isDateField = key.toLowerCase().includes("fecha");

              return (
                <div className="st-data" key={key}>
                  <label>{key}</label>
                  <input
                    type={isDateField ? "date" : "text"}
                    value={value}
                    readOnly={!onEdition}
                    onChange={(e) => handleChange("leg_guardians", key, e.target.value)}
                    className={onEdition ? "editing" : ""}
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

export default RegisterForm;
