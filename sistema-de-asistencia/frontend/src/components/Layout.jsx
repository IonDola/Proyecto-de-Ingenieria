import React, { useEffect, useState } from "react";
import "./../styles/student-ui.css";
import PageHead from "./PageHead";

/* IMÁGENES (dentro de src): */

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
