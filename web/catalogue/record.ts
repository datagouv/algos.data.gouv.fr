import type { RegistryRecord } from '@datagouv/regles-core'
import type { UiBreadcrumbProps, UiCard, UiFilter, UiFilterableCard } from '../shared/types/ui'
import { recordPath, routes } from '../routes'
import { facetLabel, toFacetValues, toFilters } from './facets'

export interface CataloguePage {
  title: string
  filters: UiFilter[]
  cards: UiFilterableCard[]
}

export interface ExternalLink {
  label: string
  href: string | null
}

export interface RecordDetail {
  title: string
  description: string
  breadcrumb: UiBreadcrumbProps
  authority: ExternalLink
  legalResources: ExternalLink[]
  version: string
  validity: string | null
  source: { repository: ExternalLink, commit: string | null } | null
  subjects: string[]
  updatedOn: string | null
}

const CATALOGUE_TITLE = 'Catalogue des règles'

const WEB_PROTOCOLS = new Set(['http:', 'https:'])

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' })

export function toRecordCard(record: RegistryRecord): UiCard {
  return {
    title: record['dct:title'].fr,
    description: record['dct:description'].fr,
    to: recordPath(record['dct:identifier']),
    detail: record['cv:hasCompetentAuthority']['skos:prefLabel'],
    tags: [
      facetLabel(record, 'cv:thematicArea'),
      facetLabel(record, 'cprmv:method'),
      facetLabel(record, 'source_openness'),
    ],
  }
}

export function toCataloguePage(records: RegistryRecord[]): CataloguePage {
  return {
    title: CATALOGUE_TITLE,
    filters: toFilters(records),
    cards: records.map(record => ({
      card: toRecordCard(record),
      values: toFacetValues(record),
    })),
  }
}

export function toRecordDetail(record: RegistryRecord): RecordDetail {
  const title = record['dct:title'].fr
  return {
    title,
    description: record['dct:description'].fr,
    breadcrumb: catalogueBreadcrumb(title),
    authority: externalLink(record['cv:hasCompetentAuthority']['@id']),
    legalResources: (record['cprmv:isBasedOn'] ?? []).map(resource => externalLink(resource['schema:url'], resource['eli:title'])),
    version: record['schema:version'],
    validity: describeValidity(record['cprmv:validFrom'], record['cprmv:validUntil']),
    source: record['dct:source'] === null
      ? null
      : {
          repository: externalLink(record['dct:source']),
          commit: record.source_commit?.slice(0, 7) ?? null,
        },
    subjects: record['dct:subject'] ?? [],
    updatedOn: formatDate(record['dct:modified'] ?? record['dct:created']),
  }
}

export function catalogueBreadcrumb(current: string): UiBreadcrumbProps {
  return {
    links: [
      { label: CATALOGUE_TITLE, to: routes.catalogue },
    ],
    current,
  }
}

// the schema accepts any URI scheme, javascript: included, so only web addresses become links
function externalLink(url: string, label = url): ExternalLink {
  const href = WEB_PROTOCOLS.has(URL.parse(url)?.protocol ?? '')
    ? url
    : null
  return { label, href }
}

function describeValidity(from: string | null, to: string | null): string | null {
  if (from && to) {
    return `Du ${formatDate(from)} au ${formatDate(to)}`
  }
  if (from) {
    return `Depuis le ${formatDate(from)}`
  }
  if (to) {
    return `Jusqu'au ${formatDate(to)}`
  }
  return null
}

function formatDate(date: string | null): string | null {
  // Intl writes the first day of a month as « 1 », French typography writes « 1er »
  return date === null
    ? null
    : DATE_FORMAT.format(new Date(date)).replace(/^1 /, '1er ')
}
