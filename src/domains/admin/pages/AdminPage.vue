<template>
  <AdminLayout>
    <LoadingState v-if="isLoading" label="관리자 통계를 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="관리자 통계를 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadStatistics">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <ContentSection v-else title-id="admin-stats-title" title="관리 요약">
      <ul class="stats-list">
        <li>
          <span>추천 기록</span>
          <strong>{{ statistics.report_count ?? 0 }}개</strong>
        </li>
        <li>
          <span>인기 건강 목표</span>
          <strong>{{ formatTopItem(statistics.popular_health_goals, 'name') }}</strong>
        </li>
        <li>
          <span>인기 성분</span>
          <strong>{{ formatTopItem(statistics.popular_ingredients, 'name_ko') }}</strong>
        </li>
      </ul>
    </ContentSection>

    <ContentSection title-id="admin-notice-title" title="관리 범위">
      <p>회원 상태, 게시글, 댓글과 답글을 조회하고 필요한 경우 삭제 액션을 수행하는 화면입니다.</p>
      <nav class="admin-links" aria-label="관리자 바로가기">
        <RouterLink to="/admin/users">회원 관리</RouterLink>
        <RouterLink to="/admin/posts">게시글 관리</RouterLink>
        <RouterLink to="/admin/comments">댓글 관리</RouterLink>
      </nav>
    </ContentSection>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../../../shared/api'
import { AdminLayout, BaseButton, ContentSection, ErrorState, LoadingState } from '../../../shared/components'

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
p {
  margin: 0;
  color: #5b6b65;
}

.admin-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.admin-links a {
  color: #165a46;
  font-weight: 700;
}

.stats-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stats-list li {
  display: grid;
  gap: 4px;
}

.stats-list span {
  color: #5b6b65;
  font-size: 0.875rem;
}

.stats-list strong {
  color: #31443d;
  font-size: 1.125rem;
}
</style>
