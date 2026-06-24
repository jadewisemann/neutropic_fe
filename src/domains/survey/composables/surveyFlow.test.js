import { describe, expect, it } from 'vitest'
import {
  createInitialSurveyState,
  getNextStepId,
  getPreviousStepId,
  toggleSelectedCode,
  useSurveyFunnel,
  validateSurveyStep,
} from './surveyFlow'
import { surveySteps } from '../config/surveyDefinition'

describe('surveyFlow', () => {
  it('moves through configured steps in order', () => {
    expect(getNextStepId(surveySteps, 'age')).toBe('gender')
    expect(getPreviousStepId(surveySteps, 'gender')).toBe('age')
    expect(getNextStepId(surveySteps, 'health_goals')).toBe('medications')
    expect(getPreviousStepId(surveySteps, 'medications')).toBe('health_goals')
    expect(getNextStepId(surveySteps, 'additional_notes')).toBeNull()
  })

  it('requires at least one and at most five health goals', () => {
    const state = createInitialSurveyState()
    const healthGoalsStep = surveySteps.find((step) => step.id === 'health_goals')

    expect(validateSurveyStep(healthGoalsStep, state).isValid).toBe(false)

    state.health_goals = ['fatigue', 'sleep', 'eye', 'gut', 'immune']
    expect(validateSurveyStep(healthGoalsStep, state).isValid).toBe(true)

    state.health_goals = ['fatigue', 'sleep', 'eye', 'gut', 'immune', 'skin']
    expect(validateSurveyStep(healthGoalsStep, state).isValid).toBe(false)
  })

  it('does not add more selected codes than the configured max', () => {
    const current = ['fatigue', 'sleep', 'eye', 'gut', 'immune']

    expect(toggleSelectedCode(current, 'skin', { max: 5 })).toEqual(current)
    expect(toggleSelectedCode(current, 'immune', { max: 5 })).toEqual(['fatigue', 'sleep', 'eye', 'gut'])
  })

  it('keeps users on an invalid required step until the step is valid', () => {
    const funnel = useSurveyFunnel(surveySteps)
    const healthGoalsStep = surveySteps.find((step) => step.id === 'health_goals')

    expect(funnel.next()).toBe(false)
    expect(funnel.currentStepId.value).toBe('age')
    expect(funnel.canShowError('age')).toBe(true)

    funnel.state.age = 30

    expect(funnel.next()).toBe(true)
    expect(funnel.currentStepId.value).toBe('gender')

    funnel.state.gender = 'female'

    expect(funnel.next()).toBe(true)
    expect(funnel.currentStepId.value).toBe('health_goals')

    expect(funnel.next()).toBe(false)
    expect(funnel.currentStepId.value).toBe('health_goals')
    expect(funnel.canShowError('health_goals')).toBe(true)

    funnel.selectStepOption(healthGoalsStep, 'fatigue')

    expect(funnel.next()).toBe(true)
    expect(funnel.currentStepId.value).toBe('medications')
  })
})
