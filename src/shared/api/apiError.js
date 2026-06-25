const DEFAULT_ERROR_MESSAGE = '요청을 처리하지 못했습니다.'
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해 주세요.'
const GENERIC_ERROR_MESSAGES = new Set([DEFAULT_ERROR_MESSAGE, 'Invalid request.', 'Bad Request'])
const UNLABELED_DETAIL_KEYS = new Set(['detail', 'details', 'message', 'messages', 'error', 'errors', 'non_field_errors'])

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
  const parsedError = parseApiErrorData(data, response)

  return new ApiError({
    message: parsedError.message,
    status: response.status,
    errorCode: parsedError.errorCode,
    details: parsedError.details,
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

function parseApiErrorData(data, response) {
  const fallbackMessage = response.statusText || DEFAULT_ERROR_MESSAGE
  const fallbackError = {
    message: fallbackMessage,
    errorCode: getDefaultErrorCode(response.status),
    details: null,
  }

  if (!data) return fallbackError

  if (typeof data === 'string') {
    return {
      ...fallbackError,
      message: normalizeMessage(data) || fallbackMessage,
      details: data,
    }
  }

  if (!isPlainObject(data)) {
    return fallbackError
  }

  const directMessage = firstMessage(data.message, data.detail, data.error_description, data.error)
  const details = data.details ?? collectResidualDetails(data)
  const detailMessages = collectErrorMessages(details)
  const message = buildDisplayMessage(directMessage, detailMessages, fallbackMessage)

  return {
    message,
    errorCode: normalizeMessage(data.error_code) || getDefaultErrorCode(response.status),
    details: details || null,
  }
}

function buildDisplayMessage(directMessage, detailMessages, fallbackMessage) {
  const normalizedDirect = normalizeMessage(directMessage)

  if (detailMessages.length > 0 && (!normalizedDirect || GENERIC_ERROR_MESSAGES.has(normalizedDirect))) {
    return detailMessages.join('\n')
  }

  if (normalizedDirect) {
    const extraMessages = detailMessages.filter((message) => message !== normalizedDirect)
    return [normalizedDirect, ...extraMessages].join('\n')
  }

  return fallbackMessage
}

function collectResidualDetails(data) {
  const details = {}

  Object.entries(data).forEach(([key, value]) => {
    if (['message', 'detail', 'error_description', 'error_code'].includes(key)) return
    details[key] = value
  })

  return Object.keys(details).length > 0 ? details : null
}

function collectErrorMessages(value, key = '') {
  if (value === null || value === undefined || value === '') return []

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const message = normalizeMessage(String(value))
    if (!message) return []
    return key && !UNLABELED_DETAIL_KEYS.has(key) ? [`${formatFieldName(key)}: ${message}`] : [message]
  }

  if (Array.isArray(value)) {
    const messages = value.flatMap((item) => collectErrorMessages(item))
    if (messages.length === 0) return []
    return key && !UNLABELED_DETAIL_KEYS.has(key)
      ? [`${formatFieldName(key)}: ${messages.join(', ')}`]
      : messages
  }

  if (isPlainObject(value)) {
    return Object.entries(value).flatMap(([childKey, childValue]) =>
      collectErrorMessages(childValue, childKey),
    )
  }

  return []
}

function firstMessage(...messages) {
  return messages.map((message) => normalizeMessage(message)).find(Boolean) || ''
}

function normalizeMessage(message) {
  return typeof message === 'string' ? message.trim() : ''
}

function formatFieldName(key) {
  return key.replaceAll('_', ' ')
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}
