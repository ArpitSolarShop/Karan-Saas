import { test, expect } from '@playwright/test';

test('successful login with admin credentials', async ({ page }) => {
  await page.goto('/login');
  
  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@alpha.dev');
  await page.fill('input[type="password"]', 'admin123');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Verify redirect to dashboard (root path in this app)
  await expect(page).toHaveURL("http://localhost:3000/");
  
  // Check for some dashboard content (e.g. Logo or Title)
  await expect(page.locator('h1')).toContainText(/Project Alpha|Dashboard|Overview/i);
});
