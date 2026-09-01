const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.json({ mensaje: 'API del Gestor de Tareas funcionando' });
});

// Listar todas las tareas
app.get('/api/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tareas ORDER BY id');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// Crear una tarea
app.post('/api/tareas', async (req, res) => {
    const { titulo, descripcion, fecha_limite, prioridad } = req.body;
    try {
        const resultado = await pool.query(
            'INSERT INTO tareas (titulo, descripcion, fecha_limite, prioridad) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, descripcion, fecha_limite, prioridad]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
});

// Editar una tarea (título, descripción, fecha, prioridad, estado)
app.put('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha_limite, prioridad, estado } = req.body;
    try {
        const resultado = await pool.query(
            `UPDATE tareas SET titulo=$1, descripcion=$2, fecha_limite=$3, prioridad=$4, estado=$5
       WHERE id=$6 RETURNING *`,
            [titulo, descripcion, fecha_limite, prioridad, estado, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar la tarea' });
    }
});

// Borrar una tarea
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tareas WHERE id=$1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al borrar la tarea' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});