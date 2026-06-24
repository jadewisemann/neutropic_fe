const DUMMY_USER = {
  id: 1,
  email: 'local-user@example.com',
  username: 'local-user',
  age: 30,
  gender: 'other',
  role: 'user',
  created_at: '2026-01-01T00:00:00Z',
}

const HEALTH_GOALS = [
  { code: 'fatigue', name: '피로 개선' },
  { code: 'immunity', name: '면역 관리' },
  { code: 'eye_health', name: '눈 건강' },
  { code: 'gut_health', name: '장 건강' },
  { code: 'sleep', name: '수면 질 개선' },
  { code: 'skin_health', name: '피부 건강' },
]

const MEDICATION_OPTIONS = [
  { code: 'anticoagulant', name: '항응고제' },
  { code: 'blood_pressure', name: '혈압약' },
  { code: 'diabetes', name: '당뇨약' },
  { code: 'thyroid', name: '갑상선약' },
]

const SPECIAL_CONDITION_OPTIONS = [
  { code: 'pregnancy', name: '임신 또는 수유 중' },
  { code: 'liver_disease', name: '간 질환' },
  { code: 'kidney_disease', name: '신장 질환' },
  { code: 'allergy', name: '알레르기' },
]

export function getLocalMockResponse({ endpoint, method = 'GET', body }) {
  if (!isLocalMockEnabled()) return { handled: false }

  const path = normalizePath(endpoint)
  const normalizedMethod = method.toUpperCase()

  if (normalizedMethod === 'POST' && path === '/auth/login/') {
    return handled(createAuthResponse(body))
  }

  if (normalizedMethod === 'POST' && path === '/auth/token/refresh/') {
    return handled({ access_token: 'local-dummy-access-token' })
  }

  if (normalizedMethod === 'POST' && path === '/auth/logout/') {
    return handled(null)
  }

  if (normalizedMethod === 'GET' && path === '/users/me/') {
    return handled(DUMMY_USER)
  }

  if (normalizedMethod === 'PATCH' && path === '/users/me/') {
    return handled({ ...DUMMY_USER, ...body })
  }

  if (normalizedMethod === 'PATCH' && path === '/users/me/password/') {
    return handled(null)
  }

  if (normalizedMethod === 'DELETE' && path === '/users/me/') {
    return handled(null)
  }

  if (normalizedMethod === 'GET' && path === '/mypage/') {
    return handled({
      user: DUMMY_USER,
      report_count: 1,
      post_count: 0,
      comment_count: 0,
    })
  }

  if (normalizedMethod === 'GET' && path === '/health_goals/') {
    return handled(HEALTH_GOALS)
  }

  if (normalizedMethod === 'GET' && path === '/medication_options/') {
    return handled(MEDICATION_OPTIONS)
  }

  if (normalizedMethod === 'GET' && path === '/special_condition_options/') {
    return handled(SPECIAL_CONDITION_OPTIONS)
  }

  if (normalizedMethod === 'POST' && path === '/reports/') {
    return handled(createReportResponse(body))
  }

  if (normalizedMethod === 'GET' && path === '/reports/') {
    return handled({
      count: 1,
      next: null,
      previous: null,
      results: [createReportListItem()],
    })
  }

  const reportMatch = path.match(/^\/reports\/([^/]+)\/$/)
  if (reportMatch && normalizedMethod === 'GET') {
    return handled(createReportResponse({ id: Number(reportMatch[1]) || 1 }))
  }

  if (reportMatch && normalizedMethod === 'PATCH') {
    return handled({
      id: Number(reportMatch[1]) || 1,
      title: body?.title ?? '로컬 더미 리포트',
    })
  }

  if (reportMatch && normalizedMethod === 'DELETE') {
    return handled(null)
  }

  const messagesMatch = path.match(/^\/reports\/([^/]+)\/messages\/$/)
  if (messagesMatch && normalizedMethod === 'GET') {
    return handled([])
  }

  if (messagesMatch && normalizedMethod === 'POST') {
    return handled({
      id: 1,
      role: 'assistant',
      content: '로컬 더미 응답입니다. 실제 추천은 백엔드 연결 후 확인해 주세요.',
      citations: [],
      created_at: new Date().toISOString(),
    })
  }

  return { handled: false }
}

function isLocalMockEnabled() {
  return import.meta.env.DEV
}

function normalizePath(endpoint) {
  if (/^https?:\/\//.test(endpoint)) {
    return new URL(endpoint).pathname
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

function handled(data) {
  return { handled: true, data }
}

function createAuthResponse(payload = {}) {
  const user = createUserFromLoginId(payload.login_id)

  return {
    access_token: 'local-dummy-access-token',
    refresh_token: 'local-dummy-refresh-token',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  }
}

function createUserFromLoginId(loginId = DUMMY_USER.username) {
  const normalizedLoginId = String(loginId || DUMMY_USER.username)
  const email = normalizedLoginId.includes('@') ? normalizedLoginId : DUMMY_USER.email
  const username = normalizedLoginId.includes('@') ? normalizedLoginId.split('@')[0] : normalizedLoginId

  return {
    ...DUMMY_USER,
    email,
    username,
  }
}

function createReportListItem() {
  return {
    id: 1,
    title: '로컬 더미 추천 리포트',
    status: 'completed',
    created_at: new Date().toISOString(),
  }
}

function createReportResponse(payload = {}) {
  const inputSummary = {
    age: payload.age ?? DUMMY_USER.age,
    gender: payload.gender ?? DUMMY_USER.gender,
    health_goals: resolveNames(payload.health_goals, HEALTH_GOALS),
    medications: resolveNames(payload.medications, MEDICATION_OPTIONS),
    special_conditions: resolveNames(payload.special_conditions, SPECIAL_CONDITION_OPTIONS),
    additional_notes: payload.additional_notes ?? '',
  }

  return {
    id: payload.id ?? 1,
    status: 'completed',
    title: '로컬 더미 추천 리포트',
    input_summary: inputSummary,
    recommended_ingredients: [
      {
        name_ko: '비타민 D',
        name_en: 'Vitamin D',
        normalized_name: 'vitamin_d',
        reason: '실내 활동이 많거나 햇빛 노출이 적은 사용자에게 자주 검토되는 성분입니다.',
        expected_effects: ['뼈 건강', '면역 관리'],
        recommended_dosage: '제품 라벨 권장량을 기준으로 섭취하세요.',
        side_effects: ['과다 섭취 시 고칼슘혈증 위험'],
        precautions: ['질환 또는 복용 약이 있으면 전문가와 상담하세요.'],
        iherb_url: '',
      },
      {
        name_ko: '마그네슘',
        name_en: 'Magnesium',
        normalized_name: 'magnesium',
        reason: '피로와 수면 질 관리 목적에서 자주 확인하는 미네랄입니다.',
        expected_effects: ['근육 기능', '에너지 대사'],
        recommended_dosage: '식사 후 소량부터 시작하세요.',
        side_effects: ['복부 불편감', '설사'],
        precautions: ['신장 질환이 있으면 섭취 전 상담이 필요합니다.'],
        iherb_url: '',
      },
    ],
    lifestyle_tips: [
      '수면 시간과 기상 시간을 일정하게 유지하세요.',
      '카페인 섭취 시간과 양을 기록해 보세요.',
    ],
    disclaimer: '로컬 더미 리포트입니다. 의학적 진단이나 치료를 대체하지 않습니다.',
    citations: [],
    created_at: new Date().toISOString(),
  }
}

function resolveNames(items = [], options = []) {
  if (!Array.isArray(items)) return []

  return items.map((item) => {
    const code = typeof item === 'string' ? item : item.code
    const option = options.find((candidate) => candidate.code === code)
    return option?.name ?? item.name ?? code
  })
}
