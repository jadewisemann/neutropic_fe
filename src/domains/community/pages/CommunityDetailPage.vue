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

        <header class="post-detail__header">
          <p>{{ formatAuthor(post.author) }}</p>
          <h1 id="post-title">{{ post.title }}</h1>
          <span>
            {{ formatDate(post.created_at) }} · 추천 {{ post.like_count ?? 0 }} · 댓글 {{ post.comment_count ?? 0 }}
          </span>
        </header>

        <section class="post-detail__body">
          <p>{{ post.content }}</p>
        </section>

        <div class="post-detail__actions">
          <BaseButton :disabled="isLikeSubmitting" @click="toggleLike">
            {{ post.is_liked ? '추천 취소' : '추천' }}
          </BaseButton>
          <BaseButton v-if="canManagePost" :to="`/community/${postId}/edit`">수정</BaseButton>
          <BaseButton v-if="canManagePost" variant="danger" @click="deletePost">삭제</BaseButton>
          <BaseButton to="/community">목록</BaseButton>
        </div>

        <section class="comments" aria-labelledby="comments-title">
          <h2 id="comments-title">댓글</h2>

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

          <div v-else class="comment-list">
            <article v-for="comment in comments" :key="comment.id" class="comment">
              <p>{{ comment.content }}</p>
              <span>{{ formatAuthor(comment.author) }} · {{ formatDate(comment.created_at) }}</span>
              <div class="comment__actions">
                <BaseButton size="sm" @click="startReply(comment)">답글</BaseButton>
                <BaseButton v-if="canManageComment(comment)" size="sm" @click="editComment(comment)">수정</BaseButton>
                <BaseButton
                  v-if="canManageComment(comment)"
                  size="sm"
                  variant="danger"
                  @click="deleteComment(comment)"
                >
                  삭제
                </BaseButton>
              </div>

              <div v-if="comment.replies?.length" class="reply-list">
                <article v-for="reply in comment.replies" :key="reply.id" class="comment comment--reply">
                  <p>{{ reply.content }}</p>
                  <span>{{ formatAuthor(reply.author) }} · {{ formatDate(reply.created_at) }}</span>
                  <div class="comment__actions">
                    <BaseButton v-if="canManageComment(reply)" size="sm" @click="editComment(reply)">수정</BaseButton>
                    <BaseButton
                      v-if="canManageComment(reply)"
                      size="sm"
                      variant="danger"
                      @click="deleteComment(reply)"
                    >
                      삭제
                    </BaseButton>
                  </div>
                </article>
              </div>
            </article>
          </div>

          <form class="comment-form" aria-label="댓글 작성" @submit.prevent="createComment">
            <p v-if="replyParent" class="reply-target">
              {{ formatAuthor(replyParent.author) }}님에게 답글 작성 중
              <button type="button" @click="cancelReply">취소</button>
            </p>
            <textarea
              v-model.trim="commentInput"
              class="form-control"
              rows="4"
              :placeholder="isAuthenticated ? '댓글을 입력해 주세요.' : '로그인 후 댓글을 작성할 수 있습니다.'"
              :disabled="isCommentSubmitting"
            />
            <FormErrorMessage :message="commentSubmitError" />
            <BaseButton size="sm" type="submit" :disabled="isCommentSubmitting">
              {{ isCommentSubmitting ? '등록 중' : '댓글 작성' }}
            </BaseButton>
          </form>
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
const commentInput = ref('')
const replyParent = ref(null)
const isDummyPost = ref(false)

const postId = computed(() => route.params.post_id)
const currentUser = computed(() => authTokenStorage.getUser())
const isAuthenticated = computed(() => Boolean(authTokenStorage.getAccessToken()))
const canManagePost = computed(() => currentUser.value?.id === post.value?.author?.id)

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
    comments.value = Array.isArray(response?.results)
      ? response.results
      : Array.isArray(response)
        ? response
        : []
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

async function createComment() {
  commentSubmitError.value = ''

  if (!isAuthenticated.value) {
    redirectToLogin()
    return
  }

  if (!commentInput.value) {
    commentSubmitError.value = '댓글 내용을 입력해 주세요.'
    return
  }

  isCommentSubmitting.value = true

  try {
    await communityApi.createComment(postId.value, {
      content: commentInput.value,
      parent_id: replyParent.value?.id ?? null,
    })
    commentInput.value = ''
    replyParent.value = null
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

  replyParent.value = comment
}

function cancelReply() {
  replyParent.value = null
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

function formatDate(value) {
  if (!value) return '작성일 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.post-detail {
  display: grid;
  gap: var(--space-5);
  margin: 0 auto;
  width: min(100%, 680px);
}

.post-detail__header,
.post-detail__body,
.comments {
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.post-detail__header p {
  margin: 0 0 var(--space-2);
  color: var(--color-text-soft);
  font-size: 14px;
  font-weight: 600;
}

.post-detail__header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: 24px;
  line-height: 1.35;
  letter-spacing: 0;
}

.post-detail__header span,
.comment span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: 13px;
}

.post-detail__body p,
.comment p {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.post-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.comments {
  display: grid;
  gap: var(--space-4);
}

.comments h2 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
}

.comment {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.comment-list,
.reply-list {
  display: grid;
  gap: var(--space-3);
}

.reply-list {
  margin-top: var(--space-3);
  padding-left: var(--space-4);
  border-left: 1px solid var(--color-border);
}

.comment--reply {
  border-bottom: 0;
}

.comment__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.comment-form {
  display: grid;
  gap: var(--space-3);
}

.reply-target {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.reply-target button {
  border: 0;
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.comment-form .form-control {
  width: 100%;
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
</style>
