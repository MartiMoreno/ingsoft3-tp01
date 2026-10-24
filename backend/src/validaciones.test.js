import { describe, it, expect } from 'vitest';

const {
    LARGO_MAXIMO_TITULO,
    PRIORIDADES,
    validarTitulo,
    validarPrioridad,
    validarEstado,
    validarFechaLimite,
    validarId,
} = require('./validaciones');

describe('validarTitulo', () => {
    it.each(['', '   ', '\t', null, undefined])('rechaza un título sin contenido (%j)', (titulo) => {
        const resultado = validarTitulo(titulo);

        expect(resultado).toEqual({ valido: false, error: 'El título es obligatorio.' });
    });

    it('devuelve el título sin espacios al principio ni al final', () => {
        const resultado = validarTitulo('  Comprar pan  ');

        expect(resultado).toEqual({ valido: true, valor: 'Comprar pan' });
    });

    it('acepta un título de exactamente 200 caracteres', () => {
        const titulo = 'a'.repeat(LARGO_MAXIMO_TITULO);

        const resultado = validarTitulo(titulo);

        expect(resultado).toEqual({ valido: true, valor: titulo });
    });

    it('rechaza un título de más de 200 caracteres', () => {
        const titulo = 'a'.repeat(LARGO_MAXIMO_TITULO + 1);

        const resultado = validarTitulo(titulo);

        expect(resultado.valido).toBe(false);
        expect(resultado.error).toContain('200');
    });
});

describe('validarPrioridad', () => {
    it.each(['BAJA', 'MEDIA', 'ALTA'])('acepta la prioridad válida %s', (prioridad) => {
        const resultado = validarPrioridad(prioridad);

        expect(resultado).toEqual({ valido: true, valor: prioridad });
    });

    it('rechaza una prioridad inválida listando las válidas', () => {
        const resultado = validarPrioridad('URGENTE');

        expect(resultado.valido).toBe(false);
        for (const valida of PRIORIDADES) {
            expect(resultado.error).toContain(valida);
        }
    });
});

describe('validarEstado', () => {
    it('acepta un estado válido', () => {
        const resultado = validarEstado('EN_PROGRESO');

        expect(resultado).toEqual({ valido: true, valor: 'EN_PROGRESO' });
    });

    it('rechaza un estado inválido', () => {
        const resultado = validarEstado('ARCHIVADA');

        expect(resultado.valido).toBe(false);
    });
});

describe('validarFechaLimite', () => {
    it.each(['', null, undefined])('trata una fecha vacía (%j) como sin fecha', (fecha) => {
        const resultado = validarFechaLimite(fecha);

        expect(resultado).toEqual({ valido: true, valor: null });
    });

    it('acepta una fecha con formato YYYY-MM-DD', () => {
        const resultado = validarFechaLimite('2026-10-20');

        expect(resultado).toEqual({ valido: true, valor: '2026-10-20' });
    });

    it('normaliza una fecha ISO completa a YYYY-MM-DD', () => {
        const resultado = validarFechaLimite('2026-10-20T00:00:00.000Z');

        expect(resultado).toEqual({ valido: true, valor: '2026-10-20' });
    });

    it('rechaza una fecha que no existe en el calendario', () => {
        const resultado = validarFechaLimite('2026-02-30');

        expect(resultado.valido).toBe(false);
    });

    it('rechaza un texto que no es una fecha', () => {
        const resultado = validarFechaLimite('el viernes');

        expect(resultado.valido).toBe(false);
    });

    it('rechaza una fecha límite que no es texto', () => {
        const resultado = validarFechaLimite(20261020);

        expect(resultado.valido).toBe(false);
        expect(resultado.error).toBeTruthy();
    });
});

describe('validarId', () => {
    it('convierte un id numérico que llega como texto en número', () => {
        const resultado = validarId('5');

        expect(resultado).toEqual({ valido: true, valor: 5 });
    });

    it.each(['0', '-1', 'abc', '1.5'])('rechaza un id que no es entero positivo (%j)', (id) => {
        const resultado = validarId(id);

        expect(resultado.valido).toBe(false);
    });
});
