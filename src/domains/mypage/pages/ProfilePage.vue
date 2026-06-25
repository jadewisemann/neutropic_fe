<template>
  <AppLayout>
    <div class="profile-page">
      <header class="profile-page__header">
        <RouterLink class="profile-back-link" to="/mypage">← 마이페이지</RouterLink>
        <h1>회원 정보 수정</h1>
        <p>나이·성별 등 건강 정보를 업데이트할 수 있어요.</p>
      </header>

      <LoadingState v-if="isLoading" label="회원 정보를 불러오는 중입니다" />

      <ErrorState v-else-if="loadError" title="회원 정보를 불러오지 못했습니다" :description="loadError">
        <template #action>
          <BaseButton size="sm" @click="loadProfile">다시 시도</BaseButton>
        </template>
      </ErrorState>

      <template v-else>
        <!-- Profile form -->
        <div class="form-card">
          <div class="form-card__title">기본 정보</div>
          <form aria-label="회원 정보 수정 폼" @submit.prevent="saveProfile">
            <div class="auth-field">
              <label class="auth-field__label" for="age">나이</label>
              <input
                id="age"
                v-model="form.age"
                class="auth-field__input"
                type="number"
                name="age"
                min="14"
                max="120"
                placeholder="나이"
              />
            </div>
            <div class="auth-field">
              <label class="auth-field__label" for="gender">성별</label>
              <select id="gender" v-model="form.gender" class="auth-field__input" name="gender">
                <option value="female">여성</option>
                <option value="male">남성</option>
                <option value="other">기타 또는 응답하지 않음</option>
              </select>
            </div>
            <p v-if="formMessage" class="form-card__message" :class="{ 'form-card__message--error': formMessage.includes('실패') || formMessage.includes('오류') }">{{ formMessage }}</p>
            <div class="form-card__actions">
              <button class="auth-submit" type="submit" :disabled="isSaving">
                {{ isSaving ? '저장 중…' : '저장' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password form -->
        <div class="form-card">
          <div class="form-card__title">비밀번호 변경</div>
          <form aria-label="비밀번호 변경 폼" @submit.prevent="savePassword">
            <div class="auth-field">
              <label class="auth-field__label" for="current_password">현재 비밀번호</label>
              <input
                id="current_password"
                v-model="passwordForm.current_password"
                class="auth-field__input"
                type="password"
                name="current_password"
                autocomplete="current-password"
              />
            </div>
            <div class="auth-field">
              <label class="auth-field__label" for="new_password">새 비밀번호</label>
              <input
                id="new_password"
                v-model="passwordForm.new_password"
                class="auth-field__input"
                type="password"
                name="new_password"
                autocomplete="new-password"
              />
            </div>
            <p v-if="passwordMessage" class="form-card__message" :class="{ 'form-card__message--error': passwordMessage.includes('실패') || passwordMessage.includes('오류') }">{{ passwordMessage }}</p>
            <div class="form-card__actions">
              <button class="auth-submit" type="submit" :disabled="isChangingPassword">
                {{ isChangingPassword ? '변경 중…' : '비밀번호 변경' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Withdraw -->
        <div class="withdraw-card">
          <div class="withdraw-card__title">회원 탈퇴</div>
          <p>탈퇴하면 현재 기기에서 로그아웃됩니다.</p>
          <button class="withdraw-btn" type="button" :disabled="isDeleting" @click="deleteAccount">
            {{ isDeleting ? '탈퇴 처리 중…' : '회원 탈퇴' }}
          </button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authTokenStorage, userApi } from '../../../shared/api'
import { AppLayout, BaseButton, ErrorState, LoadingState } from '../../../shared/components'

const router = useRouter()
const form = reactive({ age: '', gender: 'other' })
const passwordForm = reactive({ current_password: '', new_password: '' })
const isLoading = ref(true)
const isSaving = ref(false)
const isChangingPassword = ref(false)
const isDeleting = ref(false)
const loadError = ref('')
const formMessage = ref('')
const passwordMessage = ref('')

onMounted(loadProfile)

async function loadProfile() {
  isLoading.value = true
  loadError.value = ''

  try {
    const user = await userApi.getMe()
    form.age = user.age ?? ''
    form.gender = user.gender || 'other'
  } catch (error) {
    loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}

async function saveProfile() {
  isSaving.value = true
  formMessage.value = ''

  try {
    await userApi.updateMe({
      age: Number(form.age),
      gender: form.gender,
    })
    formMessage.value = '회원 정보가 저장되었습니다.'
  } catch (error) {
    formMessage.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isSaving.value = false
  }
}

async function savePassword() {
  isChangingPassword.value = true
  passwordMessage.value = ''

  try {
    await userApi.updatePassword({ ...passwordForm })
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordMessage.value = '비밀번호가 변경되었습니다.'
  } catch (error) {
    passwordMessage.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isChangingPassword.value = false
  }
}

async function deleteAccount() {
  if (!window.confirm('정말 회원 탈퇴를 진행할까요?')) return

  isDeleting.value = true

  try {
    await userApi.deleteMe()
    authTokenStorage.clearAuth()
    router.replace('/')
  } catch (error) {
    formMessage.value = error?.message || '잠시 후 다시 시도해 주세요.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  display: grid;
  gap: 16px;
  animation: np-fade 0.3s ease both;
}

.profile-page__header {
  margin-bottom: 4px;
}

.profile-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b736d;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 12px;
}

.profile-back-link:hover {
  color: #1a221e;
  text-decoration: none;
}

.profile-page__header h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #1a221e;
}

.profile-page__header p {
  margin: 0;
  font-size: 13.5px;
  color: #6b736d;
  line-height: 1.5;
}

.form-card {
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
  padding: 22px 24px;
  display: grid;
  gap: 14px;
}

.form-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a221e;
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

.auth-field__input {
  height: 46px;
  padding: 0 14px;
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 14.5px;
  color: #2d352f;
  outline: none;
  width: 100%;
  transition: border-color 150ms, box-shadow 150ms;
}

.auth-field__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.form-card__message {
  margin: 0;
  padding: 10px 14px;
  border-radius: 9px;
  background: #eef4f0;
  color: var(--color-brand-strong);
  font-size: 13px;
  line-height: 1.5;
}

.form-card__message--error {
  background: #fbece9;
  color: #8f2f23;
}

.form-card__actions {
  display: flex;
  justify-content: flex-end;
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

.withdraw-card {
  padding: 18px 22px;
  background: #fffafa;
  border: 1px solid #f3c7c7;
  border-radius: 13px;
  display: grid;
  gap: 10px;
}

.withdraw-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #8f2f23;
}

.withdraw-card p {
  margin: 0;
  font-size: 13.5px;
  color: #6b736d;
  line-height: 1.5;
}

.withdraw-btn {
  width: fit-content;
  height: 40px;
  padding: 0 18px;
  border: 1.5px solid #f3c7c7;
  border-radius: 9px;
  background: transparent;
  color: #8f2f23;
  font: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms, border-color 150ms;
}

.withdraw-btn:hover:not(:disabled) {
  background: #fff0ef;
  border-color: #e06060;
}

.withdraw-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
