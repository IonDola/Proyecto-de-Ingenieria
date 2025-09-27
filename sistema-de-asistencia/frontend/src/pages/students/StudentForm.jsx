import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";

export default function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    id_mep: "",
    first_name: "",
    last_name: "",
    section: "",
    active: true,
  });

  // Atajos desde los botones del Layout (escuchamos los CustomEvent)
  useEffect(() => {
    const onSave = () => handleSubmit(new Event("submit"));
    const onEdit = () => document.querySelector("input")?.focus();
    window.addEventListener("ui-save", onSave);
    window.addEventListener("ui-edit", onEdit);
    return () => {
      window.removeEventListener("ui-save", onSave);
      window.removeEventListener("ui-edit", onEdit);
    };
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/students/${id}/`)
        .then((r) => r.json())
        .then(setForm)
        .catch(() => setMsg("No se pudo cargar el estudiante"));
    }
  }, [id, isEdit]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    const url = isEdit ? `/api/students/${id}/update/` : `/api/students/new/`;
    const method = isEdit ? "PATCH" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((data) => {
        if (isEdit) {
          setMsg("Cambios guardados ✅");
        } else {
          navigate(`/students/${data.id}`);
        }
      })
      .catch((err) => setMsg(err?.error || "Error al guardar X"));
  };

  return (
    <Layout
      rightHeader={
        <div className="right-title">
          {isEdit ? " Editar Estudiante" : " *Nuevo Estudiante*"}
        </div>
      }
    >
      <div className="card">
        {msg && <p className={msg.includes("X") ? "error" : "ok"}>{msg}</p>}

        <div className="section-header">Información</div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="label">Carnet
            <input name="id_mep" value={form.id_mep} onChange={change} required />
          </label>

          <label className="label">Nombre
            <input name="first_name" value={form.first_name} onChange={change} required />
          </label>

          <label className="label">Apellidos
            <input name="last_name" value={form.last_name} onChange={change} required />
          </label>

          <label className="label">Sección
            <input name="section" value={form.section} onChange={change} />
          </label>

          <label className="label inline">
            <input type="checkbox" name="active" checked={form.active} onChange={change} />
            Activo
          </label>

          <div className="actions-inline">
            <button className="btn" type="submit"> Guardar</button>
            <button className="btn ghost" type="button" onClick={() => navigate(-1)}>✖ Cancelar</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
