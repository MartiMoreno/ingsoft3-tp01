import { describe, it, expect, vi } from 'vitest';
import { filtrarTareas, textoVencimiento, listarTareas, crearTarea, borrarTarea } from './tareas';

// Respuesta falsa con la forma mínima de la de fetch
function respuesta(ok, cuerpo) {
  return { ok, json: async () => cuerpo };
}

const TAREAS = [
  { id: 1, estado: 'PENDIENTE', prioridad: 'ALTA' },
  { id: 2, estado: 'PENDIENTE', prioridad: 'BAJA' },
  { id: 3, estado: 'COMPLETADA', prioridad: 'ALTA' },
  { id: 4, estado: 'EN_PROGRESO', prioridad: 'MEDIA' },
];

describe('filtrarTareas', () => {
  it.each([
    ['sin filtros devuelve todas', { estado: '', prioridad: '' }, [1, 2, 3, 4]],
    ['solo por estado', { estado: 'PENDIENTE', prioridad: '' }, [1, 2]],
    ['solo por prioridad', { estado: '', prioridad: 'ALTA' }, [1, 3]],
    ['por estado y prioridad a la vez', { estado: 'PENDIENTE', prioridad: 'ALTA' }, [1]],
    ['una combinación sin coincidencias devuelve vacío', { estado: 'COMPLETADA', prioridad: 'BAJA' }, []],
  ])('filtra %s', (_caso, filtros, idsEsperados) => {
    const resultado = filtrarTareas(TAREAS, filtros);

    expect(resultado.map(t => t.id)).toEqual(idsEsperados);
  });
});

describe('textoVencimiento', () => {
  it.each([null, undefined, ''])('muestra "Sin fecha" cuando no hay fecha (%j)', (fecha) => {
    const texto = textoVencimiento(fecha);

    expect(texto).toBe('Sin fecha');
  });

  it('muestra el día que manda el backend sin correrlo por la zona horaria', () => {
    const texto = textoVencimiento('2026-10-20T00:00:00.000Z');

    expect(texto).toBe('Vence 20/10/2026');
  });

  it('completa día y mes con dos dígitos', () => {
    const texto = textoVencimiento('2026-01-05');

    expect(texto).toBe('Vence 05/01/2026');
  });
});

describe('API de tareas', () => {
  it('crea la tarea con un único POST en JSON a /api/tareas', async () => {
    const datos = { titulo: 'Estudiar', descripcion: '', fecha_limite: '', prioridad: 'MEDIA' };
    const traer = vi.fn().mockResolvedValue(respuesta(true, { id: 1, ...datos }));

    await crearTarea(datos, traer);

    expect(traer).toHaveBeenCalledTimes(1);
    expect(traer).toHaveBeenCalledWith('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  });

  it('lanza un error con el mensaje del backend cuando la creación falla', async () => {
    const traer = vi.fn().mockResolvedValue(respuesta(false, { error: 'El título es obligatorio.' }));

    const intento = crearTarea({ titulo: '' }, traer);

    await expect(intento).rejects.toThrow('El título es obligatorio.');
  });

  it('devuelve las tareas que trae la respuesta', async () => {
    const traer = vi.fn().mockResolvedValue(respuesta(true, TAREAS));

    const tareas = await listarTareas(traer);

    expect(tareas).toEqual(TAREAS);
  });

  it('borra la tarea con un DELETE a su URL', async () => {
    const traer = vi.fn().mockResolvedValue({ ok: true });

    await borrarTarea(7, traer);

    expect(traer).toHaveBeenCalledWith('/api/tareas/7', { method: 'DELETE' });
  });
});
