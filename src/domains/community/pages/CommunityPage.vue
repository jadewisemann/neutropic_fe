<template>
  <AppLayout>
    <section class="community-page" aria-labelledby="community-title">
      <PageHeader
        title-id="community-title"
        eyebrow="커뮤니티"
        title="오늘의 건강 루틴 이야기"
        description="짧게 남기고, 이어서 묻고, 서로의 영양제 경험을 가볍게 확인해 보세요."
      >
        <template #actions>
          <BaseButton to="/community/new" variant="primary">게시글 작성</BaseButton>
        </template>
      </PageHeader>

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
      >
        <template #action>
          <BaseButton to="/community/new">게시글 작성</BaseButton>
        </template>
      </EmptyState>

      <template v-else>
        <p v-if="isUsingFallback" class="fallback-notice" role="status">
          {{ loadError }}
        </p>

        <div class="post-list" aria-live="polite">
          <article v-for="post in posts" :key="post.id" class="thread-post">
            <div class="thread-post__rail" aria-hidden="true">
              <span class="thread-post__avatar">{{ getAuthorInitial(post.author) }}</span>
              <span class="thread-post__line"></span>
            </div>
            <div class="thread-post__body">
              <p class="thread-post__meta">
                <strong>{{ formatAuthor(post.author) }}</strong>
                <span>{{ formatDate(post.created_at) }}</span>
              </p>
              <h2>
                <RouterLink :to="`/community/${post.id}`">{{ post.title }}</RouterLink>
              </h2>
              <p v-if="post.content" class="thread-post__content">{{ truncateContent(post.content) }}</p>
              <div class="thread-post__actions" aria-label="게시글 반응">
                <span>♡ {{ post.like_count ?? 0 }}</span>
                <RouterLink :to="`/community/${post.id}`">💬 {{ post.comment_count ?? 0 }}</RouterLink>
                <RouterLink :to="`/community/${post.id}`">↗ 공유</RouterLink>
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
import { useRoute } from 'vue-router'
import { communityApi } from '../../../shared/api'
import { AppLayout, BaseButton, EmptyState, ErrorState, LoadingState, PageHeader } from '../../../shared/components'
import { useThreadFeed } from '../composables/useThreadFeed'
import { dummyCommunityPosts } from '../data/dummyPosts'

const route = useRoute()

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
  initialQuery: {
    ordering: 'latest',
  },
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

</script>

<style scoped>
.community-page {
  display: grid;
  gap: var(--space-6);
}

.post-list {
  display: grid;
  margin: 0 auto;
  width: min(100%, 680px);
  border-top: 1px solid var(--color-border);
}

.thread-post {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.thread-post__rail {
  display: grid;
  justify-items: center;
  grid-template-rows: 40px 1fr;
}

.thread-post__avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-blue-200);
  color: var(--color-blue-700);
  font-size: 14px;
  font-weight: 600;
}

.thread-post__line {
  width: 1px;
  min-height: 100%;
  background: var(--color-border);
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
  color: var(--color-text-muted);
  font-size: 13px;
}

.thread-post__meta strong {
  color: var(--color-text-soft);
  font-weight: 500;
}

.thread-post h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0;
}

.thread-post h2 a {
  color: var(--color-text);
  text-decoration: none;
}

.thread-post h2 a:hover {
  text-decoration: underline;
}

.thread-post__content {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.thread-post__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  align-items: center;
  padding-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
}

.thread-post__actions a {
  color: inherit;
  text-decoration: none;
  transition: color 150ms;
}

.thread-post__actions a:hover {
  color: var(--color-text);
  text-decoration: none;
}

.fallback-notice {
  margin: 0 auto;
  width: min(100%, 680px);
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

@media (max-width: 600px) {
  .thread-post {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: var(--space-3);
  }
}
</style>
