function FormatEntries(obj, map) {
    return Object.entries(map)
        .map(([key, [newKey, order]]) => {
            let value = obj?.[key];

            if (value === undefined || value === null || value === "") {
                value = " ";
            } else if (key === "birth_date") {
                const date = new Date(value);
                value = !isNaN(date.getTime())
                    ? date.toISOString().split("T")[0]
                    : null;
            }

            return { key: newKey, value, order };
        })
        .sort((a, b) => a.order - b.order)
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
};

export function FormatStudentRegister(student) {
    const year = student?.ongoing_age_year || new Date().getFullYear();
    const keyMapStudent = {
        id_mep: ["Carnet", 0],
        first_name: ["Nombre", 1],
        surnames: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        birth_place: ["Lugar de Nacimiento", 5],
        gender: ["Género", 6],
        ongoing_age: ["Edad", 7],
        section: ["Sección", 8],
        address: ["Dirección de Residencia", 9],
    };
    const keyMapGuardians = {
        guardian_name_1: ["Nombre del Encargado 1", 1],
        guardian_id_1: ["Cédula del Encargado 1", 2],
        guardian_phone_1: ["Telefono del Encargado 1", 3],
        guardian_relationship_1: ["Parentesco del Encargado 1", 4],
        guardian_name_2: ["Nombre del Encargado 2", 5],
        guardian_id_2: ["Cédula del Encargado 2", 6],
        guardian_phone_2: ["Telefono del Encargado 2", 7],
        guardian_relationship_2: ["Parentesco del Encargado 2", 8],
        guardian_name_3: ["Nombre del Encargado 3", 9],
        guardian_id_3: ["Cédula del Encargado 3", 10],
        guardian_phone_3: ["Telefono del Encargado 3", 11],
        guardian_relationship_3: ["Parentesco del Encargado 3", 12],
        institutional_guardian: ["Encargado Legal ante la Institución", 13],
    };
    if (!student) {
        const emptyStudent = {};
        const emptyGuardian = {};

        const selectedMap = keyMapStudent;
        for (const key in selectedMap) {
            emptyStudent[key] = "";
        }
        for (const key in keyMapGuardians) {
            emptyGuardian[key] = "";
        }
        return {
            student: FormatEntries(emptyStudent, selectedMap),
            legal_guardians: FormatEntries(emptyGuardian, keyMapGuardians),
            name: " *Nuevo Estudiante* "
        };
    }

    // Si sí hay estudiante, procesarlo normalmente
    const orderedStudent = FormatEntries(student, keyMapStudent)

    const orderedLG = FormatEntries(student, keyMapGuardians);

    const name = `${student.first_name ?? ""} ${student.surnames ?? ""}`.trim()

    return {
        student: orderedStudent,
        legal_guardians: orderedLG,
        name: name,
        going_year: year
    };
};

function ResumeStudent(student) {
};

export function FormatActionRegister(student, action) {
};