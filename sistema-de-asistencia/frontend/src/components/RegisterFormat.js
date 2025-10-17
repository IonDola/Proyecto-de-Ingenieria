export function FormatRegister({ register, student, schoolTag = false }) {
    const keyMap = {
        transferred: ["Transferido", 1],
        notes: ["Notas", 2],
    };
    const keyMapWithSchool = {
        origin_school: ["Escuela de Origen", 1],
        transferred: ["Transferido", 2],
        notes: ["Notas", 3],
    };
    const keyMapStudent = {
        first_name: ["Nombre", 1],
        last_name: ["Apellidos", 2],
        nationality: ["Nacionalidad", 3],
        birth_date: ["Fecha de Nacimiento", 4],
        gender: ["Género", 5],
        section: ["Sección", 6],
        address: ["Dirección de Residencia", 7],

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

    const carnet = student.id_mep || " ";
    // TODO: Hacer que evalue el valor de on_revision del registro
    const onRevision = true;

    const FormatEntries = (obj, map) => {
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
    const orderedReport = schoolTag ? FormatEntries(register, keyMapWithSchool) : FormatEntries(register, keyMap);
    const orderedStudent = FormatEntries(student, keyMapStudent);
    const orderedLG = FormatEntries(student, keyMapGuardians);
    return [orderedReport, orderedStudent, orderedLG, carnet, onRevision];
}

// Utilidad para normalizar fechas en formato YYYY-MM-DD
function NormalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
}

/**
 * Convierte la data del formulario o documento a un payload compatible con el modelo Student de Django.
 * @param {Object} data - Objeto completo que contiene `register`, `leg_guardians` y `carnet`.
 * @returns {Object} Payload listo para POST/PATCH a Django.
 */
export function PrepareStudentForSave(data) {
    const { register = {}, leg_guardians = {}, carnet } = data;

    const studentData = {
        id_mep: carnet?.trim() || "",
        first_name: register.first_name || "",
        last_name: register.last_name || "",
        nationality: register.nationality || "Costa Rica",
        birth_date: NormalizeDate(register.birth_date) || null,
        gender: register.gender || "Indefinido",
        section: register.section || "",
        address: register.address || null,

        guardian_name_1: leg_guardians.legal_guardian_1 || "Some Parent",
        guardian_id_1: leg_guardians.legal_guardian_id_1 || "Some ID",
        guardian_phone_1: leg_guardians.legal_guardian_phone_1 || "Some PhoneNumber",

        guardian_name_2: leg_guardians.legal_guardian_2 || null,
        guardian_id_2: leg_guardians.legal_guardian_id_2 || null,
        guardian_phone_2: leg_guardians.legal_guardian_phone_2 || null,

        guardian_name_3: leg_guardians.legal_guardian_3 || null,
        guardian_id_3: leg_guardians.legal_guardian_id_3 || null,
        guardian_phone_3: leg_guardians.legal_guardian_phone_3 || null,
    };

    return studentData;
}

/**
 * Convierte la data del formulario o documento a un payload compatible con el modelo Action de Django.
 * @param {Object} data - Objeto que contiene los campos relevantes del registro de acción.
 * @returns {Object} Payload listo para POST/PATCH a Django.
 */
export function PrepareActionForSave(data, actionTag) {
  const { notes, student_id, transferred, en_revision, origin_school } = data;

  const actionData = {
    type: actionTag || "ingreso",
    notes: notes || "",
    student: student_id,                
    transferred: !!transferred,
    on_revision: en_revision !== undefined ? !!en_revision : true,
  };

  if (actionTag === "ingreso" && origin_school) {
    actionData.origin_school = origin_school;
  }

  return actionData;
}
