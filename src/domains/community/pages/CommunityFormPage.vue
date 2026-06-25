<template>
  <section class="community-form-page" :aria-labelledby="titleId">
    <header>
      <p>커뮤니티</p>
      <h1 :id="titleId">{{ title }}</h1>
      <span>게시글 작성과 수정은 로그인 상태에서만 가능합니다.</span>
    </header>

    <BaseForm aria-label="커뮤니티 게시글 폼" @submit.prevent="handleSubmit">
      <FormField label="제목">
        <input
          v-model.trim="form.title"
          class="form-control"
          type="text"
          name="title"
          placeholder="제목을 입력하세요"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="내용">
        <textarea
          v-model.trim="form.content"
          class="form-control"
          rows="10"
          name="content"
          placeholder="건강 고민이나 영양제 경험을 공유하세요."
          :disabled="isSubmitting"
        />
      </FormField>
      <FormErrorMessage :message="errorMessage" />
      <FormActions>
        <BaseButton variant="primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '처리 중' : submitLabel }}
        </BaseButton>
        <BaseButton to="/community">취소</BaseButton>
      </FormActions>
    </BaseForm>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseForm, FormActions, FormErrorMessage, FormField } from '../../../shared/components'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  submitLabel: {
    type: String,
    required: true,
  },
  initialPost: {
    type: Object,
    default: null,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  content: '',
})

const titleId = computed(() => `community-form-${props.title.replace(/\s+/g, '-').toLowerCase()}`)

watch(
  () => props.initialPost,
  (post) => {
    form.title = post?.title || ''
    form.content = post?.content || ''
  },
  { immediate: true },
)

function handleSubmit() {
  emit('submit', {
    title: form.title,
    content: form.content,
  })
}
</script>

<style scoped>
.community-form-page {
  display: grid;
  gap: var(--space-5);
  margin: 0 auto;
  width: min(100%, 680px);
}

.community-form-page header p {
  margin: 0 0 var(--space-2);
  color: var(--color-brand-muted);
  font-size: 13px;
  font-weight: 800;
}

.community-form-page header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0;
}

.community-form-page header span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

</style>
