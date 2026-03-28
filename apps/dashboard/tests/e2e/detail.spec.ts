import { expect, test } from '@playwright/test';

test('detail drawer opens for selected turret', async ({ page }) => {
  await page.goto('/?demo=true');
  await page.getByRole('button', { name: 'Connect EVE Vault' }).click();
  await page.getByTestId('turret-card-0xturret-alpha').click();

  await expect(page.getByTestId('turret-detail')).toBeVisible();
  await expect(page.getByText('Selected turret')).toBeVisible();
});
