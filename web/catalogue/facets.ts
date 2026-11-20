import type { RegistryRecord } from '@datagouv/regles-core'
import type { UiFilter, UiFilterOption } from '../shared/types/ui'
import type { Facet } from './labels'
import { ENGINE_LABELS, FACET_LABELS, SOURCE_OPENNESS_LABELS, THEMATIC_AREA_LABELS } from './labels'

const FACET_READERS: Record<Facet, (record: RegistryRecord) => UiFilterOption> = {
  thematic_area: record => ({ value: record.thematic_area, label: THEMATIC_AREA_LABELS[record.thematic_area] }),
  competent_authority: record => ({ value: record.competent_authority.name, label: record.competent_authority.name }),
  engine: record => ({ value: record.engine, label: ENGINE_LABELS[record.engine] }),
  source_openness: record => ({ value: record.source_openness, label: SOURCE_OPENNESS_LABELS[record.source_openness] }),
}

const FACETS = Object.keys(FACET_READERS) as Facet[]

export function facetLabel(record: RegistryRecord, facet: Facet): string {
  return FACET_READERS[facet](record).label
}

export function toFacetValues(record: RegistryRecord): Record<string, string> {
  return Object.fromEntries(FACETS.map(facet => [facet, FACET_READERS[facet](record).value]))
}

export function toFilters(records: RegistryRecord[]): UiFilter[] {
  return FACETS
    .map(facet => ({
      name: facet,
      ...FACET_LABELS[facet],
      options: toOptions(records, facet),
    }))
    .filter(filter => filter.options.length > 1)
}

function toOptions(records: RegistryRecord[], facet: Facet): UiFilterOption[] {
  const options = new Map(records.map((record) => {
    const option = FACET_READERS[facet](record)
    return [option.value, option]
  }))
  return [
    ...options.values(),
  ].sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}
