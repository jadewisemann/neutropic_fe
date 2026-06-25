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
  padding: 0 24px;
  background: #f7f8f6;
  min-height: calc(100vh - 60px);
}

.auth-layout__panel {
  width: 100%;
  max-width: 420px;
  padding: 56px 0;
  animation: np-fade 0.3s ease both;
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
