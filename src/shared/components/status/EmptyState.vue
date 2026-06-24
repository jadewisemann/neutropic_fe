<template>
  <BaseStatus
    class="u-panel u-panel--spacious u-panel--dashed u-text-center"
    :title="title"
    :description="description"
  >
    <template #default="{ title: statusTitle, description: statusDescription }">
      <p class="u-text-title">{{ statusTitle }}</p>
      <p v-if="statusDescription" class="empty-state__description u-text-muted u-measure">
        {{ statusDescription }}
      </p>
      <div v-if="$slots.action" class="empty-state__action">
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
    default: '표시할 내용이 없습니다',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.empty-state__description {
  margin: 8px auto 0;
}

.empty-state__action {
  margin-top: 16px;
}
</style>
