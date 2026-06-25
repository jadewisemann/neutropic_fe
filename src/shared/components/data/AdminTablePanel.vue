<template>
  <section class="admin-table-panel u-panel u-panel--spacious" :aria-labelledby="resolvedTitleId">
    <header class="admin-table-panel__header">
      <h2 :id="resolvedTitleId">{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </header>

    <div class="admin-table-panel__scroll">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  titleId: {
    type: String,
    default: '',
  },
})

const resolvedTitleId = computed(() => props.titleId || `${props.title.replace(/\s+/g, '-').toLowerCase()}-title`)
</script>

<style scoped>
.admin-table-panel {
  overflow-x: auto;
}

.admin-table-panel__header {
  margin-bottom: var(--space-4);
}

.admin-table-panel__header h2 {
  margin: 0 0 var(--space-2);
  font-size: 1.25rem;
}

.admin-table-panel__header p {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-table-panel__scroll {
  overflow-x: auto;
}
</style>
