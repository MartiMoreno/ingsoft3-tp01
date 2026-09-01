import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_URL = '/api';

const coloresPrioridad = { BAJA: '#dcfce7', MEDIA: '#dbeafe', ALTA: '#fee2e2' };
const textoPrioridad = { BAJA: '#166534', MEDIA: '#1e40af', ALTA: '#991b1b' };
const coloresEstado = { PENDIENTE: '#fef3c7', EN_PROGRESO: '#dcfce7', COMPLETADA: '#f3f4f6' };
const textoEstado = { PENDIENTE: '#92400e', EN_PROGRESO: '#166534', COMPLETADA: '#6b7280' };

function Nav() {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <Link to="/" style={navStyle}>Tareas</Link>
      <Link to="/nueva" style={navStyle}>Nueva tarea</Link>
    </div>
  );
}

const navStyle = {
  flex: 1, textAlign: 'center', padding: 10, borderRadius: 8,
  background: '#f3f4f6', color: '#374151', fontSize: 14,
  textDecoration: 'none', fontWeight: 500,
};

function Badge({ texto, bg, color }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: bg, color, fontWeight: 500 }}>
      {texto}
    </span>
  );
}

function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const cargar = async () => {
    const r = await fetch(`${API_URL}/tareas`);
    setTareas(await r.json());
  };

  useEffect(() => { cargar(); }, []);

  const filtradas = tareas.filter(t =>
    (!filtroEstado || t.estado === filtroEstado) &&
    (!filtroPrioridad || t.prioridad === filtroPrioridad)
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Gestor de tareas</h1>
        <Link to="/nueva" style={{ fontSize: 13, padding: '8px 14px', background: '#111827', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
          + Nueva tarea
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={selectStyle}>
          <option value="">Estado: todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="COMPLETADA">Completada</option>
        </select>
        <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} style={selectStyle}>
          <option value="">Prioridad: todas</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtradas.length === 0 && <p style={{ color: '#6b7280', fontSize: 14 }}>No hay tareas para mostrar.</p>}
        {filtradas.map(t => (
          <Link key={t.id} to={`/tarea/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{t.titulo}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                  {t.fecha_limite ? `Vence ${new Date(t.fecha_limite).toLocaleDateString('es-AR')}` : 'Sin fecha'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge texto={t.prioridad} bg={coloresPrioridad[t.prioridad]} color={textoPrioridad[t.prioridad]} />
                <Badge texto={t.estado.replace('_', ' ')} bg={coloresEstado[t.estado]} color={textoEstado[t.estado]} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const selectStyle = { flex: 1, fontSize: 13, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' };
const inputStyle = { width: '100%', fontSize: 14, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', boxSizing: 'border-box' };
const labelStyle = { fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 4 };

function NuevaTarea() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');

  const crear = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, fecha_limite: fechaLimite, prioridad }),
    });
    navigate('/');
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, marginTop: 0 }}>Nueva tarea</h1>
      <form onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Título</label>
          <input style={inputStyle} value={titulo} onChange={e => setTitulo(e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha límite</label>
            <input type="date" style={inputStyle} value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Prioridad</label>
            <select style={inputStyle} value={prioridad} onChange={e => setPrioridad(e.target.value)}>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <Link to="/" style={{ fontSize: 13, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, textDecoration: 'none', color: '#374151' }}>Cancelar</Link>
          <button type="submit" style={{ fontSize: 13, padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: 8 }}>Crear tarea</button>
        </div>
      </form>
    </div>
  );
}

function DetalleTarea() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(null);

  const cargar = async () => {
    const r = await fetch(`${API_URL}/tareas`);
    const todas = await r.json();
    setTarea(todas.find(t => String(t.id) === id));
  };

  useEffect(() => { cargar(); }, [id]);

  if (!tarea) return <p>Cargando...</p>;

  const guardar = async () => {
    await fetch(`${API_URL}/tareas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarea),
    });
    navigate('/');
  };

  const eliminar = async () => {
    await fetch(`${API_URL}/tareas/${id}`, { method: 'DELETE' });
    navigate('/');
  };

  return (
    <div>
      <Link to="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>&larr; Volver</Link>
      <h1 style={{ fontSize: 20 }}>{tarea.titulo}</h1>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <Badge texto={tarea.prioridad} bg={coloresPrioridad[tarea.prioridad]} color={textoPrioridad[tarea.prioridad]} />
        <Badge texto={tarea.estado.replace('_', ' ')} bg={coloresEstado[tarea.estado]} color={textoEstado[tarea.estado]} />
      </div>

      <p style={{ fontSize: 14, color: '#6b7280' }}>{tarea.descripcion || 'Sin descripción'}</p>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginBottom: 16 }}>
        <table style={{ width: '100%', fontSize: 13 }}>
          <tbody>
            <tr>
              <td style={{ color: '#6b7280', padding: '4px 0' }}>Vence</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>
                {tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-AR') : 'Sin fecha'}
              </td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', padding: '4px 0' }}>Creada</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>
                {new Date(tarea.created_at).toLocaleDateString('es-AR')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Cambiar estado</label>
        <select style={inputStyle} value={tarea.estado} onChange={e => setTarea({ ...tarea, estado: e.target.value })}>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="COMPLETADA">Completada</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={eliminar} style={{ fontSize: 13, padding: '8px 16px', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, background: 'white' }}>Eliminar</button>
        <button onClick={guardar} style={{ fontSize: 13, padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: 8 }}>Guardar cambios</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Nav />
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <Routes>
          <Route path="/" element={<ListaTareas />} />
          <Route path="/nueva" element={<NuevaTarea />} />
          <Route path="/tarea/:id" element={<DetalleTarea />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;