<template>
  <AppLayout>
    <article class="post-detail" aria-labelledby="post-title">
      <LoadingState v-if="isLoading" label="게시글을 불러오는 중입니다" />

      <ErrorState
        v-else-if="loadError"
        title="게시글을 불러오지 못했습니다"
        :description="loadError"
      >
        <template #action>
          <div class="detail-row-actions">
            <BaseButton size="sm" @click="loadPost">다시 시도</BaseButton>
            <BaseButton to="/community" size="sm">목록</BaseButton>
          </div>
        </template>
      </ErrorState>

      <template v-else-if="post">
        <p v-if="isDummyPost" class="fallback-notice" role="status">
          연결이 불안정해 예시 게시글을 표시합니다.
        </p>

        <button class="detail-back" type="button" @click="goBack">‹ 커뮤니티</button>

        <section class="thread-section" aria-labelledby="post-title">
          <!-- Main post item -->
          <article class="thread-item thread-item--main">
            <div class="thread-rail">
              <span class="thread-avatar thread-avatar--lg">{{ getAuthorInitial(post.author) }}</span>
              <span class="thread-line"></span>
            </div>
            <div class="thread-content">
              <div class="thread-meta-row">
                <div class="thread-meta">
                  <strong class="thread-username">{{ formatAuthor(post.author) }}</strong>
                  <span class="thread-time">{{ formatRelativeTime(post.created_at) }}</span>
                </div>
                <div v-if="canManagePost" class="thread-manage">
                  <BaseButton size="sm" :to="`/community/${postId}/edit`">수정</BaseButton>
                  <BaseButton size="sm" variant="danger" @click="deletePost">삭제</BaseButton>
                </div>
              </div>
              <h1 id="post-title" class="sr-only">{{ post.title }}</h1>
              <p class="thread-body">{{ post.content }}</p>
              <div class="thread-reactions-row" aria-label="게시글 반응">
                <button
                  class="reaction-btn"
                  type="button"
                  :class="{ 'reaction-btn--liked': post.is_liked }"
                  aria-label="추천"
                  :disabled="isLikeSubmitting"
                  @click="toggleLike"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" :class="{ 'is-filled': post.is_liked }">
                    <path d="M20.8 4.6c-1.9-1.8-4.9-1.8-6.8.1L12 6.7 10 4.7C8.1 2.8 5.1 2.8 3.2 4.6 1.1 6.7 1.1 10 3.1 12l8.2 8.1c.4.4 1 .4 1.4 0l8.2-8.1c2-2 2-5.3-.1-7.4Z" />
                  </svg>
                  {{ post.like_count ?? 0 }}
                </button>
                <button class="reaction-btn" type="button" aria-label="댓글" @click="openRootComposer">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" />
                  </svg>
                  {{ post.comment_count ?? 0 }}
                </button>
              </div>
              <div class="thread-footer-row">
                <span class="thread-footer-label">{{ (post.comment_count ?? comments.length) }}개 댓글</span>
                <button class="thread-footer-btn" type="button" @click="openRootComposer">
                  댓글 달기 <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>
          </article>

          <LoadingState v-if="isCommentsLoading" label="댓글을 불러오는 중입니다" />

          <ErrorState
            v-else-if="commentsError"
            title="댓글을 불러오지 못했습니다"
            :description="commentsError"
          >
            <template #action>
              <BaseButton size="sm" @click="loadComments">다시 시도</BaseButton>
            </template>
          </ErrorState>

          <EmptyState
            v-else-if="comments.length === 0"
            title="댓글이 없습니다"
            description="아직 등록된 댓글이 없습니다."
          />

          <template v-else>
            <template v-for="comment in comments" :key="comment.id">
              <!-- Comment -->
              <article class="thread-item thread-item--comment">
                <div class="thread-rail">
                  <span class="thread-avatar">{{ getAuthorInitial(comment.author) }}</span>
                  <span v-if="comment.replies?.length || activeReplyId === comment.id" class="thread-line"></span>
                </div>
                <div class="thread-content">
                  <div class="thread-meta-row">
                    <div class="thread-meta">
                      <strong class="thread-username">{{ formatAuthor(comment.author) }}</strong>
                      <span class="thread-time">{{ formatRelativeTime(comment.created_at) }}</span>
                    </div>
                  </div>
                  <p class="thread-body">{{ comment.content }}</p>
                  <div class="thread-reactions-row">
                    <button class="reaction-btn" type="button" aria-label="답글" @click="startReply(comment)">
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" />
                      </svg>
                      답글
                    </button>
                    <template v-if="canManageComment(comment)">
                      <button class="reaction-btn" type="button" @click="editComment(comment)">수정</button>
                      <button class="reaction-btn reaction-btn--danger" type="button" @click="deleteComment(comment)">삭제</button>
                    </template>
                  </div>

                  <form
                    v-if="activeReplyId === comment.id"
                    class="reply-form"
                    aria-label="답글 작성"
                    @submit.prevent="createReply(comment)"
                  >
                    <textarea
                      v-model.trim="replyInput"
                      class="reply-form__textarea"
                      rows="3"
                      :placeholder="`${formatAuthor(comment.author)}님에게 답글 달기`"
                      :disabled="isCommentSubmitting"
                    />
                    <FormErrorMessage :message="commentSubmitError" />
                    <div class="reply-form__actions">
                      <button class="reply-form__cancel-btn" type="button" @click="cancelReply">취소</button>
                      <button class="reply-form__submit-btn" type="submit" :disabled="isCommentSubmitting">
                        {{ isCommentSubmitting ? '게시 중' : '답글 게시' }}
                      </button>
                    </div>
                  </form>
                </div>
              </article>

              <!-- Nested replies -->
              <article
                v-for="reply in comment.replies"
                :key="reply.id"
                class="thread-item thread-item--reply"
              >
                <div class="thread-rail thread-rail--indent">
                  <span class="thread-avatar thread-avatar--sm">{{ getAuthorInitial(reply.author) }}</span>
                </div>
                <div class="thread-content">
                  <div class="thread-meta-row">
                    <div class="thread-meta">
                      <strong class="thread-username">{{ formatAuthor(reply.author) }}</strong>
                      <span class="thread-time">{{ formatRelativeTime(reply.created_at) }}</span>
                    </div>
                  </div>
                  <p class="thread-body">{{ reply.content }}</p>
                  <div v-if="canManageComment(reply)" class="thread-reactions-row">
                    <button class="reaction-btn" type="button" @click="editComment(reply)">수정</button>
                    <button class="reaction-btn reaction-btn--danger" type="button" @click="deleteComment(reply)">삭제</button>
                  </div>
                </div>
              </article>
            </template>
          </template>

          <!-- Root comment composer -->
          <div v-if="!isCommentsLoading && !commentsError" class="root-composer">
            <button v-if="!isRootComposerOpen" class="root-composer__trigger" type="button" @click="openRootComposer">
              <span class="thread-avatar thread-avatar--sm">{{ getAuthorInitial(currentUser) }}</span>
              <span class="root-composer__placeholder">{{ formatAuthor(post.author) }}에게 댓글 달기…</span>
            </button>
            <form v-else class="reply-form reply-form--root" aria-label="댓글 작성" @submit.prevent="createRootComment">
              <textarea
                v-model.trim="rootCommentInput"
                class="reply-form__textarea"
                rows="3"
                :placeholder="commentPlaceholder"
                :disabled="isCommentSubmitting"
              />
              <FormErrorMessage :message="commentSubmitError" />
              <div class="reply-form__actions">
                <button class="reply-form__cancel-btn" type="button" @click="cancelRootComment">취소</button>
                <button class="reply-form__submit-btn" type="submit" :disabled="isCommentSubmitting">
                  {{ isCommentSubmitting ? '게시 중' : '게시' }}
                </button>
              </div>
            </form>
          </div>
        </section>
      </template>
    </article>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authTokenStorage, communityApi } from '../../../shared/api'
import { AppLayout, BaseButton, EmptyState, ErrorState, FormErrorMessage, LoadingState } from '../../../shared/components'
import { findDummyCommunityPost, getDummyCommunityComments } from '../data/dummyPosts'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const comments = ref([])
const isLoading = ref(true)
const isCommentsLoading = ref(true)
const isLikeSubmitting = ref(false)
const isCommentSubmitting = ref(false)
const loadError = ref('')
const commentsError = ref('')
const commentSubmitError = ref('')
const rootCommentInput = ref('')
const replyInput = ref('')
const activeReplyId = ref(null)
const isRootComposerOpen = ref(false)
const isDummyPost = ref(false)

const postId = computed(() => route.params.post_id)
const currentUser = computed(() => authTokenStorage.getUser())
const isAuthenticated = computed(() => Boolean(authTokenStorage.getAccessToken()))
const canManagePost = computed(() => currentUser.value?.id === post.value?.author?.id)
const commentPlaceholder = computed(() => (isAuthenticated.value ? '댓글을 입력해 주세요.' : '로그인 후 댓글을 작성할 수 있습니다.'))

onMounted(() => {
  loadPost()
  loadComments()
})

async function loadPost() {
  isLoading.value = true
  loadError.value = ''

  try {
    post.value = await communityApi.getPost(postId.value)
    isDummyPost.value = false
  } catch (error) {
    const fallbackPost = findDummyCommunityPost(postId.value)

    if (fallbackPost) {
      post.value = fallbackPost
      isDummyPost.value = true
    } else {
      loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
    }
  } finally {
    isLoading.value = false
  }
}

async function loadComments() {
  isCommentsLoading.value = true
  commentsError.value = ''

  try {
    const response = await communityApi.listComments(postId.value)
    const commentList = Array.isArray(response?.results)
      ? response.results
      : Array.isArray(response)
        ? response
        : []
    comments.value = normalizeComments(commentList)
  } catch (error) {
    const fallbackComments = getDummyCommunityComments(postId.value)

    if (fallbackComments.length > 0) {
      comments.value = fallbackComments
    } else {
      commentsError.value = error?.message || '댓글을 불러오지 못했습니다.'
    }
  } finally {
    isCommentsLoading.value = false
  }
}

async function toggleLike() {
  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  if (isDummyPost.value) {
    post.value = {
      ...post.value,
      is_liked: !post.value.is_liked,
      like_count: Math.max(0, (post.value.like_count ?? 0) + (post.value.is_liked ? -1 : 1)),
    }
    return
  }

  isLikeSubmitting.value = true

  try {
    const response = post.value.is_liked
      ? await communityApi.unlikePost(postId.value)
      : await communityApi.likePost(postId.value)

    post.value = {
      ...post.value,
      is_liked: response?.is_liked ?? !post.value.is_liked,
      like_count: response?.like_count ?? post.value.like_count,
    }
  } catch (error) {
    window.alert(error?.message || '추천 처리에 실패했습니다.')
  } finally {
    isLikeSubmitting.value = false
  }
}

async function deletePost() {
  if (!post.value) return
  if (!window.confirm(`'${post.value.title}' 게시글을 삭제할까요?`)) return

  try {
    await communityApi.deletePost(postId.value)
    router.push('/community')
  } catch (error) {
    window.alert(error?.message || '게시글 삭제에 실패했습니다.')
  }
}

function openRootComposer() {
  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  activeReplyId.value = null
  replyInput.value = ''
  commentSubmitError.value = ''
  isRootComposerOpen.value = true
}

function cancelRootComment() {
  rootCommentInput.value = ''
  commentSubmitError.value = ''
  isRootComposerOpen.value = false
}

async function createRootComment() {
  commentSubmitError.value = ''

  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  if (!rootCommentInput.value) {
    commentSubmitError.value = '댓글 내용을 입력해 주세요.'
    return
  }

  isCommentSubmitting.value = true

  try {
    await communityApi.createComment(postId.value, {
      content: rootCommentInput.value,
      parent_id: null,
    })
    rootCommentInput.value = ''
    isRootComposerOpen.value = false
    await loadComments()
    await loadPost()
  } catch (error) {
    commentSubmitError.value = error?.message || '댓글 등록에 실패했습니다.'
  } finally {
    isCommentSubmitting.value = false
  }
}

function startReply(comment) {
  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  isRootComposerOpen.value = false
  rootCommentInput.value = ''
  commentSubmitError.value = ''
  activeReplyId.value = activeReplyId.value === comment.id ? null : comment.id
  replyInput.value = ''
}

function cancelReply() {
  activeReplyId.value = null
  replyInput.value = ''
  commentSubmitError.value = ''
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/community')
}

async function createReply(comment) {
  commentSubmitError.value = ''

  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  if (!replyInput.value) {
    commentSubmitError.value = '답글 내용을 입력해 주세요.'
    return
  }

  isCommentSubmitting.value = true

  try {
    await communityApi.createComment(postId.value, {
      content: replyInput.value,
      parent_id: comment.id,
    })
    replyInput.value = ''
    activeReplyId.value = null
    await loadComments()
    await loadPost()
  } catch (error) {
    commentSubmitError.value = error?.message || '답글 등록에 실패했습니다.'
  } finally {
    isCommentSubmitting.value = false
  }
}

async function editComment(comment) {
  const content = window.prompt('댓글 내용을 수정해 주세요.', comment.content)
  const normalizedContent = content?.trim()

  if (!normalizedContent || normalizedContent === comment.content) return

  try {
    await communityApi.updateComment(comment.id, { content: normalizedContent })
    await loadComments()
  } catch (error) {
    window.alert(error?.message || '댓글 수정에 실패했습니다.')
  }
}

async function deleteComment(comment) {
  if (!window.confirm('댓글을 삭제할까요?')) return

  try {
    await communityApi.deleteComment(comment.id)
    await loadComments()
    await loadPost()
  } catch (error) {
    window.alert(error?.message || '댓글 삭제에 실패했습니다.')
  }
}

function canManageComment(comment) {
  return currentUser.value?.id === comment?.author?.id
}

function redirectToLogin() {
  router.push({
    path: '/login',
    query: { redirect_to: route.fullPath },
  })
}

function formatAuthor(author) {
  return author?.username ? author.username : '작성자 알 수 없음'
}

function getAuthorInitial(author) {
  const name = author?.value?.username ?? author?.username
  return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

function normalizeComments(commentList) {
  return [...commentList]
    .sort(compareByCreatedAt)
    .map((comment) => ({
      ...comment,
      replies: Array.isArray(comment.replies)
        ? [...comment.replies].sort(compareByCreatedAt)
        : [],
    }))
}

function compareByCreatedAt(a, b) {
  return new Date(a.created_at || 0) - new Date(b.created_at || 0)
}

function formatRelativeTime(value) {
  if (!value) return ''

  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (diffSeconds < 60) return '방금'

  const units = [
    { label: '년', seconds: 31536000 },
    { label: '개월', seconds: 2592000 },
    { label: '주', seconds: 604800 },
    { label: '일', seconds: 86400 },
    { label: '시간', seconds: 3600 },
    { label: '분', seconds: 60 },
  ]
  const unit = units.find((item) => diffSeconds >= item.seconds)
  return `${Math.floor(diffSeconds / unit.seconds)}${unit.label} 전`
}
</script>

<style scoped>
.post-detail {
  display: grid;
  gap: 12px;
  margin: 0 auto;
  width: min(100%, 1280px);
  padding: 28px 24px 56px;
  animation: np-fade 0.3s ease both;
}

@media (max-width: 640px) {
  .post-detail {
    padding: 20px 16px 40px;
  }
}

.detail-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-back {
  justify-self: start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6b736d;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.detail-back:hover {
  color: #1a221e;
}

.thread-section {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
  overflow: hidden;
}

/* Thread item grid */
.thread-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #eef0ec;
}

.thread-item--reply {
  padding-left: 16px;
}

/* Rail (avatar + line) */
.thread-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 100%;
}

.thread-rail--indent {
  padding-left: 8px;
}

.thread-avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-brand-50);
  color: var(--color-brand);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.thread-avatar--lg {
  width: 44px;
  height: 44px;
  font-size: 16px;
}

.thread-avatar--sm {
  width: 36px;
  height: 36px;
  font-size: 13px;
}

.thread-line {
  width: 2px;
  flex: 1;
  min-height: 8px;
  background: #eef0ec;
  border-radius: 99px;
}

/* Content */
.thread-content {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.thread-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.thread-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.thread-username {
  font-size: 14.5px;
  font-weight: 700;
  color: #1a221e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-time {
  flex-shrink: 0;
  font-size: 12.5px;
  color: #9aa19b;
}

.thread-manage {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}

.thread-body {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.7;
  color: #2d352f;
  word-break: break-word;
  white-space: pre-wrap;
}

.thread-reactions-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9aa19b;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 150ms;
}

.reaction-btn:hover {
  color: var(--color-brand);
}

.reaction-btn--liked,
.reaction-btn--liked:hover {
  color: #e04040;
}

.reaction-btn:disabled {
  cursor: wait;
  opacity: 0.55;
}

.reaction-btn--danger {
  color: #c44444;
}

.reaction-btn--danger:hover {
  color: #8f2f23;
}

.reaction-btn svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.reaction-btn svg.is-filled {
  fill: currentColor;
  stroke: currentColor;
}

.thread-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
}

.thread-footer-label {
  font-size: 12.5px;
  color: #9aa19b;
  font-weight: 500;
}

.thread-footer-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #9aa19b;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: color 150ms;
}

.thread-footer-btn:hover {
  color: #1a221e;
}

/* Reply form */
.reply-form {
  display: grid;
  gap: 10px;
  padding-top: 8px;
}

.reply-form--root {
  padding-top: 0;
}

.reply-form__textarea {
  display: block;
  width: 100%;
  min-height: 86px;
  padding: 12px 14px;
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 14.5px;
  line-height: 1.6;
  color: #2d352f;
  resize: vertical;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}

.reply-form__textarea:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.reply-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.reply-form__cancel-btn {
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid #d4dad4;
  border-radius: 9px;
  background: transparent;
  color: #5a625b;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 150ms;
}

.reply-form__cancel-btn:hover {
  border-color: #a8b2a6;
}

.reply-form__submit-btn {
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 9px;
  background: var(--color-brand);
  color: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
}

.reply-form__submit-btn:hover:not(:disabled) {
  background: var(--color-brand-strong);
}

.reply-form__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Root comment trigger */
.root-composer {
  padding: 16px 20px;
  border-top: 1px solid #eef0ec;
}

.root-composer__trigger {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 4px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.root-composer__placeholder {
  font: inherit;
  font-size: 14px;
  color: #9aa19b;
  text-align: left;
}

.root-composer__trigger:hover .root-composer__placeholder {
  color: #1a221e;
}

.fallback-notice {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid var(--color-warning-border);
  border-radius: 8px;
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
  font-size: 13px;
}
</style>
