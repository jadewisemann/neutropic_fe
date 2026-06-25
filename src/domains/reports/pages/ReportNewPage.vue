<template>
  <ReportLayout>
    <template #actions>
      <RouterLink class="report-back-link" to="/reports">← 추천 기록</RouterLink>
    </template>

    <ErrorState
      v-if="!report"
      title="생성된 리포트를 찾을 수 없습니다"
      description="설문을 다시 제출하거나 저장된 리포트 목록에서 확인해 주세요."
    >
      <template #action>
        <div class="report-actions">
          <BaseButton to="/survey" size="sm">설문 시작</BaseButton>
          <BaseButton to="/reports" size="sm">목록 이동</BaseButton>
        </div>
      </template>
    </ErrorState>

    <template v-else>
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
          <span class="badge badge--brand">기능성원료 인정</span>
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
        <BaseButton to="/reports">목록 이동</BaseButton>
        <BaseButton to="/survey">다시 설문</BaseButton>
      </div>
    </template>

    <template #aside>
      <ReportChatPanel
        v-model="chatInput"
        title="리포트 채팅"
        description="이 리포트의 성분·섭취법을 물어볼 수 있어요. 진단·처방은 안내해 드릴 수 없어요."
        placeholder="성분에 대해 물어보기…"
        :messages="chatMessages"
        :is-submitting="isChatSubmitting"
        :error-message="chatError"
        @submit="sendChatMessage"
      />
    </template>
  </ReportLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { reportApi } from '../../../shared/api'
import { BaseButton, ErrorState, ReportChatPanel, ReportLayout } from '../../../shared/components'

const report = ref(readLatestReport())
const chatMessages = ref([])
const chatInput = ref('')
const isChatSubmitting = ref(false)
const chatError = ref('')
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

async function sendChatMessage(content) {
  if (!report.value?.id) {
    chatError.value = '리포트 저장 후 채팅을 사용할 수 있습니다.'
    return
  }

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
    const assistantMessage = await reportApi.sendMessage(report.value.id, { content })
    chatMessages.value = [...chatMessages.value, assistantMessage]
  } catch (error) {
    chatError.value = error?.message || '질문을 보내지 못했습니다.'
  } finally {
    isChatSubmitting.value = false
  }
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

function readLatestReport() {
  try {
    const rawReport = window.sessionStorage.getItem('neutripic:latest_report')
    return rawReport ? JSON.parse(rawReport) : null
  } catch {
    return null
  }
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
  color: #6b736d;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
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

.report-section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a221e;
  padding: 4px 2px;
}

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
}

.ingredient-card__en {
  font-size: 12.5px;
  font-weight: 500;
  color: #8b938c;
  margin-top: 2px;
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

.report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
