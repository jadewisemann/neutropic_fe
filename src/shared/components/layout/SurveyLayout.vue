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
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  animation: np-fade 0.3s ease both;
}
</style>
