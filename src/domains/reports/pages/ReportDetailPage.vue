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
        title="저장된 채팅"
        description="이 리포트 범위 안에서 후속 질문을 이어갈 수 있습니다."
        :messages="chatMessages"
        :is-loading="isChatLoading"
        :is-submitting="isChatSubmitting"
        :error-message="chatError"
        @submit="sendChatMessage"
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

const route = useRoute()
const router = useRouter()
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
    chatError.value = error?.message || '질문을 보내지 못했습니다.'
  } finally {
    isChatSubmitting.value = false
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

.ingredient-card h3,
.ingredient-card__subtitle {
  margin: 0;
}

.ingredient-card__subtitle {
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
