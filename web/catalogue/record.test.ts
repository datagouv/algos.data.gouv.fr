import type { RegistryRecord } from '@datagouv/algos-core'
import { describe, expect, it } from 'vitest'
import { toCataloguePage, toRecordCard, toRecordDetail } from './record.ts'

const exampleRecord: RegistryRecord = {
  '@id': 'https://regles.data.gouv.fr/regles/ministere-agriculture/prestagri-aide-scolarite',
  'dct:identifier': 'prestagri-aide-scolarite',
  'schema:version': '0.1.0',
  'dct:title': { fr: 'Calcul de l\'aide à la scolarité', en: 'School allowance calculation' },
  'dct:description': { fr: 'Calcule le montant de l\'aide à la scolarité à partir du quotient familial du foyer.' },
  'cprmv:validFrom': null,
  'cprmv:validUntil': null,
  'dct:subject': null,
  'dct:source': 'https://github.com/betagouv/prestagri',
  'source_commit': '478b3cc2ab28299c73b94fdd192b0559ae5873b8',
  'dct:created': null,
  'dct:modified': null,
  'cv:hasCompetentAuthority': { '@id': 'https://github.com/betagouv/prestagri#organisation', 'skos:prefLabel': 'Ministère de l\'Agriculture' },
  'cv:thematicArea': 'solidarity',
  'cprmv:method': 'catala',
  'source_openness': 'open',
  'cprmv:isBasedOn': null,
}

describe('toRecordCard', () => {
  it('shows the French title and description, the authority and the tags of the record, and links to it', () => {
    expect(toRecordCard(exampleRecord)).toEqual({
      title: 'Calcul de l\'aide à la scolarité',
      description: expect.stringMatching(/^Calcule le montant de l'aide à la scolarité/),
      to: '/regles/prestagri-aide-scolarite',
      detail: 'Ministère de l\'Agriculture',
      tags: ['Solidarité', 'Catala', 'Code ouvert'],
    })
  })
})

describe('toCataloguePage', () => {
  it('titles the catalogue and shows a card per record', () => {
    expect(toCataloguePage([exampleRecord])).toEqual({
      title: 'Catalogue d\'algorithmes publics',
      filters: [],
      cards: [
        {
          card: toRecordCard(exampleRecord),
          values: expect.any(Object),
        },
      ],
    })
  })

  it('gives each card the value of its record for each filter', () => {
    const otherRecord: RegistryRecord = { ...exampleRecord, 'dct:identifier': 'autre', 'cprmv:method': 'openfisca' }
    const page = toCataloguePage([exampleRecord, otherRecord])
    expect(page.cards.map(({ values }) => values['cprmv:method'])).toEqual(['catala', 'openfisca'])
  })
})

describe('toRecordDetail', () => {
  it('shows the French title and description', () => {
    expect(toRecordDetail(exampleRecord)).toMatchObject({
      title: 'Calcul de l\'aide à la scolarité',
      description: expect.stringMatching(/^Calcule le montant de l'aide à la scolarité/),
    })
  })

  it('leads back to the catalogue in the breadcrumb', () => {
    expect(toRecordDetail(exampleRecord).breadcrumb).toEqual({
      links: [
        { label: 'Catalogue d\'algorithmes publics', to: '/' },
      ],
      current: 'Calcul de l\'aide à la scolarité',
    })
  })

  it.each([
    ['2026-01-01', '2026-12-31', 'Du 1er janvier 2026 au 31 décembre 2026'],
    ['2026-01-01', null, 'Depuis le 1er janvier 2026'],
    [null, '2026-12-31', 'Jusqu\'au 31 décembre 2026'],
    [null, null, null],
  ])('describes the validity from %s to %s', (validFrom, validThrough, validity) => {
    expect(toRecordDetail({ ...exampleRecord, 'cprmv:validFrom': validFrom, 'cprmv:validUntil': validThrough }).validity).toBe(validity)
  })

  it('shortens the source commit to seven characters', () => {
    expect(toRecordDetail(exampleRecord).source).toEqual({
      repository: { label: 'https://github.com/betagouv/prestagri', href: 'https://github.com/betagouv/prestagri' },
      commit: '478b3cc',
    })
  })

  it('shows the legal resources in the order of the record, without a link for an address outside the web', () => {
    const detail = toRecordDetail({
      ...exampleRecord,
      'cprmv:isBasedOn': [
        { 'eli:title': 'Code électoral, article L.2', 'schema:url': 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/' },
        { 'eli:title': 'Texte sans adresse web', 'schema:url': 'javascript:alert(1)' },
      ],
    })
    expect(detail.legalResources).toEqual([
      { label: 'Code électoral, article L.2', href: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/' },
      { label: 'Texte sans adresse web', href: null },
    ])
  })

  it('shows no legal resource for a record that gives none', () => {
    expect(toRecordDetail(exampleRecord).legalResources).toEqual([])
  })

  it('leaves out the source when the record has none', () => {
    expect(toRecordDetail({ ...exampleRecord, 'dct:source': null, 'source_commit': null }).source).toBeNull()
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    'not a url',
  ])('shows %s as text, without a link', (url) => {
    const detail = toRecordDetail({
      ...exampleRecord,
      'cv:hasCompetentAuthority': { ...exampleRecord['cv:hasCompetentAuthority'], '@id': url },
      'dct:source': url,
    })
    expect(detail.authority).toEqual({ label: url, href: null })
    expect(detail.source?.repository).toEqual({ label: url, href: null })
  })
})
