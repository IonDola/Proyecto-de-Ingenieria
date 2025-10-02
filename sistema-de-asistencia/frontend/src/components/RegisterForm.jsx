import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/register-style.css";

import Tool from "./PageTool"
import Home from "../assets/icons/home.svg"

const RegisterForm = ({ register, setRegister }) => {
  const [formData, setFormData] = useState({
    carnet: "",
    nombre: "",
    carrera: "",
  });
  const [onEdition, setOnEdition] = useState(false);
  const [onRevision, setOnRevision] = useState(true);
  const revStyle = {
    color: onRevision ? '#FFDE59' : '#31FF5F',
    gridColumn: '3'
  };

  // ✅ Maneja cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidate = () => {
    // TODO
    console.log("Not implemented")
  };

  const handleSave = () => {
    // TODO
    console.log("Not implemented")
  };

  // ✅ Cancelar
  const handleCancel = () => {
    setFormData({ carnet: "", nombre: "", carrera: "" });
    setOnEdition(false);
  };

  return (
    <>
      <div className="tools">
        <Tool key={"Tool" + 1}>
          <Link to={"/home"}>
            <img src={Home} alt="Volver a menu Home" title="Volver a menu Home" className="w-icon" />
          </Link>
        </Tool>
        <Tool key={"Tool" + 2}>
          <img src="" alt="x" title="x" className="w-icon" />
        </Tool>
        <Tool key={"Tool" + 3}>
          <img src="" alt="x" title="x" className="w-icon" />
        </Tool>
        <Tool key={"Tool" + 4}>
          <img src="" alt="x" title="x" className="w-icon" />
        </Tool>
      </div>
      <form id="register">
        <div id="carnet">
          <div id="inpt">
            <label> Carnet: </label>
            <input
              type="text"
              name="carnet"
              value={formData.carnet}
              onChange={handleChange}
            />
          </div>
          <button type="button" onClick={handleValidate} style={{ gridColumn: '2' }}>
            Verificar
          </button>
          <div style={revStyle}>
            {onRevision ? "En Revisión" : "Revisado"}
          </div>
        </div>
        <div id="st-table">
          <div className="st-h">
            <p>Información</p>
          </div>
          <div className="st-data">
            {Object.keys(register).map((key) => {
              const value = register[key] ?? "";

              const isDateField = key.toLowerCase().includes("fecha");

              return (
                <div className="st-data" key={key}>
                  <label>{key}</label>
                  <input
                    type={isDateField ? "date" : "text"}
                    value={value}
                    onChange={(e) =>
                      setRegister({ ...register, [key]: e.target.value })
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className="st-h">
            <p>Encargados Legales</p>
          </div>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;