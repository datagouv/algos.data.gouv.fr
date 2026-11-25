import type { RegistryRecord } from '@datagouv/algos-core'
import type { UiFilter, UiFilterOption } from '../shared/types/ui'
import type { Facet } from './labels'
import { FACET_LABELS, METHOD_LABELS, SOURCE_OPENNESS_LABELS, THEMATIC_AREA_LABELS } from './labels'

const FACET_READERS: Record<Facet, (record: RegistryRecord) => UiFilterOption> = {
  'cv:thematicArea': record => ({ value: record['cv:thematicArea'], label: THEMATIC_AREA_LABELS[record['cv:thematicArea']] }),
  'cv:hasCompetentAuthority': record => ({ value: record['cv:hasCompetentAuthority']['skos:prefLabel'], label: record['cv:hasCompetentAuthority']['skos:prefLabel'] }),
  'cprmv:method': record => ({ value: record['cprmv:method'], label: METHOD_LABELS[record['cprmv:method']] }),
  'source_openness': record => ({ value: record.source_openness, label: SOURCE_OPENNESS_LABELS[record.source_openness] }),
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
