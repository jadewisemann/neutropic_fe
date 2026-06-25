<template>
  <AppLayout>
    <div class="auth-layout">
      <section class="auth-layout__panel" :aria-labelledby="titleId">
        <header class="auth-layout__header">
          <h1 :id="titleId">{{ title }}</h1>
          <p v-if="description" class="auth-layout__description">{{ description }}</p>
        </header>
        <slot />
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'

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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 56px 24px;
  background: #f7f8f6;
  min-height: calc(100vh - 60px);
}

.auth-layout__panel {
  width: 100%;
  max-width: 480px;
  padding: 40px 44px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 16px;
  box-shadow: var(--shadow-raised);
  animation: np-fade 0.3s ease both;
}

@media (max-width: 640px) {
  .auth-layout {
    padding: 24px 16px;
    align-items: stretch;
  }

  .auth-layout__panel {
    padding: 32px 24px;
    border-radius: 12px;
  }
}

.auth-layout__header {
  margin-bottom: 28px;
}

.auth-layout__header h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
  color: #1a221e;
}

.auth-layout__description {
  margin: 0;
  color: #6b736d;
  font-size: 14px;
  line-height: 1.6;
}
</style>
