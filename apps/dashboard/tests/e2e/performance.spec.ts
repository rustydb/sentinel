import { expect, test } from '@playwright/test';

test('wallet connect renders dashboard under three seconds', async ({ page }) => {
  await page.goto('/demo');

  const startedAt = Date.now();
  await page.getByRole('button', { name: 'Connect EVE Vault' }).click();
  await expect(page.getByText('Command grid')).toBeVisible();

  expect(Date.now() - startedAt).toBeLessThan(3000);
});
