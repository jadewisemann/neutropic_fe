<template>
  <AuthLayout
    title="회원가입"
    eyebrow="리포트 저장을 위한 계정 생성"
    description="기본 정보는 성분 추천 조건과 추천 기록 관리에 사용됩니다."
  >
    <BaseForm aria-label="회원가입 폼" @submit.prevent="handleSubmit">
      <FormField label="이메일">
        <input
          v-model.trim="form.email"
          class="form-control"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="이메일"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="사용자 이름">
        <input
          v-model.trim="form.username"
          class="form-control"
          type="text"
          name="username"
          autocomplete="username"
          placeholder="사용자 이름"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="비밀번호">
        <input
          v-model="form.password"
          class="form-control"
          type="password"
          name="password"
          autocomplete="new-password"
          placeholder="비밀번호"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="비밀번호 확인">
        <input
          v-model="form.passwordConfirm"
          class="form-control"
          type="password"
          name="password_confirm"
          autocomplete="new-password"
          placeholder="비밀번호 확인"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="나이">
        <input
          v-model.number="form.age"
          class="form-control"
          type="number"
          name="age"
          min="14"
          max="120"
          placeholder="나이"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="성별">
        <select v-model="form.gender" class="form-control" name="gender" :disabled="isSubmitting">
          <option value="">선택</option>
          <option value="female">여성</option>
          <option value="male">남성</option>
          <option value="other">기타 또는 응답하지 않음</option>
        </select>
      </FormField>
      <FormErrorMessage :message="errorMessage" />
      <BaseButton class="auth-submit" variant="primary" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '가입 중' : '회원가입' }}
      </BaseButton>
    </BaseForm>

    <p class="auth-link">
      이미 계정이 있나요?
      <RouterLink :to="loginLink">로그인</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../../../shared/api'
import { AuthLayout, BaseButton, BaseForm, FormErrorMessage, FormField } from '../../../shared/components'

const route = useRoute()
const router = useRouter()
const form = reactive({
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
  age: '',
  gender: '',
})
const errorMessage = ref('')
const isSubmitting = ref(false)
const redirectTo = computed(() => {
  const redirect = route.query.redirect_to

  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/survey'
  }

  return redirect
})
const loginLink = computed(() => ({
  path: '/login',
  query: { redirect_to: redirectTo.value },
}))

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email || !form.username || !form.password || !form.age || !form.gender) {
    errorMessage.value = '필수 정보를 모두 입력해 주세요.'
    return
  }

  if (form.password !== form.passwordConfirm) {
    errorMessage.value = '비밀번호 확인이 일치하지 않습니다.'
    return
  }

  isSubmitting.value = true

  try {
    await authApi.signup({
      email: form.email,
      username: form.username,
      password: form.password,
      age: form.age,
      gender: form.gender,
    })

    router.push({
      path: '/login',
      query: { redirect_to: redirectTo.value },
    })
  } catch (error) {
    errorMessage.value = error?.message || '회원가입에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-submit {
  width: 100%;
}

.auth-link {
  margin: var(--space-5) 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.auth-link a {
  color: var(--color-brand);
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
