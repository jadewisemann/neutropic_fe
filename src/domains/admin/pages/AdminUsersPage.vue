<template>
  <AdminLayout title="회원 관리">
    <LoadingState v-if="isLoading" label="회원 목록을 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="회원 목록을 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadUsers">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <EmptyState v-else-if="users.length === 0" title="회원이 없습니다" />

    <AdminTablePanel v-else title="회원 목록" description="회원 상태와 기본 정보를 확인합니다." title-id="users-title">
      <table>
        <thead>
          <tr>
            <th scope="col">회원</th>
            <th scope="col">나이 / 성별</th>
            <th scope="col">상태</th>
            <th scope="col">가입일</th>
            <th scope="col">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <strong>{{ user.username || '-' }}</strong>
              <span>{{ user.email || '-' }}</span>
            </td>
            <td>{{ user.age || '-' }} / {{ formatGender(user.gender) }}</td>
            <td>{{ user.is_active === false ? '비활성' : '활성' }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <BaseButton size="sm" :disabled="updatingUserId === user.id" @click="toggleUserActive(user)">
                {{ user.is_active === false ? '활성화' : '비활성화' }}
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

const users = ref([])
const isLoading = ref(true)
const loadError = ref('')
const updatingUserId = ref(null)

onMounted(loadUsers)

async function loadUsers() {
  isLoading.value = true
  loadError.value = ''

  try {
    users.value = normalizeList(await adminApi.listUsers())
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function toggleUserActive(user) {
  updatingUserId.value = user.id

  try {
    const updatedUser = await adminApi.updateUser(user.id, { is_active: user.is_active === false })
    users.value = users.value.map((item) => (item.id === user.id ? { ...item, ...updatedUser } : item))
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    updatingUserId.value = null
  }
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  return response?.results || response?.items || response?.data || []
}

function formatGender(value) {
  return { female: '여성', male: '남성', other: '기타' }[value] || '-'
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
  min-width: 680px;
}

th,
td {
  padding: 12px;
  border-top: 1px solid #edf2ef;
  text-align: left;
}

td span {
  display: block;
  margin-top: 4px;
  color: #5b6b65;
  font-size: 0.875rem;
}

th {
  color: #5b6b65;
  font-size: 0.875rem;
}
</style>
