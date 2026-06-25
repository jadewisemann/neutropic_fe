export const REPORT_DAILY_CREATE_LIMIT = 3
export const REPORT_CHAT_DAILY_CREATE_LIMIT = 30

export const reportLimitMessages = {
  reportCreate: `리포트 생성은 계정 기준 하루 최대 ${REPORT_DAILY_CREATE_LIMIT}회까지 요청할 수 있어요.`,
  reportChat: `리포트 채팅은 계정 기준 하루 최대 ${REPORT_CHAT_DAILY_CREATE_LIMIT}회까지 보낼 수 있어요.`,
}

export function getRateLimitMessage(error, fallbackMessage) {
  const limit = Number(error?.details?.limit)
  const resource = error?.details?.resource

  if (resource === 'report' && Number.isFinite(limit)) {
    return `오늘 생성 가능한 리포트 ${limit}회를 모두 사용했습니다. 내일 다시 요청해 주세요.`
  }

  if (resource === 'report_chat' && Number.isFinite(limit)) {
    return `오늘 보낼 수 있는 리포트 채팅 ${limit}회를 모두 사용했습니다. 내일 다시 이용해 주세요.`
  }

  return fallbackMessage
}
