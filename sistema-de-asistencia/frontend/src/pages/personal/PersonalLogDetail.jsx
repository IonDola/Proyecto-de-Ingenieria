import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHead from "../../components/PageHead";

const PersonalLogDetail = () => {
  const { actionId } = useParams();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access") || "";
        const r = await fetch(`/api/users/me/actions/${actionId}/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
        setRow(await r.json());
      } catch (e) {
        setErr(e.message || "No se pudo cargar el detalle");
      }
    })();
  }, [actionId]);

  return (
    <Layout>
      <PageHead title="Log Detail" subtitle="Detailed information about this action" />
      <div style={{ padding: "20px" }}>
        {err && <p className="error">{err}</p>}
        {!err && !row && <p>Cargando…</p>}
        {row && (
          <>
            <p><strong>Fecha:</strong> {new Date(row.timestamp).toLocaleString()}</p>
            <p><strong>Acción:</strong> {row.action}</p>
            <p><strong>Tipo:</strong> {row.type}</p>
            <p><strong>Afecta a:</strong> {row.entity || "—"}</p>
            <p><strong>Estado:</strong> {row.status}</p>
            {row.metadata && (
              <>
                <p><strong>Metadata:</strong></p>
                <pre>{JSON.stringify(row.metadata, null, 2)}</pre>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PersonalLogDetail;
