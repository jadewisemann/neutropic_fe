<template>
  <AdminLayout title="게시글 관리">
    <LoadingState v-if="isLoading" label="게시글 목록을 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="게시글 목록을 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadPosts">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <EmptyState v-else-if="posts.length === 0" title="게시글이 없습니다" />

    <AdminTablePanel v-else title="게시글 목록" description="게시글을 조회하고 운영 정책에 따라 삭제할 수 있습니다." title-id="posts-title">
      <table>
        <thead>
          <tr>
            <th scope="col">제목</th>
            <th scope="col">작성자</th>
            <th scope="col">댓글</th>
            <th scope="col">추천</th>
            <th scope="col">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td>
              <RouterLink :to="`/community/${post.id}`">{{ post.title || '-' }}</RouterLink>
              <span>{{ formatDate(post.created_at) }}</span>
            </td>
            <td>{{ post.author?.username || '-' }}</td>
            <td>{{ post.comment_count ?? 0 }}</td>
            <td>{{ post.like_count ?? 0 }}</td>
            <td>
              <BaseButton size="sm" variant="danger" :disabled="deletingPostId === post.id" @click="deletePost(post)">
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

const posts = ref([])
const isLoading = ref(true)
const loadError = ref('')
const deletingPostId = ref(null)

onMounted(loadPosts)

async function loadPosts() {
  isLoading.value = true
  loadError.value = ''

  try {
    posts.value = normalizeList(await adminApi.listPosts())
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function deletePost(post) {
  if (!window.confirm('게시글을 삭제할까요?')) return

  deletingPostId.value = post.id

  try {
    await adminApi.deletePost(post.id)
    posts.value = posts.value.filter((item) => item.id !== post.id)
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    deletingPostId.value = null
  }
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  return response?.results || response?.items || response?.data || []
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
  min-width: 640px;
}

th,
td {
  padding: 12px;
  border-top: 1px solid #edf2ef;
  text-align: left;
}

th {
  color: #5b6b65;
  font-size: 0.875rem;
}

td span {
  display: block;
  margin-top: 4px;
  color: #5b6b65;
  font-size: 0.875rem;
}

a {
  color: #165a46;
  font-weight: 700;
}
</style>
