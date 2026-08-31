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
app.get('/tareas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tareas ORDER BY id');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// Crear una tarea
app.post('/tareas', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});