<script setup lang="ts">
import type { UiCardListProps } from '#layers/web/shared/types/ui'

defineProps<UiCardListProps>()
</script>

<template>
  <ul class="card-list">
    <li
      v-for="card in cards"
      :key="card.to"
      class="card"
    >
      <h2 class="card-title">
        <NuxtLink :to="card.to">
          {{ card.title }}
        </NuxtLink>
      </h2>
      <ul
        v-if="card.tags?.length"
        class="card-tags"
      >
        <li
          v-for="tag in card.tags"
          :key="tag"
          class="card-tag"
        >
          {{ tag }}
        </li>
      </ul>
      <p
        v-if="card.detail"
        class="card-detail"
      >
        {{ card.detail }}
      </p>
      <p class="card-description">
        {{ card.description }}
      </p>
    </li>
  </ul>
</template>

<style scoped>
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
}

/* the title comes first for screen readers, the tags and the detail show above it */
.card-tags,
.card-detail {
  order: -1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: 0 0 var(--space-1);
  padding: 0;
  list-style: none;
}

.card-tag {
  padding: 0 var(--space-1);
  background: var(--color-background-alt);
  font-size: var(--font-size-small);
}

.card-detail {
  margin: 0 0 var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

.card-title {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-large);
}

.card-description {
  margin: 0;
  color: var(--color-text-muted);
}
</style>
