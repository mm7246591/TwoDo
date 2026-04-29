<script setup lang="ts">
import SettingAvatarUploader from "@/components/setting/profile/SettingAvatarUploader.vue";

defineProps<{
  connectionDays: number;
  connectionLabel: string;
  displayName: string;
  isUploadingAvatar: boolean;
  partnerStatusText: string;
  photoUrl?: string;
  points: number;
}>();

defineEmits<{
  uploadAvatar: [file: File];
}>();
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

    <h2
      class="text-[32px] font-[800] leading-[40px] tracking-[0] text-[var(--app-text-strong)]"
    >
      {{ displayName }}
    </h2>
    <p
      class="mt-[4px] text-[16px] leading-[24px] tracking-[0] text-[var(--app-text-muted)]"
    >
      {{ partnerStatusText }}
    </p>

    <div class="mt-[18px] grid w-full grid-cols-2 gap-[16px]">
      <article
        class="grid min-h-[118px] place-items-center rounded-[20px] bg-[var(--app-surface-muted)] p-[12px]"
      >
        <span
          class="material-symbols-outlined fill text-[28px] text-[var(--app-accent)]"
          aria-hidden="true"
        >
          calendar_clock
        </span>
        <strong
          class="text-[24px] font-[800] leading-[32px] tracking-[0] text-[var(--app-text-strong)]"
        >
          {{ connectionDays }} 天
        </strong>
        <span
          class="text-[12px] font-[700] leading-[16px] tracking-[0] text-[var(--app-text-muted)]"
        >
          {{ connectionLabel }}
        </span>
      </article>

      <article
        class="grid min-h-[118px] place-items-center rounded-[20px] bg-[var(--app-surface-muted)] p-[12px]"
      >
        <span
          class="material-symbols-outlined fill text-[28px] text-[var(--app-success-text)]"
          aria-hidden="true"
        >
          stars
        </span>
        <strong
          class="text-[24px] font-[800] leading-[32px] tracking-[0] text-[var(--app-text-strong)]"
        >
          {{ points }} 分
        </strong>
        <span
          class="text-[12px] font-[700] leading-[16px] tracking-[0] text-[var(--app-text-muted)]"
        >
          總點數
        </span>
      </article>
    </div>
  </section>
</template>

<spec lang="md">
## 1. 說明

- 顯示設定頁頂部個人摘要，包含頭像、顯示名稱、配對狀態、連線天數與點數。

## 2. 功能需求

- 1. 使用者資料存在時，顯示目前顯示名稱與配對狀態。
- 2. 使用者上傳頭像時，向上送出檔案讓設定頁處理更新流程。
- 3. 元件顯示連線天數與總點數，作為設定頁摘要資訊。

## 3. 對接口

- props：display-name：目前顯示名稱。
- props：photo-url：頭像圖片網址。
- props：is-uploading-avatar：頭像上傳狀態。
- props：partner-status-text：配對狀態文字。
- props：connection-days：連線或使用天數。
- props：connection-label：連線天數標籤。
- props：points：目前總點數。
- emit：upload-avatar(檔案)：要求設定頁更新頭像。
- defineModel：無。
</spec>
