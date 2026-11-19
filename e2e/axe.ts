import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WCAG_21_AA = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
]

export async function findViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze()
  return results.violations
}
