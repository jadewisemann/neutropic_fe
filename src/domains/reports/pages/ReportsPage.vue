<template>
  <AppLayout>
    <section class="reports-page" aria-labelledby="reports-title">
      <PageHeader
        title-id="reports-title"
        eyebrow="추천 기록"
        title="저장된 리포트"
        description="생성일, 건강 목표, 주요 추천 성분을 기준으로 최근 리포트를 확인합니다."
      >
        <template #actions>
          <BaseButton to="/survey" variant="primary">다시 설문하기</BaseButton>
        </template>
      </PageHeader>

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
        <article v-for="report in reports" :key="report.id" class="report-list__item">
          <div>
            <p class="report-list__status">{{ formatStatus(report.status) }}</p>
            <h2>{{ report.title }}</h2>
            <p>{{ formatDate(report.created_at) }}</p>
          </div>
          <div class="report-list__actions">
            <BaseButton :to="`/reports/${report.id}`" size="sm" variant="primary">상세 보기</BaseButton>
            <BaseButton size="sm" @click="renameReport(report)">제목 수정</BaseButton>
            <BaseButton size="sm" variant="danger" @click="deleteReport(report)">삭제</BaseButton>
          </div>
        </article>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { reportApi } from '../../../shared/api'
import { AppLayout, BaseButton, EmptyState, ErrorState, LoadingState, PageHeader } from '../../../shared/components'

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

async function renameReport(report) {
  const title = window.prompt('새 리포트 제목을 입력해 주세요.', report.title)
  const normalizedTitle = title?.trim()

  if (!normalizedTitle || normalizedTitle === report.title) return

  try {
    const updatedReport = await reportApi.update(report.id, { title: normalizedTitle })
    reports.value = reports.value.map((item) => (
      item.id === report.id ? { ...item, title: updatedReport?.title ?? normalizedTitle } : item
    ))
  } catch (error) {
    window.alert(error?.message || '제목 수정에 실패했습니다.')
  }
}

async function deleteReport(report) {
  if (!window.confirm(`'${report.title}' 리포트를 삭제할까요?`)) return

  try {
    await reportApi.delete(report.id)
    reports.value = reports.value.filter((item) => item.id !== report.id)
  } catch (error) {
    window.alert(error?.message || '리포트 삭제에 실패했습니다.')
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

function formatDate(value) {
  if (!value) return '생성일 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.reports-page {
  display: grid;
  gap: var(--space-6);
}

.report-list {
  display: grid;
  gap: var(--space-3);
}

.report-list__item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-raised);
  transition: box-shadow 200ms;
}

.report-list__item:hover {
  box-shadow: var(--shadow-popover);
}

.report-list__item h2,
.report-list__item p {
  margin: 0;
}

.report-list__item h2 {
  margin: var(--space-1) 0 var(--space-2);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.report-list__item p {
  color: var(--color-text-muted);
  font-size: 13px;
}

.report-list__status {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-brand-muted);
}

.report-list__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .report-list__item {
    flex-direction: column;
  }

  .report-list__actions {
    justify-content: flex-start;
  }
}

@media (min-width: 720px) {
  .report-list__item {
    padding: var(--space-5) var(--space-6);
  }
}
</style>
