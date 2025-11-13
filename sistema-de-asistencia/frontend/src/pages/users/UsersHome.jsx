import { Link } from "react-router-dom";

import PageHead from "../../components/PageHead"
import Tool from "../../components/PageTool"
import Home from "../../components/HomeLink"

import UserIcon from "../../assets/icons/user.svg"
import AdminLogo from "../../assets/icons/admin_logo.svg"
import VisitorLogo from "../../assets/icons/visitor_logo.svg"

const AdminHome = () => {
    const iconList = [
        {
            id: 1,
            image: UserIcon,
            description: "Usuarios"
        }
    ];
    return (
        <>
            <PageHead icons={iconList} />
            <main style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="tools" id="lateral-fixed">
                    <Home />
                </div>
                <div id="students-tools" className="big-tools">
                    <div>
                        <Tool>
                            <Link to={"/users/admins"}>
                                <img src={AdminLogo} alt="" className="w-icon" />
                                <p>Administrativos</p>
                            </Link>
                        </Tool>
                    </div>
                    <div>
                        <Tool>
                            <Link to={"/users/visitors"}>
                                <img src={VisitorLogo} alt="" className="w-icon" />
                                <p>Visitantes</p>
                            </Link>
                        </Tool>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AdminHome;