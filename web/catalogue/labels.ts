import type { RegistryRecord } from '@datagouv/regles-core'

export const THEMATIC_AREA_LABELS: Record<RegistryRecord['thematic_area'], string> = {
  solidarity: 'Solidarité',
  taxation: 'Fiscalité',
  employment: 'Emploi',
  retirement: 'Retraite',
  housing: 'Logement',
  culture: 'Culture',
  health: 'Santé',
  citizenship: 'Citoyenneté',
}

export const ENGINE_LABELS: Record<RegistryRecord['engine'], string> = {
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
  thematic_area: { label: 'Domaine', allLabel: 'Tous les domaines' },
  competent_authority: { label: 'Organisme', allLabel: 'Tous les organismes' },
  engine: { label: 'Moteur de calcul', allLabel: 'Tous les moteurs' },
  source_openness: { label: 'Ouverture du code', allLabel: 'Tous les niveaux d\'ouverture' },
}

export type Facet = keyof typeof FACET_LABELS
