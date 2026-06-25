import { readonly, ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function showToast(message, options = {}) {
    const normalizedMessage = String(message || '').trim()
    if (!normalizedMessage) return null

    const id = ++toastId
    const toast = {
      id,
      message: normalizedMessage,
      type: options.type || 'info',
    }

    toasts.value = [...toasts.value, toast]

    window.setTimeout(() => {
      dismissToast(id)
    }, options.duration ?? 3200)

    return id
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts: readonly(toasts),
    showToast,
    dismissToast,
  }
}
