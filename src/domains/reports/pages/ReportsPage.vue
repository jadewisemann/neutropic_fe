<template>
  <AppLayout>
    <div class="reports-page">
      <div class="reports-page__header">
        <div>
          <h1>추천 기록</h1>
          <p>날짜 · 건강 목표 · 핵심 성분으로 정리됩니다.</p>
        </div>
        <RouterLink class="reports-page__new-btn" to="/survey">새 리포트</RouterLink>
      </div>

      <LoadingState v-if="isLoading" label="리포트 목록을 불러오는 중입니다" />

      <ErrorState
        v-else-if="loadError"
        title="리포트 목록을 불러오지 못했습니다"
        :description="loadError"
      >
        <template #action>
          <BaseButton size="sm" @click="loadReports">다시 시도</BaseButton>
        </template>
      </ErrorState>

      <EmptyState
        v-else-if="reports.length === 0"
        title="저장된 리포트가 없습니다"
        description="설문을 완료하면 추천 기록이 이곳에 저장됩니다."
      >
        <template #action>
          <BaseButton to="/survey">추천 설문 시작</BaseButton>
        </template>
      </EmptyState>

      <div v-else class="report-list">
        <RouterLink
          v-for="report in reports"
          :key="report.id"
          :to="`/reports/${report.id}`"
          class="report-card"
        >
          <div class="report-card__body">
            <div class="report-card__top">
              <span class="report-card__title">{{ report.title }}</span>
              <span class="report-card__date">{{ formatShortDate(report.created_at) }}</span>
            </div>
            <div class="report-card__tags">
              <span class="report-card__tag report-card__tag--brand">{{ formatStatus(report.status) }}</span>
              <span v-if="getGoalText(report)" class="report-card__tag report-card__tag--neutral">{{ getGoalText(report) }}</span>
            </div>
          </div>
          <span class="report-card__arrow">›</span>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { reportApi } from '../../../shared/api'
import { AppLayout, BaseButton, EmptyState, ErrorState, LoadingState } from '../../../shared/components'

const reports = ref([])
const isLoading = ref(true)
const loadError = ref('')

onMounted(() => {
  loadReports()
})

async function loadReports() {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await reportApi.list()
    reports.value = Array.isArray(response?.results) ? response.results : []
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

function formatStatus(status) {
  const labels = {
    completed: '생성 완료',
    needs_clarification: '추가 확인 필요',
    failed: '생성 실패',
  }

  return labels[status] ?? status ?? '상태 없음'
}

function getGoalText(report) {
  const goals = report.input_summary?.health_goals
  if (Array.isArray(goals) && goals.length > 0) {
    return goals.slice(0, 2).join(' · ') + (goals.length > 2 ? ' 외' : '')
  }
  return ''
}

function formatShortDate(value) {
  if (!value) return ''

  const date = new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
}
</script>

<style scoped>
.reports-page {
  max-width: 1024px;
  margin: 0 auto;
  padding: 36px 24px 56px;
  animation: np-fade 0.3s ease both;
}

@media (max-width: 640px) {
  .reports-page {
    padding: 24px 16px 40px;
  }
}

.reports-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.reports-page__header h1 {
  margin: 0 0 5px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  color: #1a221e;
}

.reports-page__header p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6b736d;
}

.reports-page__new-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: var(--color-brand);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms;
}

.reports-page__new-btn:hover {
  background: var(--color-brand-strong);
  text-decoration: none;
}

.report-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 560px) {
  .report-list {
    grid-template-columns: 1fr;
  }
}

.report-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 150ms;
}

.report-card:hover {
  border-color: #cfd6cf;
  text-decoration: none;
}

.report-card__body {
  flex: 1;
  min-width: 0;
}

.report-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
}

.report-card__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: #1a221e;
}

.report-card__date {
  flex-shrink: 0;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  color: #9aa19b;
}

.report-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.report-card__tag {
  padding: 4px 9px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
}

.report-card__tag--brand {
  background: var(--color-brand-50);
  color: #1d5840;
}

.report-card__tag--neutral {
  background: #f2f4f1;
  color: #5a625b;
  font-weight: 500;
}

.report-card__arrow {
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 700;
  color: #c2c8c1;
}
</style>
