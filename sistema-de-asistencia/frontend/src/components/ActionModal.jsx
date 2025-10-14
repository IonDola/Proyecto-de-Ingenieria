import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EnterIcon from "../assets/icons/enter.svg";
import ExitIcon from "../assets/icons/exit.svg";
import AbandonIcon from "../assets/icons/abandon.svg";

import "../styles/dialog-style.css"

export default function ActionModal({ studentId, initial = null, onClose, onSuccess }) {
  const isEdit = Boolean(initial?.id);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [msg, setMsg] = useState("");

  // para picker de estudiante cuando no viene studentId
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  useEffect(() => {
    if (studentId) return;         // no hace falta buscar
    if (!q) { setOptions([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/students/?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setOptions(d.results || []))
      .catch(() => { });
    return () => ctrl.abort();
  }, [q, studentId]);

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

          <div>
            <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
