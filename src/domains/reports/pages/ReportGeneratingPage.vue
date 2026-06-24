<template>
  <AppLayout>
    <section class="generation-page" aria-labelledby="generation-title">
      <PageHeader
        title-id="generation-title"
        eyebrow="리포트 생성"
        title="설문 제출 후 바로 리포트를 생성합니다"
        description="현재 백엔드에는 별도 비동기 job API가 없어서 설문 화면에서 생성 요청과 결과 이동을 처리합니다."
      />

      <ErrorState
        title="진행 중인 생성 요청이 없습니다"
        description="새 리포트가 필요하면 설문을 제출해 주세요. 최근 생성 결과는 방금 생성된 리포트 화면에서 확인할 수 있습니다."
      >
        <template #action>
          <div class="error-actions">
            <BaseButton to="/survey" size="sm">설문 수정</BaseButton>
            <BaseButton to="/reports/new" size="sm">최근 생성 결과</BaseButton>
          </div>
        </template>
      </ErrorState>

      <SafetyNotice />
    </section>
  </AppLayout>
</template>

<script setup>
import { AppLayout, BaseButton, ErrorState, PageHeader, SafetyNotice } from '../../../shared/components'
</script>

<style scoped>
.generation-page {
  display: grid;
  gap: 20px;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

</style>
