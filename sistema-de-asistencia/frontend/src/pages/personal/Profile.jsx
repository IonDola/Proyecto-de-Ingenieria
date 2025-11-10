import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead"
import Tool from "../../components/PageTool"

import StudentIcon from "../../assets/icons/student.svg"
import UserIcon from "../../assets/icons/user.svg"
import LogsIcon from "../../assets/icons/log.svg"

const Profile = () => {
    return (
        <>
            <PageHead icons={[{ id: 1, image: UserIcon, description: "Mi Perfil" },]} name={localStorage.getItem("full_name")} />
            <main style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div id="home-tools" className="big-tools">
                    <div>
                        <Tool>
                            <Link to={"/students"}>
                                <img src={StudentIcon} alt="" className="w-icon" />
                                <p>Estudiantes</p>
                            </Link>
                        </Tool>
                    </div>
                    <div>
                        <Tool>
                            <Link to={"/users"}>
                                <img src={UserIcon} alt="" className="w-icon" />
                                <p>Usuarios</p>
                            </Link>
                        </Tool>
                    </div>
                    <div>
                        <Link to={"/generallog"} className="tool-link">
                            <Tool>
                                <img src={LogsIcon} alt="" className="w-icon" />
                                <p>Bitácora</p>
                            </Tool>
                        </Link>
                    </div>

                </div>
            </main>
        </>
    );
};

export default Profile;