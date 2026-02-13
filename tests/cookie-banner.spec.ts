import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'cookie-consent';

test.describe('Cookie Banner', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear consent so each test starts fresh
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  });

  test('shows banner on first visit', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('role', 'dialog');
    await expect(banner).toHaveAttribute('aria-label', 'Cookie consent');
    await expect(page.locator('#cookie-accept')).toBeVisible();
    await expect(page.locator('#cookie-reject')).toBeVisible();
  });

  test('renders markdown message with link', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#cookie-banner a');
    await expect(link).toBeVisible();
  });

  test('hides banner and loads GA on accept', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();

    await page.locator('#cookie-accept').click();

    // Banner hidden
    await expect(banner).toBeHidden();

    // localStorage persisted
    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY
    );
    expect(consent).toBe('accepted');

    // GA script injected into head
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag"]');
    await expect(gaScript).toBeAttached();
  });

  test('hides banner and disables GA on reject', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeVisible();

    await page.locator('#cookie-reject').click();

    // Banner hidden
    await expect(banner).toBeHidden();

    // localStorage persisted
    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY
    );
    expect(consent).toBe('rejected');

    // GA disable flag set on window
    const gaDisabled = await page.evaluate(() =>
      Object.keys(window).some((k) => k.startsWith('ga-disable-'))
    );
    expect(gaDisabled).toBe(true);

    // No GA script loaded
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag"]');
    await expect(gaScript).not.toBeAttached();
  });

  test('remembers accepted consent on return visit', async ({ page }) => {
    // Accept cookies
    await page.goto('/');
    await page.locator('#cookie-accept').click();
    await expect(page.locator('#cookie-banner')).toBeHidden();

    // Navigate to another page and back (simulates return visit)
    await page.goto('/');

    // Banner stays hidden, GA loaded
    await expect(page.locator('#cookie-banner')).toBeHidden();
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag"]');
    await expect(gaScript).toBeAttached();
  });

  test('remembers rejected consent on return visit', async ({ page }) => {
    // Reject cookies
    await page.goto('/');
    await page.locator('#cookie-reject').click();
    await expect(page.locator('#cookie-banner')).toBeHidden();

    // Navigate to another page and back
    await page.goto('/');

    // Banner stays hidden, no GA
    await expect(page.locator('#cookie-banner')).toBeHidden();
    const gaScript = page.locator('script[src*="googletagmanager.com/gtag"]');
    await expect(gaScript).not.toBeAttached();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#cookie-banner')).toBeVisible();

    // Tab into the banner buttons
    await page.locator('#cookie-reject').focus();
    await expect(page.locator('#cookie-reject')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#cookie-accept')).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('#cookie-banner')).toBeHidden();

    const consent = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY
    );
    expect(consent).toBe('accepted');
  });
});
