import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
    test('should toggle dark mode and persist after reload', async ({ page }) => {
        // Go to the application
        await page.goto('/');

        // Check that we are initially in light mode (or at least the button is there)
        const toggleButton = page.locator('button[title="Cambiar a modo noche"]');
        await expect(toggleButton).toBeVisible();

        // Initially, html should NOT have 'dark' class (assuming default light)
        // or if it has it from system, we just toggle it.
        const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

        // Toggle theme
        await toggleButton.click();

        // Verify it changed
        const isDarkAfterToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkAfterToggle).toBe(!isInitiallyDark);

        // Refresh the page
        await page.reload();

        // Verify it persists
        const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        expect(isDarkAfterReload).toBe(isDarkAfterToggle);
    });
});
