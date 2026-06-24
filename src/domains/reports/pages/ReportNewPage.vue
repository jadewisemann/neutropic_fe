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
            <dl class="summary-list">
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
        title="리포트 기반 채팅"
        description="리포트에 포함된 성분, 복용법, 부작용, 주의사항 범위 안에서 질문할 수 있습니다."
        placeholder="리포트 내용에 대해 질문하세요."
        :messages="chatMessages"
      />
    </template>
  </ReportLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BaseButton, ContentSection, ErrorState, MedicalDisclaimer, ReportChatPanel, ReportLayout } from '../../../shared/components'

const report = ref(readLatestReport())
const recommendedIngredients = computed(() => report.value?.recommended_ingredients ?? [])

const chatMessages = [
  { id: 'empty', text: '채팅은 리포트 상세 API 연결 후 사용할 수 있습니다.' },
]

function readLatestReport() {
  try {
    const rawReport = window.sessionStorage.getItem('neutripic:latest_report')
    return rawReport ? JSON.parse(rawReport) : null
  } catch {
    return null
  }
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
