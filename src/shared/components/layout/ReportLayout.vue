<template>
  <AppLayout>
    <section class="report-layout">
      <div class="report-layout__top">
        <slot name="actions" />
      </div>
      <div class="report-layout__content">
        <article class="report-layout__main">
          <slot />
        </article>
        <aside v-if="$slots.aside" class="report-layout__aside">
          <slot name="aside" />
        </aside>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'

defineProps({
  title: {
    type: String,
    default: '성분 중심 추천 리포트',
  },
})
</script>

<style scoped>
.report-layout {
  max-width: 1024px;
  margin: 0 auto;
  padding: 28px 24px 56px;
  animation: np-fade 0.3s ease both;
}

.report-layout__top {
  margin-bottom: 16px;
}

.report-layout__content {
  display: grid;
  grid-template-columns: 1.65fr 1fr;
  gap: 20px;
  align-items: start;
}

.report-layout__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.report-layout__aside {
  position: sticky;
  top: 76px;
}

@media (max-width: 700px) {
  .report-layout__content {
    grid-template-columns: 1fr;
  }

  .report-layout__aside {
    position: static;
  }
}

@media (max-width: 640px) {
  .report-layout {
    padding: 20px 16px 40px;
  }
}
</style>
