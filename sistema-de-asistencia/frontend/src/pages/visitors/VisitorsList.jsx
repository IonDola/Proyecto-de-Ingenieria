import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/main.css";
import "../../styles/listable-style.css";
import "../../styles/dialog-style.css";

import PageHead from "../../components/PageHead";
import Listable from "../../components/Listable";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

import UserIcon from "../../assets/icons/user.svg"
import VisitorLogo from "../../assets/icons/visitor_logo.svg"
import Add from "../../assets/icons/new_temp.svg";
import MassRemove from "../../assets/icons/delete_temp.svg";

function getAccess() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("jwt_access") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const opts = { day: "2-digit", month: "short", year: "numeric" };
    return d.toLocaleDateString("es-CR", opts).replace(/\./g, "");
  } catch {
    return iso;
  }
}

export default function VisitorsList() {
  const iconList = [
    { id: 1, image: UserIcon, description: "Usuarios" },
    { id: 2, image: VisitorLogo, description: "Visitantes" },
  ];

  const columns = [
    { name: "", width: "100px" },
    { name: "Clave", width: "1fr" },
    { name: "Nombre", width: "1fr" },
    { name: "Vencimiento", width: "1fr" },
    { name: "Estado", width: "160px" },
    { name: "", width: "130px" },
  ];

  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const [selected, setSelected] = useState({});
  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const [showModal, setShowModal] = useState(false);
  const [busyModal, setBusyModal] = useState(false);
  const [form, setForm] = useState({ name: "", expires_at: "" }); // YYYY-MM-DD
  const [createdInfo, setCreatedInfo] = useState(null); // {visitor_code, password}

  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.visitor_code || "").toLowerCase().includes(s) ||
      (r.name || "").toLowerCase().includes(s) ||
      (r.status || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const load = async () => {
    try {
      const access = getAccess();
      const r = await fetch(`/api/users/visitors/`, {
        headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
        credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.detail || d?.error || "Error al listar");
      const list = d.results || [];
      setRows(list);
      setSelected((prev) => {
        const next = {};
        list.forEach((v) => { if (prev[v.id]) next[v.id] = true; });
        return next;
      });
    } catch (e) {
      console.error("error en visitors list:", e);
      setRows([]);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setSp({ q: e.target.value || "" });
  };

  const toggleSel = (id, checked) => {
    setSelected((s) => ({ ...s, [id]: checked }));
  };

  const openCreate = () => {
    setCreatedInfo(null);
    setForm({ name: "", expires_at: "" });
    setShowModal(true);
  };

  const createVisitor = async () => {
    if (!form.name.trim() || !form.expires_at) return;
    setBusyModal(true);
    try {
      const access = getAccess();
      const r = await fetch(`/api/users/visitors/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Error al crear");
      setCreatedInfo({ visitor_code: d.visitor_code, password: d.password });
      await load();
    } catch (e) {
      console.error("error al crear visitante:", e);
      alert("Error al crear el usuario visitante");
    } finally {
      setBusyModal(false);
    }
  };

  const suspendOne = async (id, code) => {
    const ok = window.confirm(`¿Suspender ahora al visitante ${code}?`);
    if (!ok) return;
    try {
      const access = getAccess();
      const r = await fetch(`/api/users/visitors/${id}/suspend/`, {
        method: "POST",
        headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
        credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Error al suspender");
      await load();
    } catch (e) {
      console.error("error al suspender visitante:", e);
      alert("Error al suspender");
    }
  };

  const bulkSuspend = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;
    if (!window.confirm(`¿Suspender ${ids.length} usuario(s) visitante(s) ahora?`)) return;
    try {
      const access = getAccess();
      for (const id of ids) {
        await fetch(`/api/users/visitors/${id}/suspend/`, {
          method: "POST",
          headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
          credentials: "include",
        });
      }
      setSelected({});
      await load();
    } catch (e) {
      console.error("error en suspensión masiva:", e);
      alert("Error al suspender usuarios seleccionados");
    }
  };

  const searchBox = (
    <input
      className="search-box"
      type="search"
      name="q"
      placeholder="Buscar por clave, nombre o estado"
      defaultValue={q}
      onKeyDown={onSearch}
    />
  );

  return (
    <>
      <PageHead icons={iconList} />
      <main>
        <div className="tools">
          <Home />
          <Tool key={"ToolAdd"} action={openCreate}>
            <img src={Add} alt="Nuevo visitante" title="Nuevo visitante" className="w-icon" />
          </Tool>
          <Tool key={"ToolSuspend"} action={bulkSuspend} disabled={!anySelected}>
            <img src={MassRemove} alt="Suspender seleccionados" title="Suspender seleccionados" className="w-icon" />
          </Tool>
        </div>

        <Listable columns={columns} searchBox={searchBox}>
          {filtered.map((v) => (
            <div className="listable-row" key={v.id}>
              <div className="cb">
                <input
                  type="checkbox"
                  checked={!!selected[v.id]}
                  onChange={(e) => toggleSel(v.id, e.target.checked)}
                />
              </div>
              <div style={{ fontWeight: 600 }}>{v.visitor_code}</div>
              <div>{v.name}</div>
              <div>{formatDate(v.expires_at)}</div>
              <div>{v.status}</div>
            </div>
          ))}
        </Listable>
      </main>

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ width: 560 }}>
            <div className="modal-header">
              <h3>Generar Usuario Temporal Nuevo</h3>
              <button
                className="icon-close"
                aria-label="Cerrar"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            {!createdInfo ? (
              <>
                <div className="modal-body">
                  <div className="form-row">
                    <label>Nombre del Usuario</label>
                    <input
                      type="text"
                      value={form.name}
                      placeholder="Cloe Cespedes Mora"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <label>Fecha de Expiración</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button className="btn" disabled={busyModal} onClick={createVisitor}>
                    {busyModal ? "Creando…" : "Confirmar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-body">
                  <div className="panel-info">
                    <p><b>Usuario creado</b></p>
                    <p>Clave (visitor_code): <b>{createdInfo.visitor_code}</b></p>
                    <p>Contraseña temporal: <b>{createdInfo.password}</b></p>
                    <small>Guarda estos datos; se mostrarán una sola vez.</small>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
