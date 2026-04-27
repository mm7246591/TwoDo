<script setup lang="ts">
import { computed } from "vue";
import {
  Uploader,
  type UploaderAfterRead,
  type UploaderBeforeRead,
  type UploaderFileListItem,
} from "vant";
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

const avatarInitial = computed(
  () => props.displayName.trim().slice(0, 1).toUpperCase() || "T",
);

const getUploaderFile = (item: UploaderFileListItem | UploaderFileListItem[]) =>
  Array.isArray(item) ? item[0]?.file : item.file;

const handleBeforeRead: UploaderBeforeRead = (file) => {
  const nextFile = Array.isArray(file) ? file[0] : file;

  if (!nextFile || !AVATAR_SUPPORTED_TYPES.has(nextFile.type)) {
    showErrorMessage("請選擇 JPG 或 PNG 圖片。");
    return false;
  }

  return true;
};

const handleOversize = () => {
  showErrorMessage("頭像圖片不能超過 5 MB。");
};

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
