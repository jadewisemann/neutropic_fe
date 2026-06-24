import { computed, reactive, ref } from 'vue'

export function createInitialSurveyState() {
  return {
    age: '',
    gender: '',
    health_goals: [],
    medications: [],
    special_conditions: [],
    additional_notes: '',
  }
}

export function getStepIndex(steps, stepId) {
  return steps.findIndex((step) => step.id === stepId)
}

export function getNextStepId(steps, stepId) {
  const stepIndex = getStepIndex(steps, stepId)

  if (stepIndex < 0 || stepIndex >= steps.length - 1) return null

  return steps[stepIndex + 1].id
}

export function getPreviousStepId(steps, stepId) {
  const stepIndex = getStepIndex(steps, stepId)

  if (stepIndex <= 0) return null

  return steps[stepIndex - 1].id
}

export function toggleSelectedCode(currentValue, code, constraints = {}) {
  if (currentValue.includes(code)) {
    return currentValue.filter((selectedCode) => selectedCode !== code)
  }

  if (constraints.max && currentValue.length >= constraints.max) {
    return currentValue
  }

  return [...currentValue, code]
}

export function validateSurveyStep(step, state) {
  const value = state[step.field]

  if (step.inputType === 'number') {
    if (step.required && (value === '' || value === null || value === undefined)) {
      return {
        isValid: false,
        message: `${step.title}을(를) 입력해 주세요.`,
      }
    }

    const numericValue = Number(value)

    if (!Number.isFinite(numericValue)) {
      return {
        isValid: false,
        message: `${step.title}은(는) 숫자로 입력해 주세요.`,
      }
    }

    if (step.min && numericValue < step.min) {
      return {
        isValid: false,
        message: `${step.title}은(는) ${step.min} 이상이어야 합니다.`,
      }
    }

    if (step.max && numericValue > step.max) {
      return {
        isValid: false,
        message: `${step.title}은(는) ${step.max} 이하이어야 합니다.`,
      }
    }
  }

  if (step.inputType === 'single_select') {
    if (step.required && !value) {
      return {
        isValid: false,
        message: `${step.title}을(를) 선택해 주세요.`,
      }
    }
  }

  if (step.inputType === 'multi_select') {
    const selectedCount = Array.isArray(value) ? value.length : 0

    if (step.required && selectedCount < (step.min ?? 1)) {
      return {
        isValid: false,
        message: `${step.title}을(를) ${step.min ?? 1}개 이상 선택해 주세요.`,
      }
    }

    if (step.max && selectedCount > step.max) {
      return {
        isValid: false,
        message: `${step.title}은(는) 최대 ${step.max}개까지 선택할 수 있습니다.`,
      }
    }
  }

  return { isValid: true, message: '' }
}

export function validateSurvey(steps, state) {
  for (const step of steps) {
    const validation = validateSurveyStep(step, state)

    if (!validation.isValid) {
      return {
        ...validation,
        stepId: step.id,
      }
    }
  }

  return { isValid: true, stepId: null, message: '' }
}

export function useSurveyFunnel(steps) {
  const state = reactive(createInitialSurveyState())
  const currentStepId = ref(steps[0]?.id ?? '')
  const attemptedStepIds = ref([])

  const currentStep = computed(() => steps.find((step) => step.id === currentStepId.value) ?? steps[0])
  const currentStepIndex = computed(() => getStepIndex(steps, currentStepId.value))
  const progressValue = computed(() => currentStepIndex.value + 1)
  const isFirstStep = computed(() => currentStepIndex.value <= 0)
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
  const currentValidation = computed(() => validateSurveyStep(currentStep.value, state))
  const surveyValidation = computed(() => validateSurvey(steps, state))

  function selectStepOption(step, code) {
    state[step.field] = toggleSelectedCode(state[step.field], code, { max: step.max })
  }

  function markAttempted(stepId) {
    if (!attemptedStepIds.value.includes(stepId)) {
      attemptedStepIds.value = [...attemptedStepIds.value, stepId]
    }
  }

  function next() {
    markAttempted(currentStepId.value)

    if (!currentValidation.value.isValid) return false

    const nextStepId = getNextStepId(steps, currentStepId.value)
    if (!nextStepId) return false

    currentStepId.value = nextStepId
    return true
  }

  function previous() {
    const previousStepId = getPreviousStepId(steps, currentStepId.value)
    if (!previousStepId) return false

    currentStepId.value = previousStepId
    return true
  }

  function showValidationFor(stepId) {
    currentStepId.value = stepId
    markAttempted(stepId)
  }

  function canShowError(stepId) {
    return attemptedStepIds.value.includes(stepId)
  }

  return {
    state,
    currentStepId,
    currentStep,
    currentStepIndex,
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
  }
}
