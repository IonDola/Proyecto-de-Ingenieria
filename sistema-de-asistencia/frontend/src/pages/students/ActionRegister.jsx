import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/register-style.css";

import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead"
import { FormatActionRegister } from "../../components/GUIFormats";

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
    const { student_id, register_id } = useParams();
    const guestView = false;
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [std, setS] = useState(null);
    const isNew = !Boolean(register_id);
    const [onEdition, setOnEdition] = useState(Boolean(isNew));
    const [formData, setFormData] = useState({
        student: {},
        going_year: "",
        actionName: " Cargando... ",
        action: {},
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
        const actionData = FormatActionRegister(std);
        setFormData({
            student: actionData.student || {},
            going_year: actionData.going_year || "",
            actionName: actionData.name || (isNew ? " *Nuevo Estudiante* " : ""),
            action: actionData.action || {},
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
            <PageHead icons={iconList} name={formData.actionName} />
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
                    <div className="st-table">
                        <div className="st-h">
                            <p>Estudiante</p>
                        </div>
                        <div>
                            {Object.keys(formData.student).map((key) => {
                                const rawValue = formData.student[key];
                                const isDateField = key.toLowerCase().includes("fecha");
                                const isAgeField = key.toLowerCase().includes("edad");
                                const isGenderField = key.toLowerCase().includes("género");
                                return (
                                    <div className="st-data" key={key}>
                                        <a>{!isAgeField ? key : "Edad Cumplida al 15 de Febrero de " + formData.going_year}</a>
                                        <input
                                            type={!isDateField ? "text" : "date"}
                                            value={rawValue}
                                            readOnly
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="st-table">
                        <div className="st-h">
                            <p>Boleta de Estado de Matrícula</p>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
};

export default ActionRegister;