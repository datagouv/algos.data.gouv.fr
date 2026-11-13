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
  <div
    role="group"
    :aria-label="label"
    class="filters"
  >
    <div
      v-for="filter in filters"
      :key="filter.name"
      class="filter"
    >
      <label
        class="filter-label"
        :for="`${id}-${filter.name}`"
      >{{ filter.label }}</label>
      <select
        :id="`${id}-${filter.name}`"
        class="filter-select"
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
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
}

.filter-label {
  display: block;
  margin-bottom: var(--space-1);
  font-weight: 600;
}

.filter-select {
  width: 100%;
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
}
</style>
