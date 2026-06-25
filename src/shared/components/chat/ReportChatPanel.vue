<template>
  <section class="chat-panel report-chat-panel" :aria-labelledby="titleId">
    <header class="chat-panel__header">
      <div :id="titleId" class="chat-panel__title">{{ title }}</div>
      <p class="chat-panel__desc">{{ description }}</p>
      <p v-if="limitNotice" class="chat-panel__limit">{{ limitNotice }}</p>
    </header>

    <p v-if="isLoading" class="report-chat-panel__status">채팅 내역을 불러오는 중입니다.</p>
    <div v-else ref="messagesEl" class="chat-panel__messages report-chat-panel__messages">
      <div
        v-for="message in messages"
        :key="message.id ?? message.content ?? message.text"
        class="report-chat-panel__message"
        :class="{ 'report-chat-panel__message--user': message.role === 'user' || message.variant === 'user' }"
      >
        <p>{{ message.content ?? message.text }}</p>
        <p v-if="message.guardrail_result" class="report-chat-panel__meta">
          안전 검사: {{ formatGuardrail(message.guardrail_result) }}
        </p>
        <ul v-if="message.citations?.length" class="report-chat-panel__citations">
          <li v-for="citation in message.citations" :key="`${message.id}-${citation.document_id}`">
            {{ citation.source_name || citation.document_id }}
          </li>
        </ul>
      </div>
    </div>

    <form class="report-chat-panel__form" @submit.prevent="handleSubmit">
      <div class="chat-panel__input-row" @click.capture="handleDisabledSubmitAttempt">
        <input
          class="chat-panel__input"
          type="text"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="isSubmitting || submitDisabled"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <BaseButton variant="primary" type="submit" :disabled="isSubmitButtonDisabled">
          {{ isSubmitting ? submittingLabel : submitLabel }}
        </BaseButton>
      </div>
      <p v-if="errorMessage" class="report-chat-panel__error" role="alert">{{ errorMessage }}</p>
    </form>

    <div v-if="suggestedQuestions.length" class="report-chat-panel__suggestions" aria-label="추천 질문">
      <button
        v-for="question in suggestedQuestions"
        :key="question"
        class="report-chat-panel__suggestion"
        type="button"
        :disabled="isSubmitting || submitDisabled"
        @click="handleSuggestedQuestion(question)"
      >
        {{ question }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { BaseButton } from '../base'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  titleId: {
    type: String,
    default: 'chat-title',
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
    default: '리포트 기반 질문을 입력하세요.',
  },
  submitLabel: {
    type: String,
    default: '질문 보내기',
  },
  submittingLabel: {
    type: String,
    default: '전송 중',
  },
  suggestedQuestions: {
    type: Array,
    default: () => [],
  },
  limitNotice: {
    type: String,
    default: '',
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'disabled-submit'])
const messagesEl = ref(null)
const isSubmitButtonDisabled = computed(() => props.isSubmitting || props.submitDisabled || !props.modelValue.trim())

const suggestedQuestions = computed(() =>
  props.suggestedQuestions
    .map((question) => String(question ?? '').trim())
    .filter(Boolean)
    .slice(0, 2),
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

function handleSuggestedQuestion(question) {
  if (props.submitDisabled) {
    emit('disabled-submit')
    return
  }
  if (props.isSubmitting) return

  emit('update:modelValue', question)
  emit('submit', question)
}

function handleDisabledSubmitAttempt() {
  if (props.submitDisabled) {
    emit('disabled-submit')
  }
}

function formatGuardrail(result) {
  if (!result) return ''
  if (typeof result === 'string') return result
  return result.message || result.reason || result.status || '확인됨'
}
</script>

<style scoped>
.report-chat-panel__messages {
  display: grid;
  gap: var(--space-3);
}

.report-chat-panel__message {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: #f0f6f3;
  color: var(--color-text-soft);
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
  line-height: 1.6;
}

.report-chat-panel__message--user {
  background: #edf2ef;
}

.report-chat-panel__status,
.report-chat-panel__meta,
.report-chat-panel__error {
  margin: 0;
  color: #5b6b65;
  font-size: 0.875rem;
}

.report-chat-panel__error {
  color: #8f2f23;
}

.report-chat-panel__citations {
  display: grid;
  gap: 4px;
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 0.875rem;
}

.report-chat-panel__form {
  display: grid;
  gap: var(--space-3);
}

.report-chat-panel :deep(.form-control) {
  width: 100%;
  box-sizing: border-box;
}

.report-chat-panel__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.report-chat-panel__suggestion {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #dfe8e3;
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-text-soft);
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
}

.report-chat-panel__suggestion:hover:not(:disabled) {
  border-color: #b8ccc2;
  background: #f7faf8;
}

.report-chat-panel__suggestion:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
