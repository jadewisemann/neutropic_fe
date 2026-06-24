<template>
  <BaseStatus
    class="u-panel"
    role="status"
    aria-live="polite"
    :label="label"
    :description="description"
  >
    <template #default="{ title, description: statusDescription }">
      <p class="u-text-title">{{ title }}</p>
      <p v-if="statusDescription" class="status-state__description u-text-muted">
        {{ statusDescription }}
      </p>
    </template>
  </BaseStatus>
</template>

<script setup>
import { BaseStatus } from '../headless'

defineProps({
  label: {
    type: String,
    default: '불러오는 중입니다',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.status-state__description {
  margin: 8px 0 0;
}
</style>
