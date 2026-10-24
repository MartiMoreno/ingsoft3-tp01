import { describe, it, expect, vi } from 'vitest';

const { crearRepositorioTareas } = require('./tareasRepo');

describe('repositorio de tareas', () => {
    it('inserta la tarea con los parámetros en orden y devuelve la fila creada', async () => {
        const fila = { id: 1, titulo: 'Estudiar', descripcion: 'cap. 3', fecha_limite: '2026-10-20', prioridad: 'ALTA', estado: 'PENDIENTE' };
        const pool = { query: vi.fn().mockResolvedValue({ rows: [fila] }) };
        const repo = crearRepositorioTareas(pool);

        const creada = await repo.crear({ titulo: 'Estudiar', descripcion: 'cap. 3', fecha_limite: '2026-10-20', prioridad: 'ALTA' });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO tareas'),
            ['Estudiar', 'cap. 3', '2026-10-20', 'ALTA']
        );
        expect(creada).toEqual(fila);
    });

    it('devuelve null al actualizar una tarea que no existe', async () => {
        const pool = { query: vi.fn().mockResolvedValue({ rows: [] }) };
        const repo = crearRepositorioTareas(pool);

        const resultado = await repo.actualizar(7, { titulo: 'Estudiar', descripcion: null, fecha_limite: null, prioridad: 'MEDIA', estado: 'PENDIENTE' });

        expect(resultado).toBeNull();
    });
});
