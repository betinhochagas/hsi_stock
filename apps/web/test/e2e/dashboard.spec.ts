import { test, expect } from '../fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login primeiro
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@hsi.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/dashboard/);
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Verificar cards de estatísticas
    await expect(page.locator('text=/total de ativos/i')).toBeVisible();
    await expect(page.locator('text=/movimentações/i')).toBeVisible();
    await expect(page.locator('text=/licenças/i')).toBeVisible();
  });

  test('should navigate to assets page', async ({ page }) => {
    await page.locator('text=/ativos/i').first().click();
    await expect(page).toHaveURL(/\/assets/);
  });

  test('should display recent movements', async ({ page }) => {
    const movementsSection = page.locator('text=/movimentações recentes/i');
    await expect(movementsSection).toBeVisible();
  });

  test('should display chart', async ({ page }) => {
    // Verificar se o gráfico está presente
    const chart = page.locator('[class*="recharts"]');
    await expect(chart).toBeVisible();
  });
});
