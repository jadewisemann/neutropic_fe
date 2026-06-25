<template>
  <AppLayout hide-footer>
    <div class="home-hero-wrapper">
      <div class="home-hero">
        <div class="home-hero__content">
          <p class="home-hero__eyebrow"><span></span>Personal nutrition insight</p>
          <h1>검증된 데이터로<br />선택이 쉬워집니다</h1>
          <p class="home-hero__brand">NEUTRIPIC</p>
          <p class="home-hero__description">
            iDISK와 기능성 인정 원료 데이터를 기반으로 복용 약, 알레르기, 건강 목표를 함께 고려해
            나에게 필요한 성분을 알려드립니다.
          </p>
        </div>
        <div class="home-hero__actions" aria-label="홈 주요 동작">
          <RouterLink class="home-btn home-btn--primary" to="/survey">추천 시작</RouterLink>
          <RouterLink class="home-btn" to="/community">커뮤니티</RouterLink>
        </div>
      </div>

      <section class="home-slider" :style="sliderStyle" aria-label="뉴트리픽 핵심 데이터 슬라이더">
        <div class="home-slider__viewport">
          <div class="home-slider__track">
            <article v-for="slide in slides" :key="slide.title" class="home-slide">
              <img :src="slide.image" :alt="slide.alt" />
            </article>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AppLayout } from '../shared/components'
import slideImage1 from '../../asset/image.png'
import slideImage2 from '../../asset/image (1).png'
import slideImage3 from '../../asset/image (2).png'
import slideImage4 from '../../asset/image (3).png'
import slideImage5 from '../../asset/image (4).png'

const slides = [
  {
    title: '복용 정보',
    image: slideImage1,
    alt: '책상 위에 놓인 건강 기록과 영양제 이미지',
  },
  {
    title: '알레르기',
    image: slideImage2,
    alt: '신선한 식재료와 건강 관리 이미지를 담은 카드',
  },
  {
    title: '건강 목표',
    image: slideImage3,
    alt: '운동과 일상 건강 목표를 표현한 이미지',
  },
  {
    title: '기능성 원료',
    image: slideImage4,
    alt: '영양 성분 분석과 식품 이미지를 함께 보여주는 카드',
  },
  {
    title: '개인 리포트',
    image: slideImage5,
    alt: '개인 건강 리포트를 확인하는 듯한 이미지',
  },
]

const activeSlide = ref(0)

const sliderStyle = computed(() => ({
  '--active-slide': activeSlide.value,
}))

let timer = null

onMounted(() => {
  timer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 3000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.home-hero-wrapper {
  flex: 1;
  min-height: 620px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff, #f7f8f6);
  border-bottom: 1px solid #e8ebe7;
  animation: np-fade 0.3s ease both;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 32px;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  padding: 58px 24px 26px;
}

.home-hero__content {
  min-width: 0;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 18px;
  color: var(--color-brand);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.home-hero__eyebrow span {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--color-brand);
}

.home-hero h1 {
  max-width: 620px;
  margin: 0;
  font-size: 48px;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0;
  color: #1a221e;
  text-wrap: balance;
}

.home-hero__brand {
  margin: 12px 0 0;
  color: var(--color-brand);
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.home-hero__description {
  max-width: 650px;
  margin: 24px 0 0;
  color: #5a625b;
  font-size: 16px;
  line-height: 1.75;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 8px;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 94px;
  height: 42px;
  padding: 0 20px;
  border: 1.5px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #2d352f;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms, color 150ms, transform 150ms;
}

.home-btn:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
  transform: translateY(-1px);
  text-decoration: none;
}

.home-btn--primary {
  background: var(--color-brand);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(20, 59, 44, 0.18);
}

.home-btn--primary:hover {
  border-color: transparent;
  background: var(--color-brand-strong);
  color: #fff;
}

.home-slider {
  --slide-gap: 16px;
  --slide-size: min(1112px, calc(100vw - 48px));
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px 24px;
}


.home-slider__viewport {
  overflow: hidden;
  min-height: 0;
  border-radius: 8px;
  background: #e8ebe7;
  box-shadow: inset 0 0 0 1px rgba(26, 34, 30, 0.08);
}

.home-slider__track {
  display: flex;
  gap: var(--slide-gap);
  height: 100%;
  transform: translateX(calc(var(--active-slide) * (var(--slide-size) + var(--slide-gap)) * -1));
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.home-slide {
  flex: 0 0 var(--slide-size);
  min-width: 0;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
}

.home-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}


@media (max-width: 760px) {
  .home-hero-wrapper {
    min-height: calc(100svh - 60px);
  }

  .home-hero {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 44px 20px 30px;
  }

  .home-hero h1 {
    font-size: 36px;
  }

  .home-hero__description {
    font-size: 15px;
  }

  .home-hero__actions {
    justify-content: flex-start;
    padding-bottom: 0;
  }

  .home-slider {
    --slide-gap: 12px;
    --slide-size: calc(100vw - 40px);
    min-height: 360px;
    padding: 0 20px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-slider__track,
  .home-btn {
    transition: none;
  }
}
</style>
