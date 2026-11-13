import type { UiFilterableCard } from '../../shared/types/ui'
import { describe, expect, it } from 'vitest'
import { selectCards } from './selection.ts'

function filterableCard(title: string, values: Record<string, string>): UiFilterableCard {
  return {
    card: { title, description: '', to: `/${title}` },
    values,
  }
}

const cards = [
  filterableCard('a', { area: 'culture', engine: 'openfisca' }),
  filterableCard('b', { area: 'solidarity', engine: 'catala' }),
  filterableCard('c', { area: 'solidarity', engine: 'openfisca' }),
]

function selectedTitles(selection: Record<string, string>): string[] {
  return selectCards(cards, selection).map(card => card.title)
}

describe('selectCards', () => {
  it('keeps every card when no choice is made', () => {
    expect(selectedTitles({ area: '', engine: '' })).toEqual(['a', 'b', 'c'])
  })

  it('keeps the cards that have the chosen value', () => {
    expect(selectedTitles({ area: 'solidarity', engine: '' })).toEqual(['b', 'c'])
  })

  it('keeps the cards that have the chosen value of every filter', () => {
    expect(selectedTitles({ area: 'solidarity', engine: 'openfisca' })).toEqual(['c'])
    expect(selectedTitles({ area: 'culture', engine: 'catala' })).toEqual([])
  })
})
