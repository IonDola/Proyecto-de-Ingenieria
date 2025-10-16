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

export function FormatStudentRegister({ student, withCarnet = false }) {
    const keyMapStudent = {
        first_name: ["Nombre", 1],
        last_name: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        gender: ["Género", 5],
        section: ["Sección", 6],
        address: ["Dirección de Residencia", 7],
    };
    const keyMapStudentWithCarnet = {
        id_mep: ["Carnet", 0],
        first_name: ["Nombre", 1],
        last_name: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        gender: ["Género", 5],
        section: ["Sección", 6],
        address: ["Dirección de Residencia", 7],
    };
    const keyMapGuardians = {
        guardian_name_1: ["Nombre del Encargado 1", 1],
        guardian_id_1: ["Cédula del Encargado 1", 2],
        guardian_phone_1: ["Telefono del Encargado 1", 3],
        guardian_name_2: ["Nombre del Encargado 2", 4],
        guardian_id_2: ["Cédula del Encargado 2", 5],
        guardian_phone_2: ["Telefono del Encargado 2", 6],
        guardian_name_3: ["Nombre del Encargado 3", 7],
        guardian_id_3: ["Cédula del Encargado 3", 5],
        guardian_phone_3: ["Telefono del Encargado 3", 9],
    };
    if (!student) {
        const emptyStudent = {};
        const emptyGuardian = {};

        const selectedMap = withCarnet ? keyMapStudentWithCarnet : keyMapStudent;
        for (const key in selectedMap) {
            emptyStudent[key] = "";
        }
        for (const key in keyMapGuardians) {
            emptyGuardian[key] = "";
        }
        return {
            student: FormatEntries(emptyStudent, selectedMap),
            legal_guardians: FormatEntries(emptyGuardian, keyMapGuardians),
            carnet: " ",
            name: " *Nuevo Estudiante* "
        };
    }

    // Si sí hay estudiante, procesarlo normalmente
    const orderedStudent = withCarnet
        ? FormatEntries(student, keyMapStudentWithCarnet)
        : FormatEntries(student, keyMapStudent);

    const orderedLG = FormatEntries(student, keyMapGuardians);

    const carnet = student.id_mep ?? " ";
    const name = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()

    return {
        student: orderedStudent,
        legal_guardians: orderedLG,
        carnet: carnet,
        name: name
    };
};

