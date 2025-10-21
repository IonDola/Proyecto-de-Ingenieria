import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead";
import Tool from "../../components/PageTool";

import StudentIcon from "../../assets/icons/student.svg";

const TempHome = () => {
  return (
    <>
      <PageHead name={localStorage.getItem("userName")} />

      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "calc(100vh - 120px)", 
        }}
      >
        <div
          id="home-tools"
          className="big-tools"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <Tool>
              <Link to="/studentsVisitorView">
                <img src={StudentIcon} alt="Estudiantes" className="w-icon" />
                <p>Estudiantes</p>
              </Link>
            </Tool>
          </div>
        </div>
      </main>
    </>
  );
};

export default TempHome;
