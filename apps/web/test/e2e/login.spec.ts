import { test, expect } from '../fixtures';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    
    // Verificar se mensagens de erro aparecem
    await expect(page.locator('text=/email/i')).toBeVisible();
    await expect(page.locator('text=/senha/i')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@hsi.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();

    // Deve redirecionar para dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Deve mostrar mensagem de erro
    await expect(page.locator('text=/credenciais inválidas/i')).toBeVisible();
  });
});
