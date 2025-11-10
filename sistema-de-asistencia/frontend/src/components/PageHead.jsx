import { useEffect, useState, Fragment } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import adminImage from "../assets/images/profile_admins.jpg";
import closeSesion from "../assets/icons/logout.svg";
import subSectionIcon from "../assets/icons/subsection.png"
import { Link } from "react-router-dom";

export const CredentialLevel = {
    DEV: "Dev",
    ADMIN: "Admin",
    GUEST: "Guest",
};

const API_LOGOUT = "/api/auth/logout/";

const PageHead = ({ name, credential, icons }) => {
    const nav = useNavigate();
    const HeadClock = () => {
        var [date, setDate] = useState(new Date());

        useEffect(() => {
            var timer = setInterval(() => setDate(new Date()), 1000);
            return function cleanup() {
                clearInterval(timer);
            };
        });

        return (
            <>
                <p>{date.toLocaleTimeString('en-US', { hour12: true })}</p>
                <p>{date.toLocaleDateString()}</p>
            </>
        );
    };

    const HeadName = ({ name, icons }) => {
        if (name && icons && icons.length == 1) {
            return (
                <div id="head-icons">
                    <img
                        src={icons[0].image}
                        alt={icons[0].description}
                        title={icons[0].description}
                        className="w-icon"
                    />
                    <div className="name"> {name} </div>
                </div>
            );
        }

        if (name) {
            return (
                <>
                    <div> Bienvenid@  </div>
                    <div className="name"> {name} </div>
                </>
            );
        }

        return (
            <div id="head-icons">
                <img
                    key={icons[0].id + "-main"}
                    src={icons[0].image}
                    alt={icons[0].description}
                    title={icons[0].description}
                    className="w-icon"
                />
                {icons.slice(1).map((icon) => (
                    <Fragment key={icon.id}>
                        <img src={subSectionIcon} alt="Separador" className="w-icon" />
                        <img
                            src={icon.image}
                            alt={icon.description}
                            title={icon.description}
                            className="w-icon"
                        />
                    </Fragment>
                ))}
            </div>
        );
    };

    const HeadMenu = () => {
        const logOut = async () => {
            console.log("Cerrando sesión...");

            const refresh = localStorage.getItem("refresh");

            try {
                if (refresh) {
                    await fetch(API_LOGOUT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ refresh }),
                    });
                }

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("userName");
                localStorage.removeItem("role");

                nav("/login", { replace: true });
            } catch (err) {
                console.error("Error al cerrar sesión:", err);
                alert("No se pudo cerrar la sesión correctamente");
            }
        };

        return (
            <>
                <div className="head-menu">
                    <div className="menu-title">
                        <img src={adminImage} alt="" />
                        <div className="menu-text">
                            <br />Menú de Usuario
                        </div>
                    </div>

                    <div className="content">
                        <div className="menu-link">
                            <Link to="/personal">Configuración de Perfil</Link>
                        </div>
                        <div className="menu-link">
                            <Link to="/personal/log">Bitácora Personal</Link>
                        </div>
                        <button id="close-sesion" onClick={logOut}>
                            <img src={closeSesion} className="w-icon" />
                            <p>Cerrar Sesión</p>
                        </button>
                    </div>
                </div >
            </>
        );
    };

    return (
        <header className="page-head">
            <div className="date-time">
                <HeadClock />
            </div>
            <div className="central">
                <HeadName name={name} icons={icons} />
            </div>
            <HeadMenu />
        </header>
    )
};

export default PageHead;