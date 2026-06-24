<template>
  <AppLayout>
    <section class="mypage-layout" aria-labelledby="mypage-layout-title">
      <aside class="mypage-layout__side">
        <p class="mypage-layout__eyebrow">마이페이지</p>
        <h1 id="mypage-layout-title">{{ title }}</h1>
        <nav class="mypage-layout__nav" aria-label="마이페이지 메뉴">
          <RouterLink to="/mypage" class="mypage-layout__nav-link">내 활동</RouterLink>
          <RouterLink to="/mypage/profile" class="mypage-layout__nav-link">회원 정보 수정</RouterLink>
          <RouterLink to="/reports" class="mypage-layout__nav-link">추천 기록</RouterLink>
        </nav>
      </aside>
      <div class="mypage-layout__content">
        <slot />
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'

defineProps({
  title: {
    type: String,
    default: '내 정보와 추천 기록',
  },
})
</script>

<style scoped>
.mypage-layout {
  display: grid;
  gap: var(--space-5);
  align-items: start;
}

.mypage-layout__side {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow-raised);
}

.mypage-layout__eyebrow {
  margin: 0;
  color: var(--color-brand-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.mypage-layout__side h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.mypage-layout__nav {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.mypage-layout__nav::-webkit-scrollbar {
  display: none;
}

.mypage-layout__nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background 150ms, color 150ms;
}

.mypage-layout__nav-link:hover {
  background: var(--color-gray-alpha-100);
  color: var(--color-text);
  text-decoration: none;
}

.mypage-layout__nav-link.router-link-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.mypage-layout__content {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 840px) {
  .mypage-layout {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: var(--space-8);
  }

  .mypage-layout__side {
    position: sticky;
    top: calc(66px + var(--space-6));
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .mypage-layout__nav {
    display: grid;
    gap: 2px;
    overflow: visible;
  }

  .mypage-layout__nav-link {
    display: flex;
    width: 100%;
    border-radius: var(--radius-sm);
  }
}
</style>
