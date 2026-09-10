import { test, expect, type Page } from 'playwright/test'

// Authentication flow specs written against the real /login page.
// The success/logout cases need live Supabase credentials:
//   TEST_USER_EMAIL / TEST_USER_PASSWORD
// Ready for live run (not live-verified here: no dev server or creds).
// Run: pnpm dev, then
//   npx playwright test --project=chromium tests/e2e/auth.spec.ts

const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'user@eralibros.com'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123'

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
}

test.describe('Authentication', () => {
  test('login page displays the sign-in form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  })

  test('successful login redirects to the dashboard', async ({ page }) => {
    await signIn(page, TEST_EMAIL, TEST_PASSWORD)

    await page.waitForURL('**/dashboard**')
    await expect(page.getByText('Bienvenido')).toBeVisible()
  })

  test('invalid credentials keep the user on login with an error', async ({ page }) => {
    await signIn(page, 'nobody@example.com', 'wrong-password-123')

    // Stays on /login, submit finishes, and the form shows the error
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.locator('form p').first()).toBeVisible()
  })

  test('logout clears the session', async ({ page }) => {
    await signIn(page, TEST_EMAIL, TEST_PASSWORD)
    await page.waitForURL('**/dashboard**')

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await page.waitForURL('**/login')

    // Protected routes bounce back to login once the session is gone
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fdashboard/)
  })
})
