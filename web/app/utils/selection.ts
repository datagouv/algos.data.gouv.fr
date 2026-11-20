import type { UiCard, UiFilterableCard, UiFilterSelection } from '../../shared/types/ui'

export function selectCards(cards: UiFilterableCard[], selection: UiFilterSelection): UiCard[] {
  return cards
    .filter(({ values }) => Object.entries(selection).every(([name, choice]) => choice === '' || values[name] === choice))
    .map(({ card }) => card)
}
