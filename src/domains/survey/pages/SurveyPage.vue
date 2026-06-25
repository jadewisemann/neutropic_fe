<template>
  <SurveyLayout>
    <section v-if="isLoading" aria-labelledby="survey-loading-title">
      <LoadingState label="설문 선택지를 불러오는 중입니다" />
    </section>

    <ErrorState
      v-else-if="loadError"
      title="설문을 불러오지 못했습니다"
      :description="loadError"
    >
      <template #action>
        <BaseButton size="sm" @click="loadSurveyOptions">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <template v-else>
      <!-- Progress strip -->
      <div class="survey-progress" aria-label="설문 진행">
        <div class="survey-progress__meta">
          <span>{{ progressValue }} / {{ surveySteps.length }} 단계</span>
          <span class="survey-progress__title" :id="`${currentStep.id}-title`">{{ currentStep.title }}</span>
        </div>
        <div
          class="survey-progress__bar"
          role="progressbar"
          :aria-valuenow="progressValue"
          :aria-valuemax="surveySteps.length"
        >
          <div
            class="survey-progress__fill"
            :style="{ width: `${(progressValue / surveySteps.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step content -->
      <ContentSection
        :title-id="`${currentStep.id}-section-title`"
        :title="currentStep.title"
        :description="currentStep.description"
      >
        <template v-if="currentStep.inputType === 'number'">
          <input
            v-model.number="state[currentStep.field]"
            class="form-control"
            type="number"
            :name="currentStep.field"
            :min="currentStep.min"
            :max="currentStep.max"
            :placeholder="currentStep.title"
            :disabled="isSubmitting"
          />

          <FormErrorMessage
            v-if="canShowError(currentStep.id) && !currentValidation.isValid"
            :message="currentValidation.message"
          />
        </template>

        <template v-else-if="currentStep.inputType === 'single_select'">
          <div class="chip-grid">
            <label
              v-for="option in currentOptions"
              :key="option.code"
              :class="{ 'chip-grid__item--checked': state[currentStep.field] === option.code }"
            >
              <input
                v-model="state[currentStep.field]"
                type="radio"
                :name="currentStep.field"
                :value="option.code"
                :disabled="isSubmitting"
              />
              <span>{{ option.name }}</span>
            </label>
          </div>

          <FormErrorMessage
            v-if="canShowError(currentStep.id) && !currentValidation.isValid"
            :message="currentValidation.message"
          />
        </template>

        <template v-if="currentStep.inputType === 'multi_select'">
          <EmptyState
            v-if="currentOptions.length === 0"
            title="선택지가 없습니다"
            description="현재 단계에서 표시할 선택지가 없습니다."
          />
          <div v-else class="chip-grid">
            <label
              v-for="option in currentOptions"
              :key="option.code"
              :class="{ 'chip-grid__item--checked': state[currentStep.field].includes(option.code) }"
            >
              <input
                type="checkbox"
                :name="currentStep.field"
                :value="option.code"
                :checked="state[currentStep.field].includes(option.code)"
                :disabled="isSubmitting"
                @change="selectStepOption(currentStep, option.code)"
              />
              <span>{{ option.name }}</span>
            </label>
          </div>

          <p class="step-help">
            선택 {{ state[currentStep.field].length }}개
            <span v-if="currentStep.max">/ 최대 {{ currentStep.max }}개</span>
          </p>

          <FormErrorMessage
            v-if="canShowError(currentStep.id) && !currentValidation.isValid"
            :message="currentValidation.message"
          />
        </template>

        <template v-else-if="currentStep.inputType === 'textarea'">
          <textarea
            v-model="state.additional_notes"
            class="form-control"
            name="additional_notes"
            rows="5"
            placeholder="과도한 개인정보는 입력하지 마세요."
            :disabled="isSubmitting"
          />
        </template>
      </ContentSection>

      <ContentSection
        v-if="clarificationQuestions.length > 0"
        title-id="clarification-title"
        title="추가 확인이 필요합니다"
        description="아래 질문을 추가 정보에 반영한 뒤 다시 요청해 주세요."
      >
        <ul class="clarification-list">
          <li v-for="question in clarificationQuestions" :key="question.code ?? question.message">
            {{ question.message }}
          </li>
        </ul>
      </ContentSection>

      <ContentSection
        v-if="state.health_goals.length > 0"
        title-id="priority-title"
        title="목표 우선순위"
        description="선택한 순서대로 우선순위가 자동 지정됩니다."
      >
        <ol class="priority-list">
          <li v-for="goalCode in state.health_goals" :key="goalCode">
            {{ getOptionName('health_goals', goalCode) }}
          </li>
        </ol>
      </ContentSection>

      <FormErrorMessage :message="submitError" />

      <SafetyNotice />

      <div class="action-bar" aria-label="설문 이동">
        <button v-if="!isFirstStep" class="action-bar__prev" :disabled="isSubmitting" @click="previous">이전</button>
        <button v-if="!isLastStep" class="action-bar__next" :disabled="isSubmitting" @click="next">다음</button>
        <button v-else class="action-bar__next" :disabled="isSubmitting" @click="handleCreateReportRequest">
          {{ isSubmitting ? '리포트 생성 중' : '리포트 생성 요청' }}
        </button>
      </div>
    </template>
  </SurveyLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authTokenStorage, userApi } from '../../../shared/api'
import {
  BaseButton,
  ContentSection,
  EmptyState,
  ErrorState,
  FormErrorMessage,
  LoadingState,
  SafetyNotice,
  SurveyLayout,
} from '../../../shared/components'
import { surveySteps } from '../config/surveyDefinition'
import { useSurveyFunnel } from '../composables/surveyFlow'
import { useSurveyOptions } from '../composables/useSurveyOptions'
import { buildReportPayload } from '../mappers/surveyReportPayload'

const router = useRouter()
const {
  state,
  currentStepId,
  currentStep,
  progressValue,
  isFirstStep,
  isLastStep,
  currentValidation,
  surveyValidation,
  selectStepOption,
  next,
  previous,
  showValidationFor,
  canShowError,
} = useSurveyFunnel(surveySteps)
const {
  optionGroups,
  isLoading,
  loadError,
  loadSurveyOptions,
  getOptionName,
} = useSurveyOptions(surveySteps)
const isSubmitting = ref(false)
const submitError = ref('')
const clarificationQuestions = ref([])
const profileDefaultsApplied = ref(false)

const currentOptions = computed(() => {
  return currentStep.value.options ?? optionGroups[currentStep.value.optionGroup] ?? []
})

onMounted(() => {
  loadSurveyOptions()
  initializeProfileDefaults()
})

async function handleCreateReportRequest() {
  if (!surveyValidation.value.isValid) {
    showValidationFor(surveyValidation.value.stepId)
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  clarificationQuestions.value = []

  try {
    storePendingReportPayload(buildReportPayload(state, optionGroups))
    await router.push('/reports/generating')
  } catch (error) {
    submitError.value = error?.message || '리포트 생성 준비에 실패했습니다.'
    isSubmitting.value = false
  } finally {
    if (router.currentRoute.value.path !== '/reports/generating') {
      isSubmitting.value = false
    }
  }
}

function storePendingReportPayload(payload) {
  window.sessionStorage.setItem('neutripic:pending_report_payload', JSON.stringify(payload))
}

async function initializeProfileDefaults() {
  applyProfileDefaults(authTokenStorage.getUser())

  if (!authTokenStorage.getAccessToken()) return

  try {
    const user = await userApi.getMe()
    applyProfileDefaults(user)
  } catch {
    // 설문은 프로필 자동 입력 없이도 계속 진행할 수 있다.
  }
}

function applyProfileDefaults(user) {
  const profileDefaults = getValidProfileDefaults(user)

  if (!profileDefaults) return false

  if (!state.age) state.age = profileDefaults.age
  if (!state.gender) state.gender = profileDefaults.gender

  if (!profileDefaultsApplied.value && ['age', 'gender'].includes(currentStepId.value)) {
    currentStepId.value = 'health_goals'
    profileDefaultsApplied.value = true
  }

  return true
}

function getValidProfileDefaults(user) {
  const age = Number(user?.age)
  const gender = user?.gender
  const ageStep = surveySteps.find((step) => step.id === 'age')
  const genderStep = surveySteps.find((step) => step.id === 'gender')
  const genderCodes = genderStep?.options?.map((option) => option.code) ?? []

  if (!ageStep || !Number.isInteger(age) || age < ageStep.min || age > ageStep.max) return null
  if (!genderCodes.includes(gender)) return null

  return { age, gender }
}
</script>

<style scoped>
/* ---- Progress strip ---- */
.survey-progress {
  margin-bottom: 28px;
}

.survey-progress__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5a625b;
}

.survey-progress__title {
  color: var(--color-brand);
  font-size: 12.5px;
}

.survey-progress__bar {
  height: 5px;
  border-radius: 99px;
  background: #eef0ec;
  overflow: hidden;
}

.survey-progress__fill {
  height: 100%;
  background: var(--color-brand);
  border-radius: 99px;
  transition: width 0.3s ease;
}

/* ---- Chips ---- */
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip-grid label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  color: #3a423d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms, background 150ms, color 150ms;
}

.chip-grid label:hover {
  border-color: var(--color-brand-muted);
  background: var(--color-gray-alpha-100);
}

.chip-grid input[type='checkbox'],
.chip-grid input[type='radio'] {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.chip-grid__item--checked {
  border-color: var(--color-brand);
  background: var(--color-brand-50);
  color: var(--color-brand-strong);
}

.step-help {
  margin: var(--space-3) 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.priority-list {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-text-soft);
  font-size: 14px;
}

.clarification-list {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-text-soft);
  font-size: 14px;
}

textarea.form-control {
  width: 100%;
  box-sizing: border-box;
}

/* ---- Action bar ---- */
.action-bar {
  display: flex;
  gap: 10px;
  margin-top: 32px;
}

.action-bar__prev {
  flex: none;
  width: 80px;
  height: 50px;
  border: 1.5px solid #d4dad4;
  border-radius: 11px;
  background: #fff;
  color: #5a625b;
  font: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms;
}

.action-bar__prev:hover:not(:disabled) {
  border-color: var(--color-brand);
}

.action-bar__prev:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-bar__next {
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 11px;
  background: var(--color-brand);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
}

.action-bar__next:hover:not(:disabled) {
  background: var(--color-brand-strong);
}

.action-bar__next:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
