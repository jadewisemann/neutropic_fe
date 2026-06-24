<template>
  <footer class="medical-disclaimer">
    {{ message }}
  </footer>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '본 리포트는 건강 정보 제공 목적이며 질병의 진단, 처방, 치료 지시를 대체하지 않습니다.',
  },
})
</script>

<style scoped>
.medical-disclaimer {
  padding: 16px;
  border-top: 1px solid #dde7e2;
  color: #5b6b65;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
