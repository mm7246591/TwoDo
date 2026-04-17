<script setup lang="ts">
defineProps<{
  shellClass?: string
  frameClass?: string
}>()
</script>

<template>
  <main
    class="min-h-screen px-3 py-3 sm:px-6 sm:py-10"
    :class="shellClass"
  >
    <div
      class="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-md flex-col rounded-[2rem] shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:min-h-[760px] sm:rounded-[2.5rem]"
      :class="frameClass"
    >
      <slot />
    </div>
  </main>
</template>
