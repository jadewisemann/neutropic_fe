<template>
  <AppLayout>
    <section class="generation-page" aria-labelledby="generation-title">
      <PageHeader
        title-id="generation-title"
        eyebrow="리포트 생성"
        title="맞춤 성분 리포트를 생성하고 있습니다"
        description="입력 검증부터 RAG 근거 확인까지 순서대로 처리합니다."
      />

      <ErrorState
        v-if="!pendingPayload && !isGenerating"
        title="진행 중인 생성 요청이 없습니다"
        description="새 리포트가 필요하면 설문을 제출해 주세요."
      >
        <template #action>
          <BaseButton to="/survey" size="sm">설문 시작</BaseButton>
        </template>
      </ErrorState>

      <ContentSection
        v-else
        title-id="generation-progress-title"
        title="생성 진행 상태"
        :description="currentStepDescription"
      >
        <ol class="step-list">
          <li
            v-for="(step, index) in generationSteps"
            :key="step.id"
            class="step-list__item"
            :class="{
              'step-list__item--done': index < activeStepIndex,
              'step-list__item--active': index === activeStepIndex && isGenerating,
              'step-list__item--failed': hasFailed && index === activeStepIndex,
            }"
          >
            <span class="step-list__marker">{{ getStepMarker(index) }}</span>
            <span>{{ step.label }}</span>
          </li>
        </ol>
      </ContentSection>

      <ErrorState
        v-if="clarificationQuestions.length > 0"
        title="추가 확인이 필요합니다"
        description="아래 내용을 보완한 뒤 다시 요청해 주세요."
      >
        <ul class="question-list">
          <li v-for="question in clarificationQuestions" :key="question.code ?? question.message">
            {{ question.message }}
          </li>
        </ul>
        <template #action>
          <BaseButton to="/survey" size="sm">설문 수정</BaseButton>
        </template>
      </ErrorState>

      <ErrorState
        v-else-if="createError"
        title="리포트 생성에 실패했습니다"
        :description="createError"
      >
        <template #action>
          <div class="error-actions">
            <BaseButton size="sm" @click="startGeneration">다시 시도</BaseButton>
            <BaseButton to="/survey" size="sm">설문 수정</BaseButton>
          </div>
        </template>
      </ErrorState>

      <SafetyNotice />
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { reportApi } from '../../../shared/api'
import { AppLayout, BaseButton, ErrorState, SafetyNotice } from '../../../shared/components'
import { getRateLimitMessage } from '../../../shared/constants/reportLimits'
import { useRateLimitStatus } from '../../../shared/composables/useRateLimitStatus'
import { useToast } from '../../../shared/composables/useToast'

const PENDING_REPORT_KEY = 'neutripic:pending_report_payload'
const LATEST_REPORT_KEY = 'neutripic:latest_report'

const generationSteps = [
  { id: 'validate', label: '입력 검증' },
  { id: 'normalize', label: '한국어 입력 정규화' },
  { id: 'rag', label: 'RAG 근거 검색' },
  { id: 'functional', label: '기능성원료 데이터 확인' },
  { id: 'write', label: '리포트 작성' },
  { id: 'save', label: '추천 기록 저장' },
]

const router = useRouter()
const { showToast } = useToast()
const { markLimitedFromError } = useRateLimitStatus()
const pendingPayload = ref(readPendingPayload())
const activeStepIndex = ref(0)
const isGenerating = ref(false)
const hasFailed = ref(false)
const createError = ref('')
const clarificationQuestions = ref([])

const currentStepDescription = computed(() => {
  if (hasFailed.value) return '현재 단계에서 처리가 중단되었습니다.'
  if (!isGenerating.value) return '생성 요청을 준비하고 있습니다.'

  return `${generationSteps[activeStepIndex.value]?.label ?? '마무리'} 중입니다.`
})

onMounted(() => {
  if (pendingPayload.value) {
    startGeneration()
  }
})

async function startGeneration() {
  if (!pendingPayload.value) return

  isGenerating.value = true
  hasFailed.value = false
  createError.value = ''
  clarificationQuestions.value = []
  activeStepIndex.value = 0

  try {
    await playProgressUntil(4)
    const report = await reportApi.create(pendingPayload.value)

    if (report?.status === 'needs_clarification') {
      activeStepIndex.value = 0
      clarificationQuestions.value = Array.isArray(report.questions) ? report.questions : []
      clearPendingPayload()
      return
    }

    activeStepIndex.value = 5
    await delay(350)
    storeLatestReport(report)
    clearPendingPayload()
    router.replace('/reports/new')
  } catch (error) {
    hasFailed.value = true
    createError.value = getCreateReportErrorMessage(error)
    if (error?.errorCode === 'rate_limit_exceeded') {
      const message = markLimitedFromError(error, createError.value)
      showToast(message || createError.value, { type: 'error' })
    }
  } finally {
    isGenerating.value = false
  }
}

async function playProgressUntil(targetIndex) {
  while (activeStepIndex.value < targetIndex) {
    await delay(420)
    activeStepIndex.value += 1
  }
}

function getStepMarker(index) {
  if (hasFailed.value && index === activeStepIndex.value) return '!'
  if (index < activeStepIndex.value) return '✓'
  return index + 1
}

function readPendingPayload() {
  try {
    const rawPayload = window.sessionStorage.getItem(PENDING_REPORT_KEY)
    return rawPayload ? JSON.parse(rawPayload) : null
  } catch {
    return null
  }
}

function storeLatestReport(report) {
  window.sessionStorage.setItem(LATEST_REPORT_KEY, JSON.stringify(report))
}

function clearPendingPayload() {
  window.sessionStorage.removeItem(PENDING_REPORT_KEY)
  pendingPayload.value = null
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function getCreateReportErrorMessage(error) {
  if (error?.errorCode === 'rate_limit_exceeded') {
    return getRateLimitMessage(error, '오늘 생성 가능한 리포트 횟수를 모두 사용했습니다.')
  }

  if (error?.errorCode === 'validation_error') {
    return error.message || '설문 입력값을 확인해 주세요.'
  }

  if (error?.errorCode === 'ai_server_error' || error?.isServerError) {
    return 'AI 리포트 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  return error?.message || '리포트 생성 요청에 실패했습니다.'
}
</script>

<style scoped>
.generation-page {
  display: grid;
  gap: 20px;
}

.step-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
}

.step-list__marker {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 800;
}

.step-list__item--done,
.step-list__item--active {
  color: var(--color-text);
}

.step-list__item--done .step-list__marker,
.step-list__item--active .step-list__marker {
  border-color: var(--color-brand);
  background: var(--color-blue-100);
}

.step-list__item--failed,
.step-list__item--failed .step-list__marker {
  border-color: #b5483c;
  color: #8f2f23;
}

.question-list {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
  padding-left: 20px;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
