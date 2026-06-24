<template>
  <section class="content-section" :aria-labelledby="titleId">
    <header class="content-section__header">
      <p v-if="eyebrow" class="content-section__eyebrow">{{ eyebrow }}</p>
      <h2 :id="titleId">{{ title }}</h2>
      <p v-if="description" class="content-section__description">{{ description }}</p>
    </header>
    <slot />
  </section>
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
.content-section {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-raised);
}

.content-section__header {
  display: grid;
  gap: var(--space-2);
}

.content-section__eyebrow {
  margin: 0;
  color: var(--color-brand-muted);
  font-size: 13px;
  font-weight: 800;
}

.content-section__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.content-section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

@media (min-width: 720px) {
  .content-section {
    padding: var(--space-6);
  }
}
</style>
