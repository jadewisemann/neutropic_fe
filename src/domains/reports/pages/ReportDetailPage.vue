<template>
  <ReportLayout>
    <template #actions>
      <RouterLink class="report-back-link" to="/reports">← 추천 기록</RouterLink>
    </template>

    <LoadingState v-if="isLoading" label="리포트를 불러오는 중입니다" />

    <ErrorState
      v-else-if="loadError"
      title="리포트를 불러오지 못했습니다"
      :description="loadError"
    >
      <template #action>
        <div class="report-actions">
          <BaseButton size="sm" @click="loadReport">다시 시도</BaseButton>
          <BaseButton to="/reports" size="sm">목록 이동</BaseButton>
        </div>
      </template>
    </ErrorState>

    <template v-else-if="report">
      <!-- Header card -->
      <div class="report-header-card">
        <div class="report-header-card__badges">
          <span class="badge badge--blue">iDISK 근거</span>
          <span v-for="goal in topGoals" :key="goal" class="badge badge--brand">{{ goal }}</span>
        </div>
        <h1>{{ report.title }}</h1>
        <p>입력하신 정보를 바탕으로 정리한 성분 중심 안내입니다.</p>
        <div class="report-header-card__summary">
          <div class="report-header-card__summary-label">입력 요약</div>
          <div>{{ summaryLine }}</div>
        </div>
      </div>

      <div class="report-section-title">핵심 추천 성분</div>

      <article
        v-for="ingredient in recommendedIngredients"
        :key="ingredient.normalized_name || ingredient.name_ko || ingredient.name_en"
        class="ingredient-card"
      >
        <div class="ingredient-card__top">
          <div>
            <div class="ingredient-card__name">{{ ingredient.name_ko || ingredient.name_en }}</div>
            <div v-if="ingredient.name_en" class="ingredient-card__en">{{ ingredient.name_en }}</div>
          </div>
          <span class="badge badge--brand">{{ getBasisLabel(ingredient) }}</span>
        </div>
        <p class="ingredient-card__reason">{{ ingredient.reason || '-' }}</p>
        <div v-if="hasRecommendationScore(ingredient) || ingredient.score_reasons?.length" class="ingredient-card__score">
          <div class="ingredient-card__score-head">
            <span class="ingredient-card__meta-label">추천 점수</span>
            <strong v-if="hasRecommendationScore(ingredient)" class="ingredient-card__score-value">
              {{ formatRecommendationScore(ingredient.recommendation_score) }}점
            </strong>
            <span v-if="ingredient.score_label" class="ingredient-card__score-label">{{ ingredient.score_label }}</span>
          </div>
          <div v-if="ingredient.score_reasons?.length" class="ingredient-card__score-reasons">
            <span
              v-for="reason in ingredient.score_reasons"
              :key="reason"
              class="ingredient-card__score-reason"
            >
              {{ reason }}
            </span>
          </div>
        </div>
        <div class="ingredient-card__meta">
          <div v-if="ingredient.expected_effects?.length">
            <div class="ingredient-card__meta-label">기대 기능성</div>
            <div class="ingredient-card__meta-value">{{ formatList(ingredient.expected_effects) }}</div>
          </div>
          <div v-if="ingredient.recommended_dosage">
            <div class="ingredient-card__meta-label">권장 섭취</div>
            <div class="ingredient-card__meta-value">{{ ingredient.recommended_dosage }}</div>
          </div>
        </div>
        <div v-if="ingredient.precautions?.length" class="ingredient-card__caution">
          <span class="ingredient-card__caution-tag">주의</span>
          <span>{{ formatList(ingredient.precautions) }}</span>
        </div>
        <a v-if="ingredient.iherb_url" :href="ingredient.iherb_url" target="_blank" rel="noreferrer" class="ingredient-card__link">
          성분 정보 외부 링크 <span class="ingredient-card__link-tag">iHerb ↗</span>
        </a>
      </article>

      <div v-if="report.lifestyle_tips?.length" class="lifestyle-card">
        <div class="lifestyle-card__title">생활 습관 팁</div>
        <div class="lifestyle-card__list">
          <div v-for="tip in report.lifestyle_tips" :key="tip" class="lifestyle-card__item">
            <span class="lifestyle-card__dot">·</span>{{ tip }}
          </div>
        </div>
      </div>

      <div class="medical-disclaimer">
        <b>의료 면책</b> · 본 리포트는 건강 정보 제공을 위한 것으로 의료 진단·처방을 대체하지 않습니다. 질환이 있거나 약을 복용 중인 경우 반드시 전문가와 상담하세요.
      </div>

      <div class="report-actions">
        <BaseButton @click="renameReport">제목 수정</BaseButton>
        <BaseButton variant="danger" @click="deleteReport">삭제</BaseButton>
      </div>
    </template>

    <template #aside>
      <ReportChatPanel
        v-model="chatInput"
        title="리포트 채팅"
        description="이 리포트의 성분·섭취법을 물어볼 수 있어요. 진단·처방은 안내해 드릴 수 없어요."
        :limit-notice="reportLimitMessages.reportChat"
        :messages="chatMessages"
        :is-loading="isChatLoading"
        :is-submitting="isChatSubmitting"
        :submit-disabled="isReportChatLimited"
        :error-message="chatError"
        @submit="sendChatMessage"
        @disabled-submit="showReportChatLimitToast"
      />
    </template>
  </ReportLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reportApi } from '../../../shared/api'
import {
  BaseButton,
  ErrorState,
  LoadingState,
  ReportChatPanel,
  ReportLayout,
} from '../../../shared/components'
import { getRateLimitMessage, reportLimitMessages } from '../../../shared/constants/reportLimits'
import { useRateLimitStatus } from '../../../shared/composables/useRateLimitStatus'
import { useToast } from '../../../shared/composables/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { isReportChatLimited, reportChatLimitedMessage, markLimitedFromError } = useRateLimitStatus()
const report = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const chatMessages = ref([])
const chatInput = ref('')
const isChatLoading = ref(false)
const isChatSubmitting = ref(false)
const chatError = ref('')

const reportId = computed(() => route.params.report_id)
const recommendedIngredients = computed(() => report.value?.recommended_ingredients ?? [])
const topGoals = computed(() => {
  const goals = report.value?.input_summary?.health_goals
  return Array.isArray(goals) ? goals.slice(0, 2) : []
})
const summaryLine = computed(() => {
  const s = report.value?.input_summary
  if (!s) return ''
  const parts = []
  if (s.age) parts.push(`${s.age}세`)
  if (s.gender) parts.push(formatGender(s.gender))
  if (s.health_goals?.length) parts.push(`목표: ${s.health_goals.join(' · ')}`)
  if (s.medications?.length) parts.push(`복용 약: ${s.medications.join(' · ')}`)
  return parts.join(' · ')
})

onMounted(() => {
  loadReport()
  loadChatMessages()
})

async function loadReport() {
  isLoading.value = true
  loadError.value = ''

  try {
    report.value = await reportApi.get(reportId.value)
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function loadChatMessages() {
  isChatLoading.value = true
  chatError.value = ''

  try {
    chatMessages.value = await reportApi.listMessages(reportId.value)
  } catch (error) {
    chatError.value = error?.message || '채팅 내역을 불러오지 못했습니다.'
  } finally {
    isChatLoading.value = false
  }
}

async function renameReport() {
  if (!report.value) return

  const title = window.prompt('새 리포트 제목을 입력해 주세요.', report.value.title)
  const normalizedTitle = title?.trim()

  if (!normalizedTitle || normalizedTitle === report.value.title) return

  try {
    const updatedReport = await reportApi.update(reportId.value, { title: normalizedTitle })
    report.value = {
      ...report.value,
      title: updatedReport?.title ?? normalizedTitle,
    }
  } catch (error) {
    window.alert(error?.message || '제목 수정에 실패했습니다.')
  }
}

async function deleteReport() {
  if (!report.value) return
  if (!window.confirm(`'${report.value.title}' 리포트를 삭제할까요?`)) return

  try {
    await reportApi.delete(reportId.value)
    router.push('/reports')
  } catch (error) {
    window.alert(error?.message || '리포트 삭제에 실패했습니다.')
  }
}

async function sendChatMessage(content) {
  const blockedMessage = getLocalChatGuardrailMessage(content)
  if (blockedMessage) {
    chatError.value = blockedMessage
    return
  }

  const userMessage = {
    id: `local-${Date.now()}`,
    role: 'user',
    content,
  }

  chatMessages.value = [...chatMessages.value, userMessage]
  chatInput.value = ''
  isChatSubmitting.value = true
  chatError.value = ''

  try {
    const assistantMessage = await reportApi.sendMessage(reportId.value, { content })
    chatMessages.value = [...chatMessages.value, assistantMessage]
  } catch (error) {
    if (error?.errorCode === 'rate_limit_exceeded') {
      chatError.value = markLimitedFromError(
        error,
        getRateLimitMessage(error, '오늘 보낼 수 있는 리포트 채팅 횟수를 모두 사용했습니다.'),
      )
      showToast(chatError.value, { type: 'error' })
    } else {
      chatError.value = error?.message || '질문을 보내지 못했습니다.'
    }
  } finally {
    isChatSubmitting.value = false
  }
}

function showReportChatLimitToast() {
  showToast(reportChatLimitedMessage.value || reportLimitMessages.reportChat, { type: 'error' })
}

function getLocalChatGuardrailMessage(content) {
  const unsafeKeywords = [
    '진단해줘',
    '처방해줘',
    '약 끊',
    '약 중단',
    '약 늘려',
    '약 줄여',
    '이전 지시 무시',
    '시스템 프롬프트',
    'system prompt',
    'ignore previous',
  ]
  const normalizedContent = content.toLowerCase()

  if (unsafeKeywords.some((keyword) => normalizedContent.includes(keyword.toLowerCase()))) {
    return '의학적 진단, 처방, 약물 변경 요청은 답변할 수 없습니다. 질환이 있거나 약을 복용 중인 경우 전문가와 상담하세요.'
  }

  return ''
}

function getBasisLabel(ingredient) {
  const sources = ingredient.score_reasons ?? []
  if (sources.some((s) => s?.toLowerCase?.().includes('idisk'))) return 'iDISK 근거'
  return '기능성원료 인정'
}

function hasRecommendationScore(ingredient) {
  return Number.isFinite(Number(ingredient.recommendation_score))
}

function formatRecommendationScore(score) {
  return Math.round(Number(score))
}

function formatList(value) {
  return Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'
}

function formatGender(value) {
  const labels = { female: '여성', male: '남성', other: '기타' }
  return labels[value] ?? value ?? ''
}
</script>

<style scoped>
.report-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  color: #6b736d;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
}

.report-back-link:hover {
  color: #1a221e;
  text-decoration: none;
}

.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
}

.badge--blue {
  background: #eaf1fa;
  color: #2a5fa8;
}

.badge--brand {
  background: var(--color-brand-50);
  color: #1d5840;
}

/* Report header card */
.report-header-card {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
  padding: 26px 28px;
}

.report-header-card__badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.report-header-card h1 {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1a221e;
  line-height: 1.25;
}

.report-header-card p {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #6b736d;
}

.report-header-card__summary {
  padding: 14px 16px;
  background: #f7f8f6;
  border-radius: 11px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #3a423d;
}

.report-header-card__summary-label {
  font-size: 12px;
  font-weight: 600;
  color: #9aa19b;
  margin-bottom: 8px;
}

/* Section title */
.report-section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a221e;
  padding: 4px 2px;
}

/* Ingredient card */
.ingredient-card {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  padding: 20px 22px;
}

.ingredient-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.ingredient-card__name {
  font-size: 18px;
  font-weight: 700;
  color: #1a221e;
  line-height: 1.3;
}

.ingredient-card__en {
  font-size: 12.5px;
  font-weight: 500;
  color: #8b938c;
  margin-top: 2px;
  line-height: 1.4;
}

.ingredient-card__reason {
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #3a423d;
}

.ingredient-card__score {
  padding: 13px 0;
  border-top: 1px solid #eef0ec;
}

.ingredient-card__score-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ingredient-card__score-value {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  color: #1d5840;
}

.ingredient-card__score-label {
  padding: 4px 8px;
  border-radius: 7px;
  background: #f1f6ef;
  color: #3f674e;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1;
}

.ingredient-card__score-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
}

.ingredient-card__score-reason {
  padding: 6px 8px;
  border-radius: 7px;
  background: #f7f8f6;
  color: #59635c;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
}

.ingredient-card__meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 13px 0;
  border-top: 1px solid #eef0ec;
  margin-bottom: 12px;
}

.ingredient-card__meta-label {
  font-size: 11px;
  font-weight: 600;
  color: #9aa19b;
  margin-bottom: 5px;
}

.ingredient-card__meta-value {
  font-size: 13px;
  font-weight: 500;
  color: #2d352f;
  line-height: 1.5;
}

.ingredient-card__caution {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 13px;
  background: #fdf8ec;
  border-radius: 9px;
  margin-bottom: 12px;
  font-size: 12.5px;
  line-height: 1.55;
  color: #6e5a2e;
}

.ingredient-card__caution-tag {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  color: #9a6512;
}

.ingredient-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-brand);
  text-decoration: none;
}

.ingredient-card__link:hover {
  text-decoration: underline;
}

.ingredient-card__link-tag {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: #9aa19b;
}

/* Lifestyle card */
.lifestyle-card {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  padding: 20px 22px;
}

.lifestyle-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a221e;
  margin-bottom: 12px;
}

.lifestyle-card__list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.lifestyle-card__item {
  display: flex;
  gap: 10px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #3a423d;
}

.lifestyle-card__dot {
  flex-shrink: 0;
  color: var(--color-brand);
  font-weight: 700;
}

/* Medical disclaimer */
.medical-disclaimer {
  padding: 16px 18px;
  background: #fdf8ec;
  border: 1px solid #f0e2c2;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.65;
  color: #6e5a2e;
}

.medical-disclaimer b {
  color: #8a5b10;
}

/* Report actions */
.report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
