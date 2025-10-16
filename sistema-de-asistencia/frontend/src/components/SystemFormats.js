export function FormatStudentForDB(formData, withCarnet = false) {
    const keyMapStudent = {
        Nombre: "first_name",
        Apellidos: "last_name",
        Nacionalidad: "nationality",
        "Fecha de Nacimiento": "birth_date",
        Género: "gender",
        Sección: "section",
        "Dirección de Residencia": "address",
    };

    const keyMapStudentWithCarnet = {
        Carnet: "id_mep",
        Nombre: "first_name",
        Apellidos: "last_name",
        Nacionalidad: "nationality",
        "Fecha de Nacimiento": "birth_date",
        Género: "gender",
        Sección: "section",
        "Dirección de Residencia": "address",
    };

    const keyMapGuardians = {
        "Nombre del Encargado 1": "legal_guardian_1",
        "Cédula del Encargado 1": "legal_guardian_id_1",
        "Telefono del Encargado 1": "legal_guardian_phone_1",
        "Nombre del Encargado 2": "legal_guardian_2",
        "Cédula del Encargado 2": "legal_guardian_id_2",
        "Telefono del Encargado 2": "legal_guardian_phone_2",
        "Nombre del Encargado 3": "legal_guardian_3",
        "Cédula del Encargado 3": "legal_guardian_id_3",
        "Telefono del Encargado 3": "legal_guardian_phone_3",
    };

    const map = withCarnet ? keyMapStudentWithCarnet : keyMapStudent;

    const backendStudent = {};
    const studentData = formData?.student || {};
    const guardiansData = formData?.legal_guardians || {};

    // Procesar los campos del estudiante
    for (const [label, backendKey] of Object.entries(map)) {
        backendStudent[backendKey] = studentData[label] ?? " ";
    }

    // Procesar los encargados legales
    for (const [label, backendKey] of Object.entries(keyMapGuardians)) {
        backendStudent[backendKey] = guardiansData[label] ?? " ";
    }

    return backendStudent;
};