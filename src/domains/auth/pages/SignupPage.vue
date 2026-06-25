<template>
  <AuthLayout
    title="회원가입"
    description="건강 정보는 리포트 생성에만 사용되며 안전하게 보관됩니다."
  >
    <div class="auth-form">
      <div class="auth-field">
        <label class="auth-field__label">닉네임</label>
        <input
          v-model.trim="form.username"
          class="auth-field__input"
          type="text"
          name="username"
          autocomplete="username"
          placeholder="건강한하루"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-field">
        <label class="auth-field__label">이메일</label>
        <input
          v-model.trim="form.email"
          class="auth-field__input"
          type="email"
          name="email"
          autocomplete="email"
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
          autocomplete="new-password"
          placeholder="8자 이상"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-field">
        <label class="auth-field__label">비밀번호 확인</label>
        <input
          v-model="form.passwordConfirm"
          class="auth-field__input"
          type="password"
          name="password_confirm"
          autocomplete="new-password"
          placeholder="비밀번호 확인"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-field">
        <label class="auth-field__label">나이</label>
        <input
          v-model.number="form.age"
          class="auth-field__input"
          type="number"
          name="age"
          min="14"
          max="120"
          placeholder="나이"
          :disabled="isSubmitting"
        />
      </div>
      <div class="auth-field">
        <label class="auth-field__label">성별</label>
        <select v-model="form.gender" class="auth-field__input auth-field__select" name="gender" :disabled="isSubmitting">
          <option value="">선택</option>
          <option value="female">여성</option>
          <option value="male">남성</option>
          <option value="other">기타 또는 응답하지 않음</option>
        </select>
      </div>
      <label class="auth-agree">
        <input v-model="agreed" type="checkbox" />
        건강 정보 처리 및 서비스 이용약관에 동의합니다.
      </label>
      <FormErrorMessage :message="errorMessage" />
      <button class="auth-submit" type="button" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? '가입 중' : '가입하고 시작하기' }}
      </button>
    </div>

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
import { AuthLayout, FormErrorMessage } from '../../../shared/components'

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
const agreed = ref(false)
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

  if (!agreed.value) {
    errorMessage.value = '이용약관에 동의해 주세요.'
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
  background: #fff;
  color: #2d352f;
  transition: border-color 150ms, box-shadow 150ms;
}

.auth-field__input::placeholder {
  color: #9aa19b;
}

.auth-field__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.auth-field__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238f8f8f' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.auth-agree {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 12.5px;
  line-height: 1.55;
  color: #6b736d;
  cursor: pointer;
}

.auth-agree input {
  margin-top: 2px;
  accent-color: var(--color-brand);
  flex-shrink: 0;
}

.auth-submit {
  width: 100%;
  height: 48px;
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
