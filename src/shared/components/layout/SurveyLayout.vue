<template>
  <AppLayout>
    <section class="survey-layout" aria-labelledby="survey-layout-title">
      <PageHeader
        class="survey-layout__header"
        title-id="survey-layout-title"
        eyebrow="추천 설문"
        :title="title"
        :description="description"
      />
      <div class="survey-layout__body">
        <slot />
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
    default: '건강 목표와 주의사항을 알려주세요',
  },
  description: {
    type: String,
    default: '입력한 정보는 성분 중심 리포트와 안전 안내를 구성하는 데 사용됩니다.',
  },
})
</script>

<style scoped>
.survey-layout__header {
  margin-bottom: var(--space-8);
}

.survey-layout__body {
  display: grid;
  gap: var(--space-6);
}
</style>
