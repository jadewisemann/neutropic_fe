<template>
  <MyPageLayout>
    <LoadingState v-if="isLoading" label="마이페이지 정보를 불러오는 중입니다" />

    <ErrorState
      v-else-if="loadError"
      title="마이페이지 정보를 불러오지 못했습니다"
      :description="loadError"
    >
      <template #action>
        <BaseButton size="sm" @click="loadSummary">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <template v-else>
    <ContentSection title-id="profile-summary-title" title="회원 정보">
      <dl>
        <div>
          <dt>이메일</dt>
          <dd>{{ summary.user?.email || '-' }}</dd>
        </div>
        <div>
          <dt>닉네임</dt>
          <dd>{{ summary.user?.username || '-' }}</dd>
        </div>
        <div>
          <dt>나이 / 성별</dt>
          <dd>{{ summary.user?.age || '-' }} / {{ formatGender(summary.user?.gender) }}</dd>
        </div>
      </dl>
      <RouterLink to="/mypage/profile">회원 정보 수정</RouterLink>
    </ContentSection>

    <ContentSection title-id="activity-summary-title" title="활동 요약">
      <ul class="activity-list">
        <li>
          <span>추천 기록</span>
          <strong>{{ summary.report_count ?? 0 }}개</strong>
        </li>
        <li>
          <span>내 게시글</span>
          <strong>{{ summary.post_count ?? 0 }}개</strong>
        </li>
        <li>
          <span>내 댓글</span>
          <strong>{{ summary.comment_count ?? 0 }}개</strong>
        </li>
      </ul>
    </ContentSection>

      <ContentSection title-id="report-history-title" title="추천 기록">
        <RouterLink to="/reports">저장된 리포트 보러가기</RouterLink>
      </ContentSection>
    </template>
  </MyPageLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { mypageApi } from '../../../shared/api'
import { BaseButton, ContentSection, ErrorState, LoadingState, MyPageLayout } from '../../../shared/components'

const summary = ref({})
const isLoading = ref(true)
const loadError = ref('')

onMounted(loadSummary)

async function loadSummary() {
  isLoading.value = true
  loadError.value = ''

  try {
    summary.value = await mypageApi.getSummary()
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

function formatGender(value) {
  const labels = {
    female: '여성',
    male: '남성',
    other: '기타 또는 응답하지 않음',
  }

  return labels[value] || '-'
}
</script>

<style scoped>
dl,
dd {
  margin: 0;
}

dl {
  display: grid;
  gap: 12px;
}

dt,
.activity-list span {
  color: #5b6b65;
  font-size: 0.875rem;
}

.activity-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-list li {
  display: grid;
  gap: 4px;
}

.activity-list strong {
  color: #31443d;
  font-size: 1.25rem;
}

a {
  color: #165a46;
  font-weight: 700;
}
</style>
