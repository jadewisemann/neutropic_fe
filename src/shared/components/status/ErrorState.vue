<template>
  <BaseStatus
    class="u-panel u-panel--danger"
    role="alert"
    :title="title"
    :description="description"
  >
    <template #default="{ title: statusTitle, description: statusDescription }">
      <p class="u-text-title u-text-danger">{{ statusTitle }}</p>
      <p v-if="statusDescription" class="error-state__description u-text-danger-muted">
        {{ statusDescription }}
      </p>
      <div v-if="$slots.action" class="error-state__action">
        <slot name="action" />
      </div>
    </template>
  </BaseStatus>
</template>

<script setup>
import { BaseStatus } from '../headless'

defineProps({
  title: {
    type: String,
    default: '문제가 발생했습니다',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.error-state__description {
  margin: 8px 0 0;
  line-height: 1.6;
}

.error-state__action {
  margin-top: 16px;
}
</style>
