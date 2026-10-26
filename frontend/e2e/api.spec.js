// Integración: pedidos HTTP reales contra la api y su base, sin navegador ni mocks.
import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL || 'http://localhost:3001';

async function listar(request) {
  const respuesta = await request.get(`${API}/api/tareas`);
  expect(respuesta.status()).toBe(200);
  return respuesta.json();
}

test('el alta guarda en la base de verdad, y el borrado la saca', async ({ request }) => {
  const titulo = `api ${Date.now()}`;

  const alta = await request.post(`${API}/api/tareas`, { data: { titulo, prioridad: 'MEDIA' } });
  expect(alta.status()).toBe(201);
  const creada = await alta.json();
  expect((await listar(request)).map(t => t.titulo)).toContain(titulo);

  const baja = await request.delete(`${API}/api/tareas/${creada.id}`);
  expect(baja.status()).toBe(204);
  expect((await listar(request)).map(t => t.titulo)).not.toContain(titulo);
});

test('un título vacío lo rechaza la api, y no crea nada', async ({ request }) => {
  const antes = await listar(request);

  const alta = await request.post(`${API}/api/tareas`, { data: { titulo: '', prioridad: 'MEDIA' } });

  expect(alta.status()).toBe(400);
  const despues = await listar(request);
  expect(despues).toHaveLength(antes.length);
});

test('cambiar el estado queda guardado en la base', async ({ request }) => {
  const titulo = `api ${Date.now()}`;
  const alta = await request.post(`${API}/api/tareas`, { data: { titulo, prioridad: 'MEDIA' } });
  expect(alta.status()).toBe(201);
  const creada = await alta.json();

  const edicion = await request.put(`${API}/api/tareas/${creada.id}`, {
    data: { titulo, prioridad: 'MEDIA', estado: 'COMPLETADA' },
  });

  expect(edicion.status()).toBe(200);
  const guardada = (await listar(request)).find(t => t.id === creada.id);
  expect(guardada.estado).toBe('COMPLETADA');

  const baja = await request.delete(`${API}/api/tareas/${creada.id}`);
  expect(baja.status()).toBe(204);
  expect((await listar(request)).map(t => t.titulo)).not.toContain(titulo);
});
