import type { RegistryRecord } from '@datagouv/regles-core'

export const THEMATIC_AREA_LABELS: Record<RegistryRecord['cv:thematicArea'], string> = {
  solidarity: 'Solidarité',
  taxation: 'Fiscalité',
  employment: 'Emploi',
  retirement: 'Retraite',
  housing: 'Logement',
  culture: 'Culture',
  health: 'Santé',
  citizenship: 'Citoyenneté',
}

export const METHOD_LABELS: Record<RegistryRecord['cprmv:method'], string> = {
  publicodes: 'Publicodes',
  openfisca: 'OpenFisca',
  catala: 'Catala',
  other: 'Autre moteur',
}

export const SOURCE_OPENNESS_LABELS: Record<RegistryRecord['source_openness'], string> = {
  open: 'Code ouvert',
  hybrid: 'Code partiellement ouvert',
  closed: 'Code fermé',
}

export const FACET_LABELS = {
  'cv:thematicArea': { label: 'Domaine', allLabel: 'Tous les domaines' },
  'cv:hasCompetentAuthority': { label: 'Organisme', allLabel: 'Tous les organismes' },
  'cprmv:method': { label: 'Moteur de calcul', allLabel: 'Tous les moteurs' },
  'source_openness': { label: 'Ouverture du code', allLabel: 'Tous les niveaux d\'ouverture' },
}

export type Facet = keyof typeof FACET_LABELS
