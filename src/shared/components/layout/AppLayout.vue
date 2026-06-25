<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <div class="app-layout__header-inner">
        <RouterLink class="app-layout__brand" to="/">
          <span class="app-layout__brand-mark"><span></span></span>
          <span>Neutripic</span>
        </RouterLink>

        <nav class="app-layout__nav" aria-label="주요 메뉴">
          <RouterLink to="/survey" class="app-layout__nav-link">추천 설문</RouterLink>
          <RouterLink to="/reports" class="app-layout__nav-link">추천 기록</RouterLink>
          <RouterLink to="/community" class="app-layout__nav-link">커뮤니티</RouterLink>
          <RouterLink to="/mypage" class="app-layout__nav-link">마이페이지</RouterLink>
        </nav>

        <div v-if="isAuthenticated" ref="accountMenuRef" class="app-layout__auth app-layout__auth--signed-in">
          <button
            class="app-layout__avatar-button"
            type="button"
            :aria-label="`${displayName} 계정 메뉴`"
            :aria-expanded="isAccountMenuOpen"
            aria-haspopup="menu"
            @click="toggleAccountMenu"
          >
            <span class="app-layout__avatar" aria-hidden="true">{{ avatarInitial }}</span>
          </button>

          <div v-if="isAccountMenuOpen" class="app-layout__account-menu" role="menu">
            <div class="app-layout__account-summary">
              <span class="app-layout__account-name">{{ displayName }}</span>
              <span v-if="currentUser?.email" class="app-layout__account-email">{{ currentUser.email }}</span>
            </div>
            <RouterLink class="app-layout__account-item" to="/mypage/profile" role="menuitem">
              회원정보 수정
            </RouterLink>
            <RouterLink class="app-layout__account-item" to="/mypage" role="menuitem">내 활동</RouterLink>
            <button
              class="app-layout__account-item app-layout__account-item--button"
              type="button"
              role="menuitem"
              :disabled="isLoggingOut"
              @click="handleLogout"
            >
              {{ isLoggingOut ? '로그아웃 중' : '로그아웃' }}
            </button>
          </div>
        </div>

        <div v-else class="app-layout__auth app-layout__auth--guest">
          <RouterLink class="app-layout__admin-link" to="/admin">관리자</RouterLink>
          <RouterLink class="button button--sm" to="/login">로그인</RouterLink>
          <RouterLink class="button button--primary button--sm" to="/signup">회원가입</RouterLink>
        </div>
      </div>
    </header>

    <main class="app-layout__main">
      <slot />
    </main>

    <footer v-if="!hideFooter" class="app-layout__footer">
      <p>Neutripic · 성분 중심 AI 리포트 · 본 서비스는 의료 진단·처방이 아닌 건강 정보를 제공합니다.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  hideFooter: { type: Boolean, default: false },
})
import { useRoute, useRouter } from 'vue-router'
import { authApi, authTokenStorage } from '../../api'

const route = useRoute()
const router = useRouter()
const isAuthenticated = ref(false)
const currentUser = ref(null)
const isLoggingOut = ref(false)
const isAccountMenuOpen = ref(false)
const accountMenuRef = ref(null)

const displayName = computed(() => {
  return currentUser.value?.username || currentUser.value?.email || '사용자'
})

const avatarInitial = computed(() => {
  return displayName.value.trim().charAt(0).toUpperCase() || 'U'
})

watch(
  () => route.fullPath,
  () => {
    syncAuthState()
    closeAccountMenu()
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('storage', syncAuthState)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuthState)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

async function handleLogout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  closeAccountMenu()

  try {
    const refreshToken = authTokenStorage.getRefreshToken()

    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
  } catch {
    // Local auth state should be cleared even if the server session is already expired.
  } finally {
    authTokenStorage.clearAuth()
    syncAuthState()
    isLoggingOut.value = false

    router.push('/')
  }
}

function syncAuthState() {
  isAuthenticated.value = Boolean(authTokenStorage.getAccessToken())
  currentUser.value = authTokenStorage.getUser()
}

function toggleAccountMenu() {
  isAccountMenuOpen.value = !isAccountMenuOpen.value
}

function closeAccountMenu() {
  isAccountMenuOpen.value = false
}

function handleDocumentClick(event) {
  if (!isAccountMenuOpen.value || accountMenuRef.value?.contains(event.target)) return

  closeAccountMenu()
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeAccountMenu()
  }
}
</script>

<style scoped>
/* ---- Layout shell ---- */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f7f8f6;
  color: var(--color-text);
}

/* ---- Header ---- */
.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.app-layout__header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: 60px;
  min-height: 60px;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-2) var(--space-4);
}

/* ---- Brand ---- */
.app-layout__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
  text-decoration: none;
}

.app-layout__brand-mark {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--color-brand);
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.18);
}

.app-layout__brand-mark span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffffff;
}

.app-layout__brand:hover {
  text-decoration: none;
  opacity: 0.8;
}

/* ---- Nav ---- */
.app-layout__nav {
  display: flex;
  flex: 1;
  gap: var(--space-1);
  overflow-x: auto;
  min-width: 0;
  padding: var(--space-1);
  scrollbar-width: none;
}

.app-layout__nav::-webkit-scrollbar {
  display: none;
}

.app-layout__nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--space-3);
  border-radius: 8px;
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: background 150ms, color 150ms;
}

.app-layout__nav-link:hover {
  background: var(--color-gray-alpha-100);
  color: var(--color-text);
  text-decoration: none;
}

.app-layout__nav-link.router-link-active {
  background: var(--color-brand-50);
  color: var(--color-brand-strong);
  box-shadow: none;
}

/* ---- Auth ---- */
.app-layout__auth {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--space-2);
}

.app-layout__auth--signed-in {
  position: relative;
}

.app-layout__avatar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  transition: background 150ms, transform 150ms;
}

.app-layout__avatar-button:hover {
  background: var(--color-gray-alpha-100);
  transform: translateY(-1px);
}

.app-layout__avatar-button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.app-layout__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-brand-muted);
  border-radius: var(--radius-full);
  background: var(--color-blue-100);
  color: var(--color-brand);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}

.app-layout__account-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 110;
  width: min(260px, calc(100vw - 32px));
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}

.app-layout__account-summary {
  display: grid;
  gap: 2px;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-1);
}

.app-layout__account-name,
.app-layout__account-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-layout__account-name {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 800;
}

.app-layout__account-email {
  color: var(--color-text-muted);
  font-size: 12px;
}

.app-layout__account-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 38px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-soft);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.app-layout__account-item:hover {
  background: var(--color-gray-alpha-100);
  color: var(--color-text);
  text-decoration: none;
}

.app-layout__account-item:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.app-layout__account-item--button {
  margin-top: var(--space-1);
}

/* ---- Main ---- */
.app-layout__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 0;
  min-height: 0;
}

/* ---- Footer ---- */
.app-layout__footer {
  border-top: 1px solid var(--color-border);
  background: #ffffff;
  padding: 20px 24px;
  text-align: left;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* ---- Responsive ---- */
@media (min-width: 720px) {
  .app-layout__header-inner {
    gap: var(--space-6);
    min-height: 66px;
    padding: 0 var(--space-6);
  }

}

.app-layout__admin-link {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 11px;
  border-radius: 8px;
  color: #9aa19b;
  font-size: 12.5px;
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 600px) {
  .app-layout__auth--guest {
    display: none;
  }
}
</style>
