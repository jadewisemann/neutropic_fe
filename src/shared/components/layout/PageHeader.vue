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
  padding-bottom: 0;
  border-bottom: 0;
  margin-bottom: 22px;
}

.page-header__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-brand);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: 0;
  color: var(--color-text);
}

.page-header__description {
  max-width: var(--content-measure);
  margin: var(--space-2) 0 0;
  color: #6b736d;
  font-size: 13.5px;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
  }
}

@media (min-width: 720px) {
  .page-header {
    gap: var(--space-5);
    margin-bottom: 22px;
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>
