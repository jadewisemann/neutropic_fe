const DEFAULT_ERROR_MESSAGE = '요청을 처리하지 못했습니다.'
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해 주세요.'

export class ApiError extends Error {
  constructor({
    message = DEFAULT_ERROR_MESSAGE,
    status = 0,
    errorCode = 'unknown_error',
    details = null,
    isNetworkError = false,
    response = null,
  } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errorCode = errorCode
    this.details = details
    this.isNetworkError = isNetworkError
    this.isServerError = status >= 500
    this.response = response
  }
}

export function createApiErrorFromResponse(response, data) {
  return new ApiError({
    message: data?.message || response.statusText || DEFAULT_ERROR_MESSAGE,
    status: response.status,
    errorCode: data?.error_code || getDefaultErrorCode(response.status),
    details: data?.details || null,
    response,
  })
}

export function createNetworkError(error) {
  return new ApiError({
    message: NETWORK_ERROR_MESSAGE,
    errorCode: 'network_error',
    details: error,
    isNetworkError: true,
  })
}

function getDefaultErrorCode(status) {
  if (status === 400) return 'validation_error'
  if (status === 401) return 'authentication_failed'
  if (status === 403) return 'permission_denied'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate_limit_exceeded'
  if (status === 502) return 'ai_server_error'
  if (status === 503) return 'service_unavailable'
  if (status >= 500) return 'internal_server_error'
  return 'unknown_error'
}
