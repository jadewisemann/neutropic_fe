const ACCESS_TOKEN_KEY = 'neutripic.access_token'
const REFRESH_TOKEN_KEY = 'neutripic.refresh_token'
const USER_KEY = 'neutripic.user'

export const authTokenStorage = {
  getAccessToken() {
    return getStorageValue(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    return getStorageValue(REFRESH_TOKEN_KEY)
  },

  getUser() {
    const user = getStorageValue(USER_KEY)

    if (!user) return null

    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  },

  setAuth({ access_token, refresh_token, user }) {
    setStorageValue(ACCESS_TOKEN_KEY, access_token)
    setStorageValue(REFRESH_TOKEN_KEY, refresh_token)
    setStorageValue(USER_KEY, user ? JSON.stringify(user) : null)
  },

  setAccessToken(accessToken) {
    setStorageValue(ACCESS_TOKEN_KEY, accessToken)
  },

  clearAuth() {
    removeStorageValue(ACCESS_TOKEN_KEY)
    removeStorageValue(REFRESH_TOKEN_KEY)
    removeStorageValue(USER_KEY)
  },
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function getStorageValue(key) {
  return getStorage()?.getItem(key) || null
}

function setStorageValue(key, value) {
  if (value === undefined || value === null || value === '') {
    removeStorageValue(key)
    return
  }

  getStorage()?.setItem(key, value)
}

function removeStorageValue(key) {
  getStorage()?.removeItem(key)
}
