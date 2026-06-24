export function buildReportPayload(state, optionGroups = {}) {
  return {
    age: Number(state.age),
    gender: state.gender,
    health_goals: state.health_goals.map((code, index) => ({
      code,
      priority: index + 1,
    })),
    medications: buildSelectedOptions(state.medications, optionGroups.medications),
    special_conditions: buildSelectedOptions(state.special_conditions, optionGroups.special_conditions),
    additional_notes: state.additional_notes.trim(),
  }
}

function buildSelectedOptions(selectedCodes, options = []) {
  return selectedCodes.map((code) => {
    const option = options.find((item) => item.code === code)
    return {
      code,
      name: option?.name ?? code,
    }
  })
}

