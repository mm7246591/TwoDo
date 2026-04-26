<script setup lang="ts">
import { Field } from "vant";
import SettingAvatarUploader from "@/components/setting/SettingAvatarUploader.vue";

defineProps<{
  canSaveDisplayName: boolean;
  connectionDays: number;
  connectionLabel: string;
  displayName: string;
  isEditorOpen: boolean;
  isSavingProfile: boolean;
  isUploadingAvatar: boolean;
  partnerStatusText: string;
  photoUrl?: string;
  points: number;
}>();

defineEmits<{
  saveDisplayName: [];
  uploadAvatar: [file: File];
}>();

const displayNameInput = defineModel<string>("displayNameInput", {
  required: true,
});
</script>

<template>
  <section
    class="flex flex-col items-center rounded-[24px] border border-[rgba(255,255,255,0.78)] bg-[var(--app-surface-strong)] p-[24px] text-center shadow-[0_18px_44px_rgba(148,72,53,0.08)]"
  >
    <SettingAvatarUploader
      :display-name="displayName"
      :is-uploading="isUploadingAvatar"
      :photo-url="photoUrl"
      @upload="$emit('uploadAvatar', $event)"
    />

    <h2 class="text-[32px] font-[800] leading-[40px] tracking-[0] text-[var(--app-text-strong)]">
      {{ displayName }}
    </h2>
    <p class="mt-[4px] text-[16px] leading-[24px] tracking-[0] text-[var(--app-text-muted)]">
      {{ partnerStatusText }}
    </p>

    <Transition
      enter-active-class="transition-[opacity,transform] duration-[180ms]"
      enter-from-class="translate-y-[-4px] opacity-0"
      enter-to-class="translate-y-[0px] opacity-100"
      leave-active-class="transition-[opacity,transform] duration-[140ms]"
      leave-from-class="translate-y-[0px] opacity-100"
      leave-to-class="translate-y-[-4px] opacity-0"
    >
      <div
        v-if="isEditorOpen"
        class="mt-[20px] grid w-full gap-[12px] rounded-[20px] bg-[var(--app-surface-muted)] p-[16px]"
      >
        <label class="grid gap-[8px] text-left">
          <span class="text-[13px] font-[700] leading-[18px] tracking-[0] text-[var(--app-text-muted)]">
            暱稱
          </span>
          <Field
            v-model="displayNameInput"
            class="w-full rounded-[16px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[14px] py-[12px] text-[var(--app-text)] after:hidden focus-within:bg-[var(--app-input-focus-bg)] focus-within:shadow-[0_0_0_4px_var(--app-input-focus-ring)] [&_.van-field__body]:min-h-[24px] [&_.van-field__control]:text-[16px] [&_.van-field__control]:leading-[24px] [&_.van-field__control]:text-[var(--app-text)]"
            type="text"
            clearable
            :border="false"
            maxlength="40"
            placeholder="輸入新的暱稱"
          />
        </label>

        <button
          class="inline-flex h-[48px] min-h-[48px] items-center justify-center rounded-[16px] border border-[var(--app-button-secondary-border)] bg-white px-[16px] text-[15px] font-[700] leading-[20px] tracking-[0] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[opacity,transform] duration-[180ms] hover:enabled:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          :disabled="!canSaveDisplayName"
          @click="$emit('saveDisplayName')"
        >
          {{ isSavingProfile ? "儲存中..." : "儲存暱稱" }}
        </button>
      </div>
    </Transition>

    <div class="mt-[18px] grid w-full grid-cols-2 gap-[16px]">
      <article class="grid min-h-[118px] place-items-center rounded-[20px] bg-[var(--app-surface-muted)] p-[12px]">
        <span class="material-symbols-outlined fill text-[28px] text-[var(--app-accent)]" aria-hidden="true">
          calendar_clock
        </span>
        <strong class="text-[24px] font-[800] leading-[32px] tracking-[0] text-[var(--app-text-strong)]">
          {{ connectionDays }} 天
        </strong>
        <span class="text-[12px] font-[700] leading-[16px] tracking-[0] text-[var(--app-text-muted)]">
          {{ connectionLabel }}
        </span>
      </article>

      <article class="grid min-h-[118px] place-items-center rounded-[20px] bg-[var(--app-surface-muted)] p-[12px]">
        <span class="material-symbols-outlined fill text-[28px] text-[var(--app-success-text)]" aria-hidden="true">
          stars
        </span>
        <strong class="text-[24px] font-[800] leading-[32px] tracking-[0] text-[var(--app-text-strong)]">
          {{ points }} 分
        </strong>
        <span class="text-[12px] font-[700] leading-[16px] tracking-[0] text-[var(--app-text-muted)]">
          總點數
        </span>
      </article>
    </div>
  </section>
</template>
