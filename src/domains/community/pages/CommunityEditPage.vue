<template>
  <AppLayout>
    <section class="community-edit-page">
      <LoadingState v-if="isLoading" label="게시글을 불러오는 중입니다" />

      <ErrorState
        v-else-if="loadError"
        title="게시글을 불러오지 못했습니다"
        :description="loadError"
      >
        <template #action>
          <BaseButton size="sm" @click="loadPost">다시 시도</BaseButton>
        </template>
      </ErrorState>

      <CommunityFormPage
        v-else
        title="게시글 수정"
        submit-label="수정 완료"
        :initial-post="post"
        :error-message="errorMessage"
        :is-submitting="isSubmitting"
        @submit="updatePost"
      />
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { communityApi } from '../../../shared/api'
import { AppLayout, BaseButton, ErrorState, LoadingState } from '../../../shared/components'
import CommunityFormPage from './CommunityFormPage.vue'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')
const errorMessage = ref('')

const postId = computed(() => route.params.post_id)

onMounted(() => {
  loadPost()
})

async function loadPost() {
  isLoading.value = true
  loadError.value = ''

  try {
    post.value = await communityApi.getPost(postId.value)
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function updatePost(payload) {
  errorMessage.value = ''

  if (!payload.title || !payload.content) {
    errorMessage.value = '제목과 내용을 입력해 주세요.'
    return
  }

  isSubmitting.value = true

  try {
    await communityApi.updatePost(postId.value, payload)
    router.push(`/community/${postId.value}`)
  } catch (error) {
    errorMessage.value = error?.message || '게시글 수정에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.community-edit-page {
  display: grid;
  gap: 20px;
}
</style>
