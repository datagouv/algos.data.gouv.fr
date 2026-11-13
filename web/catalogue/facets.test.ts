import type { RegistryRecord } from '@datagouv/regles-core'
import { describe, expect, it } from 'vitest'
import { toFilters } from './facets.ts'

const prestagri: RegistryRecord = {
  id: 'https://regles.data.gouv.fr/regles/ministere-agriculture/prestagri-aide-scolarite',
  identifier: 'prestagri-aide-scolarite',
  version: '0.1.0',
  title: { fr: 'Calcul de l\'aide à la scolarité' },
  description: { fr: 'Calcule le montant de l\'aide à la scolarité.' },
  valid_from: null,
  valid_to: null,
  subjects: null,
  source_repository: 'https://github.com/betagouv/prestagri',
  source_commit: null,
  created_at: null,
  updated_at: null,
  competent_authority: { id: 'https://github.com/betagouv/prestagri#organisation', name: 'Ministère de l\'Agriculture' },
  thematic_area: 'solidarity',
  engine: 'catala',
  source_openness: 'open',
  legal_resources: null,
}
const passCulture: RegistryRecord = {
  ...prestagri,
  identifier: 'openfisca-france-pass-culture',
  competent_authority: { id: 'https://github.com/openfisca/openfisca-france#organisation', name: 'Ministère de la Culture' },
  thematic_area: 'culture',
  engine: 'openfisca',
}

describe('toFilters', () => {
  it('offers each value of the records once, sorted by label', () => {
    const taxRule: RegistryRecord = { ...prestagri, identifier: 'impot', thematic_area: 'taxation' }
    const filters = toFilters([
      prestagri,
      taxRule,
      { ...prestagri, identifier: 'prestagri-quotient-familial' },
    ])
    expect(filters.find(filter => filter.name === 'thematic_area')).toEqual({
      name: 'thematic_area',
      label: 'Domaine',
      allLabel: 'Tous les domaines',
      options: [
        { value: 'taxation', label: 'Fiscalité' },
        { value: 'solidarity', label: 'Solidarité' },
      ],
    })
  })

  it('groups the records of an authority by its name', () => {
    const sameAuthority: RegistryRecord = {
      ...prestagri,
      identifier: 'autre-depot',
      competent_authority: { id: 'https://example.org/autre-depot#organisation', name: 'Ministère de l\'Agriculture' },
    }
    const filters = toFilters([prestagri, sameAuthority, passCulture])
    expect(filters.find(filter => filter.name === 'competent_authority')?.options).toEqual([
      { value: 'Ministère de l\'Agriculture', label: 'Ministère de l\'Agriculture' },
      { value: 'Ministère de la Culture', label: 'Ministère de la Culture' },
    ])
  })

  it('gives no filter for a facet with a single value in the records', () => {
    expect(toFilters([prestagri, passCulture]).map(filter => filter.name)).toEqual(['thematic_area', 'competent_authority', 'engine'])
  })
})
