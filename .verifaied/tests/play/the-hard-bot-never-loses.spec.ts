// verifaied-test: Play/The hard bot never loses
import { test, expect } from '@playwright/test';

test('The hard bot never loses', async ({ page }) => {
  await page.goto('/');

  const status = page.getByRole('status');
  const cell = (n: number) => page.getByRole('button', { name: `Cell ${n}`, exact: true });

  await test.step('Switch the bot to Hard', async () => {
    await page.getByRole('button', { name: 'Hard' }).click();
    await expect(page.getByRole('button', { name: 'Hard' })).toHaveAttribute('aria-pressed', 'true');
    await expect(status).toHaveText('Your move');
  });

  await test.step('Take the centre; the bot takes a corner', async () => {
    await cell(5).click();
    await expect(status).toHaveText('Your move');
    await expect(cell(1)).toBeDisabled();
  });

  await test.step('Every threat gets blocked', async () => {
    await cell(2).click();
    await expect(status).toHaveText('Your move');
    await expect(cell(8)).toBeDisabled();

    await cell(4).click();
    await expect(status).toHaveText('Your move');
    await expect(cell(6)).toBeDisabled();

    await cell(3).click();
    await expect(status).toHaveText('Your move');
    await expect(cell(7)).toBeDisabled();
  });

  await test.step('Fill the last cell: a draw', async () => {
    await cell(9).click();
    await expect(status).toHaveText('Draw');
    await expect(page.getByTestId('score-draws')).toHaveText('1');
    await expect(page.getByTestId('score-bot')).toHaveText('0');
  });
});
