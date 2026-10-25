const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { crearRepositorioTareas } = require('./src/tareasRepo');
const { crearServicioTareas, ErrorValidacion } = require('./src/tareasServicio');

const servicio = crearServicioTareas(crearRepositorioTareas(pool));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// 400 si los datos no son válidos; cualquier otro error es un 500 con el mensaje de la ruta
function responderError(res, error, mensaje500) {
    if (error instanceof ErrorValidacion) {
        return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: mensaje500 });
}

app.get('/', (req, res) => {
    res.json({ mensaje: 'API del Gestor de Tareas funcionando' });
});

// Chequeo de vida para Render: no toca la base
app.get('/health', (req, res) => {
    res.json({ estado: 'ok' });
});

// Listar todas las tareas
app.get('/api/tareas', async (req, res) => {
    try {
        res.json(await servicio.listar());
    } catch (error) {
        responderError(res, error, 'Error al obtener las tareas');
    }
});

// Crear una tarea
app.post('/api/tareas', async (req, res) => {
    try {
        res.status(201).json(await servicio.crear(req.body));
    } catch (error) {
        responderError(res, error, 'Error al crear la tarea');
    }
});

// Editar una tarea (título, descripción, fecha, prioridad, estado)
app.put('/api/tareas/:id', async (req, res) => {
    try {
        const tarea = await servicio.actualizar(req.params.id, req.body);
        if (tarea === null) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(tarea);
    } catch (error) {
        responderError(res, error, 'Error al editar la tarea');
    }
});

// Borrar una tarea
app.delete('/api/tareas/:id', async (req, res) => {
    try {
        await servicio.borrar(req.params.id);
        res.status(204).send();
    } catch (error) {
        responderError(res, error, 'Error al borrar la tarea');
    }
});

// Primero se asegura la tabla; si la base no responde, no tiene sentido arrancar
pool.asegurarEsquema()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('No se pudo preparar la base de datos:', error);
        process.exit(1);
    });
