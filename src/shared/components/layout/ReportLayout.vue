<template>
  <AppLayout>
    <section class="report-layout" aria-labelledby="report-layout-title">
      <PageHeader class="report-layout__header" title-id="report-layout-title" eyebrow="추천 리포트" :title="title">
        <slot name="actions" />
      </PageHeader>
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
import PageHeader from './PageHeader.vue'

defineProps({
  title: {
    type: String,
    default: '성분 중심 추천 리포트',
  },
})
</script>

<style scoped>
.report-layout__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: var(--space-6);
  align-items: start;
}

.report-layout__main,
.report-layout__aside {
  display: grid;
  gap: var(--space-5);
}

@media (max-width: 920px) {
  .report-layout__content {
    grid-template-columns: 1fr;
  }
}
</style>
