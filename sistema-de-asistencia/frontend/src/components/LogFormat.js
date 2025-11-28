export default function FormatRegister({ register }) {
    console.log("Formatting register:", register);
    // Mapas de traducción
    const typeMap = {
        egreso: "Egreso",
        ingreso: "Ingreso",
        desertor: "Desertor",
        auth: "Autenticación",
        bulk_operation: "Operación Masiva",
        update: "Actualización",
        visitor_management: "Gestión de Visitantes",

    };

    const actionMap = {
        ACTION_CREATED: "Acción Creada",
        ACTION_UPDATED: "Acción Actualizada",
        ACTION_DELETED: "Acción Eliminada",
        VISITOR_SUSPENDED: "Visitante Suspendido",
        VISITORKEY_CREATED: "Llave de Visitante Creada",
        STUDENT_CREATED: "Estudiante Creado",
        STUDENT_UPDATED: "Estudiante Actualizado",
        STUDENT_DELETED: "Estudiante Eliminado",
        BULK_DELETE: "Eliminación Masiva",
        BULK_RECOVER: "Recuperación Masiva",
    };

    const statusMap = {
        success: "Éxito",
        failed: "Fallido",
    };

    // ---- Formateo de ENTITY si la acción es ACTION_UPDATED ----
    const formatEntity = (obj) => {
        const { action, entity } = obj;

        if (action !== "ACTION_UPDATED") return entity;

        // Extraer nombre del estudiante desde el texto
        const match = entity.match(/estudiante\s(.+)$/i);
        const studentName = match ? match[1] : "";

        return `Acción de Estudiante ${studentName}`;
    };

    // ---- Resultado ----
    return {
        timestamp: (() => {
            const d = new Date(register.timestamp);
            return isNaN(d) ? register.timestamp : d.toISOString();
        })(),

        action: actionMap[register.action] ?? register.action,

        type: typeMap[register.type] ?? register.type,

        entity: formatEntity(register),

        status: statusMap[register.status] ?? register.status,

        metadata: register.metadata,
        user: register.user?.full_name ?? "",
    };
}
