import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EnterIcon from "../assets/icons/enter.svg";
import ExitIcon from "../assets/icons/exit.svg";
import AbandonIcon from "../assets/icons/abandon.svg";

import "../styles/dialog-style.css"

export default function ActionModal({ onClose }) {
  // para picker de estudiante cuando no viene studentId
  const actionOptions = [
    {
      value: "ingreso", label: "Ingreso", content:
        <Link to={"/actions/enter/new"} target="_blank">
          <img src={EnterIcon} alt="Ingreso" title="Ingreso" />
        </Link>
    },
    {
      value: "egreso", label: "Egreso", content:
        <Link to={"/actions/exit/new"} target="_blank">
          <img src={ExitIcon} alt="Egreso" title="Egreso" />
        </Link>
    },
    {
      value: "abandono", label: "Abandono", content:
        <Link to={"/actions/abandon/new"} target="_blank">
          <img src={AbandonIcon} alt="Abandono" title="Abandono" />
        </Link>
    },
  ];

  return (
    <div id="backdrop" onClick={onClose}>
      <div id="action-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Nueva acción</h3>
        <div id="form-grid">
          <span>Tipo</span>
          <div className="buttons">
            {actionOptions.map((opt) => (
              <div className="type-button" key={opt.value}>
                {opt.content}
                <span>{opt.label}</span>
              </div>
            ))}
          </div>

          <button id="cancel-modal" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
