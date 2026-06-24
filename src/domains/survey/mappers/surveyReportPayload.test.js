import { describe, expect, it } from 'vitest'
import { createInitialSurveyState } from '../composables/surveyFlow'
import { buildReportPayload } from './surveyReportPayload'

const sampleOptions = {
  health_goals: [
    { code: 'fatigue', name: '피로' },
    { code: 'sleep', name: '수면' },
  ],
  medications: [{ code: 'anticoagulant', name: '항응고제' }],
  special_conditions: [{ code: 'allergy', name: '알레르기' }],
}

describe('buildReportPayload', () => {
  it('builds the reports request payload with health goal priority by selected order', () => {
    const state = {
      ...createInitialSurveyState(),
      age: 30,
      gender: 'female',
      health_goals: ['fatigue', 'sleep'],
      medications: ['anticoagulant'],
      special_conditions: ['allergy'],
      additional_notes: '카페인을 먹으면 심장이 두근거립니다.',
    }

    expect(buildReportPayload(state, sampleOptions)).toEqual({
      age: 30,
      gender: 'female',
      health_goals: [
        { code: 'fatigue', priority: 1 },
        { code: 'sleep', priority: 2 },
      ],
      medications: [{ code: 'anticoagulant', name: '항응고제' }],
      special_conditions: [{ code: 'allergy', name: '알레르기' }],
      additional_notes: '카페인을 먹으면 심장이 두근거립니다.',
    })
  })
})
