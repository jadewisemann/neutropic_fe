<template>
  <form class="base-form u-panel u-panel--spacious">
    <slot />
  </form>
</template>

<style scoped>
.base-form {
  display: grid;
  gap: var(--space-4);
}
</style>
