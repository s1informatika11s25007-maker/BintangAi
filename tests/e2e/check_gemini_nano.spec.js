import { test, expect } from '@playwright/test';

test('Test Gemini Nano window.ai availability in Chromium Browser from CLI', async ({ page }) => {
  console.log("=== Menguji Lingkungan Browser dari Playwright CLI ===");

  await page.goto('http://localhost:3000');

  const status = await page.evaluate(async () => {
    return {
      hasWindow: typeof window !== 'undefined',
      hasWindowAi: typeof window.ai !== 'undefined',
      hasLanguageModel: typeof window.ai?.languageModel !== 'undefined'
    };
  });

  console.log("1. Environment memiliki window:", status.hasWindow);
  console.log("2. Google Chrome memuat window.ai:", status.hasWindowAi);
  console.log("3. API window.ai.languageModel:", status.hasLanguageModel);

  expect(status.hasWindow).toBe(true);
});
