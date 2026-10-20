// Acceso a datos de tareas. Recibe el pool por parámetro para poder
// reemplazarlo por un doble en los tests.

function crearRepositorioTareas(pool) {
    async function listar() {
        const resultado = await pool.query('SELECT * FROM tareas ORDER BY id');
        return resultado.rows;
    }

    async function crear({ titulo, descripcion, fecha_limite, prioridad }) {
        const resultado = await pool.query(
            'INSERT INTO tareas (titulo, descripcion, fecha_limite, prioridad) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, descripcion, fecha_limite, prioridad]
        );
        return resultado.rows[0];
    }

    // Devuelve null si no existe una tarea con ese id
    async function actualizar(id, { titulo, descripcion, fecha_limite, prioridad, estado }) {
        const resultado = await pool.query(
            `UPDATE tareas SET titulo=$1, descripcion=$2, fecha_limite=$3, prioridad=$4, estado=$5
       WHERE id=$6 RETURNING *`,
            [titulo, descripcion, fecha_limite, prioridad, estado, id]
        );
        if (resultado.rows.length === 0) return null;
        return resultado.rows[0];
    }

    async function borrar(id) {
        await pool.query('DELETE FROM tareas WHERE id=$1', [id]);
    }

    return { listar, crear, actualizar, borrar };
}

module.exports = { crearRepositorioTareas };
