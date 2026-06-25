<template>
  <Teleport to="body">
    <div v-if="toasts.length" class="toast-host" aria-live="polite" aria-atomic="true">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-host__item"
        :class="`toast-host__item--${toast.type}`"
      >
        <span>{{ toast.message }}</span>
        <button type="button" class="toast-host__close" aria-label="알림 닫기" @click="dismissToast(toast.id)">
          ×
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../../composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 1000;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 36px));
  pointer-events: none;
}

.toast-host__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border: 1px solid #dfe5de;
  border-radius: 10px;
  background: #fff;
  color: #26302a;
  box-shadow: 0 10px 28px rgba(26, 34, 30, 0.14);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  pointer-events: auto;
}

.toast-host__item--error {
  border-color: #f1cfca;
  background: #fbece9;
  color: #8f2f23;
}

.toast-host__close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: currentColor;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
}

.toast-host__close:hover {
  opacity: 1;
  background: rgba(26, 34, 30, 0.08);
}
</style>
