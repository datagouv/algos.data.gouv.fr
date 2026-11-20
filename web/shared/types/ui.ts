export interface UiLink {
  label: string
  to: string
}

export interface UiCard {
  title: string
  description: string
  to: string
  detail?: string
  tags?: string[]
}

export interface UiCardListProps {
  cards: UiCard[]
}

export interface UiFilterOption {
  value: string
  label: string
}

export interface UiFilter {
  name: string
  label: string
  allLabel: string
  options: UiFilterOption[]
}

export interface UiFiltersProps {
  label: string
  filters: UiFilter[]
}

export type UiFilterSelection = Record<string, string>

export interface UiFilterableCard {
  card: UiCard
  values: Record<string, string>
}

export interface UiBreadcrumbProps {
  links: UiLink[]
  current: string
}

export interface UiPageHeaderProps {
  title: string
  lead?: string
  breadcrumb?: UiBreadcrumbProps
}
