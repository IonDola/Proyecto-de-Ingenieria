export function formatRegister({ register, student, schoolTag = false }) {
    const keyMap = {
        first_name: ["Nombre", 1],
        last_name: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        gender: ["Género", 5],
        section: ["Sección", 6],
        address: ["Dirección de Residencia", 7],
        notes: ["Notas", 8],
    };
    const keyMapWithSchool = {
        first_name: ["Nombre", 1],
        last_name: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        gender: ["Género", 5],
        section: ["Sección", 6],
        address: ["Dirección de Residencia", 7],
        original_school: ["Escuela de Origen", 8],
        notes: ["Notas", 9],
    };
    const keyMapGuardians = {
        legal_guardian_1: ["Nombre del Encargado 1", 1],
        legal_guardian_id_1: ["Cédula del Encargado 1", 2],
        legal_guardian_phone_1: ["Telefono del Encargado 1", 3],
        legal_guardian_2: ["Nombre del Encargado 2", 4],
        legal_guardian_id_2: ["Cédula del Encargado 2", 5],
        legal_guardian_phone_2: ["Telefono del Encargado 2", 6],
        legal_guardian_3: ["Nombre del Encargado 3", 7],
        legal_guardian_id_3: ["Cédula del Encargado 3", 5],
        legal_guardian_phone_3: ["Telefono del Encargado 3", 9],
    };

    const combined = { ...(student || {}), ...(register || {}) };
    const carnet = combined.id_mep || " ";
    const onRevition = combined.revition_state || true;

    const formatEntries = (obj, map) => {
        return Object.entries(map)
            .map(([key, [newKey, order]]) => {
                let value = obj?.[key];

                if (value === undefined || value === null || value === "") {
                    value = " ";
                } else if (key === "birth_date") {
                    const date = new Date(value);
                    value = !isNaN(date.getTime())
                        ? date.toISOString().split("T")[0]
                        : " ";
                }

                return { key: newKey, value, order };
            })
            .sort((a, b) => a.order - b.order)
            .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    };
    const orderedSt = schoolTag ? formatEntries(combined, keyMapWithSchool) : formatEntries(combined, keyMap);
    const orderedLG = formatEntries(combined, keyMapGuardians);

    return [orderedSt, orderedLG, carnet, onRevition];
}
