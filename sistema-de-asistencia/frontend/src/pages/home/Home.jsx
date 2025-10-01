import "../../styles/main.css"
import PageHead from "../../components/PageHead"
import Listable from "../../components/Listable"
import Tool  from "../../components/PageTool" 
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
const Home = () => {
    const [rows, setRows] = useState([]);

    const iconList = [
      {
        id: 1,
        image: StudentIcon,
        description: "Estudiantes"
      },
      {
        id: 2,
        image: StudentProfile,
        description: "Perfiles"
      },
    ];

    const columns = [
      {name : "", width: "50px"}, // Seleccionado
      {name : "Carnet", width: "1fr"},
      {name : "Nombre", width: "1fr"},
      {name : "", width: "50px"}, // Revisar perfil
    ];

    useEffect(() => {
      fetch("/api/students/")
        .then(res => res.json())
        .then(data => setRows(data.results || []))
        .catch(() => setRows([]));
    }, []);

    return (
    <>
        <PageHead icons={iconList}/>
        <main>
            <div className="tools">
              <Tool key={"Tool" + 1}> Home </Tool>
              <Link to="/students/new" className="tool-link" style={{ display: "contents" }}>
                <Tool key={"Tool" + 2}> Añadir </Tool>
              </Link>
              <Tool key={"Tool" + 3}> Eliminar </Tool>
            </div>
            <Listable columns={columns}>
              {rows.length === 0 ? (
                <div className="empty" style={{gridColumn: '1 / -1'}}>Sin datos</div>
              ) : (
                rows.map(s => (
                  <React.Fragment key={s.id}>
                    <div><input type="checkbox" /></div>
                    <div>{s.id_mep}</div>
                    <div>{`${s.last_name}, ${s.first_name}`}</div>
                    <div>
                      {/* ícono de perfil eliminado */}
                    </div>
                  </React.Fragment>
                ))
              )}
            </Listable>
        </main>
    </>
    );
};

export default Home;