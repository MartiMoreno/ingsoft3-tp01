// Funciones puras de validación: no tocan red, base ni la fecha del sistema.
// Cada una devuelve { valido: true, valor } o { valido: false, error }.

const LARGO_MAXIMO_TITULO = 200;
const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA'];
const ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'];

// 'YYYY-MM-DD' solo, o seguido de la parte horaria ISO (ej. 'T00:00:00.000Z')
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const ok = (valor) => ({ valido: true, valor });
const fallo = (error) => ({ valido: false, error });

function validarTitulo(titulo) {
    if (titulo === null || titulo === undefined) return fallo('El título es obligatorio.');
    if (typeof titulo !== 'string') return fallo('El título debe ser un texto.');

    const limpio = titulo.trim();
    if (limpio === '') return fallo('El título es obligatorio.');
    if (limpio.length > LARGO_MAXIMO_TITULO) {
        return fallo(`El título no puede superar los ${LARGO_MAXIMO_TITULO} caracteres.`);
    }
    return ok(limpio);
}

function validarPrioridad(prioridad) {
    if (!PRIORIDADES.includes(prioridad)) {
        return fallo(`La prioridad debe ser una de: ${PRIORIDADES.join(', ')}.`);
    }
    return ok(prioridad);
}

function validarEstado(estado) {
    if (!ESTADOS.includes(estado)) {
        return fallo(`El estado debe ser uno de: ${ESTADOS.join(', ')}.`);
    }
    return ok(estado);
}

function validarFechaLimite(fecha) {
    if (fecha === null || fecha === undefined || fecha === '') return ok(null);
    if (typeof fecha !== 'string') return fallo('La fecha límite debe tener el formato YYYY-MM-DD.');

    const partes = FORMATO_FECHA.exec(fecha);
    if (!partes) return fallo('La fecha límite debe tener el formato YYYY-MM-DD.');

    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);

    // Se arma la fecha en UTC y se compara: si el día no existe (ej. 30 de febrero),
    // Date lo "corre" al mes siguiente y los componentes ya no coinciden.
    const armada = new Date(Date.UTC(anio, mes - 1, dia));
    if (
        armada.getUTCFullYear() !== anio ||
        armada.getUTCMonth() !== mes - 1 ||
        armada.getUTCDate() !== dia
    ) {
        return fallo('La fecha límite no es una fecha válida.');
    }

    return ok(`${partes[1]}-${partes[2]}-${partes[3]}`);
}

function validarId(id) {
    let numero = id;
    if (typeof id === 'string') {
        if (!/^\d+$/.test(id)) return fallo('El id debe ser un número entero positivo.');
        numero = Number(id);
    }
    if (typeof numero !== 'number' || !Number.isSafeInteger(numero) || numero <= 0) {
        return fallo('El id debe ser un número entero positivo.');
    }
    return ok(numero);
}

module.exports = {
    LARGO_MAXIMO_TITULO,
    PRIORIDADES,
    ESTADOS,
    validarTitulo,
    validarPrioridad,
    validarEstado,
    validarFechaLimite,
    validarId,
};
