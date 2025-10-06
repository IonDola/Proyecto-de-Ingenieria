import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EnterIcon from "../assets/icons/enter.svg";
import ExitIcon from "../assets/icons/exit.svg";
import AbandonIcon from "../assets/icons/abandon.svg";

import "../styles/dialog-style.css"

export default function ActionModal({ studentId, initial = null, onClose, onSuccess }) {
  const isEdit = Boolean(initial?.id);
  const [type, setType] = useState(initial?.type || "ingreso");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [msg, setMsg] = useState("");

  // para picker de estudiante cuando no viene studentId
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const actionOptions = [
    {
      value: "ingreso", label: "Ingreso", content:
        <Link to={"/actions/enter/new"}>
          <img src={EnterIcon} alt="Ingreso" title="Ingreso" />
        </Link>
    },
    { value: "egreso", label: "Egreso", content: <img src={ExitIcon} alt="Egreso" title="Egreso" /> },
    { value: "abandono", label: "Abandono", content: <img src={AbandonIcon} alt="Abandono" title="Abandono" /> },
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

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const making = async () => {
      const body = { type, notes };
      let url, method;

      if (isEdit) {
        url = `/api/actions/${initial.id}/update/`;
        method = "PATCH";
      } else if (studentId) {
        url = `/api/students/${studentId}/actions/new/`;
        method = "POST";
      } else {
        if (!selectedStudent?.id) {
          throw new Error("Selecciona un estudiante");
        }
        url = `/api/actions/new/`;
        method = "POST";
        body["student_id"] = selectedStudent.id;
      }

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error al guardar la acción");
      return data;
    };

    try {
      const data = await making();
      onSuccess?.(data);
      onClose?.();
    } catch (err) {
      setMsg(err.message || "Error al guardar");
    }
  };

  return (
    <div id="backdrop" onClick={onClose}>
      <div id="action-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Nueva acción</h3>
        <form onSubmit={submit} id="form-grid">
          <span>Tipo</span>
          <div className="buttons">
            {actionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className="type-button"
              >
                {opt.content}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <div>
            <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
