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
  padding: 0;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  background: #ffffff;
}

.admin-table-panel__header {
  padding: 16px 18px;
  border-bottom: 1px solid #eef0ec;
  margin-bottom: 0;
}

.admin-table-panel__header h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.admin-table-panel__header p {
  margin: 0;
  color: #6b736d;
  font-size: 13.5px;
}

.admin-table-panel__scroll {
  overflow-x: auto;
}
</style>
