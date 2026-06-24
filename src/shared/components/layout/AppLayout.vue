<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <div class="app-layout__header-inner">
        <RouterLink class="app-layout__brand" to="/">Neutripic</RouterLink>

        <nav class="app-layout__nav" aria-label="주요 메뉴">
          <RouterLink to="/survey" class="app-layout__nav-link">추천 설문</RouterLink>
          <RouterLink to="/reports" class="app-layout__nav-link">추천 기록</RouterLink>
          <RouterLink to="/community" class="app-layout__nav-link">커뮤니티</RouterLink>
          <RouterLink to="/mypage" class="app-layout__nav-link">마이페이지</RouterLink>
        </nav>

        <RouterLink class="button button--sm" to="/login">로그인</RouterLink>
      </div>
    </header>

    <main class="app-layout__main">
      <slot />
    </main>

    <footer class="app-layout__footer">
      <p>건강기능식품 성분 정보를 제공하며, 진단이나 처방을 대체하지 않습니다.</p>
    </footer>
  </div>
</template>

<style scoped>
/* ---- Layout shell ---- */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(37, 111, 79, 0.08), transparent 320px),
    var(--color-surface-muted);
  color: var(--color-text);
}

/* ---- Header ---- */
.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
  background: rgba(247, 248, 246, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.app-layout__header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 58px;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-2) var(--space-4);
}

/* ---- Brand ---- */
.app-layout__brand {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
  text-decoration: none;
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
  border-radius: var(--radius-full);
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
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

/* ---- Main ---- */
.app-layout__main {
  flex: 1;
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

/* ---- Footer ---- */
.app-layout__footer {
  border-top: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  padding: var(--space-5) var(--space-4);
  text-align: center;
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

  .app-layout__main {
    padding: var(--space-8) var(--space-6);
  }
}

@media (min-width: 1024px) {
  .app-layout__header-inner {
    padding: 0 var(--space-8);
  }

  .app-layout__main {
    padding: var(--space-10) var(--space-8);
  }
}

@media (max-width: 600px) {
  .app-layout__header-inner > .button {
    display: none;
  }
}
</style>
