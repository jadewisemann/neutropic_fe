<template>
  <AppLayout>
    <CommunityFormPage
      title="게시글 작성"
      submit-label="등록"
      :error-message="errorMessage"
      :is-submitting="isSubmitting"
      @submit="createPost"
    />
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { communityApi } from '../../../shared/api'
import { AppLayout } from '../../../shared/components'
import CommunityFormPage from './CommunityFormPage.vue'

const router = useRouter()
const errorMessage = ref('')
const isSubmitting = ref(false)

async function createPost(payload) {
  errorMessage.value = ''

  if (!payload.content) {
    errorMessage.value = '내용을 입력해 주세요.'
    return
  }

  isSubmitting.value = true

  try {
    const post = await communityApi.createPost(payload)
    router.push(`/community/${post.id}`)
  } catch (error) {
    errorMessage.value = error?.message || '게시글 등록에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
