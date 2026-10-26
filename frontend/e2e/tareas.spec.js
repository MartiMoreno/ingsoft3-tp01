// End-to-end: un navegador real contra el front desplegado, que habla con su api y su base.
import { test, expect } from '@playwright/test';

// Promesa que se cumple cuando la lista termina de cargar desde la api.
// Sin esto, un "no aparece" podría pasar sólo porque la lista todavía está vacía.
function esperarLista(page) {
  return page.waitForResponse(r =>
    r.url().includes('/api/tareas') && r.request().method() === 'GET' && r.ok()
  );
}

async function crearTarea(page, titulo) {
  await page.goto('/nueva');
  await page.getByLabel('Título').fill(titulo);
  const lista = esperarLista(page);
  await page.getByRole('button', { name: 'Crear tarea' }).click();
  await lista;
}

async function eliminarDesdeLista(page, titulo) {
  await page.getByRole('link', { name: titulo }).click();
  const lista = esperarLista(page);
  await page.getByRole('button', { name: 'Eliminar' }).click();
  await lista;
}

test('crear una tarea la muestra en la lista, y eliminarla la saca', async ({ page }) => {
  const titulo = `e2e ${Date.now()}`;

  await crearTarea(page, titulo);

  await expect(page.getByText(titulo, { exact: true })).toBeVisible();
  await eliminarDesdeLista(page, titulo);
  await expect(page.getByText(titulo, { exact: true })).toHaveCount(0);
});

test('un título de más de 200 caracteres muestra el error y no crea nada', async ({ page }) => {
  const titulo = `e2e ${Date.now()}`;
  await page.goto('/nueva');
  await page.getByLabel('Título').fill(`${titulo} ${'x'.repeat(200)}`);

  await page.getByRole('button', { name: 'Crear tarea' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('200');
  const lista = esperarLista(page);
  await page.goto('/');
  await lista;
  await expect(page.getByText(titulo)).toHaveCount(0);
});

test('cambiar el estado de una tarea queda guardado', async ({ page }) => {
  const titulo = `e2e ${Date.now()}`;
  await crearTarea(page, titulo);
  await page.getByRole('link', { name: titulo }).click();

  await page.getByLabel('Cambiar estado').selectOption('COMPLETADA');
  const lista = esperarLista(page);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await lista;

  await expect(page.getByRole('link', { name: titulo })).toContainText('COMPLETADA');
  await eliminarDesdeLista(page, titulo);
  await expect(page.getByText(titulo, { exact: true })).toHaveCount(0);
});
