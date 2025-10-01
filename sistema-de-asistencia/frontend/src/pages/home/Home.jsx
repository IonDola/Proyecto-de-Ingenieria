import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/main.css"
import PageHead from "../../components/PageHead"
import Listable from "../../components/Listable"
import Tool  from "../../components/PageTool" 

import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
import ViewProfile from "../../assets/icons/descripcion-general.svg"
import Home1 from "../../assets/icons/home.svg"
import Add from "../../assets/icons/new_person.svg"
import MassRemove from "../../assets/icons/massive_delete.svg"
const Home = () => {

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

  return (
    <>
        <PageHead icons={iconList}/>
        <main>
            <div className="tools">
              <Tool key={"Tool" + 1}> <img src={Home1} alt="Volver a menu Home" title="Volver a menu Home"/> </Tool>
              <Tool key={"Tool" + 2}> <img src={Add} alt="Añadir estudiante" title="Añadir estudiante"/> </Tool>
              <Tool key={"Tool" + 3}> <img src={MassRemove} alt="Remover multipels registros" title="Remover multiples registros"/> </Tool>
            </div>
            <Listable columns={columns}>
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
                    <button><img src={ViewProfile} alt="" className="w-icon"/></button>
                </div>
              ))}
            </Listable>
        </main>

    </>
  );
};

export default Home;