<script setup lang="ts">
import { computed } from "vue";
import {
  Uploader,
  type UploaderFileListItem,
} from "vant";
import type {
  UploaderAfterRead,
  UploaderBeforeRead,
} from "vant/es/uploader/types";
import { showErrorMessage } from "@/services/uiFeedback";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_ACCEPT = "image/png,image/jpeg";
const AVATAR_SUPPORTED_TYPES = new Set(["image/jpeg", "image/png"]);

const props = defineProps<{
  displayName: string;
  isUploading: boolean;
  photoUrl?: string;
}>();

const emit = defineEmits<{
  upload: [file: File];
}>();

/** 顯示頭像替代文字，沒有名稱時使用預設首字。 */
const avatarInitial = computed(
  () => props.displayName.trim().slice(0, 1).toUpperCase() || "T",
);

/**
 * 從 Vant Uploader 回傳項目取出原始檔案。
 *
 * @param item - 單一或多檔模式的上傳項目。
 * @returns 可交給父層上傳的 File，沒有檔案時回傳 undefined。
 */
const getUploaderFile = (item: UploaderFileListItem | UploaderFileListItem[]) =>
  Array.isArray(item) ? item[0]?.file : item.file;

/**
 * 驗證頭像檔案格式是否為支援的圖片類型。
 *
 * @param file - Vant Uploader 讀取前提供的檔案或檔案陣列。
 * @returns 格式可接受時回傳 true，否則中止讀取。
 */
const handleBeforeRead: UploaderBeforeRead = (file) => {
  const nextFile = Array.isArray(file) ? file[0] : file;

  if (!nextFile || !AVATAR_SUPPORTED_TYPES.has(nextFile.type)) {
    showErrorMessage("請選擇 JPG 或 PNG 圖片。");
    return false;
  }

  return true;
};

/** 顯示頭像檔案大小超限的錯誤訊息。 */
const handleOversize = () => {
  showErrorMessage("頭像圖片不能超過 5 MB。");
};

/**
 * 在 Vant Uploader 讀取檔案後通知父層執行上傳。
 *
 * @param item - Vant Uploader 產生的上傳項目。
 */
const handleAfterRead: UploaderAfterRead = (item) => {
  const file = getUploaderFile(item);
  if (!file) {
    return;
  }

  emit("upload", file);
};
</script>

<template>
  <div class="relative h-[112px] w-[112px]">
    <span
      class="inline-flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-[linear-gradient(135deg,var(--app-coral),var(--app-support))] text-[34px] font-[800] text-white shadow-[0_12px_24px_rgba(118,69,52,0.12)]"
      aria-hidden="true"
    >
      <img
        v-if="photoUrl"
        class="h-full w-full object-cover"
        :src="photoUrl"
        :alt="`${displayName} avatar`"
      />
      <span v-else>{{ avatarInitial }}</span>
    </span>

    <Uploader
      class="avatar-uploader"
      :accept="AVATAR_ACCEPT"
      :after-read="handleAfterRead"
      :before-read="handleBeforeRead"
      :disabled="isUploading"
      :max-count="1"
      :max-size="AVATAR_MAX_SIZE"
      :preview-image="false"
      result-type="file"
      @oversize="handleOversize"
    >
      <button
        class="inline-flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] items-center justify-center rounded-full bg-[var(--auth-primary-container)] text-[var(--auth-on-primary-container)] shadow-[0_8px_18px_rgba(255,158,133,0.32)] transition-transform duration-[180ms] hover:scale-[1.05] active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)]"
        type="button"
        :disabled="isUploading"
        aria-label="更換頭像"
      >
        <span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">
          upload
        </span>
      </button>
    </Uploader>
  </div>
</template>

<style scoped lang="scss">
.avatar-uploader {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 40px;
  height: 40px;
  overflow: visible;

  :deep(.van-uploader__wrapper),
  :deep(.van-uploader__input-wrapper) {
    display: block;
    width: 40px;
    height: 40px;
  }
}
</style>

<spec lang="md">
## 1. 說明

- 顯示設定頁頭像上傳入口，讓使用者從目前照片或名稱首字中更換頭像。
- 元件用於個人資料設定區，只負責本地檔案選擇與上傳事件輸出。

## 2. 功能需求

- 1. 有 photo-url 時顯示圖片；沒有 photo-url 時顯示 display-name 的首字。
- 2. 使用者點擊上傳按鈕後，可選擇 JPG 或 PNG 圖片。
- 3. 檔案格式不符合時顯示錯誤訊息，且不送出 upload 事件。
- 4. 檔案超過 5 MB 時顯示錯誤訊息。
- 5. 選擇有效檔案後，送出 upload 事件並帶入原始 File。
- 6. is-uploading 為 true 時，上傳入口不可操作。

## 3. 對接口

- props：display-name：使用者顯示名稱，用於產生頭像首字。
- props：is-uploading：頭像上傳中狀態，用於停用上傳入口。
- props：photo-url：目前頭像圖片網址。
- emit：upload(file)：通知父層上傳選取的圖片檔案。

## 4. CSS 描述

- 頭像外觀主要使用 TailwindCSS 類別。
- Vant Uploader 的內部 wrapper 尺寸以 scoped style 限定為上傳按鈕大小。
</spec>
