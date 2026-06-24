const surveyStepDefinitions = [
  {
    id: 'age',
    title: '나이',
    description: '성분 추천 조건에 사용할 만 나이를 입력합니다.',
    inputType: 'number',
    min: 14,
    max: 120,
    required: true,
  },
  {
    id: 'gender',
    title: '성별',
    description: '성분 추천 조건에 사용할 성별 정보를 선택합니다.',
    inputType: 'single_select',
    required: true,
    options: [
      { code: 'female', name: '여성' },
      { code: 'male', name: '남성' },
      { code: 'other', name: '기타 또는 응답하지 않음' },
    ],
  },
  {
    id: 'health_goals',
    title: '건강 목표',
    description: '1개 이상, 최대 5개까지 선택할 수 있습니다.',
    inputType: 'multi_select',
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: 'medications',
    title: '복용 약',
    description: '해당 항목이 없으면 선택하지 않고 다음 단계로 넘어갈 수 있습니다.',
    inputType: 'multi_select',
    required: false,
  },
  {
    id: 'special_conditions',
    title: '특이사항',
    description: '임신/수유, 간/신장 질환, 항응고제 등 고위험 항목은 안전 안내를 강화합니다.',
    inputType: 'multi_select',
    required: false,
  },
  {
    id: 'additional_notes',
    title: '추가 정보',
    description: '선택지에 없는 복용 약, 질환, 알레르기, 생활 습관을 입력합니다.',
    inputType: 'textarea',
    required: false,
  },
]

export const surveySteps = surveyStepDefinitions.map(normalizeSurveyStep)

function normalizeSurveyStep(step) {
  const field = step.field ?? step.id

  return {
    ...step,
    field,
    optionGroup: step.optionGroup ?? (step.inputType === 'multi_select' ? field : null),
  }
}
