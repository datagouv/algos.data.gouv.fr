import { assert, describe, expect, it } from 'vitest'
import exampleRecord from '../fixtures/record.json' with { type: 'json' }
import { buildRegistry } from './registry.ts'

const EXAMPLE_PATH = 'data/example.json'

describe('buildRegistry', () => {
  it('lists the record of every file and finds a record by its identifier', () => {
    const otherRecord = { ...exampleRecord, '@id': 'https://regles.data.gouv.fr/regles/autre', 'dct:identifier': 'autre' }
    const result = buildRegistry([
      { path: EXAMPLE_PATH, content: exampleRecord },
      { path: 'data/autre.json', content: otherRecord },
    ])
    assert(result.valid)
    expect(result.registry.records.map(record => record['dct:identifier'])).toEqual(['prestagri-aide-scolarite', 'autre'])
    expect(result.registry.find('autre')?.['@id']).toBe('https://regles.data.gouv.fr/regles/autre')
  })

  it('reports the file of an invalid record', () => {
    const { 'cv:hasCompetentAuthority': hasCompetentAuthority, ...incomplete } = exampleRecord
    expect(buildRegistry([
      { path: 'data/incomplete.json', content: incomplete },
    ])).toEqual({
      valid: false,
      gaps: [
        expect.objectContaining({ path: 'data/incomplete.json', field: 'cv:hasCompetentAuthority' }),
      ],
    })
  })

  it('reports a record that repeats the id and the identifier of another file', () => {
    expect(buildRegistry([
      { path: EXAMPLE_PATH, content: exampleRecord },
      { path: 'data/copie.json', content: exampleRecord },
    ])).toEqual({
      valid: false,
      gaps: [
        { path: 'data/copie.json', field: '@id', message: `has the same @id as ${EXAMPLE_PATH}` },
        { path: 'data/copie.json', field: 'dct:identifier', message: `has the same dct:identifier as ${EXAMPLE_PATH}` },
      ],
    })
  })
})
