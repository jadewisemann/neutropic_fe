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
          <div class="post-detail__actions">
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

        <section class="thread" aria-labelledby="post-title">
          <article class="main-thread-item">
            <div class="thread2">
              <div class="profile">
                <div class="image" aria-hidden="true">{{ getAuthorInitial(post.author) }}</div>
                <div class="frame-2" aria-hidden="true"></div>
              </div>
              <div class="frame-8">
                <div class="name">
                  <div class="frame-7">
                    <div class="user-name">{{ formatAuthor(post.author) }}</div>
                    <div class="_16-h">{{ formatRelativeTime(post.created_at) }}</div>
                  </div>
                  <div class="post-menu">
                    <BaseButton v-if="canManagePost" size="sm" :to="`/community/${postId}/edit`">수정</BaseButton>
                    <BaseButton v-if="canManagePost" size="sm" variant="danger" @click="deletePost">삭제</BaseButton>
                  </div>
                </div>
              </div>
            </div>
            <div class="message">
              <div class="text">
                <h1 id="post-title">{{ post.title }}</h1>
                <p>{{ post.content }}</p>
              </div>
              <div class="actions">
                <button class="thread-reactions" type="button" aria-label="추천" :disabled="isLikeSubmitting" @click="toggleLike">
                  <svg aria-hidden="true" viewBox="0 0 24 24" :class="{ 'is-filled': post.is_liked }">
                    <path d="M20.8 4.6c-1.9-1.8-4.9-1.8-6.8.1L12 6.7 10 4.7C8.1 2.8 5.1 2.8 3.2 4.6 1.1 6.7 1.1 10 3.1 12l8.2 8.1c.4.4 1 .4 1.4 0l8.2-8.1c2-2 2-5.3-.1-7.4Z" />
                  </svg>
                  <span>{{ post.like_count ?? 0 }}</span>
                </button>
                <button class="thread-reactions2" type="button" aria-label="댓글" @click="openRootComposer">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" />
                  </svg>
                  <span>{{ post.comment_count ?? 0 }}</span>
                </button>
              </div>
            </div>
            <div class="reply">
              <div class="replies">{{ post.comment_count ?? comments.length }} replies</div>
              <button class="frame-10" type="button" @click="openRootComposer">
                <span class="view-activity">Reply</span>
                <span class="caret-right" aria-hidden="true">›</span>
              </button>
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
              <article class="reply-thread-item">
                <div class="frame-14">
                  <div class="profile2">
                    <div class="image" aria-hidden="true">{{ getAuthorInitial(comment.author) }}</div>
                    <div class="frame-22" aria-hidden="true"></div>
                  </div>
                  <div v-if="comment.replies?.length || activeReplyId === comment.id" class="frame-13" aria-hidden="true">
                    <div class="rectangle-8"></div>
                  </div>
                </div>
                <div class="frame-82">
                  <div class="name">
                    <div class="frame-7">
                      <div class="user-name">{{ formatAuthor(comment.author) }}</div>
                      <div class="_16-h">{{ formatRelativeTime(comment.created_at) }}</div>
                    </div>
                  </div>
                  <div class="message">
                    <div class="text2">
                      <p>{{ comment.content }}</p>
                    </div>
                    <div class="actions2">
                      <button class="thread-reactions2" type="button" aria-label="답글" @click="startReply(comment)">
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" />
                        </svg>
                        <span>답글</span>
                      </button>
                      <button v-if="canManageComment(comment)" class="thread-reactions" type="button" @click="editComment(comment)">수정</button>
                      <button
                        v-if="canManageComment(comment)"
                        class="thread-reactions thread-reactions--danger"
                        type="button"
                        @click="deleteComment(comment)"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <form
                    v-if="activeReplyId === comment.id"
                    class="expanded-reply-input"
                    aria-label="답글 작성"
                    @submit.prevent="createReply(comment)"
                  >
                    <textarea
                      v-model.trim="replyInput"
                      rows="3"
                      :placeholder="`${formatAuthor(comment.author)}님에게 답글 달기`"
                      :disabled="isCommentSubmitting"
                    />
                    <FormErrorMessage :message="commentSubmitError" />
                    <div class="expanded-reply-input__actions">
                      <BaseButton size="sm" type="button" @click="cancelReply">취소</BaseButton>
                      <BaseButton size="sm" type="submit" :disabled="isCommentSubmitting">
                        {{ isCommentSubmitting ? '게시 중' : '답글 게시' }}
                      </BaseButton>
                    </div>
                  </form>
                </div>
              </article>

              <article
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-thread-item2"
              >
                <div class="frame-142">
                  <div class="profile2">
                    <div class="image" aria-hidden="true">{{ getAuthorInitial(reply.author) }}</div>
                    <div class="frame-23" aria-hidden="true"></div>
                  </div>
                </div>
                <div class="frame-82">
                  <div class="name">
                    <div class="frame-7">
                      <div class="user-name">{{ formatAuthor(reply.author) }}</div>
                      <div class="_16-h">{{ formatRelativeTime(reply.created_at) }}</div>
                    </div>
                  </div>
                  <div class="message">
                    <div class="text2">
                      <p>{{ reply.content }}</p>
                    </div>
                    <div class="actions2">
                      <button v-if="canManageComment(reply)" class="thread-reactions" type="button" @click="editComment(reply)">수정</button>
                      <button
                        v-if="canManageComment(reply)"
                        class="thread-reactions thread-reactions--danger"
                        type="button"
                        @click="deleteComment(reply)"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </template>
          </template>

          <div v-if="!isCommentsLoading && !commentsError" class="reply-input">
            <button v-if="!isRootComposerOpen" class="input" type="button" @click="openRootComposer">
              <div class="frame-17">
                <div class="frame-15">
                  <div class="ellipse-3"></div>
                  <div class="mask-group">{{ getAuthorInitial(currentUser) }}</div>
                  <div class="ellipse-4"></div>
                </div>
              </div>
              <span class="reply-to-babda">Reply to {{ formatAuthor(post.author) }}...</span>
            </button>
            <form v-else class="expanded-reply-input expanded-reply-input--root" aria-label="댓글 작성" @submit.prevent="createRootComment">
              <textarea
                v-model.trim="rootCommentInput"
                rows="3"
                :placeholder="commentPlaceholder"
                :disabled="isCommentSubmitting"
              />
              <FormErrorMessage :message="commentSubmitError" />
              <div class="expanded-reply-input__actions">
                <BaseButton size="sm" type="button" @click="cancelRootComment">취소</BaseButton>
                <BaseButton size="sm" type="submit" :disabled="isCommentSubmitting">
                  {{ isCommentSubmitting ? '게시 중' : '게시' }}
                </BaseButton>
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
  if (diffSeconds < 60) return 'now'

  const units = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]
  const unit = units.find((item) => diffSeconds >= item.seconds)
  return `${Math.floor(diffSeconds / unit.seconds)}${unit.label}`
}

</script>

<style scoped>
.post-detail {
  display: grid;
  gap: var(--space-4);
  margin: 0 auto;
  width: min(100%, 680px);
}

.post-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.detail-back {
  justify-self: start;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
}

.detail-back:hover {
  color: var(--color-text);
}

.detail-back:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.thread-reactions svg,
.thread-reactions2 svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.thread-reactions svg.is-filled {
  fill: currentColor;
  stroke: currentColor;
}

.thread {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
  background: transparent;
}

.main-thread-item,
.reply-thread-item,
.reply-thread-item2,
.reply-input {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  column-gap: var(--space-3);
}

.main-thread-item {
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-border);
}

.thread2 {
  display: contents;
}

.profile,
.frame-14,
.frame-142,
.frame-17 {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.profile2,
.frame-15 {
  position: relative;
  display: flex;
  justify-content: center;
}

.image,
.mask-group {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-blue-200);
  color: var(--color-blue-700);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
}

.profile2 .image,
.mask-group {
  width: 36px;
  height: 36px;
  font-size: 13px;
}

.frame-2,
.frame-13 {
  display: flex;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 18px;
  padding-top: var(--space-2);
}

.frame-2::before,
.rectangle-8 {
  display: block;
  width: 1px;
  height: 100%;
  min-height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  content: '';
}

.frame-8,
.frame-82 {
  grid-column: 2;
  min-width: 0;
}

.name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
}

.frame-7 {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}

.user-name {
  overflow: hidden;
  color: var(--color-text-soft);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._16-h {
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.4;
}

.post-menu {
  display: flex;
  flex: 0 0 auto;
  gap: var(--space-2);
}

.message {
  grid-column: 2;
  min-width: 0;
}

.text,
.text2 {
  min-width: 0;
}

.text h1 {
  margin: var(--space-1) 0 var(--space-2);
  color: var(--color-text);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
}

.text p,
.text2 p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-soft);
  font-size: 15px;
  line-height: 1.7;
  word-break: break-word;
}

.actions,
.actions2 {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-3);
}

.thread-reactions,
.thread-reactions2,
.frame-10 {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.thread-reactions:hover,
.thread-reactions2:hover,
.frame-10:hover {
  color: var(--color-brand);
}

.thread-reactions:disabled {
  cursor: wait;
  opacity: 0.55;
}

.thread-reactions--danger {
  color: var(--color-danger-text);
}

.thread-reactions--danger:hover {
  color: var(--color-danger-muted);
}

.reply {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.replies,
.view-activity,
.caret-right,
.reply-to-babda {
  color: var(--color-text-muted);
  font-size: 13px;
}

.reply-thread-item,
.reply-thread-item2 {
  padding-top: var(--space-5);
}

.reply-thread-item .message,
.reply-thread-item2 .message {
  margin-top: var(--space-1);
}

.reply-thread-item2 .frame-142 {
  min-height: auto;
}

.expanded-reply-input {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding: var(--space-3) 0 var(--space-1);
}

.expanded-reply-input--root {
  grid-column: 1 / -1;
  margin-top: 0;
  padding-top: 0;
}

.expanded-reply-input textarea {
  display: block;
  width: 100%;
  min-height: 92px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
}

.expanded-reply-input textarea:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: var(--focus-ring);
}

.expanded-reply-input__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.reply-input {
  align-items: center;
  margin-top: var(--space-5);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--color-border);
}

.reply-input .input {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  column-gap: var(--space-3);
  align-items: center;
  width: 100%;
  padding: var(--space-2) 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.reply-input .input:hover .reply-to-babda {
  color: var(--color-text);
}

.ellipse-3,
.ellipse-4 {
  position: absolute;
  right: -2px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--color-surface);
  border-radius: var(--radius-full);
  background: var(--color-brand);
}

.ellipse-3 {
  top: 1px;
}

.ellipse-4 {
  bottom: 1px;
}

.fallback-notice {
  margin: 0 0 var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--radius-sm);
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
  font-size: 13px;
}

@media (max-width: 560px) {
  .main-thread-item,
  .reply-thread-item,
  .reply-thread-item2,
  .reply-input .input {
    grid-template-columns: 40px minmax(0, 1fr);
    column-gap: var(--space-2);
  }

  .post-menu {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .text h1 {
    font-size: 20px;
  }
}
</style>
