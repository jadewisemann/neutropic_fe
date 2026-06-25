<template>
  <ReportLayout :title="report?.title || '방금 생성된 추천 리포트'">
    <template #actions>
      <div class="report-actions">
        <BaseButton to="/reports">목록 이동</BaseButton>
        <BaseButton to="/survey">다시 설문</BaseButton>
      </div>
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
      <ContentSection title-id="input-summary-title" title="사용자 입력 요약">
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
            <dt>추가 정보</dt>
            <dd>{{ report.input_summary?.additional_notes || '-' }}</dd>
          </div>
        </dl>
      </ContentSection>

      <ContentSection title-id="ingredient-list-title" title="핵심 추천 성분">
        <div v-if="recommendedIngredients.length === 0" class="empty-copy">
          추천 성분이 없습니다.
        </div>
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

      <ContentSection title-id="lifestyle-title" title="생활 습관 관리 팁">
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
        placeholder="성분에 대해 물어보기…"
        :limit-notice="reportLimitMessages.reportChat"
        :messages="chatMessages"
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
import { computed, ref } from 'vue'
import { reportApi } from '../../../shared/api'
import {
  BaseButton,
  ContentSection,
  ErrorState,
  MedicalDisclaimer,
  ReportChatPanel,
  ReportLayout,
} from '../../../shared/components'
import { getRateLimitMessage, reportLimitMessages } from '../../../shared/constants/reportLimits'
import { useRateLimitStatus } from '../../../shared/composables/useRateLimitStatus'
import { useToast } from '../../../shared/composables/useToast'

const { showToast } = useToast()
const { isReportChatLimited, reportChatLimitedMessage, markLimitedFromError } = useRateLimitStatus()
const report = ref(readLatestReport())
const recommendedIngredients = computed(() => report.value?.recommended_ingredients ?? [])

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

function readLatestReport() {
  try {
    const rawReport = window.sessionStorage.getItem('neutripic:latest_report')
    return rawReport ? JSON.parse(rawReport) : null
  } catch {
    return null
  }
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
</script>

<style scoped>
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

.ingredient-card h3,
.ingredient-card__subtitle {
  margin: 0;
}

.ingredient-card__subtitle,
.empty-copy {
  color: #5b6b65;
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
  gap: 12px;
  margin: 0;
  padding-left: 20px;
}

p {
  margin: 0;
  color: #5b6b65;
  line-height: 1.6;
}

.report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

</style>
