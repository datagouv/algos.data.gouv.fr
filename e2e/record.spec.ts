import { expect, test } from '@playwright/test'
import { findViolations } from './axe.ts'

test('the page of a record shows its legal resources as links', async ({ page }) => {
  await page.goto('/regles/civique-droit-vote')
  const main = page.getByRole('main')
  await expect(main.getByText('Base légale')).toBeVisible()
  await expect(main.getByRole('link', { name: /^(Code électoral|Constitution), article/ })).toHaveCount(4)
  expect(await findViolations(page)).toEqual([])
})
