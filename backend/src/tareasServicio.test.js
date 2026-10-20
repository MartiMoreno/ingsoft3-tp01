import { describe, it, expect, vi } from 'vitest';

const { crearServicioTareas, ErrorValidacion } = require('./tareasServicio');

function crearRepoFalso() {
    return {
        listar: vi.fn().mockResolvedValue([]),
        crear: vi.fn().mockImplementation(async (tarea) => ({ id: 1, ...tarea })),
        actualizar: vi.fn().mockImplementation(async (id, tarea) => ({ id, ...tarea })),
        borrar: vi.fn().mockResolvedValue(undefined),
    };
}

describe('crear', () => {
    it('guarda la tarea una sola vez con los campos normalizados', async () => {
        const repo = crearRepoFalso();
        const servicio = crearServicioTareas(repo);

        await servicio.crear({ titulo: '  Estudiar  ', descripcion: 'cap. 3', fecha_limite: '', prioridad: 'ALTA' });

        expect(repo.crear).toHaveBeenCalledTimes(1);
        expect(repo.crear).toHaveBeenCalledWith({
            titulo: 'Estudiar',
            descripcion: 'cap. 3',
            fecha_limite: null,
            prioridad: 'ALTA',
        });
    });

    it('rechaza un título vacío sin llegar a guardar', async () => {
        const repo = crearRepoFalso();
        const servicio = crearServicioTareas(repo);

        const intento = servicio.crear({ titulo: '', prioridad: 'ALTA' });

        await expect(intento).rejects.toBeInstanceOf(ErrorValidacion);
        expect(repo.crear).not.toHaveBeenCalled();
    });

    it('rechaza una prioridad inválida sin llegar a guardar', async () => {
        const repo = crearRepoFalso();
        const servicio = crearServicioTareas(repo);

        const intento = servicio.crear({ titulo: 'Estudiar', prioridad: 'URGENTE' });

        await expect(intento).rejects.toBeInstanceOf(ErrorValidacion);
        expect(repo.crear).not.toHaveBeenCalled();
    });
});

describe('actualizar', () => {
    it('ignora los campos extra que manda el frontend', async () => {
        const repo = crearRepoFalso();
        const servicio = crearServicioTareas(repo);
        const datos = {
            id: 99,
            created_at: '2026-10-01T12:00:00.000Z',
            titulo: 'Estudiar',
            descripcion: null,
            fecha_limite: '2026-10-20',
            prioridad: 'MEDIA',
            estado: 'COMPLETADA',
        };

        await servicio.actualizar('7', datos);

        expect(repo.actualizar).toHaveBeenCalledWith(7, {
            titulo: 'Estudiar',
            descripcion: null,
            fecha_limite: '2026-10-20',
            prioridad: 'MEDIA',
            estado: 'COMPLETADA',
        });
    });

    it('rechaza un id inválido sin llegar a guardar', async () => {
        const repo = crearRepoFalso();
        const servicio = crearServicioTareas(repo);

        const intento = servicio.actualizar('abc', { titulo: 'Estudiar', prioridad: 'MEDIA', estado: 'PENDIENTE' });

        await expect(intento).rejects.toBeInstanceOf(ErrorValidacion);
        expect(repo.actualizar).not.toHaveBeenCalled();
    });

    it('devuelve null cuando la tarea no existe', async () => {
        const repo = crearRepoFalso();
        repo.actualizar.mockResolvedValue(null);
        const servicio = crearServicioTareas(repo);

        const resultado = await servicio.actualizar('7', { titulo: 'Estudiar', prioridad: 'MEDIA', estado: 'PENDIENTE' });

        expect(resultado).toBeNull();
    });
});
