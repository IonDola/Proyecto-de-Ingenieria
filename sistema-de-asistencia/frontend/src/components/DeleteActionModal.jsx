import { useState } from "react";
import "../styles/dialog-style.css";

/**
 * F-033: Modal para eliminar acción con razón obligatoria
 * 
 * Props:
 * - action: Objeto con la acción a eliminar (id, type, etc)
 * - onClose: Callback para cerrar el modal
 * - onConfirm: Callback(reason) que se ejecuta al confirmar
 */
export default function DeleteActionModal({ action, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // F-033: Validar que se proporcione una razón
    if (!reason.trim()) {
      setError("Debe proporcionar una razón para eliminar la acción");
      return;
    }

    if (reason.trim().length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }

    setBusy(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Error al eliminar la acción");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 560 }}>
        <div className="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button
            className="icon-close"
            aria-label="Cerrar"
            onClick={onClose}
            disabled={busy}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="panel-info" style={{ marginBottom: 16 }}>
              <p>
                <strong>Acción a eliminar:</strong>
              </p>
              <p>Tipo: {action?.type || "—"}</p>
              <p>ID: {action?.id || "—"}</p>
              {action?.student && (
                <p>
                  Estudiante: {action.student.first_name} {action.student.surnames}
                </p>
              )}
            </div>

            {action?.on_revision === false && (
              <div
                style={{
                  background: "#ffebee",
                  border: "1px solid #f44336",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  color: "#c62828",
                }}
              >
                <strong>⚠️ Advertencia:</strong>
                <p style={{ margin: "4px 0 0 0" }}>
                  Esta acción ya ha sido aplicada/revisada y no puede ser eliminada.
                </p>
              </div>
            )}

            <div className="form-row" style={{ gridTemplateColumns: "1fr" }}>
              <label htmlFor="reason">
                <strong>Razón de eliminación *</strong>
                <small style={{ display: "block", opacity: 0.8, marginTop: 4 }}>
                  Explique por qué se debe eliminar esta acción (mínimo 10 caracteres)
                </small>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Registro duplicado por error del sistema, datos incorrectos irrecuperables, etc."
                rows={4}
                disabled={busy || action?.on_revision === false}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px",
                  background: "#ffebee",
                  border: "1px solid #f44336",
                  borderRadius: "8px",
                  color: "#c62828",
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              disabled={busy || !reason.trim() || action?.on_revision === false}
              style={{
                background: "#d32f2f",
                opacity: busy || !reason.trim() || action?.on_revision === false ? 0.5 : 1,
              }}
            >
              {busy ? "Eliminando..." : "Eliminar Acción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}