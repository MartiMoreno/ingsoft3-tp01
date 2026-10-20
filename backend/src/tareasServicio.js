// Reglas de negocio de tareas: valida y normaliza antes de llegar al repositorio.

const {
    validarTitulo,
    validarPrioridad,
    validarEstado,
    validarFechaLimite,
    validarId,
} = require('./validaciones');

class ErrorValidacion extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = 'ErrorValidacion';
    }
}

// Devuelve el valor normalizado o lanza ErrorValidacion con el mensaje
function exigir(resultado) {
    if (!resultado.valido) throw new ErrorValidacion(resultado.error);
    return resultado.valor;
}

function crearServicioTareas(repo) {
    async function listar() {
        return repo.listar();
    }

    async function crear(datos = {}) {
        const tarea = {
            titulo: exigir(validarTitulo(datos.titulo)),
            descripcion: datos.descripcion ?? null,
            fecha_limite: exigir(validarFechaLimite(datos.fecha_limite)),
            prioridad: exigir(validarPrioridad(datos.prioridad)),
        };
        return repo.crear(tarea);
    }

    // Solo se toman los campos editables: lo que sobre (id, created_at, ...) se ignora
    async function actualizar(id, datos = {}) {
        const idValido = exigir(validarId(id));
        const tarea = {
            titulo: exigir(validarTitulo(datos.titulo)),
            descripcion: datos.descripcion ?? null,
            fecha_limite: exigir(validarFechaLimite(datos.fecha_limite)),
            prioridad: exigir(validarPrioridad(datos.prioridad)),
            estado: exigir(validarEstado(datos.estado)),
        };
        return repo.actualizar(idValido, tarea);
    }

    async function borrar(id) {
        const idValido = exigir(validarId(id));
        await repo.borrar(idValido);
    }

    return { listar, crear, actualizar, borrar };
}

module.exports = { crearServicioTareas, ErrorValidacion };
