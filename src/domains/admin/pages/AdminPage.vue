<template>
  <AdminLayout>
    <LoadingState v-if="isLoading" label="관리자 통계를 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="관리자 통계를 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadStatistics">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <template v-else>
      <!-- 4-stat grid -->
      <div class="stats-grid">
        <div class="stats-grid__item">
          <div class="stats-grid__number">{{ statistics.report_count ?? 0 }}</div>
          <div class="stats-grid__label">추천 기록</div>
        </div>
        <div class="stats-grid__item">
          <div class="stats-grid__number">{{ statistics.user_count ?? 0 }}</div>
          <div class="stats-grid__label">가입 회원</div>
        </div>
        <div class="stats-grid__item">
          <div class="stats-grid__number">{{ statistics.post_count ?? 0 }}</div>
          <div class="stats-grid__label">커뮤니티 글</div>
        </div>
        <div class="stats-grid__item">
          <div class="stats-grid__number">{{ statistics.comment_count ?? 0 }}</div>
          <div class="stats-grid__label">댓글</div>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-card__title">인기 건강 목표</div>
          <div class="summary-card__value">{{ formatTopItem(statistics.popular_health_goals, 'name') }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card__title">인기 성분</div>
          <div class="summary-card__value">{{ formatTopItem(statistics.popular_ingredients, 'name_ko') }}</div>
        </div>
      </div>

      <div class="scope-card">
        <div class="scope-card__title">관리 범위</div>
        <p>회원 상태, 게시글, 댓글과 답글을 조회하고 필요한 경우 삭제 액션을 수행하는 화면입니다.</p>
        <nav class="admin-links" aria-label="관리자 바로가기">
          <RouterLink to="/admin/users">회원 관리</RouterLink>
          <RouterLink to="/admin/posts">게시글 관리</RouterLink>
          <RouterLink to="/admin/comments">댓글 관리</RouterLink>
        </nav>
      </div>
    </template>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../../../shared/api'
import { AdminLayout, BaseButton, ErrorState, LoadingState } from '../../../shared/components'

const statistics = ref({})
const isLoading = ref(true)
const loadError = ref('')

onMounted(loadStatistics)

async function loadStatistics() {
  isLoading.value = true
  loadError.value = ''

  try {
    statistics.value = await adminApi.getReportStatistics()
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

function formatTopItem(items, labelKey) {
  const [item] = Array.isArray(items) ? items : []
  if (!item) return '-'
  return `${item[labelKey] || '-'} (${item.count ?? 0})`
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stats-grid__item {
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  text-align: center;
}

.stats-grid__number {
  font-size: 28px;
  font-weight: 700;
  color: #1a221e;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stats-grid__label {
  margin-top: 7px;
  font-size: 12.5px;
  font-weight: 500;
  color: #8b938c;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-card {
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
}

.summary-card__title {
  font-size: 12px;
  font-weight: 600;
  color: #9aa19b;
  margin-bottom: 8px;
}

.summary-card__value {
  font-size: 16px;
  font-weight: 700;
  color: #1a221e;
}

.scope-card {
  padding: 20px 22px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  display: grid;
  gap: 12px;
}

.scope-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a221e;
}

.scope-card p {
  margin: 0;
  color: #6b736d;
  font-size: 13.5px;
  line-height: 1.55;
}

.admin-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-links a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--color-brand-50);
  color: var(--color-brand-strong);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: background 150ms;
}

.admin-links a:hover {
  background: #ddf0e6;
  text-decoration: none;
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
