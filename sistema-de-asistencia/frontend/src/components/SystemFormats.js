function normalizeDate(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().split("T")[0];
  if (typeof v === "string") {
    const s = v.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // DD/MM/YYYY
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return null;
}

function normalizeGender(g) {
  if (!g) return "Indefinido";
  const s = String(g).trim().toLowerCase();
  if (["masculino", "m", "male", "hombre"].includes(s)) return "Masculino";
  if (["femenino", "f", "female", "mujer"].includes(s)) return "Femenino";
  return "Indefinido";
}

export function FormatStudentForDB(formData) {
  const keyMapStudent = {
    Carnet: "id_mep",
    Nombre: "first_name",
    Apellidos: "surnames",
    Nacionalidad: "nationality",
    "Fecha de Nacimiento": "birth_date",
    going_year: "ongoing_age_year",
    "Lugar de Nacimiento": "birth_place",
    Edad: "ongoing_age",
    Género: "gender",
    Sección: "section",
    "Dirección de Residencia": "address",
  };

  const keyMapGuardians = {
    "Nombre del Encargado 1": "guardian_name_1",
    "Cédula del Encargado 1": "guardian_id_1",
    "Telefono del Encargado 1": "guardian_phone_1",
    "Parentesco del Encargado 1": "guardian_relationship_1",
    "Nombre del Encargado 2": "guardian_name_2",
    "Cédula del Encargado 2": "guardian_id_2",
    "Telefono del Encargado 2": "guardian_phone_2",
    "Parentesco del Encargado 2": "guardian_relationship_2",
    "Nombre del Encargado 3": "guardian_name_3",
    "Cédula del Encargado 3": "guardian_id_3",
    "Telefono del Encargado 3": "guardian_phone_3",
    "Parentesco del Encargado 3": "guardian_relationship_3",
    "Encargado Legal ante la Institución": "institutional_guardian",
  };

  const backendStudent = {};
  const studentData = formData?.student || {};
  const guardiansData = formData?.legal_guardians || {};
  const year = formData?.going_year || new Date().getFullYear();

  // estudiante
  for (const [label, backendKey] of Object.entries(keyMapStudent)) {
    let value = studentData[label];

    // normalizaciones puntuales
    if (backendKey === "birth_date") value = normalizeDate(value);
    if (backendKey === "gender") value = normalizeGender(value);

    backendStudent[backendKey] =
      value !== undefined && value !== null ? value : "";
  }

  // encargados Legales
  for (const [label, backendKey] of Object.entries(keyMapGuardians)) {
    backendStudent[backendKey] =
      guardiansData[label] !== undefined && guardiansData[label] !== null
        ? guardiansData[label]
        : "";
  }

  backendStudent["ongoing_age_year"] = year;
  return backendStudent;
}

export function FormatActionForDB(formData, isNew = false) {
  let backendAction = {
    type: formData.type || "",
    notes: formData.notes || "",
    transferred: formData.transferred,
    origin_school: formData.origin_school || "",
    matriculate_level: formData.matriculate_level || "",
    on_revision: formData.on_revision,
  };

  if (isNew) {
    backendAction.on_revision = true;
  }

  if (formData.type === "Desertor") {
    backendAction.matriculate_level = "";
    backendAction.origin_school = "";
    backendAction.transferred = ""
  } else {
    if (!formData.transferred) {
      backendAction.origin_school = ""
    }
  }

  return backendAction;
};
