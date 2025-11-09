import { useEffect, useState } from "react";
import "../styles/dialog-style.css";

/**
 * F-039: Modal para ver y recuperar estudiantes eliminados
 */
export default function RecoverModal({ onClose, onSuccess }) {
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/students/deleted/?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error al cargar");
      setDeletedStudents(data.results || []);
    } catch (e) {
      console.error("Error cargando eliminados:", e);
      setDeletedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [q]);

  const toggleSel = (id, checked) => {
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const handleRecover = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) {
      alert("Selecciona al menos un estudiante");
      return;
    }

    if (!window.confirm(`¿Recuperar ${ids.length} estudiante(s)?`)) return;

    try {
      const r = await fetch("/api/students/bulk-recover/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error al recuperar");
      
      alert(`${data.recovered} estudiante(s) recuperado(s)`);
      setSelected({});
      await load();
      if (onSuccess) onSuccess();
    } catch (e) {
      alert(e.message || "Error al recuperar");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 720, maxHeight: "80vh" }}>
        <div className="modal-header">
          <h3>Estudiantes Eliminados</h3>
          <button className="icon-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "50vh", overflowY: "auto" }}>
          <input
            type="search"
            placeholder="Buscar por carnet o nombre"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "12px",
              padding: "0 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
            }}
          />

          {loading ? (
            <p>Cargando...</p>
          ) : deletedStudents.length === 0 ? (
            <p>No hay estudiantes eliminados</p>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {deletedStudents.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 2fr 180px",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[s.id]}
                    onChange={(e) => toggleSel(s.id, e.target.checked)}
                  />
                  <div style={{ fontWeight: 600 }}>{s.id_mep}</div>
                  <div>{`${s.first_name} ${s.surnames}`}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn"
            onClick={handleRecover}
            disabled={Object.values(selected).every((v) => !v)}
          >
            Recuperar Seleccionados
          </button>
        </div>
      </div>
    </div>
  );
}