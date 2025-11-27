import { Link } from "react-router-dom";
import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead"

import HomeIcon from "../../assets/icons/home.svg"
import saveIcon from "../../assets/icons/save_changes.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
import UserIcon from "../../assets/icons/user.svg"
import { useEffect, useState } from "react";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [edited, setEdited] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const token = localStorage.getItem("access");
    const isVisitor = localStorage.getItem("role") === "VISITOR";


    useEffect(() => {
        fetch("/api/auth/my-profile/", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setEdited({ ...data }); // Copia inicial editable
            });
    }, [token]);

    const handleChange = (field, value) => {
        setEdited(prev => ({ ...prev, [field]: value }));
    };

    const handleDiscard = () => {
        setEdited({ ...profile });
    };

    const handleSave = () => {
        setIsSaving(true);
        fetch("/api/auth/my-profile/update/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(edited),
        })
            .then(res => res.json())
            .then(data => {
                alert(data.detail || "Perfil actualizado correctamente.");
                setProfile({ ...edited });
            })
            .catch(() => alert("Error al guardar cambios"))
            .finally(() => {
                setIsSaving(false)
                localStorage.setItem("full_name", `${edited.first_name} ${edited.last_name}`);
                localStorage.setItem("gender", `${edited.gender}`);

            });
    };

    return (
        <>
            <PageHead icons={[{ id: 1, image: UserIcon, description: "Mi Perfil" },]} name={localStorage.getItem("full_name")} />
            <main>
                <div className="tools">
                    {!isVisitor && <Home />}
                    {isVisitor &&
                        <Tool key={"HomeTool"}>
                            <Link to={"/visitor/home"}>
                                <img src={HomeIcon} alt="Volver a menu Home" title="Volver a menu Home" className="w-icon" />
                            </Link>
                        </Tool>
                    }
                    <Tool action={handleSave} type={"submit"}>
                        <img src={saveIcon} alt="Guardar" title="Guardar" className="w-icon" />
                    </Tool>
                    <Tool action={handleDiscard}>
                        <img src={cancelIcon} alt="Cancelar" title="Cancelar" className="w-icon" />
                    </Tool>
                </div>
                {profile &&
                    <form id="register" onSubmit={e => e.preventDefault()}>
                        <div className="st-table">
                            {!profile && <div className="st-h"> Cargando Datos de Mi Perfil </div>}
                            {profile && <div className="st-h"> Mi Perfil </div>}

                            <div className="st-data">
                                <label>Nombre de Usuario:</label>
                                <input
                                    type="text"
                                    value={edited.username}
                                    onChange={e => handleChange("username", e.target.value)}
                                    readOnly={profile.role == "VISITOR"}
                                />
                            </div>

                            <div className="st-data">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    value={edited.first_name}
                                    onChange={e => handleChange("first_name", e.target.value)}
                                />
                            </div>

                            <div className="st-data">
                                <label>Apellido:</label>
                                <input
                                    type="text"
                                    value={edited.last_name}
                                    onChange={e => handleChange("last_name", e.target.value)}
                                />
                            </div>

                            <div className="st-data">
                                <label>Género:</label>
                                <select
                                    value={edited.gender}
                                    onChange={e => handleChange("gender", e.target.value)}
                                >
                                    <option value="Indefinido">Indefinido</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Masculino">Masculino</option>
                                </select>
                            </div>

                            <div className="st-data">
                                <label>Correo Electrónico:</label>
                                <input
                                    type="text"
                                    value={edited.email}
                                    onChange={e => handleChange("email", e.target.value)}
                                />
                            </div>

                            <div className="st-data">
                                <label>Rol:</label>
                                <input type="text" value={profile.role} readOnly />
                            </div>
                        </div>
                    </form>}

            </main>
        </>
    );
};

export default Profile;