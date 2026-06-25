<template>
  <AppLayout>
    <div class="home-hero-wrapper">
      <div class="home-hero">
        <p class="home-hero__eyebrow"><span></span>성분 중심 AI 리포트</p>
        <h1>복용 약과 목표까지 반영한<br />나만의 성분 리포트</h1>
        <p class="home-hero__description">
          제품을 권하지 않습니다. 검증된 근거로 어떤 성분이 왜 필요한지, 무엇을 주의해야 하는지 설명합니다.
        </p>
        <div class="home-hero__actions">
          <RouterLink class="home-btn home-btn--primary" to="/survey">추천 시작</RouterLink>
          <RouterLink class="home-btn" to="/community">커뮤니티 보기</RouterLink>
        </div>
      </div>
    </div>

    <div class="home-pillars">
      <div class="pillar-grid">
        <article class="pillar-card">
          <span class="pillar-card__mark">成</span>
          <h2>성분 중심 리포트</h2>
          <p>제품이 아니라 성분이 왜 필요한지 설명합니다.</p>
        </article>
        <article class="pillar-card">
          <span class="pillar-card__mark">근</span>
          <h2>RAG 기반 근거</h2>
          <p>iDISK와 기능성원료 인정현황 데이터를 바탕으로 추천 이유를 설명합니다.</p>
        </article>
        <article class="pillar-card">
          <span class="pillar-card__mark">安</span>
          <h2>안전 가드레일</h2>
          <p>복용 약, 임신/수유, 알레르기 정보를 반영합니다.</p>
        </article>
        <article class="pillar-card">
          <span class="pillar-card__mark">链</span>
          <h2>검증된 성분 링크</h2>
          <p>iHerb 성분 정보 외부 링크만 제공합니다.</p>
        </article>
        <article class="pillar-card">
          <span class="pillar-card__mark">答</span>
          <h2>리포트 기반 채팅</h2>
          <p>작성된 근거 범위 안에서 후속 질문을 이어갑니다.</p>
        </article>
      </div>
      <div class="home-notice">
        <b>안내</b> · 질환이 있거나 약을 복용 중인 경우 전문가와 상담하세요. 본 서비스는 의료 진단·처방이 아닌 건강 정보 제공입니다.
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { AppLayout } from '../shared/components'
</script>

<style scoped>
.home-hero-wrapper {
  background: linear-gradient(180deg, #ffffff, #f7f8f6);
  border-bottom: 1px solid #e8ebe7;
  animation: np-fade 0.3s ease both;
}

.home-hero {
  max-width: 1160px;
  margin: 0 auto;
  padding: 64px 24px 56px;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 22px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-brand-50);
  color: var(--color-brand);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
}

.home-hero__eyebrow span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-brand);
}

.home-hero h1 {
  max-width: 600px;
  margin: 0 0 18px;
  font-size: 46px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.03em;
  color: #1a221e;
  text-wrap: balance;
}

.home-hero__description {
  max-width: 520px;
  margin: 0 0 28px;
  color: #5a625b;
  font-size: 18px;
  line-height: 1.7;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  align-items: center;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 24px;
  border: 1.5px solid #d4dad4;
  border-radius: 11px;
  background: #fff;
  color: #2d352f;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 150ms, color 150ms;
}

.home-btn:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
  text-decoration: none;
}

.home-btn--primary {
  border-color: transparent;
  background: var(--color-brand);
  color: #fff;
  font-weight: 700;
  padding: 0 28px;
  box-shadow: 0 2px 6px rgba(20, 59, 44, 0.22);
}

.home-btn--primary:hover {
  background: var(--color-brand-strong);
  border-color: transparent;
  color: #fff;
}

.home-pillars {
  max-width: 1160px;
  margin: 0 auto;
  padding: 44px 24px 64px;
}

.pillar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.pillar-card {
  padding: 22px;
  border: 1px solid #e8ebe7;
  border-radius: 12px;
  background: #fff;
}

.pillar-card__mark {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin-bottom: 14px;
  border-radius: 10px;
  background: var(--color-brand-50);
  color: var(--color-brand);
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
}

.pillar-card h2 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: #1a221e;
}

.pillar-card p {
  margin: 0;
  color: #6b736d;
  font-size: 13px;
  line-height: 1.55;
}

.home-notice {
  margin-top: 18px;
  padding: 16px 20px;
  background: #fdf8ec;
  border: 1px solid #f0e2c2;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #6e5a2e;
}

.home-notice b {
  color: #8a5b10;
}

@media (max-width: 560px) {
  .home-hero {
    padding-top: 44px;
  }

  .home-hero h1 {
    font-size: 34px;
  }
}
</style>
