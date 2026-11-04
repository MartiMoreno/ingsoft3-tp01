// Resume una lista de tareas: cuántas hay por estado y cuántas están vencidas
// respecto de "hoy" (YYYY-MM-DD). "hoy" entra por parámetro para que el
// resultado no dependa del reloj.

function resumirTareas(tareas, hoy) {
    const resumen = {
        total: 0,
        pendientes: 0,
        enProgreso: 0,
        completadas: 0,
        vencidas: 0,
    };

    if (!Array.isArray(tareas)) {
        return resumen;
    }

    for (const tarea of tareas) {
        resumen.total += 1;

        if (tarea.estado === 'PENDIENTE') {
            resumen.pendientes += 1;
        } else if (tarea.estado === 'EN_PROGRESO') {
            resumen.enProgreso += 1;
        } else if (tarea.estado === 'COMPLETADA') {
            resumen.completadas += 1;
        }

        if (
            tarea.fecha_limite &&
            tarea.fecha_limite.slice(0, 10) < hoy &&
            tarea.estado !== 'COMPLETADA'
        ) {
            resumen.vencidas += 1;
        }
    }

    return resumen;
}

module.exports = { resumirTareas };
