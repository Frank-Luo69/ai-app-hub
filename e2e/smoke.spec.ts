import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=AI Mini-App Hub')).toBeVisible();
});

test('detail loads with mock backend', async ({ page }) => {
  await page.goto('/g/e2e-demo');
  await expect(page.getByRole('heading', { name: 'E2E Demo App' })).toBeVisible();
  await expect(page.getByRole('link', { name: '去玩' })).toBeVisible();
  await expect(page.getByRole('button', { name: '删除' })).toHaveCount(0);
});

test('comments unauth cannot post', async ({ page }) => {
  await page.goto('/g/e2e-demo');
  const input = page.locator('input[placeholder="登录后才能发言"]');
  await expect(input).toBeVisible();
});
