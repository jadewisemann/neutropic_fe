import { ApiError, createApiErrorFromResponse, createNetworkError } from './apiError'
import { authTokenStorage } from './tokenStorage'
import { getLocalMockResponse } from './localMockApi'

export const API_BASE_URL = '/api/v1'

export const apiClient = createApiClient()

export function createApiClient({ baseUrl = API_BASE_URL, getAccessToken = authTokenStorage.getAccessToken } = {}) {
  async function request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers,
      query,
      auth = true,
      token,
      signal,
      credentials = 'same-origin',
    } = options
    const requestHeaders = createHeaders(headers)
    const accessToken = token ?? (auth ? getAccessToken() : null)
    const requestBody = createRequestBody(body, requestHeaders)
    const localMockResponse = getLocalMockResponse({ endpoint, method, body, query })

    if (localMockResponse.handled) {
      return localMockResponse.data
    }

    if (accessToken && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    }

    try {
      const response = await fetch(createUrl(baseUrl, endpoint, query), {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
        credentials,
      })
      const data = await parseResponseBody(response)

      if (!response.ok) {
        throw createApiErrorFromResponse(response, data)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw createNetworkError(error)
    }
  }

  return {
    request,
    get(endpoint, options) {
      return request(endpoint, { ...options, method: 'GET' })
    },
    post(endpoint, body, options) {
      return request(endpoint, { ...options, method: 'POST', body })
    },
    patch(endpoint, body, options) {
      return request(endpoint, { ...options, method: 'PATCH', body })
    },
    delete(endpoint, options) {
      return request(endpoint, { ...options, method: 'DELETE' })
    },
  }
}

function createHeaders(headers) {
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  return requestHeaders
}

function createRequestBody(body, headers) {
  if (body === undefined || body === null) return undefined
  if (typeof FormData !== 'undefined' && body instanceof FormData) return body
  if (typeof Blob !== 'undefined' && body instanceof Blob) return body
  if (typeof body === 'string') return body

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

async function parseResponseBody(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('Content-Type') || ''
  const text = await response.text()

  if (!text) return null

  if (contentType.includes('application/json') || contentType.includes('+json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

function createUrl(baseUrl, endpoint, query) {
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const url = new URL(joinUrl(baseUrl, endpoint), origin)

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item))
      return
    }

    url.searchParams.set(key, value)
  })

  return url.toString()
}

function joinUrl(baseUrl, endpoint) {
  if (/^https?:\/\//.test(endpoint)) return endpoint

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${normalizedBaseUrl}${normalizedEndpoint}`
}
