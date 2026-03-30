import { expect, test } from '@playwright/test';

test('wallet connect renders turret grid', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Connect EVE Vault' }).click();

  await expect(page.getByText('Command grid')).toBeVisible();
  await expect(page.getByTestId('turret-card-0xturret-alpha')).toBeVisible();
});
