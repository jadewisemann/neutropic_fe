<template>
  <AppLayout>
    <section class="hero-section" aria-labelledby="home-title">
      <p class="hero-section__eyebrow">성분 중심 AI 리포트</p>
      <h1 id="home-title">Neutripic</h1>
      <p class="hero-section__description">
        건강 목표, 복용 약, 특이사항을 바탕으로 제품이 아닌 성분 중심의 개인화 리포트를 제공합니다.
      </p>
      <div class="hero-section__actions">
        <BaseButton to="/login?redirect_to=/survey" variant="primary">추천 시작</BaseButton>
        <BaseButton to="/community">커뮤니티 보기</BaseButton>
      </div>
    </section>

    <section class="section-grid" aria-label="서비스 가치">
      <article class="info-block">
        <h2>RAG 기반 근거</h2>
        <p>iDISK와 건강기능식품 기능성원료 인정현황 데이터를 바탕으로 성분 추천 이유를 설명합니다.</p>
      </article>
      <article class="info-block">
        <h2>안전 가드레일</h2>
        <p>복용 약, 특이사항, 서비스 범위를 확인해 고위험 요청은 안전 안내로 전환합니다.</p>
      </article>
      <article class="info-block">
        <h2>검증된 성분 링크</h2>
        <p>iHerb는 상품 정보가 아니라 백엔드가 검증한 성분 외부 링크로만 연결합니다.</p>
      </article>
    </section>

    <section class="flow-preview" aria-labelledby="flow-title">
      <h2 id="flow-title">추천 리포트 흐름</h2>
      <ol>
        <li>건강 목표와 우선순위를 선택합니다.</li>
        <li>복용 약과 특이사항을 입력합니다.</li>
        <li>성분 중심 리포트와 주의사항을 확인합니다.</li>
        <li>리포트 기반 채팅으로 후속 질문을 남깁니다.</li>
      </ol>
    </section>

    <SafetyNotice />

    <section class="community-preview" aria-labelledby="community-title">
      <div>
        <h2 id="community-title">커뮤니티</h2>
        <p>건강 고민과 영양제 경험을 공유하는 공간입니다. 목록과 상세 조회는 비회원도 가능합니다.</p>
      </div>
      <BaseButton to="/community">게시글 보러가기</BaseButton>
    </section>
  </AppLayout>
</template>

<script setup>
import { AppLayout, BaseButton, SafetyNotice } from '../shared/components'
</script>

<style scoped>
/* ---- Hero ---- */
.hero-section {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-8) 0 var(--space-6);
}

.hero-section__eyebrow {
  margin: 0;
  color: var(--color-brand-muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.hero-section h1 {
  margin: 0;
  font-size: 42px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0;
  color: var(--color-text);
}

.hero-section__description {
  max-width: 600px;
  margin: 0;
  color: var(--color-text-soft);
  font-size: 16px;
  line-height: 1.65;
}

.hero-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

/* ---- Value grid ---- */
.section-grid {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.info-block {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-raised);
  transition: box-shadow 200ms;
}

.info-block:hover {
  box-shadow: var(--shadow-popover);
}

.info-block h2 {
  margin: 0 0 var(--space-2);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.info-block p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.65;
}

/* ---- Flow preview ---- */
.flow-preview {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-raised);
  margin-bottom: var(--space-6);
}

.flow-preview h2 {
  margin: 0 0 var(--space-4);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.flow-preview ol {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.6;
}

/* ---- Community CTA ---- */
.community-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-raised);
  margin-top: var(--space-6);
}

.community-preview h2 {
  margin: 0 0 var(--space-2);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--color-text);
}

.community-preview p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.6;
}

/* ---- Responsive ---- */
@media (min-width: 720px) {
  .hero-section {
    gap: var(--space-5);
    padding: var(--space-16) 0 var(--space-10);
  }

  .hero-section h1 {
    font-size: 64px;
  }

  .hero-section__description {
    font-size: 18px;
  }

  .section-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .info-block,
  .flow-preview,
  .community-preview {
    padding: var(--space-6);
  }
}

@media (max-width: 820px) {
  .section-grid {
    grid-template-columns: 1fr;
  }

  .community-preview {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
