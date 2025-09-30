import React, { useEffect, useState } from "react";
import "./../styles/student-ui.css";

/* IMÁGENES (dentro de src): */
import SchoolShield from "../assets/images/school_shield.png";

/* ÍCONOS (en public/icons): */

export default function Layout({ children, rightHeader = null }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="ui-root"
      role="application"
    >
      {/* Barra lateral izquierda */}
      <aside className="ui-sidebar">
        <button
          className="ui-sidebtn"
          title="Inicio"
          onClick={() => (window.location.href = "/students")}
        >
          <img className="icon" src="/icons/home.svg" alt="Inicio" />
        </button>

        <button
          className="ui-sidebtn"
          title="Nuevo estudiante"
          onClick={() => (window.location.href = "/students/new")}
        >
          <img className="icon" src="/icons/new_person.svg" alt="Nuevo" />
        </button>

        <button
          className="ui-sidebtn"
          title="Editar"
          onClick={() => window.dispatchEvent(new CustomEvent("ui-edit"))}
        >
          <img className="icon" src="/icons/edit.svg" alt="Editar" />
        </button>

        <button
          className="ui-sidebtn"
          title="Guardar"
          onClick={() => window.dispatchEvent(new CustomEvent("ui-save"))}
        >
          <img className="icon" src="/icons/save_changes.svg" alt="Guardar" />
        </button>
      </aside>

      {/* Contenedor principal */}
      <main className="ui-main">
        {/* Top bar */}
        <header className="ui-topbar">
          <div className="ui-clock">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
            <span className="date">{now.toLocaleDateString()}</span>
          </div>

          <div className="ui-top-actions">
            <img src={SchoolShield} alt="Escuela" className="shield" />
            <button className="pill">
              <img className="icon" src="/icons/letters.svg" alt="Aa" />
            </button>
            <button className="pill">
              <img className="icon" src="/icons/log.svg" alt="1234" />
            </button>
            <button className="pill">
              <img className="icon" src="/icons/search.svg" alt="Buscar" />
            </button>
            <button className="pill">
              <img className="icon" src="/icons/filter.svg" alt="Filtrar" />
            </button>
          </div>

          <div className="ui-user">
            <div className="user-label">
              <strong>Menú de Usuario</strong>
              <small>Admin</small>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <section className="ui-content">
          <div className="app-frame">
            {children}
          </div>
        </section>

        {/* Título flotante opcional */}
        {rightHeader}
      </main>
    </div>
  );
}
