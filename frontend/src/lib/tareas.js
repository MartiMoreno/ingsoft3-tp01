const API_URL = '/api';

// Un filtro vacío no filtra
export function filtrarTareas(tareas, { estado, prioridad } = {}) {
  return tareas.filter(t =>
    (!estado || t.estado === estado) &&
    (!prioridad || t.prioridad === prioridad)
  );
}

// Se arma desde el texto 'YYYY-MM-DD' (sin new Date) para no depender de la zona horaria
export function textoVencimiento(fecha) {
  if (!fecha) return 'Sin fecha';
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `Vence ${dia}/${mes}/${anio}`;
}

// Si la respuesta no es ok, lanza un Error con el mensaje del backend
async function verificar(respuesta) {
  if (respuesta.ok) return respuesta;
  let mensaje = 'Ocurrió un error al comunicarse con el servidor.';
  try {
    const cuerpo = await respuesta.json();
    if (cuerpo && cuerpo.error) mensaje = cuerpo.error;
  } catch {
    // La respuesta no traía JSON: queda el mensaje genérico
  }
  throw new Error(mensaje);
}

export async function listarTareas(traer = fetch) {
  const respuesta = await verificar(await traer(`${API_URL}/tareas`));
  return respuesta.json();
}

export async function crearTarea(datos, traer = fetch) {
  const respuesta = await verificar(await traer(`${API_URL}/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }));
  return respuesta.json();
}

export async function actualizarTarea(id, datos, traer = fetch) {
  const respuesta = await verificar(await traer(`${API_URL}/tareas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }));
  return respuesta.json();
}

export async function borrarTarea(id, traer = fetch) {
  await verificar(await traer(`${API_URL}/tareas/${id}`, { method: 'DELETE' }));
}
