import { test, expect } from 'playwright/test'

// Public catalog specs written against the real /catalogo pages.
// Filtering is client-side (no URL params). Book-dependent tests skip
// gracefully when the catalog has no data.
// Ready for live run (not live-verified here: no dev server or creds).
// Run: pnpm dev, then
//   npx playwright test --project=chromium tests/e2e/catalog.spec.ts

test.describe('Public catalog', () => {
  test('catalog page shows heading, search and category filters', async ({ page }) => {
    await page.goto('/catalogo')

    await expect(page.getByRole('heading', { name: 'Catálogo de libros' })).toBeVisible()
    await expect(page.getByPlaceholder('Buscar por título o autor...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible()
  })

  test('catalog lists books with title and price', async ({ page }) => {
    await page.goto('/catalogo')

    const titles = page.locator('main h3')
    if ((await titles.count()) === 0) {
      test.skip(true, 'Catalog is empty, nothing to list')
    }

    await expect(titles.first()).toBeVisible()
    // Cards with a price render it with a $ prefix
    await expect(page.locator('main').getByText(/\$/).first()).toBeVisible()
  })

  test('book detail shows gallery and WhatsApp link', async ({ page }) => {
    await page.goto('/catalogo')

    const firstLink = page.locator('main a[href^="/catalogo/"]').first()
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Catalog is empty, no detail page to open')
    }
    const title = await page.locator('main h3').first().innerText()
    await firstLink.click()

    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()

    // Gallery image, or the imageless fallback
    const galleryImage = page.locator('main img').first()
    if ((await galleryImage.count()) > 0) {
      await expect(galleryImage).toBeVisible()
    } else {
      await expect(page.getByText('Sin imagen')).toBeVisible()
    }

    // WhatsApp inquiry link with the store number
    const whatsapp = page.locator('main a[href^="https://wa.me/58864240"]').first()
    await expect(whatsapp).toBeVisible()
  })

  test('category filter narrows the book list', async ({ page }) => {
    await page.goto('/catalogo')

    const before = await page.locator('main h3').count()
    if (before === 0) {
      test.skip(true, 'Catalog is empty, nothing to filter')
    }

    const names = await page.locator('main button').allInnerTexts()
    const category = names.map((name) => name.trim()).find((name) => name !== 'Todos')
    if (!category) {
      test.skip(true, 'No categories available to filter by')
    }

    await page.getByRole('button', { name: category, exact: true }).click()
    const filtered = await page.locator('main h3').count()
    expect(filtered).toBeLessThanOrEqual(before)

    // Resetting restores the full list
    await page.getByRole('button', { name: 'Todos', exact: true }).click()
    expect(await page.locator('main h3').count()).toBe(before)
  })

  test('search with no matches shows the empty state', async ({ page }) => {
    await page.goto('/catalogo')

    await page.getByPlaceholder('Buscar por título o autor...').fill('zzz-no-such-book-zzz')
    await expect(
      page.getByText('No se encontraron libros con esos criterios.')
    ).toBeVisible()
  })
})
