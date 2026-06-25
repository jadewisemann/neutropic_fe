<template>
  <div class="chat-panel">
    <header class="chat-panel__header">
      <div class="chat-panel__title">{{ title }}</div>
      <p class="chat-panel__desc">{{ description }}</p>
      <p v-if="limitNotice" class="chat-panel__limit">{{ limitNotice }}</p>
    </header>

    <div ref="messagesEl" class="chat-panel__messages">
      <p v-if="isLoading" class="chat-panel__status">채팅 내역을 불러오는 중입니다.</p>
      <p v-else-if="messages.length === 0" class="chat-panel__status">
        이 리포트의 성분·섭취법에 대해 물어볼 수 있어요. 진단·처방은 도와드릴 수 없어요.
      </p>
      <div
        v-for="message in messages"
        :key="message.id ?? message.content ?? message.text"
        class="chat-panel__message"
        :class="{
          'chat-panel__message--user': message.role === 'user' || message.variant === 'user',
          'chat-panel__message--block': message.role === 'block',
        }"
      >
        {{ message.content ?? message.text }}
      </div>
    </div>

    <div class="chat-panel__input-row" @click.capture="handleDisabledSubmitAttempt">
      <input
        class="chat-panel__input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="isSubmitting || submitDisabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter.prevent="handleSubmit"
      />
      <button
        class="chat-panel__send"
        type="button"
        :disabled="isSubmitButtonDisabled"
        @click="handleSubmit"
      >
        ↑
      </button>
    </div>

    <p v-if="errorMessage" class="chat-panel__error" role="alert">{{ errorMessage }}</p>

    <div class="chat-panel__suggestions">
      <button
        v-for="(q, i) in displayedSuggestions"
        :key="i"
        class="chat-panel__suggestion"
        type="button"
        @click="$emit('update:modelValue', q)"
      >
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  messages: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '성분에 대해 물어보기…',
  },
  limitNotice: {
    type: String,
    default: '',
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'disabled-submit'])
const messagesEl = ref(null)
const isSubmitButtonDisabled = computed(() => props.isSubmitting || props.submitDisabled || !props.modelValue.trim())

const defaultSuggestions = [
  '첫 번째 추천 성분명은 왜 추천됐나요?',
  '건강 목표에 가장 중요한 성분은 무엇인가요?',
]
const displayedSuggestions = computed(() => (props.suggestions.length ? props.suggestions : defaultSuggestions))

watch(
  () => props.messages,
  async () => {
    await nextTick()
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  },
  { deep: true },
)

function handleSubmit() {
  const content = props.modelValue.trim()
  if (props.submitDisabled) {
    emit('disabled-submit')
    return
  }
  if (!content || props.isSubmitting) return
  emit('submit', content)
}

function handleDisabledSubmitAttempt() {
  if (props.submitDisabled) {
    emit('disabled-submit')
  }
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 560px;
  background: #fff;
  border: 1px solid #e8ebe7;
  border-radius: 14px;
  overflow: hidden;
}

.chat-panel__header {
  flex-shrink: 0;
  padding: 16px 18px;
  border-bottom: 1px solid #eef0ec;
}

.chat-panel__title {
  font-size: 15px;
  font-weight: 700;
  color: #1a221e;
  line-height: 1.3;
}

.chat-panel__desc {
  margin: 3px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: #8b938c;
}

.chat-panel__limit {
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: #6b736d;
}

.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fafbf9;
  scrollbar-width: thin;
}

.chat-panel__status {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #8b938c;
  align-self: flex-start;
  max-width: 86%;
  padding: 10px 13px;
  border-radius: 14px 14px 14px 4px;
  background: #fff;
  border: 1px solid #eef0ec;
}

.chat-panel__message {
  max-width: 86%;
  padding: 10px 13px;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 14px 14px 14px 4px;
  background: #fff;
  border: 1px solid #eef0ec;
  color: #2d352f;
  align-self: flex-start;
}

.chat-panel__message--user {
  align-self: flex-end;
  border-radius: 14px 14px 4px 14px;
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: #fff;
}

.chat-panel__message--block {
  align-self: flex-start;
  background: #fbece9;
  border-color: #f1cfca;
  color: #9a352c;
  border-radius: 12px;
}

.chat-panel__input-row {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #eef0ec;
}

.chat-panel__input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #e4e7e3;
  border-radius: 10px;
  font: inherit;
  font-size: 13.5px;
  outline: none;
  background: #fff;
  color: #2d352f;
  transition: border-color 150ms, box-shadow 150ms;
}

.chat-panel__input::placeholder {
  color: #9aa19b;
}

.chat-panel__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px var(--color-brand-50);
}

.chat-panel__send {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--color-brand);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
}

.chat-panel__send:hover:not(:disabled) {
  background: var(--color-brand-strong);
}

.chat-panel__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-panel__error {
  flex-shrink: 0;
  margin: 0;
  padding: 8px 12px;
  font-size: 12.5px;
  color: #9a352c;
  background: #fbece9;
}

.chat-panel__suggestions {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #f7f8f6;
  border-top: 1px solid #eef0ec;
}

.chat-panel__suggestion {
  padding: 6px 10px;
  border: 1px solid #e4e7e3;
  border-radius: 8px;
  background: #fff;
  color: #5a625b;
  font: inherit;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 150ms, color 150ms;
}

.chat-panel__suggestion:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}
</style>
