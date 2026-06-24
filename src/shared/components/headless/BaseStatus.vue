<template>
  <component :is="as" :role="role" :aria-live="ariaLive || undefined">
    <slot :title="resolvedTitle" :description="description">
      <component :is="titleTag" v-if="resolvedTitle">{{ resolvedTitle }}</component>
      <p v-if="description">{{ description }}</p>
      <slot name="action" />
    </slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  as: {
    type: String,
    default: 'section',
  },
  title: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  titleTag: {
    type: String,
    default: 'p',
  },
  role: {
    type: String,
    default: undefined,
  },
  ariaLive: {
    type: String,
    default: '',
  },
})

const resolvedTitle = computed(() => props.title || props.label)
</script>
