import { expect, test } from '@playwright/test'
import { findViolations } from './axe.ts'

test('the filters of the catalogue restrict the cards and combine', async ({ page }) => {
  await page.goto('/')
  const cards = page.getByRole('main').getByRole('heading', { level: 2 })
  const status = page.getByRole('main').getByRole('status')
  await expect(cards).toHaveCount(3)

  // the generated page answers a choice once Vue has hydrated it
  await expect(async () => {
    await page.getByLabel('Domaine').selectOption('Solidarité')
    await expect(status).toHaveText('1 règle', { timeout: 500 })
  }).toPass()
  await expect(cards).toHaveCount(1)

  await page.getByLabel('Moteur de calcul').selectOption('OpenFisca')
  await expect(status).toHaveText('Aucune règle ne correspond aux filtres choisis.')
  await expect(cards).toHaveCount(0)
  expect(await findViolations(page)).toEqual([])

  await page.getByLabel('Domaine').selectOption('Tous les domaines')
  await page.getByLabel('Moteur de calcul').selectOption('Tous les moteurs')
  await expect(cards).toHaveCount(3)
})
