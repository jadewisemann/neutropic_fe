<template>
  <MyPageLayout title="회원 정보 수정">
    <LoadingState v-if="isLoading" label="회원 정보를 불러오는 중입니다" />

    <ErrorState v-else-if="loadError" title="회원 정보를 불러오지 못했습니다" :description="loadError">
      <template #action>
        <BaseButton size="sm" @click="loadProfile">다시 시도</BaseButton>
      </template>
    </ErrorState>

    <BaseForm v-else aria-label="회원 정보 수정 폼" @submit.prevent="saveProfile">
      <FormField label="나이">
        <input v-model="form.age" class="form-control" type="number" name="age" min="14" max="120" placeholder="나이" />
      </FormField>
      <FormField label="성별">
        <select v-model="form.gender" class="form-control" name="gender">
          <option value="female">여성</option>
          <option value="male">남성</option>
          <option value="other">기타 또는 응답하지 않음</option>
        </select>
      </FormField>
      <FormErrorMessage :message="formMessage" />
      <FormActions>
        <BaseButton type="submit" variant="primary" :disabled="isSaving">{{ isSaving ? '저장 중' : '저장' }}</BaseButton>
        <BaseButton to="/mypage">취소</BaseButton>
      </FormActions>
    </BaseForm>

    <BaseForm v-if="!isLoading && !loadError" class="danger-form" aria-label="비밀번호 변경 폼" @submit.prevent="savePassword">
      <FormField label="현재 비밀번호">
        <input v-model="passwordForm.current_password" class="form-control" type="password" name="current_password" autocomplete="current-password" />
      </FormField>
      <FormField label="새 비밀번호">
        <input v-model="passwordForm.new_password" class="form-control" type="password" name="new_password" autocomplete="new-password" />
      </FormField>
      <FormErrorMessage :message="passwordMessage" />
      <FormActions>
        <BaseButton type="submit" variant="primary" :disabled="isChangingPassword">
          {{ isChangingPassword ? '변경 중' : '비밀번호 변경' }}
        </BaseButton>
      </FormActions>
    </BaseForm>

    <section v-if="!isLoading && !loadError" class="withdraw-section">
      <h2>회원 탈퇴</h2>
      <p>탈퇴하면 현재 기기에서 로그아웃됩니다.</p>
      <BaseButton variant="danger" :disabled="isDeleting" @click="deleteAccount">
        {{ isDeleting ? '탈퇴 처리 중' : '회원 탈퇴' }}
      </BaseButton>
    </section>
  </MyPageLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authTokenStorage, userApi } from '../../../shared/api'
import { BaseButton, BaseForm, ErrorState, FormActions, FormErrorMessage, FormField, LoadingState, MyPageLayout } from '../../../shared/components'

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
.danger-form,
.withdraw-section {
  margin-top: 24px;
}

.withdraw-section {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid #f3c7c7;
  border-radius: 8px;
  background: #fffafa;
}

.withdraw-section h2,
.withdraw-section p {
  margin: 0;
}
</style>
