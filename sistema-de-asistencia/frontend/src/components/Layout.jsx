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

  const isStudentNew = window.location.pathname === "/students/new";

  return (
    <div
      className="ui-root"
      role="application"
    >
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
