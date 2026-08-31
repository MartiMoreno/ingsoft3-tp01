import { useState, useEffect } from 'react';

const API_URL = '/api';

function App() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');

  const cargarTareas = async () => {
    const respuesta = await fetch(`${API_URL}/tareas`);
    const datos = await respuesta.json();
    setTareas(datos);
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  const crearTarea = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        descripcion,
        fecha_limite: fechaLimite,
        prioridad,
      }),
    });
    setTitulo('');
    setDescripcion('');
    setFechaLimite('');
    setPrioridad('MEDIA');
    cargarTareas();
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Gestor de Tareas</h1>

      <form onSubmit={crearTarea} style={{ marginBottom: 30 }}>
        <div>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
        </div>
        <div>
          <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
        <button type="submit">Crear tarea</button>
      </form>

      <h2>Tareas</h2>
      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            <strong>{tarea.titulo}</strong> — {tarea.prioridad} — {tarea.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;