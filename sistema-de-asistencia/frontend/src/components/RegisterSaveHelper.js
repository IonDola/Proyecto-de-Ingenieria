import { PrepareStudentForSave, PrepareActionForSave } from "./RegisterFormat";

/* lectura del access token para Authorization */
function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("jwt_access") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

export async function HelpSave(formData, isEdit = false, carnet, initial = null, actionTag) {
  try {
    // Preparar payloads para Django
    const studentPayload = PrepareStudentForSave(formData);
    const actionPayload = PrepareActionForSave(formData, actionTag);

    // Buscar si ya existe el estudiante por id_mep
    const checkStudent = await CheckStudentId(carnet);
    let studentData;
    const access = getAccessToken();

    if (checkStudent.length > 0) {
      studentData = checkStudent[0];
    } else {
      // Crear estudiante nuevo (ahora con Authorization para que la bitacora lo atribuya)
      const studentRes = await fetch(`/students/api/students/new/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(studentPayload),
      });
      if (!studentRes.ok) {
        const errTxt = await studentRes.text().catch(() => "");
        throw new Error(errTxt || "Error al crear el estudiante");
      }
      studentData = await studentRes.json();
    }

    // Crear o actualizar la acción según corresponda
    let url, method;
    if (isEdit && initial != null) {
      url = `/api/actions/${initial}/update/`;
      method = "PATCH";
    } else {
      url = `/api/actions/new/`;
      method = "POST";
    }

    // Asegurar que la acción apunte al estudiante correcto (usar student_id)
    const actionResBody = { ...actionPayload, student_id: studentData.id };
    delete actionResBody.student; // no enviar "student" al endpoint global

    const actionRes = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(actionResBody),
    });

    const actionText = await actionRes.text().catch(() => "");
    let actionData = {};
    try { actionData = JSON.parse(actionText || "{}"); } catch { }

    if (!actionRes.ok) {
      throw new Error(actionData?.error || actionText || `Error HTTP ${actionRes.status}`);
    }

    console.log(" Guardado correctamente:", actionData);
    return { success: true, data: actionData };

  } catch (err) {
    console.error(" Error en handleSave:", err);
    return { success: false, message: err.message || "Error desconocido" };
  }
}

/**
 * Busca estudiantes por id_mep y actualiza estados opcionales de React si se pasan.
 * @param {string} id_mep - Carnet/ID del estudiante a buscar
 * @returns {Promise<Array>} Lista de estudiantes encontrados
 */
export async function CheckStudentId(id_mep) {
  try {
    const response = await fetch(`/students/api/students/?q=${encodeURIComponent(id_mep)}`);
    if (!response.ok) throw new Error("Error al buscar estudiante");

    const data = await response.json();
    const results = data.results || [];

    return results;
  } catch (err) {
    console.error("Error en CheckStudentId:", err);
    return [];
  }
}

export async function MarkAsReviewed(actionId) {
  try {
    const access = getAccessToken();
    const response = await fetch(`/api/actions/${actionId}/update/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ on_revision: false }),
    });
    const text = await response.text().catch(() => "");
    let data = {};
    try { data = JSON.parse(text || "{}"); } catch { }

    if (!response.ok) throw new Error(data?.error || text || "Error al marcar como revisado");

    return { success: true, data };
  } catch (err) {
    console.error("Error en MarkAsReviewed:", err);
    return { success: false, message: err.message || "Error desconocido" };
  }
}