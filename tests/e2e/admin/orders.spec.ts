import { test, expect } from 'playwright/test'

// Admin order management specs use the saved admin session and run against
// the real /dashboard/pedidos pages with live data.
// Ready for live run (not live-verified here: no dev server or creds).
// Run: pnpm dev, then
//   npx playwright test --project=admin tests/e2e/admin/orders.spec.ts

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin order management', () => {
  test('orders list shows heading and new-order action', async ({ page }) => {
    await page.goto('/dashboard/pedidos')

    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nuevo pedido' })).toBeVisible()
    await expect(
      page.getByPlaceholder('Buscar por nombre, email o teléfono...')
    ).toBeVisible()
  })

  test('status filter is reflected in the URL', async ({ page }) => {
    await page.goto('/dashboard/pedidos')

    await page.getByRole('combobox').selectOption('pendiente')
    await expect(page).toHaveURL(/status=pendiente/)

    await page.getByRole('combobox').selectOption('')
    await expect(page).not.toHaveURL(/status=/)
  })

  test('order detail opens from the list', async ({ page }) => {
    await page.goto('/dashboard/pedidos')

    const detailsLink = page.getByRole('link', { name: 'Ver detalles' }).first()
    if ((await detailsLink.count()) === 0) {
      await expect(page.getByText('No se encontraron pedidos')).toBeVisible()
      test.skip(true, 'No orders to open')
    }
    await detailsLink.click()

    await expect(page).toHaveURL(/\/dashboard\/pedidos\/.+/)
  })
})
