import { expect, test } from '@playwright/test';

test('map iframe is embedded', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Connect EVE Vault' }).click();
  await expect(page.getByTitle('EVE Frontier universe map')).toBeVisible();
});
