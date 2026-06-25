import { describe, expect, it } from 'vitest'
import { createApiErrorFromResponse } from './apiError'

function createResponse(status = 400, statusText = 'Bad Request') {
  return { status, statusText }
}

describe('createApiErrorFromResponse', () => {
  it('shows field details instead of generic backend messages', () => {
    const error = createApiErrorFromResponse(createResponse(), {
      error_code: 'validation_error',
      message: 'Invalid request.',
      details: {
        health_goals: ['최대 5개까지 선택할 수 있습니다.'],
        non_field_errors: ['입력값을 다시 확인해 주세요.'],
      },
    })

    expect(error.message).toBe(
      'health goals: 최대 5개까지 선택할 수 있습니다.\n입력값을 다시 확인해 주세요.',
    )
    expect(error.errorCode).toBe('validation_error')
  })

  it('keeps direct detail messages from DRF responses', () => {
    const error = createApiErrorFromResponse(createResponse(403, 'Forbidden'), {
      detail: '이 작업을 수행할 권한이 없습니다.',
    })

    expect(error.message).toBe('이 작업을 수행할 권한이 없습니다.')
    expect(error.errorCode).toBe('permission_denied')
  })

  it('parses plain text error bodies', () => {
    const error = createApiErrorFromResponse(createResponse(503, 'Service Unavailable'), 'AI 서버 응답이 지연되고 있습니다.')

    expect(error.message).toBe('AI 서버 응답이 지연되고 있습니다.')
    expect(error.errorCode).toBe('service_unavailable')
  })
})
