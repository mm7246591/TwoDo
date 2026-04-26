<script setup lang="ts">
defineProps<{
  isSubmitting: boolean;
}>();

defineEmits<{
  signOut: [];
}>();
</script>

<template>
  <div class="pt-[8px]">
    <button
      class="flex min-h-[56px] w-full items-center justify-center gap-[8px] rounded-[20px] border border-[var(--auth-error-container)] bg-[var(--app-surface-strong)] px-[16px] py-[16px] text-[14px] font-[800] leading-[20px] tracking-[0] text-[var(--auth-error)] shadow-[var(--app-shadow-chip)] transition-[background-color,color,transform] duration-[180ms] hover:bg-[var(--auth-error-container)] hover:text-[var(--auth-on-error-container)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      :disabled="isSubmitting"
      @click="$emit('signOut')"
    >
      <span class="material-symbols-outlined text-[20px]" aria-hidden="true">
        logout
      </span>
      {{ isSubmitting ? "登出中..." : "登出帳號" }}
    </button>
  </div>
</template>
