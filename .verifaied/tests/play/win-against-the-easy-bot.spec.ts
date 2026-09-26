// verifaied-test: Play/Win against the easy bot
import { test, expect } from '@playwright/test';

test('Win against the easy bot', async ({ page }) => {
  // Seed 42 makes the easy bot's "random" replies the same every run.
  await page.goto('/?seed=42');

  await test.step('A fresh board, your move', async () => {
    await expect(page.getByRole('status')).toHaveText('Your move');
    await expect(page.getByRole('button', { name: 'Easy' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('score-you')).toHaveText('0');
  });

  await test.step('Take the top-left corner', async () => {
    await page.getByRole('button', { name: 'Cell 1', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Bot is thinking…');
    await expect(page.getByRole('status')).toHaveText('Your move');
    await expect(page.getByRole('button', { name: 'Cell 6', exact: true })).toBeDisabled();
  });

  await test.step('Line up two in the top row', async () => {
    await page.getByRole('button', { name: 'Cell 2', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Your move');
    await expect(page.getByRole('button', { name: 'Cell 5', exact: true })).toBeDisabled();
  });

  await test.step('Complete the row: X wins', async () => {
    await page.getByRole('button', { name: 'Cell 3', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('X wins');
    await expect(page.getByTestId('winning-line')).toBeVisible();
    await expect(page.getByTestId('score-you')).toHaveText('1');
  });

  await test.step('The win lands in History', async () => {
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByTestId('games-played')).toHaveText('1');
    await expect(page.getByRole('cell', { name: 'Win' })).toBeVisible();
  });
});
