import "../../styles/main.css"
import PageHead from "../../components/PageHead"
import Listable from "../../components/Listable"
import Tool  from "../../components/PageTool" 

import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
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
      {name : "", width: "50px"}, // Seleccionado
      {name : "Carnet", width: "1fr"},
      {name : "Nombre", width: "1fr"},
      {name : "", width: "50px"}, // Revisar perfil
    ];
    
  return (
    <>
        <PageHead icons={iconList}/>
        <main>
            <div className="tools">
              <Tool key={"Tool" + 1}> Home </Tool>
              <Tool key={"Tool" + 2}> Añadir </Tool>
              <Tool key={"Tool" + 3}> Eliminar </Tool>
            </div>
            <Listable columns={columns}>

            </Listable>
        </main>

    </>
  );
};

export default Home;