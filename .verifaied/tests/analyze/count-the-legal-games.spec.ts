// verifaied-test: Analyze/Count the legal games
import { test, expect } from '@playwright/test';

test('Count the legal games', async ({ page }) => {
  await page.goto('/analyze');

  await test.step('The empty board is undecided', async () => {
    await expect(page.getByRole('heading', { name: 'Analyze' })).toBeVisible();
    await expect(page.getByTestId('evaluation')).toHaveText('Undecided');
    await expect(page.getByTestId('turn')).toHaveText('X');
    await expect(page.getByRole('heading', { name: 'Next boards (9)' })).toBeVisible();
  });

  await test.step('Put an X in the centre', async () => {
    await page.getByRole('button', { name: 'Cell 5', exact: true }).click();
    await expect(page.getByLabel('Position')).toHaveValue('....x....');
    await expect(page.getByTestId('turn')).toHaveText('O');
    await expect(page.getByTestId('perfect-play')).toHaveText('Draw');
    await expect(page.getByRole('heading', { name: 'Next boards (8)' })).toBeVisible();
  });

  await test.step('Count every legal game', async () => {
    await expect(page.getByTestId('game-count')).toHaveText('?');
    await page.getByRole('button', { name: 'Count games' }).click();
    await expect(page.getByTestId('game-count')).toHaveText('255,168');
  });
});
