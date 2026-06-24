<template>
  <component
    :is="componentType"
    :class="buttonClasses"
    :type="nativeType"
    :to="to || undefined"
    :href="href || undefined"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    default: '',
  },
  href: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'secondary',
    validator: (value) => ['secondary', 'primary', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
})

const componentType = computed(() => {
  if (props.to) {
    return RouterLink
  }

  if (props.href) {
    return 'a'
  }

  return 'button'
})

const nativeType = computed(() => {
  return componentType.value === 'button' ? props.type : undefined
})

const buttonClasses = computed(() => [
  'button',
  props.variant !== 'secondary' && `button--${props.variant}`,
  props.size !== 'md' && `button--${props.size}`,
])
</script>
