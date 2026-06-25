<template>
  <div class="community-form-page" :aria-labelledby="titleId">
    <RouterLink class="form-back-link" to="/community">← 커뮤니티</RouterLink>
    <header class="community-form-page__header">
      <h1 :id="titleId">{{ title }}</h1>
      <p>게시글 작성과 수정은 로그인 상태에서만 가능합니다.</p>
    </header>

    <form class="form-card" :aria-label="title + ' 폼'" @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-field__label" for="community-content">내용</label>
        <textarea
          id="community-content"
          v-model.trim="form.content"
          class="auth-field__textarea"
          rows="10"
          name="content"
          placeholder="건강 고민이나 영양제 경험을 공유하세요."
          :disabled="isSubmitting"
        />
      </div>
      <FormErrorMessage :message="errorMessage" />
      <div class="form-card__actions">
        <RouterLink class="form-card__cancel" to="/community">취소</RouterLink>
        <button class="auth-submit" type="submit" :disabled="isSubmitting || !form.content">
          {{ isSubmitting ? '처리 중…' : submitLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { FormErrorMessage } from '../../../shared/components'

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
  content: '',
})

const titleId = computed(() => `community-form-${props.title.replace(/\s+/g, '-').toLowerCase()}`)

watch(
  () => props.initialPost,
  (post) => {
    form.content = post?.content || ''
  },
  { immediate: true },
)

function handleSubmit() {
  emit('submit', {
    title: buildGeneratedTitle(form.content),
    content: form.content,
  })
}

function buildGeneratedTitle(content) {
  const normalized = content || String(Date.now())
  const hash = Math.abs([...normalized].reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0))
    .toString(36)
    .slice(0, 6)
  return `community-${hash}`
}
</script>

<style scoped>
.community-form-page {
  display: grid;
  gap: 12px;
  margin: 0 auto;
  width: min(100%, 640px);
  padding: 28px 20px 56px;
  animation: np-fade 0.3s ease both;
}

.form-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b736d;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.form-back-link:hover {
  color: #1a221e;
  text-decoration: none;
}

.community-form-page__header h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #1a221e;
}

.community-form-page__header p {
  margin: 0;
  color: #6b736d;
  font-size: 13.5px;
  line-height: 1.5;
}

.form-card {
  display: grid;
  gap: 14px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
}

.auth-field {
  display: grid;
  gap: 7px;
}

.auth-field__label {
  font-size: 13px;
  font-weight: 600;
  color: #5a625b;
}

.auth-field__textarea {
  width: 100%;
  padding: 14px;
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 14.5px;
  color: #2d352f;
  outline: none;
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
  transition: border-color 150ms, box-shadow 150ms;
}

.auth-field__textarea:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.auth-field__textarea::placeholder {
  color: #9aa19b;
}

.form-card__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.form-card__cancel {
  height: 46px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  border: 1.5px solid #d4dad4;
  border-radius: 10px;
  color: #5a625b;
  font-size: 14.5px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 150ms;
}

.form-card__cancel:hover {
  border-color: #a8b2a6;
  text-decoration: none;
}

.auth-submit {
  height: 46px;
  padding: 0 22px;
  border: none;
  border-radius: 10px;
  background: var(--color-brand);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
}

.auth-submit:hover:not(:disabled) {
  background: var(--color-brand-strong);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
