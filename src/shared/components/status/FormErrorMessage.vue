<template>
  <p v-if="message" class="form-error-message" role="alert">{{ message }}</p>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.form-error-message {
  margin: 6px 0 0;
  color: #8f2f23;
  font-size: 0.875rem;
}
</style>
