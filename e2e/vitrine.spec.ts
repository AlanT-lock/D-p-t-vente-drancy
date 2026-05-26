import { test, expect } from '@playwright/test';

test('accueil affiche le bandeau et les catégories', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/pas de vente en ligne/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Catégories/i })).toBeVisible();
});

test('navigation catégorie → sous-catégorie', async ({ page }) => {
  await page.goto('/c/mobilier');
  await expect(page.getByRole('heading', { name: 'Mobilier' })).toBeVisible();
  await page.getByRole('link', { name: 'Canapés' }).click();
  await expect(page).toHaveURL(/\/c\/mobilier\/canapes/);
});

test('aucun bouton acheter sur une page produit', async ({ page }) => {
  await page.goto('/');
  const firstProductLink = page.locator('a[href^="/produit/"]').first();
  if ((await firstProductLink.count()) > 0) {
    await firstProductLink.click();
    await expect(page.getByText(/cet article vous intéresse/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /acheter|panier/i })).toHaveCount(0);
  }
});
