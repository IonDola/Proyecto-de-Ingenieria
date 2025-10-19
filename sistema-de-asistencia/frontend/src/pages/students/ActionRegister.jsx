import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/register-style.css";

import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead"
import { FormatStudentRegister } from "../../components/GUIFormats";

import StudentIcon from "../../assets/icons/student.svg"
import StudentActions from "../../assets/icons/student_registers.svg"
import IconProfile from "../../assets/icons/student_profiles.svg";
import StudentEnter from "../../assets/icons/enter.svg"
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete_doc.svg";
import markAsIcon from "../../assets/icons/registered.svg";
import saveIcon from "../../assets/icons/save_changes.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
import returnIcon from "../../assets/icons/devolverse.png";
import IconNew from "../../assets/icons/new_doc.svg";

const ActionRegister = () => {
    const iconList = [
        {
            id: 1,
            image: IconNew,
            description: "Registro"
        },
    ];
    const { student_id, registerId } = useParams();
    const guestView = false;
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [std, setS] = useState(null);
    const isNew = !Boolean(registerId) && !guestView;
    const [onEdition, setOnEdition] = useState(Boolean(isNew));
    const [formData, setFormData] = useState({
        student: {},
        legal_guardians: {},
        name: " Cargando... ",
    });
    useEffect(() => {
        if (!student_id) return;
        fetch(`/api/students/${student_id}/`)
            .then((r) => {
                if (!r.ok) return r.text().then(t => { throw new Error(t || `HTTP ${r.status}`); });
                return r.json();
            })
            .then(setS)
            .catch((e) => setErr(`No se pudo cargar el estudiante: ${e.message}`));
    }, [student_id]);

    useEffect(() => {
        if (std == null && student_id) return;
        const stData = FormatStudentRegister(std);
        setFormData({
            student: stData.student || {},
            legal_guardians: stData.legal_guardians || {},
            name: stData.name || (isNew ? " *Nuevo Estudiante* " : ""),
        });
    }, [std, student_id, isNew]);

    const toggleEdit = () => {
    };
    const handleChange = (section, key, event) => {
        const { value } = event.target;
        setFormData((prev) => {
            if (section === "carnet") {
                return { ...prev, carnet: value };
            }
            return {
                ...prev,
                [section]: { ...prev[section], [key]: value },
            };
        });
    };
    const handleSubmit = (e) => {
    };

    const baseTools = (
        <>
            {!isNew && (
                <Tool action={toggleEdit}>
                    <img src={editIcon} alt="Editar" className="w-icon" />
                </Tool>
            )}
        </>
    );

    let sideTools = baseTools;
    if (onEdition && !isNew) {
        sideTools = (
            <>
                <Tool action={handleSubmit} type={"submit"}>
                    <img src={saveIcon} alt="Guardar" title="Guardar" className="w-icon" />
                </Tool>
                <Tool action={toggleEdit}>
                    <img src={cancelIcon} alt="Cancelar" title="Cancelar" className="w-icon" />
                </Tool>
            </>
        );
    }
    return (
        <>
            <PageHead icons={iconList} name={"Boleta de Estado de Matrícula"} />
            <main>
                <div className="tools">
                    <Home />
                    <Tool>
                        <Link to="/students/profiles" title="Volver al listado" className="page-tool">
                            <img src={returnIcon} alt="Volver" className="w-icon" />
                        </Link>
                    </Tool>
                    {sideTools}
                </div>

                <form id="register" onSubmit={handleSubmit}>
                    <div id="st-table">
                        <div className="st-h">
                            <p>Estudiante</p>
                        </div>
                        <div>
                            {Object.keys(formData.student).map((key) => {
                                const rawValue = formData.student[key];
                                const isDateField = key.toLowerCase().includes("fecha");
                                return (
                                    <div className="st-data" key={key}>
                                        <a>{key}</a>
                                        <input
                                            type={!isDateField ? "text" : "date"}
                                            value={rawValue}
                                            readOnly={!onEdition}
                                            onChange={(e) => {
                                                handleChange("student", key, e);
                                            }}
                                            className={onEdition ? "editing" : ""}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="st-h">
                            <p>Encargados Legales</p>
                        </div>
                        <div>
                            {Object.keys(formData.legal_guardians).map((key) => {
                                const value = formData.legal_guardians[key] ?? "";
                                return (
                                    <div className="st-data" key={key}>
                                        <a>{key}</a>
                                        <input
                                            type={"text"}
                                            value={value}
                                            readOnly={!onEdition}
                                            onChange={(e) => {
                                                handleChange("legal_guardians", key, e);
                                            }}
                                            className={onEdition ? "editing" : ""}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
};

export default ActionRegister;