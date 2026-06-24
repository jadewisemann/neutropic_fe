<template>
  <aside class="safety-notice" aria-label="건강 정보 안내">
    <strong>{{ title }}</strong>
    <p>{{ message }}</p>
  </aside>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '건강 정보 안내',
  },
  message: {
    type: String,
    default: '질환이 있거나 약을 복용 중인 경우 전문가와 상담하세요.',
  },
})
</script>

<style scoped>
.safety-notice {
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--radius-md);
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
  font-size: 14px;
}

.safety-notice strong {
  display: block;
  margin-bottom: var(--space-1);
  font-weight: 800;
}

.safety-notice p {
  margin: 0;
  line-height: 1.6;
}
</style>
