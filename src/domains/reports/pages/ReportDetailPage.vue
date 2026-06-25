<template>
  <ReportLayout :title="report?.title || '저장된 추천 리포트 상세'">
    <template #actions>
      <div class="report-actions">
        <BaseButton :disabled="!report" @click="renameReport">제목 수정</BaseButton>
        <BaseButton :disabled="!report" variant="danger" @click="deleteReport">삭제</BaseButton>
        <BaseButton to="/reports">목록 이동</BaseButton>
      </div>
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
      <ContentSection
        title-id="report-header-title"
        :title="report.title"
        :eyebrow="formatDate(report.created_at)"
      >
        <p>상태: {{ formatStatus(report.status) }}</p>
      </ContentSection>

      <ContentSection title-id="summary-title" title="사용자 입력 요약">
        <dl class="summary-list">
          <div>
            <dt>나이</dt>
            <dd>{{ report.input_summary?.age ?? '-' }}</dd>
          </div>
          <div>
            <dt>성별</dt>
            <dd>{{ formatGender(report.input_summary?.gender) }}</dd>
          </div>
          <div>
            <dt>건강 목표</dt>
            <dd>{{ formatList(report.input_summary?.health_goals) }}</dd>
          </div>
          <div>
            <dt>복용 약</dt>
            <dd>{{ formatList(report.input_summary?.medications) }}</dd>
          </div>
          <div>
            <dt>특이사항</dt>
            <dd>{{ formatList(report.input_summary?.special_conditions) }}</dd>
          </div>
          <div>
            <dt>추가 입력</dt>
            <dd>{{ report.input_summary?.additional_notes || '-' }}</dd>
          </div>
        </dl>
      </ContentSection>

      <ContentSection title-id="ingredient-title" title="추천 성분 상세">
        <p v-if="recommendedIngredients.length === 0">추천 성분이 없습니다.</p>
        <template v-else>
          <article
            v-for="ingredient in recommendedIngredients"
            :key="ingredient.normalized_name || ingredient.name_ko || ingredient.name_en"
            class="ingredient-card"
          >
            <h3>{{ ingredient.name_ko || ingredient.name_en }}</h3>
            <p v-if="ingredient.name_en" class="ingredient-card__subtitle">{{ ingredient.name_en }}</p>
            <p v-if="hasRecommendationScore(ingredient)" class="ingredient-card__score">
              추천 적합도 {{ ingredient.recommendation_score }}% · {{ ingredient.score_label || getScoreLabel(ingredient.recommendation_score) }}
            </p>
            <dl class="summary-list">
              <div v-if="ingredient.score_reasons?.length">
                <dt>적합도 근거</dt>
                <dd>{{ formatList(ingredient.score_reasons) }}</dd>
              </div>
              <div>
                <dt>추천 이유</dt>
                <dd>{{ ingredient.reason || '-' }}</dd>
              </div>
              <div>
                <dt>기능성</dt>
                <dd>{{ formatList(ingredient.expected_effects) }}</dd>
              </div>
              <div>
                <dt>복용법 및 권장 용량</dt>
                <dd>{{ ingredient.recommended_dosage || '-' }}</dd>
              </div>
              <div>
                <dt>부작용 가능성</dt>
                <dd>{{ formatList(ingredient.side_effects) }}</dd>
              </div>
              <div>
                <dt>주의사항</dt>
                <dd>{{ formatList(ingredient.precautions) }}</dd>
              </div>
              <div v-if="ingredient.iherb_url">
                <dt>검증된 성분 링크</dt>
                <dd>
                  <a :href="ingredient.iherb_url" target="_blank" rel="noreferrer">
                    성분 정보 보기
                  </a>
                </dd>
              </div>
            </dl>
          </article>
          <p class="ingredient-score-note">
            추천 적합도는 사용자의 입력 조건, 근거 자료, 주의사항을 종합한 우선순위 점수이며, 효과 발생 확률이나 의학적 진단을 의미하지 않습니다.
          </p>
        </template>
      </ContentSection>

      <ContentSection title-id="tips-title" title="생활 습관 관리 팁">
        <ul v-if="report.lifestyle_tips?.length">
          <li v-for="tip in report.lifestyle_tips" :key="tip">{{ tip }}</li>
        </ul>
        <p v-else>생활 습관 관리 팁이 없습니다.</p>
      </ContentSection>

      <ContentSection v-if="report.citations?.length" title-id="citations-title" title="근거 출처">
        <ul>
          <li v-for="citation in report.citations" :key="`${citation.source_type}-${citation.document_id}`">
            {{ citation.source_name || citation.document_id }}
          </li>
        </ul>
      </ContentSection>

      <MedicalDisclaimer :message="report.disclaimer" />
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
        :suggested-questions="suggestedChatQuestions"
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
  ContentSection,
  ErrorState,
  LoadingState,
  MedicalDisclaimer,
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
const suggestedChatQuestions = computed(() => {
  const firstIngredientName = getDisplayName(recommendedIngredients.value[0])
  const primaryGoal = getDisplayName(report.value?.input_summary?.health_goals?.[0])

  return [
    firstIngredientName ? `${firstIngredientName}은 왜 추천됐나요?` : '',
    primaryGoal ? `${primaryGoal}에 가장 중요한 성분은 무엇인가요?` : '',
  ].filter(Boolean)
})

function getDisplayName(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name_ko || value.name || value.label || value.name_en || ''
}

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

function formatRecommendationScore(score) {
  return Math.round(Number(score))
}

function formatList(value) {
  return Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'
}

function formatGender(value) {
  const labels = {
    female: '여성',
    male: '남성',
    other: '기타 또는 응답하지 않음',
  }

  return labels[value] ?? value ?? '-'
}

function formatStatus(status) {
  const labels = {
    completed: '생성 완료',
    needs_clarification: '추가 확인 필요',
    failed: '생성 실패',
  }

  return labels[status] ?? status ?? '상태 없음'
}

function hasRecommendationScore(ingredient) {
  return Number.isFinite(Number(ingredient?.recommendation_score))
}

function getScoreLabel(score) {
  const normalizedScore = Number(score)
  if (normalizedScore >= 80) return '높음'
  if (normalizedScore >= 60) return '보통'
  if (normalizedScore >= 40) return '주의 필요'
  return '낮음'
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
p {
  margin: 0;
  color: #5b6b65;
  line-height: 1.6;
}

.summary-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

.summary-list div {
  display: grid;
  gap: 4px;
}

.ingredient-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid #dde7e2;
  border-radius: 8px;
}

.ingredient-card + .ingredient-card {
  margin-top: 14px;
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

.ingredient-card__subtitle {
  color: #5b6b65;
}

.ingredient-card__score {
  width: fit-content;
  padding: 6px 10px;
  border: 1px solid #b9d7ce;
  border-radius: 999px;
  background: #edf7f3;
  color: #24614f;
  font-size: 0.875rem;
  font-weight: 800;
}

.ingredient-score-note {
  margin-top: 14px;
  font-size: 0.875rem;
}

dt {
  color: #5b6b65;
  font-size: 0.875rem;
}

dd {
  margin: 0;
  color: #31443d;
}

ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
  color: #31443d;
}

.report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
