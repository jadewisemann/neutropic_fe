<template>
  <AppLayout>
    <section class="not-found-page" aria-labelledby="not-found-title">
      <div class="not-found-page__inner">
        <span class="not-found-page__code">404</span>
        <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
        <p>요청하신 주소가 잘못되었거나 삭제된 페이지입니다.</p>
        <RouterLink class="not-found-page__cta" to="/">홈으로 이동</RouterLink>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { AppLayout } from '../shared/components'
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px 24px;
  animation: np-fade 0.3s ease both;
}

.not-found-page__inner {
  display: grid;
  gap: 14px;
  max-width: 380px;
  text-align: center;
}

.not-found-page__code {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-brand);
  letter-spacing: 0.06em;
}

.not-found-page h1 {
  font-size: 26px;
  color: #1a221e;
}

.not-found-page p {
  font-size: 14px;
  color: #6b736d;
  line-height: 1.6;
}

.not-found-page__cta {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  height: 46px;
  padding: 0 22px;
  border-radius: 10px;
  background: var(--color-brand);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background 150ms;
}

.not-found-page__cta:hover {
  background: var(--color-brand-strong);
  text-decoration: none;
}
</style>
