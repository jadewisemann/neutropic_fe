<template>
  <AuthLayout
    title="로그인"
    description="리포트와 추천 기록은 로그인 후 저장됩니다."
  >
    <div class="auth-form">
      <div class="auth-field">
        <label class="auth-field__label">이메일</label>
        <input
          v-model.trim="form.login_id"
          class="auth-field__input"
          type="text"
          name="login_id"
          autocomplete="username"
          placeholder="hello@neutripic.app"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-field">
        <label class="auth-field__label">비밀번호</label>
        <input
          v-model="form.password"
          class="auth-field__input"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :disabled="isSubmitting"
        />
      </div>
      <FormErrorMessage :message="errorMessage" />
      <button class="auth-submit" type="button" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? '로그인 중' : '로그인' }}
      </button>
    </div>

    <p class="auth-link">
      계정이 없으신가요?
      <RouterLink :to="signupLink">회원가입</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, authTokenStorage } from '../../../shared/api'
import { AuthLayout, FormErrorMessage } from '../../../shared/components'

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
    errorMessage.value = '이메일과 비밀번호를 입력해 주세요.'
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
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-field {
  display: flex;
  flex-direction: column;
}

.auth-field__label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: #3a423d;
  margin-bottom: 7px;
  line-height: 1;
}

.auth-field__input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  font: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
  background: #fff;
  color: #2d352f;
}

.auth-field__input::placeholder {
  color: #9aa19b;
}

.auth-field__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.auth-submit {
  width: 100%;
  height: 48px;
  margin-top: 4px;
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
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-link {
  margin: 20px 0 0;
  text-align: center;
  color: #6b736d;
  font-size: 13.5px;
}

.auth-link a {
  color: var(--color-brand);
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>
