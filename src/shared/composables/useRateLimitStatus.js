import { computed, reactive } from 'vue'

import { getRateLimitMessage } from '../constants/reportLimits'

const RATE_LIMIT_KEY = 'neutripic:rate_limits'

const state = reactive(readRateLimitState())

export function useRateLimitStatus() {
  function isLimited(resource) {
    return state[getTodayKey()]?.[resource]?.limited === true
  }

  function getLimitedMessage(resource) {
    return state[getTodayKey()]?.[resource]?.message || ''
  }

  function markLimitedFromError(error, fallbackMessage) {
    const resource = error?.details?.resource
    if (!resource) return ''

    const message = getRateLimitMessage(error, fallbackMessage)
    const todayKey = getTodayKey()

    state[todayKey] = {
      ...(state[todayKey] || {}),
      [resource]: {
        limited: true,
        message,
      },
    }
    persistRateLimitState()

    return message
  }

  return {
    isReportCreateLimited: computed(() => isLimited('report')),
    isReportChatLimited: computed(() => isLimited('report_chat')),
    reportCreateLimitedMessage: computed(() => getLimitedMessage('report')),
    reportChatLimitedMessage: computed(() => getLimitedMessage('report_chat')),
    markLimitedFromError,
  }
}

function readRateLimitState() {
  if (typeof window === 'undefined') return {}

  try {
    const rawState = window.localStorage.getItem(RATE_LIMIT_KEY)
    const parsedState = rawState ? JSON.parse(rawState) : {}
    return parsedState?.[getTodayKey()] ? { [getTodayKey()]: parsedState[getTodayKey()] } : {}
  } catch {
    return {}
  }
}

function persistRateLimitState() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ [getTodayKey()]: state[getTodayKey()] || {} }))
  } catch {
    // 제한 상태 저장에 실패해도 실제 API 제한은 서버에서 다시 확인된다.
  }
}

function getTodayKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
