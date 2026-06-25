<template>
  <AppLayout>
    <section class="community-page" aria-labelledby="community-title">
      <header class="community-page__header">
        <h1 id="community-title">커뮤니티</h1>
        <span>상업적 후기·판매 글은 제한돼요</span>
      </header>

      <div class="community-tabs" aria-label="커뮤니티 주제">
        <button
          v-for="(tab, index) in communityTabs"
          :key="tab"
          type="button"
          :class="{ 'community-tabs__item--active': index === 0 }"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Inline composer -->
      <div class="quick-composer">
        <span class="quick-composer__avatar" aria-hidden="true">{{ currentUserInitial }}</span>
        <input
          v-model.trim="composer.content"
          class="quick-composer__input"
          type="text"
          placeholder="건강 고민이나 영양제 경험을 나눠보세요"
          :disabled="isSubmittingPost"
          @keydown.enter.prevent="createPost"
        />
        <button
          class="quick-composer__post-btn"
          type="button"
          :disabled="isSubmittingPost || !composer.content"
          @click="createPost"
        >
          {{ isSubmittingPost ? '게시 중' : '게시' }}
        </button>
      </div>
      <FormErrorMessage :message="composerError" />

      <LoadingState v-if="isInitialLoading" label="게시글 목록을 불러오는 중입니다" />

      <ErrorState
        v-else-if="loadError && posts.length === 0"
        title="게시글 목록을 불러오지 못했습니다"
        :description="loadError"
      >
        <template #action>
          <BaseButton size="sm" @click="loadInitialPosts">다시 시도</BaseButton>
        </template>
      </ErrorState>

      <EmptyState
        v-else-if="posts.length === 0"
        title="게시글이 없습니다"
        description="첫 번째 건강 고민이나 영양제 경험을 공유해 보세요."
      />

      <template v-else>
        <p v-if="isUsingFallback" class="fallback-notice" role="status">
          {{ loadError }}
        </p>

        <div class="post-list" aria-live="polite">
          <article v-for="(post, i) in posts" :key="post.id" class="thread-post">
            <div class="thread-post__rail" aria-hidden="true">
              <span class="thread-post__avatar">{{ getAuthorInitial(post.author) }}</span>
              <span v-if="i < posts.length - 1" class="thread-post__line"></span>
            </div>
            <div class="thread-post__body">
              <p class="thread-post__meta">
                <strong>{{ formatAuthor(post.author) }}</strong>
                <span>{{ formatDate(post.created_at) }}</span>
              </p>
              <p v-if="post.content" class="thread-post__content">{{ truncateContent(post.content) }}</p>
              <div class="thread-post__actions" aria-label="게시글 반응">
                <span>♡ {{ post.like_count ?? 0 }}</span>
                <RouterLink :to="`/community/${post.id}`">답글 {{ post.comment_count ?? 0 }}</RouterLink>
                <RouterLink :to="`/community/${post.id}`">리포스트 0</RouterLink>
                <span>공유</span>
              </div>
            </div>
          </article>
        </div>

        <ErrorState
          v-if="loadError && !isUsingFallback"
          title="다음 게시글을 불러오지 못했습니다"
          :description="loadError"
        >
          <template #action>
            <BaseButton size="sm" @click="loadMorePosts">다시 시도</BaseButton>
          </template>
        </ErrorState>

        <div ref="sentinel" class="feed-sentinel" aria-hidden="true"></div>

        <div class="feed-status" role="status">
          <LoadingState v-if="isLoadingMore" label="다음 게시글을 불러오는 중입니다" />
          <BaseButton v-else-if="hasMore" size="sm" @click="loadMorePosts">더 보기</BaseButton>
          <span v-else>모든 게시글을 확인했습니다.</span>
        </div>
      </template>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authTokenStorage, communityApi } from '../../../shared/api'
import { AppLayout, BaseButton, EmptyState, ErrorState, FormErrorMessage, LoadingState } from '../../../shared/components'
import { useThreadFeed } from '../composables/useThreadFeed'
import { dummyCommunityPosts } from '../data/dummyPosts'

const route = useRoute()
const router = useRouter()
const isSubmittingPost = ref(false)
const composerError = ref('')
const composer = reactive({ content: '' })
const currentUser = computed(() => authTokenStorage.getUser())
const communityTabs = ['추천', '수면', '면역', '소화', '피부']
const currentUserInitial = computed(() => {
  const username = currentUser.value?.username || currentUser.value?.email || 'U'
  return username.trim().slice(0, 1).toUpperCase()
})

const {
  items: posts,
  isInitialLoading,
  isLoadingMore,
  loadError,
  isUsingFallback,
  hasMore,
  sentinel,
  loadInitialItems: loadInitialPosts,
  loadMoreItems: loadMorePosts,
} = useThreadFeed({
  loadItems: communityApi.listPosts,
  initialQuery: { ordering: 'latest' },
  fallbackItems: dummyCommunityPosts,
  getRouteKey: () => route.fullPath,
})

function formatAuthor(author) {
  return author?.username || '알 수 없음'
}

function getAuthorInitial(author) {
  return formatAuthor(author).slice(0, 1).toUpperCase()
}

function formatDate(value) {
  if (!value) return '작성일 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function truncateContent(value) {
  const normalized = String(value).replace(/\s+/g, ' ').trim()
  return normalized.length > 160 ? `${normalized.slice(0, 160)}...` : normalized
}

async function createPost() {
  composerError.value = ''

  if (!composer.content) {
    composerError.value = '내용을 입력해 주세요.'
    return
  }

  if (!authTokenStorage.getAccessToken()) {
    router.push({ path: '/login', query: { redirect_to: route.fullPath } })
    return
  }

  isSubmittingPost.value = true

  try {
    await communityApi.createPost({
      title: buildGeneratedTitle(composer.content),
      content: composer.content,
    })
    composer.content = ''
    await loadInitialPosts()
  } catch (error) {
    composerError.value = error?.message || '게시글 작성에 실패했습니다.'
  } finally {
    isSubmittingPost.value = false
  }
}

function buildGeneratedTitle(content) {
  const hash = Math.abs([...content].reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0))
    .toString(36)
    .slice(0, 6)
  return `community-${hash}`
}
</script>

<style scoped>
.community-page {
  display: grid;
  gap: 0;
  max-width: 600px;
  margin: 0 auto;
  padding: 28px 20px 56px;
  animation: np-fade 0.3s ease both;
}

.community-page__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.community-page__header h1 {
  margin: 0;
  color: #1a221e;
  font-size: 24px;
  font-weight: 700;
}

.community-page__header span {
  color: #9aa19b;
  font-size: 12px;
  line-height: 1.4;
}

.community-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.community-tabs::-webkit-scrollbar {
  display: none;
}

.community-tabs button {
  flex: none;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #e4e7e3;
  border-radius: 99px;
  background: #fff;
  color: #5a625b;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.community-tabs__item--active {
  border-color: transparent !important;
  background: var(--color-brand-50) !important;
  color: var(--color-brand-strong) !important;
}

/* Inline composer */
.quick-composer {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px 4px;
  border-bottom: 1px solid #eef0ec;
}

.quick-composer__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-brand);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.quick-composer__input {
  flex: 1;
  min-width: 0;
  height: 42px;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 14.5px;
  color: #2d352f;
}

.quick-composer__input::placeholder {
  color: #9aa19b;
}

.quick-composer__post-btn {
  flex-shrink: 0;
  height: 38px;
  padding: 0 18px;
  border: none;
  border-radius: 99px;
  background: var(--color-brand);
  color: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
}

.quick-composer__post-btn:hover:not(:disabled) {
  background: var(--color-brand-strong);
}

.quick-composer__post-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-list {
  display: grid;
  width: 100%;
}

.thread-post {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 18px 4px;
  border-bottom: 1px solid #eef0ec;
}

.thread-post__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.thread-post__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-brand-50);
  color: var(--color-brand);
  font-size: 14px;
  font-weight: 700;
}

.thread-post__line {
  width: 2px;
  flex: 1;
  min-height: 6px;
  background: #eef0ec;
}

.thread-post__body {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

.thread-post__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
  margin: 0;
  color: #9aa19b;
  font-size: 12.5px;
}

.thread-post__meta strong {
  color: #1a221e;
  font-size: 14.5px;
  font-weight: 700;
}

.thread-post__content {
  margin: 0;
  color: #2d352f;
  font-size: 14.5px;
  line-height: 1.62;
  white-space: pre-wrap;
}

.thread-post__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  color: #9aa19b;
  font-size: 12.5px;
  font-weight: 500;
}

.thread-post__actions a {
  color: inherit;
  text-decoration: none;
}

.thread-post__actions a:hover {
  color: #1a221e;
}

.fallback-notice {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--radius-sm);
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
  font-size: 13px;
}

.feed-sentinel {
  height: 1px;
}

.feed-status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: var(--space-4) 0;
}

.feed-status span {
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
