import React, { useEffect, useState } from "react";

export default function ActionModal({ studentId, initial = null, onClose, onSuccess }) {
  const isEdit = Boolean(initial?.id);
  const [type, setType] = useState(initial?.type || "ingreso");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [msg, setMsg] = useState("");

  // para picker de estudiante cuando no viene studentId
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (studentId) return;         // no hace falta buscar
    if (!q) { setOptions([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/students/?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setOptions(d.results || []))
      .catch(() => {});
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
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{marginTop:0}}>{isEdit ? "Editar acción" : "Nueva acción"}</h3>
        {msg && <p style={{ color: "#b60101" }}>{msg}</p>}
        <form onSubmit={submit} className="form-grid">

          {!studentId && !isEdit && (
            <div className="label" style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Estudiante</div>
              <input
                className="search-input"
                placeholder="Buscar por carnet o nombre"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
              <div className="card" style={{ maxHeight: 180, overflow: "auto", marginTop: 6 }}>
                {options.map(o => (
                  <div key={o.id}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="selstudent"
                        checked={selectedStudent?.id === o.id}
                        onChange={() => setSelectedStudent(o)}
                      />
                      <span className="mono">{o.id_mep}</span>
                      <span>{o.first_name} {o.last_name}</span>
                    </label>
                  </div>
                ))}
                {q && options.length === 0 && <div>Sin resultados…</div>}
              </div>
            </div>
          )}

          <label className="label">Tipo
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ingreso">Ingreso</option>
              <option value="abandono">Abandono</option>
              <option value="transferencia">Transferencia</option>
              <option value="egreso">Egreso</option>
            </select>
          </label>

          <label className="label" style={{ gridColumn: "1 / -1" }}>Notas
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <div className="actions-inline" style={{ gridColumn: "1 / -1" }}>
            <button className="btn" type="submit">{isEdit ? "Guardar" : "Crear"}</button>
            <button className="btn ghost" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal: { width: 620, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 12px 40px rgba(0,0,0,.25)" }
};
