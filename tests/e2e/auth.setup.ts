import { test as setup, expect } from 'playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/user.json')

setup('authenticate as user', async ({ page }) => {
  // Navigate to login
  await page.goto('/login')

  // Fill login form
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'user@eralibros.com')
  await page.getByLabel('Contraseña').fill(process.env.TEST_USER_PASSWORD || 'password123')

  // Submit form
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**')

  // Verify authenticated
  await expect(page.getByText('Bienvenido')).toBeVisible()

  // Save authentication state
  await page.context().storageState({ path: authFile })
})

// Admin auth setup
const adminAuthFile = path.join(__dirname, '../.auth/admin.json')

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_ADMIN_EMAIL || 'admin@eralibros.com')
  await page.getByLabel('Contraseña').fill(process.env.TEST_ADMIN_PASSWORD || 'admin123')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.waitForURL('**/dashboard**')
  await expect(page.getByText('Bienvenido')).toBeVisible()
  await page.context().storageState({ path: adminAuthFile })
})
