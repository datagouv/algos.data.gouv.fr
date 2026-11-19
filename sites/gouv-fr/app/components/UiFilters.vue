<script setup lang="ts">
import type { UiFilterSelection, UiFiltersProps } from '#layers/web/shared/types/ui'

defineProps<UiFiltersProps>()
const selection = defineModel<UiFilterSelection>({ required: true })
const id = useId()

function choose(name: string, event: Event) {
  selection.value = { ...selection.value, [name]: (event.target as HTMLSelectElement).value }
}
</script>

<template>
  <!-- Native select: DsfrSelect always adds a disabled placeholder option before the option without choice -->
  <div
    role="group"
    :aria-label="label"
    class="fr-grid-row fr-grid-row--gutters fr-mb-3w"
  >
    <div
      v-for="filter in filters"
      :key="filter.name"
      class="fr-col-12 fr-col-md-4"
    >
      <div class="fr-select-group">
        <label
          class="fr-label"
          :for="`${id}-${filter.name}`"
        >{{ filter.label }}</label>
        <select
          :id="`${id}-${filter.name}`"
          class="fr-select"
          :name="filter.name"
          :value="selection[filter.name] ?? ''"
          @change="choose(filter.name, $event)"
        >
          <option value="">
            {{ filter.allLabel }}
          </option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
