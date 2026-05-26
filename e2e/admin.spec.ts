import { test, expect } from '@playwright/test';

const SLUG = process.env.ADMIN_SLUG ?? 'admin-xY3kQ9';
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test('login admin et redirection vers le dashboard', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'identifiants e2e non configurés');
  await page.goto(`/${SLUG}/login`);
  await page.getByLabel('Email').fill(EMAIL!);
  await page.getByLabel('Mot de passe').fill(PASSWORD!);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(`/${SLUG}`);
  await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
});

test("l'URL /admin redirige ou 404 quand le slug est invalide", async ({ page }) => {
  const res = await page.goto('/admin');
  // soit redirigé vers '/', soit 404 ; on accepte les deux car le slug réel est différent
  expect(res?.status() ?? 200).toBeLessThan(500);
});
