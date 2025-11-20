import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../../styles/main.css";
import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

import IconLogs from "../../assets/icons/log.svg";
import IconBack from "../../assets/icons/devolverse.png";

function readAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("jwt_access") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

export default function GlobalLogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const iconList = [
    { id: 1, image: IconLogs, description: "Detalle de Evento" },
  ];

  useEffect(() => {
    const loadLog = async () => {
      try {
        setLoading(true);
        const access = readAccessToken();
        const r = await fetch(`/api/logs/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
          },
          credentials: "include",
        });

        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || `HTTP ${r.status}`);
        }

        const data = await r.json();
        setLog(data);
      } catch (e) {
        console.error("Error cargando detalle:", e);
        setError(e.message || "No se pudo cargar el evento");
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHead icons={iconList} />
        <main>
          <div className="tools">
            <Home />
          </div>
          <div className="card" style={{ padding: 12, marginRight: 25 }}>
            <em>Cargando…</em>
          </div>
        </main>
      </>
    );
  }

  if (error || !log) {
    return (
      <>
        <PageHead icons={iconList} />
        <main>
          <div className="tools">
            <Home />
            <Tool>
              <button
                className="page-tool"
                onClick={() => navigate("/logs")}
                title="Volver"
              >
                <img src={IconBack} alt="Volver" className="w-icon" />
              </button>
            </Tool>
          </div>
          <div className="card" style={{ padding: 12, marginRight: 25 }}>
            <p className="error">{error || "Evento no encontrado"}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHead icons={iconList} name={`Evento: ${log.action}`} />
      <main>
        <div className="tools">
          <Home />
          <Tool>
            <button
              className="page-tool"
              onClick={() => navigate("/logs")}
              title="Volver a bitácora"
            >
              <img src={IconBack} alt="Volver" className="w-icon" />
            </button>
          </Tool>
        </div>

        <div className="card" style={{ marginRight: 25 }}>
          <div className="section-header">Información del Evento</div>
          
          <div className="grid">
            <div className="cell label">ID</div>
            <div className="cell value">{log.id}</div>

            <div className="cell label">Fecha y Hora</div>
            <div className="cell value">
              {new Date(log.timestamp).toLocaleString("es-CR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>

            <div className="cell label">Acción</div>
            <div className="cell value">{log.action}</div>

            <div className="cell label">Tipo</div>
            <div className="cell value">{log.type}</div>

            <div className="cell label">Entidad</div>
            <div className="cell value">{log.entity || "—"}</div>

            <div className="cell label">Estado</div>
            <div className="cell value">
              <span
                style={{
                  color: log.status === "success" ? "#0f7a32" : "#b60101",
                  fontWeight: 600,
                }}
              >
                {log.status}
              </span>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 16 }}>
            Usuario
          </div>
          
          <div className="grid">
            <div className="cell label">ID</div>
            <div className="cell value">{log.user?.id || "—"}</div>

            <div className="cell label">Username</div>
            <div className="cell value">{log.user?.username || "—"}</div>

            <div className="cell label">Nombre Completo</div>
            <div className="cell value">{log.user?.full_name || "—"}</div>

            <div className="cell label">Email</div>
            <div className="cell value">{log.user?.email || "—"}</div>

            <div className="cell label">Rol</div>
            <div className="cell value">{log.user?.role || "—"}</div>

            <div className="cell label">Activo</div>
            <div className="cell value">
              {log.user?.is_active ? "Sí" : "No"}
            </div>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: 16 }}>
                Metadata (Información Adicional)
              </div>
              <div className="cell" style={{ marginTop: 8 }}>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    overflow: "auto",
                    fontSize: "13px",
                  }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}

          <div className="actions-inline" style={{ marginTop: 16 }}>
            <button className="btn ghost" onClick={() => navigate("/logs")}>
              Volver a Bitácora
            </button>
          </div>
        </div>
      </main>
    </>
  );
}