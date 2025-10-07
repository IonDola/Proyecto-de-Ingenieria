import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead"
import Tool  from "../../components/PageTool" 

import StudentIcon from "../../assets/icons/student.svg"
import UserIcon from "../../assets/icons/user.svg"
import DataBaseIcon from "../../assets/icons/data-base.svg"
import LogsIcon from "../../assets/icons/log.svg"

const Home = () => {
  return (
    <>
      <PageHead name={"Developer"}/>
      <main style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
        <div id="home-tools" className="big-tools">
          <div>
            <Tool>
              <Link to={"/students"}>
                <img src={StudentIcon} alt=""  className="w-icon"/>
                <p>Estudiantes</p>    
              </Link>
            </Tool>
          </div>
          <div>
            <Tool>
              <img src={UserIcon} alt=""  className="w-icon"/>
              <p>Usuarios</p>
            </Tool>
          </div>
          <div id="halved">
            <div style={{gridRow:"1"}}>
              <Tool>
                <img src={DataBaseIcon} alt=""  className="w-icon"/>
                <p>Seguridad y Respaldo</p>
              </Tool>
            </div>
            <div style={{gridRow:"2"}}>
                <Tool>
                  <Link to="/personal">
                    <img src={LogsIcon} alt=""  className="w-icon"/>
                  </Link>
                <p>Bitacora</p>
              </Tool>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default Home;