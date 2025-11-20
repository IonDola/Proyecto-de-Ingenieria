import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead"
import Tool from "../../components/PageTool"
import VisitorHome from "../../components/VisitorHomeLink"

import StudentIcon from "../../assets/icons/student.svg"
import StudentProfile from "../../assets/icons/student_profiles.svg"
import StudentActions from "../../assets/icons/student_registers.svg"

const StudentsHomeVisitor = () => {
    const iconList = [
        {
            id: 1,
            image: StudentIcon,
            description: "Estudiantes"
        }
    ];
    return (
        <>
            <PageHead icons={iconList} />
            <main style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="tools" id="lateral-fixed">
                    <VisitorHome />
                </div>
                <div id="students-tools" className="big-tools">
                    <div>
                        <Tool>
                            <Link to={"/studentsVisitorView/profiles"}>
                                <img src={StudentProfile} alt="" className="w-icon" />
                                <p>Perfiles</p>
                            </Link>
                        </Tool>
                    </div>
                    <div>
                        <Tool>
                            <Link to={"/studentsVisitorView/actions"}>
                                <img src={StudentActions} alt="" className="w-icon" />
                                <p>Acciones</p>
                            </Link>
                        </Tool>
                    </div>
                </div>
            </main>
        </>
    );
};

export default StudentsHomeVisitor;