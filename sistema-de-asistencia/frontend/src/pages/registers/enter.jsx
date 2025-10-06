import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Link, useParams } from "react-router-dom";

export default function HistoryDetail() {
    const { actionId } = useParams();
    const [a, setA] = useState(null);

    useEffect(() => {
        fetch(`/api/actions/${actionId}/`)
            .then((r) => r.json())
            .then(setA)
            .catch(() => setA({ error: "No se pudo cargar la acción" }));
    }, [actionId]);

    if (!a) return <Layout><p>Cargando…</p></Layout>;
    if (a.error) return <Layout><p className="error">{a.error}</p></Layout>;

    return (
        <Layout rightHeader={<div className="right-title"> Detalle de Acción</div>}>
            <div className="card">
                <div className="grid">
                    <div className="cell label">Tipo</div>
                    <div className="cell value">{a.type}</div>
                    <div className="cell label">Fecha</div>
                    <div className="cell value">{new Date(a.created_at).toLocaleString()}</div>
                    <div className="cell label">Notas</div>
                    <div className="cell value">{a.notes || "—"}</div>
                    <div className="cell label">Actor</div>
                    <div className="cell value">{a.actor || "—"}</div>
                </div>
                <div className="actions-inline">
                    <Link className="btn ghost" to={`/students/${a.student_id}/history`}> Volver</Link>
                </div>
            </div>
        </Layout>
    );
}
