<template>
  <header class="page-header">
    <div>
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <h1 :id="titleId">{{ title }}</h1>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <slot name="actions" />
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  titleId: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-5);
}

.page-header__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-brand-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: 0;
  color: var(--color-text);
}

.page-header__description {
  max-width: var(--content-measure);
  margin: var(--space-2) 0 0;
  color: var(--color-text-soft);
  font-size: 15px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
  }
}

@media (min-width: 720px) {
  .page-header {
    gap: var(--space-5);
    padding-bottom: var(--space-6);
    margin-bottom: var(--space-6);
  }

  .page-header h1 {
    font-size: 34px;
  }
}
</style>
