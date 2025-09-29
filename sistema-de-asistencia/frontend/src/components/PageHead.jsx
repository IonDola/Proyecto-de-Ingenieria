import { useEffect, useState, Fragment } from "react";
import { Navigate } from "react-router-dom";
import adminImage from "../assets/images/profile_admins.jpg";
import closeSesion from "../assets/icons/logout.svg";

export const CredentialLevel = {
    DEV: "Dev",
    ADMIN: "Admin",
    GUEST: "Guest",
};

const PageHead = ( { name, credential } ) => {
    const credentialLevel = credential
    const [displayedName, setName] = useState(name);

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
                <p>{date.toLocaleDateString()}</p>
                <p>{date.toLocaleTimeString()}</p>
            </>
        );
    };

    const HeadName = () => {
        
    };

    const HeadMenu = () => {
        const [goToLogin, setGoToLogin] = useState(false);
        const logOut = () => {
            setGoToLogin(true);
            console.log("salir")
            // TODO Logica de logout del sistema.
        }

        if (goToLogin) {
            return <Navigate to="/"/>
        }

        return (
            <Fragment>
            <div className="head-menu">
                <div className="menu-title">
                    <img src={adminImage} alt="" />
                    <div className="menu-text">
                        <br />Menú de Usuario
                    </div>
                </div>

                {/* TODO: Arreglar la alineacion del contenido */}
                <div className="content">
                    <div className="menu-link">
                        <a href="#">Ir a Perfil</a>
                        <br />
                        <a href="#">Bitácora Personal</a>
                    </div>
                    <button className="close-sesion" onClick={logOut}>
                        <img src={closeSesion} className="icon"/>
                        <p>Cerrar Sesión</p>
                    </button>
                </div>
            </div>
            </Fragment>
        );
    };

    const mainColorStyle = {
        backgroundColor : credentialLevel == "DEV" ? 'var(--brown-color)' :
        'var(--blue-color)',
    }

    return (
        <div className="page-head" style={mainColorStyle}>
            <div className="date-time">
                <HeadClock />
            </div>
            <div className="central">
                Bienvenid@ {displayedName}
            </div>
            <HeadMenu />
        </div>
    )
};

export default PageHead;