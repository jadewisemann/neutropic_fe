<template>
  <AuthLayout
    title="로그인"
    eyebrow="다시 오신 것을 환영합니다"
    description="추천 설문, 리포트 저장, 리포트 기반 채팅은 로그인 후 이용할 수 있습니다."
  >
    <RedirectNotice />

    <BaseForm aria-label="로그인 폼" @submit.prevent="handleSubmit">
      <FormField label="아이디 또는 이메일">
        <input
          v-model.trim="form.login_id"
          class="form-control"
          type="text"
          name="login_id"
          autocomplete="username"
          placeholder="아이디 또는 이메일"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormField label="비밀번호">
        <input
          v-model="form.password"
          class="form-control"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="비밀번호"
          :disabled="isSubmitting"
        />
      </FormField>
      <FormErrorMessage :message="errorMessage" />
      <BaseButton class="auth-submit" variant="primary" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '로그인 중' : '로그인' }}
      </BaseButton>
    </BaseForm>

    <p class="auth-link">
      아직 계정이 없나요?
      <RouterLink :to="signupLink">회원가입</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, authTokenStorage } from '../../../shared/api'
import { AuthLayout, BaseButton, BaseForm, FormErrorMessage, FormField } from '../../../shared/components'

const RedirectNotice = {
  template: `
    <p class="redirect-notice">
      로그인 후 이전에 시도한 페이지로 돌아갈 수 있습니다.
    </p>
  `,
}

const route = useRoute()
const router = useRouter()
const form = reactive({
  login_id: '',
  password: '',
})
const errorMessage = ref('')
const isSubmitting = ref(false)
const redirectTo = computed(() => {
  const redirect = route.query.redirect_to

  if (typeof redirect !== 'string' || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/'
  }

  return redirect
})
const signupLink = computed(() => ({
  path: '/signup',
  query: redirectTo.value === '/' ? {} : { redirect_to: redirectTo.value },
}))

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.login_id || !form.password) {
    errorMessage.value = '아이디 또는 이메일과 비밀번호를 입력해 주세요.'
    return
  }

  isSubmitting.value = true

  try {
    const auth = await authApi.login({
      login_id: form.login_id,
      password: form.password,
    })

    authTokenStorage.setAuth(auth)
    router.push(redirectTo.value)
  } catch (error) {
    errorMessage.value = error?.message || '로그인에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.redirect-notice {
  margin: 0 0 var(--space-5);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--radius-sm);
  background: var(--color-blue-100);
  color: var(--color-text-soft);
  font-size: 14px;
  line-height: 1.5;
}

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
