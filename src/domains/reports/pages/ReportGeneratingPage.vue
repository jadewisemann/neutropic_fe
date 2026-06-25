<template>
  <AppLayout>
    <div class="generation-page">
      <ErrorState
        v-if="!pendingPayload && !isGenerating"
        title="진행 중인 생성 요청이 없습니다"
        description="새 리포트가 필요하면 설문을 제출해 주세요."
      >
        <template #action>
          <BaseButton to="/survey" size="sm">설문 시작</BaseButton>
        </template>
      </ErrorState>

      <template v-else>
        <!-- Header -->
        <div class="generation-header">
          <span class="generation-spinner" aria-hidden="true"></span>
          <div>
            <h2>리포트를 만들고 있어요</h2>
            <p>가짜 진행률 대신 실제 단계를 보여줘요. 잠시만 기다려 주세요.</p>
          </div>
        </div>

        <!-- Steps -->
        <div class="step-panel">
          <div
            v-for="(step, index) in generationSteps"
            :key="step.id"
            class="step-item"
          >
            <div class="step-item__rail">
              <span
                class="step-item__marker"
                :class="{
                  'step-item__marker--done': index < activeStepIndex,
                  'step-item__marker--active': index === activeStepIndex && isGenerating,
                  'step-item__marker--failed': hasFailed && index === activeStepIndex,
                }"
              >{{ getStepMarker(index) }}</span>
              <span
                v-if="index < generationSteps.length - 1"
                class="step-item__line"
                :class="{
                  'step-item__line--done': index < activeStepIndex,
                  'step-item__line--active': index <= activeStepIndex && isGenerating,
                }"
              ></span>
            </div>
            <div class="step-item__content">
              <div
                class="step-item__label"
                :class="{
                  'step-item__label--done': index < activeStepIndex,
                  'step-item__label--active': index === activeStepIndex && isGenerating,
                  'step-item__label--failed': hasFailed && index === activeStepIndex,
                }"
              >{{ step.label }}</div>
              <div
                v-if="index === activeStepIndex && isGenerating && !hasFailed"
                class="step-item__progress"
              >진행 중…</div>
            </div>
          </div>
        </div>

        <div class="generation-footer">
          <RouterLink class="generation-back" to="/survey">설문 수정하기</RouterLink>
        </div>
      </template>

      <div v-if="clarificationQuestions.length > 0" class="clarification-notice">
        <div class="clarification-notice__title">추가 확인이 필요합니다</div>
        <p>아래 내용을 보완한 뒤 다시 요청해 주세요.</p>
        <ul class="question-list">
          <li v-for="question in clarificationQuestions" :key="question.code ?? question.message">
            {{ question.message }}
          </li>
        </ul>
        <RouterLink class="action-link" to="/survey">설문 수정</RouterLink>
      </div>

      <div v-else-if="createError" class="error-notice">
        <div class="error-notice__title">리포트 생성에 실패했습니다</div>
        <p>{{ createError }}</p>
        <div class="error-actions">
          <BaseButton size="sm" @click="startGeneration">다시 시도</BaseButton>
          <BaseButton to="/survey" size="sm">설문 수정</BaseButton>
        </div>
      </div>

      <SafetyNotice />
    </div>
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
  { id: 'validate', label: '입력 정보 확인' },
  { id: 'normalize', label: '건강 목표 정규화' },
  { id: 'rag', label: '근거 데이터 검색 · iDISK' },
  { id: 'functional', label: '기능성원료 데이터 확인' },
  { id: 'write', label: '성분 리포트 작성' },
  { id: 'save', label: '안전 문구 확인' },
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
  return ''
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
  gap: 18px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 56px 24px;
  animation: np-fade 0.3s ease both;
}

@media (max-width: 640px) {
  .generation-page {
    padding: 36px 16px 40px;
  }
}

/* Header */
.generation-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
}

.generation-spinner {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--color-brand-50);
  border-top-color: var(--color-brand);
  animation: np-spin 0.9s linear infinite;
}

.generation-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  color: #1a221e;
}

.generation-header p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #8b938c;
}

/* Step panel */
.step-panel {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
  padding: 24px 22px;
}

.step-item {
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
}

.step-item:last-child {
  padding-bottom: 0;
}

.step-item__rail {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-item__marker {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 1.5px solid #e4e7e3;
  background: #f2f4f1;
  color: #aab0a8;
  transition: background 300ms, color 300ms, border-color 300ms;
}

.step-item__marker--done {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: #fff;
}

.step-item__marker--active {
  background: var(--color-brand-50);
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.step-item__marker--failed {
  background: #fbece9;
  border-color: #b5483c;
  color: #8f2f23;
}

.step-item__line {
  width: 2px;
  flex: 1;
  margin-top: 4px;
  min-height: 6px;
  background: #e4e7e3;
  transition: background 300ms;
}

.step-item__line--done,
.step-item__line--active {
  background: var(--color-brand);
}

.step-item__content {
  padding-top: 2px;
}

.step-item__label {
  font-size: 14.5px;
  line-height: 1.4;
  color: #aab0a8;
  font-weight: 500;
  transition: color 300ms, font-weight 300ms;
}

.step-item__label--done,
.step-item__label--active {
  color: #1a221e;
  font-weight: 600;
}

.step-item__label--active {
  font-weight: 700;
}

.step-item__label--failed {
  color: #8f2f23;
}

.step-item__progress {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-brand);
  margin-top: 3px;
  animation: np-pulse 1.2s ease-in-out infinite;
}

/* Footer */
.generation-footer {
  text-align: center;
}

.generation-back {
  color: #9aa19b;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px;
}

.generation-back:hover {
  color: #1a221e;
}

/* Notices */
.clarification-notice,
.error-notice {
  padding: 18px;
  border: 1px solid #e8ebe7;
  border-radius: 12px;
  background: #fff;
}

.clarification-notice__title,
.error-notice__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a221e;
  margin-bottom: 6px;
}

.clarification-notice p,
.error-notice p {
  margin: 0 0 12px;
  font-size: 13.5px;
  color: #6b736d;
}

.question-list {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 14px;
  color: #3a423d;
}

.action-link {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--color-brand-50);
  color: var(--color-brand-strong);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
