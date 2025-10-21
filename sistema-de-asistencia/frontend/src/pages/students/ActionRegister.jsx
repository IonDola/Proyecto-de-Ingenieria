import { useEffect, useState, Fragment } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/register-style.css";

import Tool from "../../components/PageTool";
import Home from "../../components/HomeLink";
import PageHead from "../../components/PageHead"
import { ResumeStudent } from "../../components/GUIFormats";
import { FormatActionForDB } from "../../components/SystemFormats";

import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/delete_doc.svg";
import markAsIcon from "../../assets/icons/registered.svg";
import saveIcon from "../../assets/icons/save_changes.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
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
    const [sid, setSid] = useState(student_id);
    const guestView = false;
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [std, setS] = useState(null);
    const [act, setAct] = useState(null);
    const navigate = useNavigate();

    const isNew = !Boolean(action_id);
    const [onEdition, setOnEdition] = useState(Boolean(isNew));
    const [formData, setFormData] = useState({
        actionName: " Cargando... ",
        type: act?.type || "ingreso",
        notes: act?.notes || "",
        on_revision: act?.on_revision ?? true,
        origin_school: act?.origin_school || "",
        transferred: act?.transferred ?? false,
        matriculate_level: act?.matriculate_level || "",
    });
    const [studentData, setStudentData] = useState({
        student: {},
        going_year: "",
    });

    useEffect(() => {
        if (!sid) return;
        fetch(`/api/students/${sid}/`)
            .then((r) => {
                if (!r.ok) return r.text().then(t => { throw new Error(t || `HTTP ${r.status}`); });
                return r.json();
            })
            .then(setS)
            .catch((e) => setErr(`No se pudo cargar el estudiante: ${e.message}`));
    }, [sid]);

    useEffect(() => {
        if (std == null || !sid) return;

        const studentData = ResumeStudent(std);
        setStudentData({
            student: studentData.student || {},
            going_year: studentData.going_year || "",
        });
        setFormData(
            {
                actionName: (isNew ? "Nueva" : "") + ` Boleta de Estado de Matrícula de ${studentData.student.Nombre ?? "..."} `,
                type: act?.type || "ingreso",
                notes: act?.notes || "",
                on_revision: act?.on_revision ?? true,
                origin_school: act?.origin_school || "",
                transferred: act?.transferred || false,
                matriculate_level: act?.matriculate_level || "",
            }
        )
    }, [std, sid]);

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
        setFormData((prev) => ({
            ...prev,
            type: act?.type || "ingreso",
            notes: act?.notes || "",
            on_revision: act?.on_revision ?? true,
            origin_school: act?.origin_school || "",
            transferred: act?.transferred || false,
            matriculate_level: act?.matriculate_level || "",
        }))
        if (!student_id && act)
            setSid(act.student_id);

    }, [act]);

    const toggleEdit = () => {
        if (!formData.on_revision) return;
        setOnEdition((prev) => !prev);
        if (onEdition) {
            // cancelar edición, editar datos
            setFormData((prev) => ({
                ...prev,
                type: act?.type || "ingreso",
                notes: act?.notes || "",
                on_revision: act?.on_revision ?? true,
                origin_school: act?.origin_school || "",
                transferred: act?.transferred || false,
                matriculate_level: act?.matriculate_level || "",
            }))
        }
    };

    const handleChange = (key, event) => {
        const { value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [key]: type === "checkbox" ? checked : value === "true" ? true : value === "false" ? false : value,
        }));
    };

    const handleMarkReviewed = async () => {
        if (!action_id) return;

        setFormData((prev) => {
            const updated = { ...prev, on_revision: false };

            handleSubmit(null, updated);
            return updated;
        });
    };

    const handleSubmit = (e, marked = null) => {
        e?.preventDefault();
        setMsg("");
        const method = !isNew ? "PATCH" : "POST";
        const url = !isNew ? `/api/actions/${action_id}/update/` : `/api/students/${sid}/actions/new/`

        const body = FormatActionForDB(marked || formData);

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then(async (r) => {
                const text = await r.text();
                if (!r.ok) {
                    console.error(" /api/students/newAction | /api/actions/update error body: ", text);
                    try {
                        const json = JSON.parse(text);
                        throw json;
                    } catch {
                        throw { error: text || `HTTP ${r.status}` };
                    }
                }
                return JSON.parse(text || "{}");
            })
            .then((data) => {
                if (isNew) {
                    setMsg("Boleta creada con extio");
                    navigate(`/actions/${data.id}`);
                    window.location.reload(true);
                } else {
                    setMsg("Cambios guardados con exito");
                    setOnEdition(false);
                    //window.location.reload(true);
                }
            })
            .catch((err) => {
                console.error(" Guardar boleta: ", err);
                setMsg(typeof err?.error === "string" ? err.error : JSON.stringify(err));
            });
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

    if (isNew) {
        sideTools = (
            <>
                <Tool action={handleSubmit} type={"submit"}>
                    <img src={saveIcon} alt="Guardar" title="Guardar" className="w-icon" />
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
                    {sideTools}
                    {!isNew && !onEdition && formData.on_revision && <Tool>
                        <img
                            src={markAsIcon}
                            alt="Marcar como Revisado"
                            title="Marcar como Revisado"
                            className="w-icon"
                            onClick={handleMarkReviewed}
                        />
                    </Tool>}
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
                        {!isNew && <div className="st-h"><p style={{ color: "black" }}>{formData.on_revision ? "En Revisión" : "Revisado"}</p></div>}
                        <div>
                            <div className="st-data">
                                <label>Tipo de Acción</label>
                                <div>
                                    {onEdition &&
                                        actionState.map((opt) => (
                                            <Fragment key={opt.value}>
                                                <Tool action={() => setFormData((prev) => ({ ...prev, type: opt.value }))}>
                                                    <img src={opt.img} alt={opt.label} className={opt.className} title={opt.label} />
                                                </Tool>
                                            </Fragment>
                                        ))}
                                    {!onEdition &&
                                        <div>
                                            {actionState.map((opt) => (
                                                formData.type === opt.value &&
                                                <div key={opt.value}>
                                                    <img src={opt.img} alt={opt.label} className=" w-icon" style={{ width: "50px", height: "50px", filter: "invert(40%) sepia(8%) saturate(2389%) hue-rotate(174deg) brightness(90%) contrast(90%)" }} />
                                                    <input
                                                        type={"text"}
                                                        value={opt.label}
                                                        readOnly
                                                        style={{ marginLeft: "1rem", fontWeight: "bold", fontSize: "1.2rem", verticalAlign: "top", marginTop: "15px" }}
                                                    />
                                                </div>
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
                                            value={formData?.transferred ? "Sí" : "No"} // acá podés poner lo que quieras
                                            readOnly
                                        />
                                    </div>
                                )
                            )}
                            {formData?.type !== "abandono" && formData.transferred &&
                                <div className="st-data">
                                    <label htmlFor="origin_school">Escuela de Origen</label>
                                    <input
                                        type="text"
                                        id="origin_school"
                                        value={formData.origin_school ?? ""}
                                        onChange={(e) => handleChange("origin_school", e)}
                                        readOnly={!onEdition}
                                    />
                                </div>}
                            {formData?.type !== "abandono" &&
                                <div className="st-data">
                                    <label>Nivel de Matriculación</label>
                                    {!onEdition ? (
                                        <input
                                            type="text"
                                            value={formData.matriculate_level ?? ""}
                                            readOnly
                                        />
                                    ) : (
                                        <select
                                            id="matriculate_level"
                                            onChange={(e) => handleChange("matriculate_level", e)}
                                            value={formData.matriculate_level ?? ""}
                                        >
                                            <option value="">Seleccione un Nivel</option>
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
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    id="notes"
                                    value={formData.notes ?? ""}
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