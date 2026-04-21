<script setup lang="ts">
type DashboardIconName =
  | 'activity'
  | 'add'
  | 'bell'
  | 'gift'
  | 'heart-link'
  | 'home'
  | 'points'
  | 'settings'
  | 'shield-check'
  | 'tasks'

withDefaults(defineProps<{
  name: DashboardIconName
  size?: number
}>(), {
  size: 20,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <template v-if="name === 'home'">
      <path d="M4 10.8L12 4L20 10.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M6.2 9.9V19H17.8V9.9" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M10.3 19V13.2H13.7V19" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
    </template>

    <template v-else-if="name === 'tasks'">
      <path d="M9 7H19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M9 12H19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M9 17H19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M5 7L5.6 7.6L7 6.2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M5 12L5.6 12.6L7 11.2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M5 17L5.6 17.6L7 16.2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
    </template>

    <template v-else-if="name === 'shield-check'">
      <path d="M12 3L18 5.6V11.3C18 15.2 15.4 18.8 12 20C8.6 18.8 6 15.2 6 11.3V5.6L12 3Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M9.5 11.8L11.2 13.5L14.8 9.9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
    </template>

    <template v-else-if="name === 'points'">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 7.8L13.3 10.4L16.2 10.8L14.1 12.9L14.6 15.8L12 14.4L9.4 15.8L9.9 12.9L7.8 10.8L10.7 10.4L12 7.8Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" />
    </template>

    <template v-else-if="name === 'gift'">
      <path d="M4 10H20V19H4V10Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M12 10V19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M4 10H20V7.4C20 6.6 19.4 6 18.6 6H5.4C4.6 6 4 6.6 4 7.4V10Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M12 6C10.6 6 9.5 5.1 9.5 4C9.5 3.2 10.1 2.6 10.9 2.6C11.6 2.6 12.2 3 12.6 3.6L13.3 4.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M12 6C13.4 6 14.5 5.1 14.5 4C14.5 3.2 13.9 2.6 13.1 2.6C12.4 2.6 11.8 3 11.4 3.6L10.7 4.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
    </template>

    <template v-else-if="name === 'bell'">
      <path d="M8 18H16" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M9 18C9.2 19.2 10.3 20 11.5 20H12.5C13.7 20 14.8 19.2 15 18" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M18 16H6C6.9 15.1 7.5 13.8 7.5 12.5V10.7C7.5 8.1 9.4 6 12 6C14.6 6 16.5 8.1 16.5 10.7V12.5C16.5 13.8 17.1 15.1 18 16Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M11.9 3.5C12.4 3.5 12.8 3.9 12.8 4.4C12.8 4.9 12.4 5.3 11.9 5.3C11.4 5.3 11 4.9 11 4.4C11 3.9 11.4 3.5 11.9 3.5Z" fill="currentColor" />
    </template>

    <template v-else-if="name === 'heart-link'">
      <path d="M8.2 8.4C8.2 6.7 9.6 5.4 11.2 5.4C12.1 5.4 12.9 5.8 13.4 6.5L14.1 7.3L14.8 6.5C15.3 5.8 16.1 5.4 17 5.4C18.6 5.4 20 6.7 20 8.4C20 10.1 18.9 11.4 17.5 12.6L14.1 15.4L10.7 12.6C9.3 11.4 8.2 10.1 8.2 8.4Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M7.2 16.8H5.8C4.3 16.8 3 15.5 3 14C3 12.5 4.3 11.2 5.8 11.2H8.2" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M16 16.8H18.2C19.7 16.8 21 15.5 21 14C21 12.5 19.7 11.2 18.2 11.2H17" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
    </template>

    <template v-else-if="name === 'settings'">
      <path d="M12 8.8C10.2 8.8 8.8 10.2 8.8 12C8.8 13.8 10.2 15.2 12 15.2C13.8 15.2 15.2 13.8 15.2 12C15.2 10.2 13.8 8.8 12 8.8Z" stroke="currentColor" stroke-width="1.8" />
      <path d="M19 13.1V10.9L16.9 10.3C16.7 9.8 16.5 9.4 16.2 9L16.8 6.9L15.1 5.2L13 5.8C12.6 5.5 12.2 5.3 11.7 5.1L11.1 3H8.9L8.3 5.1C7.8 5.3 7.4 5.5 7 5.8L4.9 5.2L3.2 6.9L3.8 9C3.5 9.4 3.3 9.8 3.1 10.3L1 10.9V13.1L3.1 13.7C3.3 14.2 3.5 14.6 3.8 15L3.2 17.1L4.9 18.8L7 18.2C7.4 18.5 7.8 18.7 8.3 18.9L8.9 21H11.1L11.7 18.9C12.2 18.7 12.6 18.5 13 18.2L15.1 18.8L16.8 17.1L16.2 15C16.5 14.6 16.7 14.2 16.9 13.7L19 13.1Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" />
    </template>

    <template v-else-if="name === 'add'">
      <path d="M12 5V19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <path d="M5 12H19" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" />
    </template>

    <template v-else>
      <path d="M5 15.5L9.2 11.3L12 14.1L18.5 7.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M16.5 7.6H18.5V9.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
      <path d="M4 19H20" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
    </template>
  </svg>
</template>
