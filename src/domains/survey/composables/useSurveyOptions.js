import { reactive, ref } from 'vue'
import { surveyMetadataApi } from '../../../shared/api'

const optionLoaders = {
  health_goals: () => surveyMetadataApi.getHealthGoals(),
  medications: () => surveyMetadataApi.getMedicationOptions(),
  special_conditions: () => surveyMetadataApi.getSpecialConditionOptions(),
}

export function useSurveyOptions(steps) {
  const optionGroups = reactive(createOptionGroups(steps))
  const isLoading = ref(true)
  const loadError = ref('')

  async function loadSurveyOptions() {
    isLoading.value = true
    loadError.value = ''

    try {
      await Promise.all(
        Object.keys(optionGroups).map(async (groupName) => {
          const loadOptions = optionLoaders[groupName]
          optionGroups[groupName] = normalizeOptions(loadOptions ? await loadOptions() : [])
        }),
      )
    } catch (error) {
      loadError.value = error.message || '잠시 후 다시 시도해 주세요.'
    } finally {
      isLoading.value = false
    }
  }

  function getOptionName(groupName, code) {
    const option = optionGroups[groupName]?.find((item) => item.code === code)
    return option?.name ?? code
  }

  return {
    optionGroups,
    isLoading,
    loadError,
    loadSurveyOptions,
    getOptionName,
  }
}

function createOptionGroups(steps) {
  return steps.reduce((groups, step) => {
    if (step.optionGroup) {
      groups[step.optionGroup] = []
    }

    return groups
  }, {})
}

function normalizeOptions(options) {
  return Array.isArray(options) ? options.filter((option) => option?.code && option?.name) : []
}

