import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";

import IconStudent from "../../assets/icons/student.svg";
import IconProfiles from "../../assets/icons/student_profiles.svg";
import IconSave from "../../assets/icons/save_changes.svg";
import IconBack from "../../assets/icons/devolverse.png";

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

  // cargar datos en edición
  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/students/${id}/`)
      .then((r) => r.json())
      .then(setForm)
      .catch(() => setMsg("No se pudo cargar el estudiante"));
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
          setMsg("Cambios guardados :)");
        } else {
          // al crear redirigimos al detalle correcto
          navigate(`/students/profiles/${data.id}`);
        }
      })
      .catch((err) => setMsg(err?.error || "Error al guardar"));
  };

  const iconList = [
    { id: 1, image: IconStudent, description: "Estudiantes" },
    { id: 2, image: IconProfiles, description: "Perfiles" },
  ];

  return (
    <div className="page--students">
      <PageHead
        icons={iconList}
      />

      <main>
        <div className="tools">
          <Home />

          <Tool>
            <button
              className="page-tool"
              onClick={() => document.querySelector("form")?.requestSubmit()}
              title="Guardar"
            >
              <img src={IconSave} alt="Guardar" className="w-icon" />
            </button>
          </Tool>

          <Tool>
            <Link to="/students/profiles" title="Volver al listado" className="page-tool">
              <img src={IconBack} alt="Volver" className="w-icon" />
            </Link>
          </Tool>
        </div>

        <div className="card" style={{ marginRight: 25 }}>
          {msg && <p className={msg.toLowerCase().includes("error") ? "error" : "ok"}>{msg}</p>}

          <div className="section-header">Información</div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="label">
              Carnet
              <input name="id_mep" value={form.id_mep} onChange={change} required />
            </label>

            <label className="label">
              Nombre
              <input name="first_name" value={form.first_name} onChange={change} required />
            </label>

            <label className="label">
              Apellidos
              <input name="last_name" value={form.last_name} onChange={change} required />
            </label>

            <label className="label">
              Sección
              <input name="section" value={form.section} onChange={change} />
            </label>

            <label className="label inline">
              <input type="checkbox" name="active" checked={form.active} onChange={change} />
              Activo
            </label>

            <div className="actions-inline">
              <button className="btn" type="submit">Guardar</button>
              <button className="btn ghost" type="button" onClick={() => navigate(-1)}>Cancelar</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
