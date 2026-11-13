<script setup lang="ts">
import type { UiFilterSelection } from '#layers/web/shared/types/ui'

const { data: catalogue, error } = await useFetch('/api/records')
if (error.value || !catalogue.value) {
  throw createError({ ...error.value, fatal: true })
}

useHead({ title: catalogue.value.title })

const selection = ref<UiFilterSelection>({})
const cards = computed(() => selectCards(catalogue.value?.cards ?? [], selection.value))
const status = computed(() => {
  if (cards.value.length === 0) {
    return 'Aucune règle ne correspond aux filtres choisis.'
  }
  return cards.value.length === 1
    ? '1 règle'
    : `${cards.value.length} règles`
})
</script>

<template>
  <template v-if="catalogue">
    <UiPageHeader :title="catalogue.title" />
    <UiPageBody>
      <UiFilters
        v-if="catalogue.filters.length > 0"
        v-model="selection"
        label="Filtrer les règles"
        :filters="catalogue.filters"
      />
      <p role="status">
        {{ status }}
      </p>
      <UiCardList :cards="cards" />
    </UiPageBody>
  </template>
</template>
