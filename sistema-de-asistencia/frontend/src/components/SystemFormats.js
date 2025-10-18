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
    "Nombre del Encargado 1": "guardian_name_1",
    "Cédula del Encargado 1": "guardian_id_1",
    "Telefono del Encargado 1": "guardian_phone_1",
    "Nombre del Encargado 2": "guardian_name_2",
    "Cédula del Encargado 2": "guardian_id_2",
    "Telefono del Encargado 2": "guardian_phone_2",
    "Nombre del Encargado 3": "guardian_name_3",
    "Cédula del Encargado 3": "guardian_id_3",
    "Telefono del Encargado 3": "guardian_phone_3",
  };

  const map = withCarnet ? keyMapStudentWithCarnet : keyMapStudent;

  const backendStudent = {};
  const studentData = formData?.student || {};
  const guardiansData = formData?.legal_guardians || formData?.leg_guardians || {};

  // estudiante
  for (const [label, backendKey] of Object.entries(map)) {
    let value = studentData[label];

    // normalizaciones puntuales
    if (backendKey === "birth_date") value = normalizeDate(value);
    if (backendKey === "gender") value = normalizeGender(value);

    backendStudent[backendKey] =
      value !== undefined && value !== null ? value : "";
  }

  if (withCarnet) {
    const carnetUI = (formData?.carnet ?? "").toString().trim();
    if (!backendStudent.id_mep || backendStudent.id_mep.toString().trim() === "") {
      backendStudent.id_mep = carnetUI;
    }
  }

  // encargados Legales
  for (const [label, backendKey] of Object.entries(keyMapGuardians)) {
    backendStudent[backendKey] =
      guardiansData[label] !== undefined && guardiansData[label] !== null
        ? guardiansData[label]
        : "";
  }

  return backendStudent;
}

export function FormatActionForDB(data, tag) {
  const reg = data?.register || {};
  const notes = (reg["Notas"] ?? data?.notes ?? "").toString();

  let transferredRaw = reg["Transferido"] ?? data?.transferred;
  if (typeof transferredRaw === "string") {
    const t = transferredRaw.trim().toLowerCase();
    transferredRaw = (t === "true" || t === "1" || t === "sí" || t === "si");
  }
  const transferred = !!transferredRaw;

  const on_revision = (typeof data?.en_revision !== "undefined")
    ? !!data.en_revision
    : (typeof data?.on_revision !== "undefined" ? !!data.on_revision : true);

  let origin_school = null;
  if (tag === "ingreso") {
    const raw = reg["Escuela de Origen"] ?? data?.origin_school;
    origin_school = (raw === undefined || raw === null || String(raw).trim() === "") ? null : String(raw).trim();
  }

  return {
    type: tag || "ingreso",
    notes,
    transferred,
    on_revision,
    ...(tag === "ingreso" ? { origin_school } : {}),
  };
}
