import { test, expect } from 'playwright/test'

// Admin book management specs use the saved admin session and run against
// the real /dashboard/libros pages with live data. The create test cleans
// up after itself via the row delete action.
// Ready for live run (not live-verified here: no dev server or creds).
// Run: pnpm dev, then
//   npx playwright test --project=admin tests/e2e/admin/books-crud.spec.ts

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin book management', () => {
  test('books list shows heading and new-book action', async ({ page }) => {
    await page.goto('/dashboard/libros')

    await expect(page.getByRole('heading', { name: 'Libros' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nuevo libro' })).toBeVisible()
    await expect(page.getByLabel('Buscar título')).toBeVisible()
  })

  test('new-book form requires a title', async ({ page }) => {
    await page.goto('/dashboard/libros/new')

    await expect(page.getByRole('heading', { name: 'Nuevo libro' })).toBeVisible()
    await page.getByRole('button', { name: 'Guardar libro' }).click()

    await expect(page.getByText('El título es requerido')).toBeVisible()
  })

  test('creates and deletes a book', async ({ page }) => {
    const title = `E2E Test Book ${Date.now()}`

    await page.goto('/dashboard/libros/new')
    // The slug auto-generates from the title
    await page.getByLabel(/Título/).fill(title)
    await page.getByLabel('Precio').fill('29.99')
    await page.getByRole('button', { name: 'Guardar libro' }).click()

    await page.waitForURL('**/dashboard/libros')
    await expect(page.getByText(title)).toBeVisible()

    // Cleanup: remove the created book through its row action
    page.on('dialog', (dialog) => dialog.accept())
    const row = page.locator('tr', { hasText: title })
    await row.getByRole('button', { name: 'Eliminar' }).click()
    await expect(row).toHaveCount(0)
  })

  test('edit action opens the edit form for an existing book', async ({ page }) => {
    await page.goto('/dashboard/libros')

    const editLink = page.getByRole('link', { name: 'Editar' }).first()
    if ((await editLink.count()) === 0) {
      test.skip(true, 'No books to edit')
    }
    await editLink.click()

    await expect(page.getByRole('heading', { name: 'Editar libro' })).toBeVisible()
  })
})
