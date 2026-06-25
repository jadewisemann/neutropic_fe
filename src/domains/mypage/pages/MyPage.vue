<template>
  <AppLayout>
    <div class="mypage" aria-labelledby="mypage-title">
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
        <!-- Profile card -->
        <div class="mypage__profile-card">
          <span class="mypage__avatar" aria-hidden="true">{{ avatarInitial }}</span>
          <div class="mypage__user-info">
            <div id="mypage-title" class="mypage__name">{{ displayName }} 님</div>
            <div class="mypage__meta">
              {{ summary.user?.email }}
              <span v-if="summary.report_count !== undefined"> · 리포트 {{ summary.report_count }}개 보관 중</span>
            </div>
          </div>
          <RouterLink class="mypage__new-btn" to="/survey">새 리포트</RouterLink>
        </div>

        <!-- Stats grid -->
        <div class="mypage__stats">
          <div class="mypage__stat">
            <div class="mypage__stat-number">{{ summary.report_count ?? 0 }}</div>
            <div class="mypage__stat-label">보관 리포트</div>
          </div>
          <div class="mypage__stat">
            <div class="mypage__stat-number">{{ summary.post_count ?? 0 }}</div>
            <div class="mypage__stat-label">내 게시글</div>
          </div>
          <div class="mypage__stat">
            <div class="mypage__stat-number">{{ summary.comment_count ?? 0 }}</div>
            <div class="mypage__stat-label">내 댓글</div>
          </div>
        </div>

        <!-- Settings list -->
        <div class="mypage__settings">
          <RouterLink to="/mypage/profile" class="mypage__settings-item">
            <span>회원 정보 수정</span>
            <span class="mypage__settings-arrow">›</span>
          </RouterLink>
          <RouterLink to="/reports" class="mypage__settings-item">
            <span>저장된 리포트 관리</span>
            <span class="mypage__settings-arrow">›</span>
          </RouterLink>
          <RouterLink to="/mypage/profile" class="mypage__settings-item">
            <span>건강 정보 수정</span>
            <span class="mypage__settings-arrow">›</span>
          </RouterLink>
          <RouterLink to="/mypage/profile" class="mypage__settings-item">
            <span>계정 · 개인정보</span>
            <span class="mypage__settings-arrow">›</span>
          </RouterLink>
        </div>

        <!-- Safety notice -->
        <div class="mypage__notice">
          질환이 있거나 약을 복용 중인 경우 전문가와 상담하세요. 저장된 건강 정보는 마이페이지에서 언제든 수정·삭제할 수 있어요.
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { mypageApi, authTokenStorage } from '../../../shared/api'
import { AppLayout, BaseButton, ErrorState, LoadingState } from '../../../shared/components'

const summary = ref({})
const isLoading = ref(true)
const loadError = ref('')

const displayName = computed(() => {
  return summary.value.user?.username || summary.value.user?.email || '사용자'
})

const avatarInitial = computed(() => {
  return displayName.value.trim().charAt(0).toUpperCase() || 'U'
})

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
</script>

<style scoped>
.mypage {
  max-width: 1024px;
  margin: 0 auto;
  padding: 36px 24px 56px;
  animation: np-fade 0.3s ease both;
  display: grid;
  gap: 18px;
}

@media (max-width: 640px) {
  .mypage {
    padding: 24px 16px 40px;
  }
}

/* Profile card */
.mypage__profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 26px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
}

.mypage__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--color-brand-50);
  color: var(--color-brand);
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.mypage__user-info {
  flex: 1;
  min-width: 0;
}

.mypage__name {
  font-size: 22px;
  font-weight: 700;
  color: #1a221e;
  line-height: 1.3;
}

.mypage__meta {
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.5;
  color: #6b736d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mypage__new-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border: 1.5px solid #d4dad4;
  border-radius: 9px;
  background: #fff;
  color: #2d352f;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 150ms;
}

.mypage__new-btn:hover {
  border-color: var(--color-brand);
  text-decoration: none;
}

/* Stats grid */
.mypage__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mypage__stat {
  padding: 24px 20px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 12px;
  text-align: center;
}

.mypage__stat-number {
  font-size: 34px;
  font-weight: 700;
  color: #1a221e;
  line-height: 1;
}

.mypage__stat-label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #8b938c;
  line-height: 1.4;
}

/* Settings list */
.mypage__settings {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 13px;
  overflow: hidden;
}

.mypage__settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #eef0ec;
  font-size: 15px;
  font-weight: 500;
  color: #2d352f;
  text-decoration: none;
  transition: background 150ms;
}

.mypage__settings-item:last-child {
  border-bottom: none;
}

.mypage__settings-item:hover {
  background: #f7f8f6;
  text-decoration: none;
}

.mypage__settings-arrow {
  font-size: 16px;
  font-weight: 700;
  color: #c2c8c1;
}

/* Notice */
.mypage__notice {
  padding: 16px 18px;
  background: #fdf8ec;
  border: 1px solid #f0e2c2;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #6e5a2e;
}

@media (max-width: 480px) {
  .mypage__stats {
    grid-template-columns: 1fr;
  }

  .mypage__profile-card {
    flex-wrap: wrap;
  }
}
</style>
