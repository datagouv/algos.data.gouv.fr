import type { RegistryRecord } from '@datagouv/regles-core'
import { describe, expect, it } from 'vitest'
import { toCataloguePage, toRecordCard, toRecordDetail } from './record.ts'

const exampleRecord: RegistryRecord = {
  id: 'https://algos.data.gouv.fr/regles/ministere-agriculture/prestagri-aide-scolarite',
  identifier: 'prestagri-aide-scolarite',
  version: '0.1.0',
  title: { fr: 'Calcul de l\'aide à la scolarité', en: 'School allowance calculation' },
  description: { fr: 'Calcule le montant de l\'aide à la scolarité à partir du quotient familial du foyer.' },
  valid_from: null,
  valid_to: null,
  subjects: null,
  source_repository: 'https://github.com/betagouv/prestagri',
  source_commit: '478b3cc2ab28299c73b94fdd192b0559ae5873b8',
  created_at: null,
  updated_at: null,
  competent_authority: { id: 'https://github.com/betagouv/prestagri#organisation', name: 'Ministère de l\'Agriculture' },
  thematic_area: 'solidarity',
  engine: 'catala',
  source_openness: 'open',
  legal_resources: null,
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
    const otherRecord: RegistryRecord = { ...exampleRecord, identifier: 'autre', engine: 'openfisca' }
    const page = toCataloguePage([exampleRecord, otherRecord])
    expect(page.cards.map(({ values }) => values.engine)).toEqual(['catala', 'openfisca'])
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
  ])('describes the validity from %s to %s', (validFrom, validTo, validity) => {
    expect(toRecordDetail({ ...exampleRecord, valid_from: validFrom, valid_to: validTo }).validity).toBe(validity)
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
      legal_resources: [
        { title: 'Code électoral, article L.2', url: 'https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006070239/' },
        { title: 'Texte sans adresse web', url: 'javascript:alert(1)' },
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
    expect(toRecordDetail({ ...exampleRecord, source_repository: null, source_commit: null }).source).toBeNull()
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    'not a url',
  ])('shows %s as text, without a link', (url) => {
    const detail = toRecordDetail({
      ...exampleRecord,
      competent_authority: { ...exampleRecord.competent_authority, id: url },
      source_repository: url,
    })
    expect(detail.authority).toEqual({ label: url, href: null })
    expect(detail.source?.repository).toEqual({ label: url, href: null })
  })
})
