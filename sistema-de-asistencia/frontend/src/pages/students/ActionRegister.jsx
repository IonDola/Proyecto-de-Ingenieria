import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/register-style.css";

import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead"
import { FormatActionRegister, ResumeStudent } from "../../components/GUIFormats";

import StudentIcon from "../../assets/icons/student.svg"
import StudentActions from "../../assets/icons/student_registers.svg"
import IconProfile from "../../assets/icons/student_profiles.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete_doc.svg";
import markAsIcon from "../../assets/icons/registered.svg";
import saveIcon from "../../assets/icons/save_changes.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
import returnIcon from "../../assets/icons/devolverse.png";
import IconNew from "../../assets/icons/new_doc.svg";

import StudentAbandon from "../../assets/icons/abandon.svg"
import StudentEnter from "../../assets/icons/enter.svg"
import StudentExit from "../../assets/icons/exit.svg"


const ActionRegister = () => {
    const iconList = [
        {
            id: 1,
            image: IconNew,
            description: "Registro"
        },
    ];
    const { student_id, register_id: action_id } = useParams();
    const guestView = false;
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [std, setS] = useState(null);
    const [act, setAct] = useState(null);

    const isNew = !Boolean(action_id);
    const [onEdition, setOnEdition] = useState(Boolean(isNew));
    const [formData, setFormData] = useState({
        actionName: " Cargando... ",
        action: {},
    });
    const [studentData, setStudentData] = useState({
        student: {},
        going_year: "",
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
        const actionData = ResumeStudent(std);
        setStudentData({
            student: actionData.student || {},
            going_year: actionData.going_year || "",
        });
        setFormData(
            {
                actionName: (isNew ? "Nueva" : "") + ` Boleta de Estado de Matrícula de ${studentData.student.Nombre} `,
            }
        )
    }, [std, student_id]);

    useEffect(() => {
        if (!action_id) return;
        fetch(`/api/actions/${action_id}/`)
            .then((r) => {
                if (!r.ok) return r.text().then(t => { throw new Error(t || `HTTP ${r.status}`); });
                return r.json();
            })
            .then(setAct)
            .catch((e) => setErr(`No se pudo cargar el estudiante: ${e.message}`));
    }, [action_id]);


    useEffect(() => {
        setFormData({
            type: act?.type || "ingreso",
            notes: act?.notes || "",
            on_revision: act?.on_revision || true,
            origin_school: act?.origin_school || "",
            transferred: act?.transferred || false,
            matriculate_level: act?.matriculate_level || "",
        })
    }, [act]);

    const toggleEdit = () => {
        setOnEdition((prev) => !prev);
    };
    const handleChange = (key, event) => {
        const { value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [key]: type === "checkbox" ? checked : value === "true" ? true : value === "false" ? false : value,
        }));
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

    let actionState = [
        { value: "ingreso", img: StudentEnter, label: "Ingreso", className: formData.type == "ingreso" ? "w-icon" : "" },
        { value: "egreso", img: StudentExit, label: "Egreso", className: formData.type == "egreso" ? "w-icon" : "" },
        { value: "abandono", img: StudentAbandon, label: "Abandono", className: formData.type == "abandono" ? "w-icon" : "" },
    ]

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
                            {Object.keys(studentData.student).map((key) => {
                                const rawValue = studentData.student[key];
                                const isDateField = key.toLowerCase().includes("fecha");
                                const isAgeField = key.toLowerCase().includes("edad");
                                return (
                                    <div className="st-data" key={key}>
                                        <a>{!isAgeField ? key : "Edad Cumplida al 15 de Febrero de " + studentData.going_year}</a>
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
                        <div>
                            <div className="st-data">
                                <label>Tipo de Acción</label>
                                <div>
                                    {onEdition &&
                                        actionState.map((opt) => (
                                            <>
                                                <Tool key={opt.value} action={() => setFormData((prev) => ({ ...prev, type: opt.value }))}>
                                                    <img src={opt.img} alt={opt.label} className={opt.className} title={opt.label} />
                                                </Tool>
                                            </>
                                        ))}
                                    {!onEdition &&
                                        <div>
                                            {actionState.map((opt) => (
                                                formData.type === opt.value &&
                                                <>
                                                    <img src={opt.img} alt={opt.label} className=" w-icon" style={{ width: "50px", height: "50px", filter: "invert(40%) sepia(8%) saturate(2389%) hue-rotate(174deg) brightness(90%) contrast(90%)" }} />
                                                    <input
                                                        type={"text"}
                                                        value={opt.label}
                                                        readOnly
                                                        style={{ marginLeft: "1rem", fontWeight: "bold", fontSize: "1.2rem", verticalAlign: "top", marginTop: "15px" }}
                                                    />
                                                </>
                                            ))}
                                        </div>
                                    }
                                </div>
                            </div>

                            {formData.type !== "abandono" && (
                                onEdition ? (
                                    <div className="st-data">
                                        <label>Transferido</label>
                                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="transferred"
                                                    value="true"
                                                    checked={formData.transferred === true}
                                                    onChange={(e) => handleChange("transferred", e)}
                                                />
                                                Sí
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="transferred"
                                                    value="false"
                                                    checked={formData.transferred === false}
                                                    onChange={(e) => handleChange("transferred", e)}
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    // Versión no editable
                                    <div className="st-data">
                                        <label>Transferido</label>
                                        <input
                                            type="text"
                                            value={formData.transferred ? "Sí" : "No"} // acá podés poner lo que quieras
                                            readOnly
                                        />
                                    </div>
                                )
                            )}
                            {formData.type !== "abandono" && formData.transferred &&
                                <div className="st-data">
                                    <label htmlFor="origin_school">Escuela de Origen</label>
                                    <input
                                        type="text"
                                        id="origin_school"
                                        value={formData.origin_school}
                                        onChange={(e) => handleChange("origin_school", e)}
                                        readOnly={!onEdition}
                                    />
                                </div>}
                            {formData.type !== "abandono" &&
                                <div className="st-data">
                                    <label htmlFor="matriculate_level">Nivel de Matriculación</label>
                                    {!onEdition ? (
                                        <input
                                            type="text"
                                            value={formData.matriculate_level}
                                            readOnly
                                        />
                                    ) : (
                                        <select
                                            id="matriculate_level"
                                            onChange={(e) => handleChange("matriculate_level", e)}
                                            value={formData.matriculate_level}
                                        >
                                            <option value="">Seleccione un nivel</option>
                                            <option value="interactivo_ii">Interactivo II</option>
                                            <option value="transicion">Transición</option>
                                            <option value="primero">Primero</option>
                                            <option value="segundo">Segundo</option>
                                            <option value="tercero">Tercero</option>
                                            <option value="cuarto">Cuarto</option>
                                            <option value="quinto">Quinto</option>
                                            <option value="sexto">Sexto</option>
                                            <option value="aula_integrada">Aula Integrada</option>
                                        </select>
                                    )}
                                </div>}
                            <div className="st-data">
                                <label htmlFor="notes">Descripción</label>
                                <input
                                    type="text"
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e)}
                                    readOnly={!onEdition}
                                    style={{ height: "100px" }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
};

export default ActionRegister;