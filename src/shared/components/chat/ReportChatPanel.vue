<template>
  <ContentSection :title="title" :title-id="titleId" :description="description" class="report-chat-panel">
    <p v-if="isLoading" class="report-chat-panel__status">채팅 내역을 불러오는 중입니다.</p>
    <p v-else-if="messages.length === 0" class="report-chat-panel__status">아직 질문 내역이 없습니다.</p>

    <div v-else class="report-chat-panel__messages">
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
      <textarea
        class="form-control"
        rows="4"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="isSubmitting"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <p v-if="errorMessage" class="report-chat-panel__error" role="alert">{{ errorMessage }}</p>
      <BaseButton variant="primary" type="submit" :disabled="isSubmitting || !modelValue.trim()">
        {{ isSubmitting ? submittingLabel : submitLabel }}
      </BaseButton>
    </form>
  </ContentSection>
</template>

<script setup>
import BaseButton from '../base/BaseButton.vue'
import ContentSection from '../layout/ContentSection.vue'

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
})

const emit = defineEmits(['update:modelValue', 'submit'])

function handleSubmit() {
  const content = props.modelValue.trim()
  if (!content || props.isSubmitting) return

  emit('submit', content)
}

function formatGuardrail(result) {
  if (result.is_allowed === false) return '차단됨'
  return result.risk_level ? `허용됨 (${result.risk_level})` : '허용됨'
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

.report-chat-panel__message p {
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
</style>
