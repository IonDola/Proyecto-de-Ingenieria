import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead"
import Tool  from "../../components/PageTool" 

import Home from "../../assets/icons/home.svg"
import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
import StudentActions from "../../assets/icons/student_registers.svg"

const StudentsHome = () => {
    const iconList = [
        {
        id: 1,
        image: StudentIcon,
        description: "Estudiantes"
        }
    ];
  return (
    <>
        <PageHead icons={iconList}/>
        <main style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <div className="tools" id="lateral-fixed">
                <Tool key={"Tool" + 1}> 
                    <Link to={"/home"}>
                    <img src={Home} alt="Volver a menu Home" title="Volver a menu Home" className="w-icon"/> 
                    </Link>
                </Tool>
            </div>
            <div id="students-tools" className="big-tools">
                <div>
                    <Tool>
                    <Link to={"/students/profiles"}>
                        <img src={StudentProfile} alt=""  className="w-icon"/>
                        <p>Perfiles</p>    
                    </Link>
                    </Tool>
                </div>
                <div>
                    <Tool>
                    <Link to={"/students/actions"}>
                        <img src={StudentActions} alt=""  className="w-icon"/>
                        <p>Acciones</p>    
                    </Link>
                    </Tool>
                </div>
            </div>
        </main>
    </>
  );
};

export default StudentsHome;