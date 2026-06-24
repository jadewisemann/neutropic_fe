<template>
  <main class="auth-layout">
    <section class="auth-layout__panel" :aria-labelledby="titleId">
      <RouterLink class="auth-layout__brand" to="/">Neutripic</RouterLink>

      <header class="auth-layout__header">
        <p v-if="eyebrow" class="auth-layout__eyebrow">{{ eyebrow }}</p>
        <h1 :id="titleId">{{ title }}</h1>
        <p v-if="description" class="auth-layout__description">{{ description }}</p>
      </header>

      <slot />
    </section>
  </main>
</template>

<script setup>
const props = defineProps({
  title: {
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

const titleId = `auth-layout-${props.title.replace(/\s+/g, '-').toLowerCase()}`
</script>

<style scoped>
.auth-layout {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: var(--space-5) var(--space-4);
  background:
    radial-gradient(circle at 20% 0%, rgba(37, 111, 79, 0.12), transparent 300px),
    var(--color-surface-muted);
}

.auth-layout__panel {
  width: min(440px, 100%);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-popover);
}

.auth-layout__brand {
  display: inline-block;
  margin-bottom: var(--space-6);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
  text-decoration: none;
}

.auth-layout__brand:hover {
  text-decoration: none;
  opacity: 0.7;
}

.auth-layout__header {
  margin-bottom: var(--space-6);
}

.auth-layout__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-brand-muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.auth-layout__header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.auth-layout__description {
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

@media (min-width: 720px) {
  .auth-layout {
    padding: var(--space-8) var(--space-4);
  }

  .auth-layout__panel {
    padding: var(--space-8);
  }
}
</style>
