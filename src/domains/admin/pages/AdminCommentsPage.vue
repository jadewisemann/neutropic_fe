<template>
  <AdminLayout title="댓글 관리">
    <LoadingState v-if="isLoading" label="댓글 목록을 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="댓글 목록을 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadComments">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <EmptyState v-else-if="comments.length === 0" title="댓글이 없습니다" />

    <AdminTablePanel v-else title="댓글과 답글 목록" description="게시글별 댓글과 답글을 확인하고 삭제 액션을 수행합니다." title-id="comments-title">
      <table>
        <thead>
          <tr>
            <th scope="col">내용</th>
            <th scope="col">게시글</th>
            <th scope="col">작성자</th>
            <th scope="col">작성일</th>
            <th scope="col">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.id">
            <td>{{ comment.content || '-' }}</td>
            <td>{{ getPostTitle(comment) }}</td>
            <td>{{ comment.author?.username || '-' }}</td>
            <td>{{ formatDate(comment.created_at) }}</td>
            <td>
              <BaseButton
                size="sm"
                variant="danger"
                :disabled="deletingCommentId === comment.id"
                @click="deleteComment(comment)"
              >
                삭제
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </AdminTablePanel>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '../../../shared/api'
import { AdminLayout, AdminTablePanel, BaseButton, EmptyState, ErrorState, LoadingState } from '../../../shared/components'

const comments = ref([])
const isLoading = ref(true)
const loadError = ref('')
const deletingCommentId = ref(null)

onMounted(loadComments)

async function loadComments() {
  isLoading.value = true
  loadError.value = ''

  try {
    comments.value = normalizeList(await adminApi.listComments())
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function deleteComment(comment) {
  if (!window.confirm('댓글을 삭제할까요?')) return

  deletingCommentId.value = comment.id

  try {
    await adminApi.deleteComment(comment.id)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    deletingCommentId.value = null
  }
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  return response?.results || response?.items || response?.data || []
}

function getPostTitle(comment) {
  return comment.post?.title || comment.post_title || '-'
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th,
td {
  padding: 12px;
  border-top: 1px solid #edf2ef;
  text-align: left;
  vertical-align: top;
}

th {
  color: #5b6b65;
  font-size: 0.875rem;
}
</style>
