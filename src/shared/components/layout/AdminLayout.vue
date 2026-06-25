<template>
  <AppLayout>
    <section class="admin-layout">
      <div class="admin-layout__header">
        <div class="admin-layout__title-row">
          <h1>관리자</h1>
          <span class="admin-layout__badge">운영 도구</span>
        </div>
        <p class="admin-layout__desc">조용하고 읽기 편한 운영 화면. 리포트 생성·안전 가드레일 동작을 모니터링합니다.</p>
      </div>
      <nav class="admin-layout__nav" aria-label="관리자 메뉴">
        <RouterLink to="/admin">대시보드</RouterLink>
        <RouterLink to="/admin/users">회원 관리</RouterLink>
        <RouterLink to="/admin/posts">게시글 관리</RouterLink>
        <RouterLink to="/admin/comments">댓글 관리</RouterLink>
      </nav>
      <div class="admin-layout__content">
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
    default: '관리자 대시보드',
  },
})
</script>

<style scoped>
.admin-layout {
  max-width: 1000px;
  margin: 0 auto;
  padding: 36px 24px 56px;
  animation: np-fade 0.3s ease both;
}

.admin-layout__header {
  margin-bottom: 22px;
}

.admin-layout__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.admin-layout__title-row h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a221e;
}

.admin-layout__badge {
  padding: 4px 9px;
  border-radius: 7px;
  background: #eef0ec;
  color: #5a625b;
  font-size: 11px;
  font-weight: 600;
}

.admin-layout__desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: #6b736d;
}

.admin-layout__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.admin-layout__nav a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #e4e7e3;
  border-radius: 8px;
  color: #5a625b;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: background 150ms, color 150ms;
}

.admin-layout__nav a:hover {
  text-decoration: none;
}

.admin-layout__nav a.router-link-active {
  border-color: transparent;
  background: var(--color-brand-50);
  color: var(--color-brand-strong);
}

.admin-layout__content {
  display: grid;
  gap: 18px;
}
</style>
