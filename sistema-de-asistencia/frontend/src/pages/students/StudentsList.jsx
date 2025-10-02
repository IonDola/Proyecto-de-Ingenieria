import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/main.css"
import PageHead from "../../components/PageHead"
import Listable from "../../components/Listable"
import Tool  from "../../components/PageTool" 

import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
import ViewProfile from "../../assets/icons/descripcion-general.svg"
import Home from "../../assets/icons/home.svg"
import Add from "../../assets/icons/new_person.svg"
import MassRemove from "../../assets/icons/massive_delete.svg"

export default function StudentsList() {
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
      {name : "", width: "100px"}, // Seleccionado
      {name : "Carnet", width: "1fr"},
      {name : "Nombre", width: "1fr"},
      {name : "", width: "100px"}, // Revisar perfil
    ];
    
  const [rows, setRows] = useState([]);
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";

  const load = () => {
    fetch(`/api/students/?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setRows(d.results || []))
      .catch(() => setRows([]));
  };

  useEffect(() => { load(); }, [q]);

  const onSearch = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setSp({ q: e.target.value || "" });
  };

  const searchBox = <input
                      className="search-box"
                      type="search"
                      name="q"
                      placeholder="Buscar por carnet o nombre"
                      defaultValue={q}
                      onKeyDown={onSearch}
                    />

  return (
    <>
        <PageHead icons={iconList}/>
        <main>
            <div className="tools">
              <Tool key={"Tool" + 1}> 
                <Link to={"/home"}>
                  <img src={Home} alt="Volver a menu Home" title="Volver a menu Home" className="w-icon"/> 
                </Link>
              </Tool>
              <Tool key={"Tool" + 2}> 
                <Link to="/students/profiles/new" target="_blank"> 
                  <img src={Add} alt="Añadir estudiante" title="Añadir estudiante" className="w-icon"/> 
                </Link> 
              </Tool>
              {/* TODO */}
              <Tool key={"Tool" + 3}> 
                <img src={MassRemove} alt="Remover multipels registros" title="Remover multiples registros" className="w-icon"/> 
              </Tool>
            </div>
            <Listable columns={columns} searchBox={searchBox}>
              {rows.map((st) => (
                <div className="listable-row" key={st.id}>
                  <div className="cb">
                    <input type="checkbox" />
                  </div>
                  <div>
                    {st.id_mep}
                  </div>
                  <div>
                    {st.first_name + " " + st.last_name}
                  </div>
                  {/* Pendiente: ver el perfil */}
                    <button><img src={ViewProfile} alt="" className="w-icon"/></button>
                </div>
              ))}
            </Listable>
        </main>

    </>
  );
}
