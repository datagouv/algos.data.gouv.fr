import type { RegistryRecord } from '@datagouv/algos-core'
import { describe, expect, it } from 'vitest'
import { toFilters } from './facets.ts'

const prestagri: RegistryRecord = {
  '@id': 'https://regles.data.gouv.fr/regles/ministere-agriculture/prestagri-aide-scolarite',
  'dct:identifier': 'prestagri-aide-scolarite',
  'schema:version': '0.1.0',
  'dct:title': { fr: 'Calcul de l\'aide à la scolarité' },
  'dct:description': { fr: 'Calcule le montant de l\'aide à la scolarité.' },
  'cprmv:validFrom': null,
  'cprmv:validUntil': null,
  'dct:subject': null,
  'dct:source': 'https://github.com/betagouv/prestagri',
  'source_commit': null,
  'dct:created': null,
  'dct:modified': null,
  'cv:hasCompetentAuthority': { '@id': 'https://github.com/betagouv/prestagri#organisation', 'skos:prefLabel': 'Ministère de l\'Agriculture' },
  'cv:thematicArea': 'solidarity',
  'cprmv:method': 'catala',
  'source_openness': 'open',
  'cprmv:isBasedOn': null,
}
const passCulture: RegistryRecord = {
  ...prestagri,
  'dct:identifier': 'openfisca-france-pass-culture',
  'cv:hasCompetentAuthority': { '@id': 'https://github.com/openfisca/openfisca-france#organisation', 'skos:prefLabel': 'Ministère de la Culture' },
  'cv:thematicArea': 'culture',
  'cprmv:method': 'openfisca',
}

describe('toFilters', () => {
  it('offers each value of the records once, sorted by label', () => {
    const taxRule: RegistryRecord = { ...prestagri, 'dct:identifier': 'impot', 'cv:thematicArea': 'taxation' }
    const filters = toFilters([
      prestagri,
      taxRule,
      { ...prestagri, 'dct:identifier': 'prestagri-quotient-familial' },
    ])
    expect(filters.find(filter => filter.name === 'cv:thematicArea')).toEqual({
      name: 'cv:thematicArea',
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
      'dct:identifier': 'autre-depot',
      'cv:hasCompetentAuthority': { '@id': 'https://example.org/autre-depot#organisation', 'skos:prefLabel': 'Ministère de l\'Agriculture' },
    }
    const filters = toFilters([prestagri, sameAuthority, passCulture])
    expect(filters.find(filter => filter.name === 'cv:hasCompetentAuthority')?.options).toEqual([
      { value: 'Ministère de l\'Agriculture', label: 'Ministère de l\'Agriculture' },
      { value: 'Ministère de la Culture', label: 'Ministère de la Culture' },
    ])
  })

  it('gives no filter for a facet with a single value in the records', () => {
    expect(toFilters([prestagri, passCulture]).map(filter => filter.name)).toEqual(['cv:thematicArea', 'cv:hasCompetentAuthority', 'cprmv:method'])
  })
})
