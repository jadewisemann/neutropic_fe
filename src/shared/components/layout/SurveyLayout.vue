<template>
  <AppLayout>
    <div class="survey-layout">
      <slot />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'
</script>

<style scoped>
.survey-layout {
  display: grid;
  gap: var(--space-6);
  max-width: 1024px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  animation: np-fade 0.3s ease both;
}

@media (max-width: 640px) {
  .survey-layout {
    padding: 24px 16px 40px;
  }
}
</style>
