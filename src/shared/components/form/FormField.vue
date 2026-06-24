<template>
  <label class="form-field">
    <span>{{ label }}</span>
    <slot />
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.form-field {
  display: grid;
  gap: var(--space-2);
  color: var(--color-text-soft);
  font-weight: 700;
}
</style>
