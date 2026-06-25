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
  gap: var(--space-5);
  padding: 26px 28px;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  background: var(--color-surface);
}

.content-section__header {
  display: grid;
  gap: var(--space-2);
}

.content-section__eyebrow {
  margin: 0;
  color: var(--color-brand);
  font-size: 12px;
  font-weight: 800;
}

.content-section__description {
  margin: 0;
  color: #6b736d;
  font-size: 13.5px;
  line-height: 1.55;
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
    padding: 30px 32px;
  }
}
</style>
