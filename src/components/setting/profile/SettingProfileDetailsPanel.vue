<script setup lang="ts">
import { computed } from "vue";
import { Field } from "vant";

interface SettingInfoField {
  label: string;
  value: string;
}

const props = defineProps<{
  actionText: string;
  canSaveDisplayName: boolean;
  canShowDeleteAccount: boolean;
  displayName: string;
  emptyText: string;
  isEditingDisplayName: boolean;
  isDeletingAccount: boolean;
  isPartnerMode: boolean;
  isPartnerProfileLoading: boolean;
  isSavingProfile: boolean;
  fields: SettingInfoField[];
  title: string;
  transitionEnterFromClass: string;
  transitionLeaveToClass: string;
}>();

defineEmits<{
  cancelDisplayNameEdit: [];
  deleteAccount: [];
  openDisplayNameEdit: [];
  primaryAction: [];
  saveDisplayName: [];
}>();

const displayNameInput = defineModel<string>("displayNameInput", {
  required: true,
});

const hasFields = computed(() => props.fields.length > 0);
</script>

<template>
  <section class="overflow-hidden rounded-[24px] bg-[var(--app-surface-strong)] shadow-[0_10px_28px_rgba(148,72,53,0.05)]">
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-[220ms]"
      :enter-from-class="transitionEnterFromClass"
      enter-to-class="translate-x-[0px] opacity-100"
      leave-active-class="transition-[opacity,transform] duration-[180ms]"
      leave-from-class="translate-x-[0px] opacity-100"
      :leave-to-class="transitionLeaveToClass"
    >
      <div :key="title" class="grid gap-[16px] p-[20px]">
        <div class="flex items-start justify-between gap-[16px]">
          <div class="grid gap-[4px]">
            <p class="text-[13px] font-[700] leading-[18px] tracking-[0] text-[var(--app-text-muted)]">
              {{ isPartnerMode ? "夥伴設定" : "個人資料" }}
            </p>
            <h2 class="text-[22px] font-[800] leading-[30px] tracking-[0] text-[var(--app-text-strong)]">
              {{ title }}
            </h2>
          </div>

          <button
            v-if="isPartnerMode"
            class="inline-flex min-h-[40px] flex-none items-center justify-center rounded-[14px] border border-[var(--app-button-secondary-border)] bg-white px-[14px] text-[14px] font-[700] leading-[20px] tracking-[0] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[opacity,transform] duration-[180ms] hover:enabled:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-55"
            type="button"
            :disabled="isPartnerProfileLoading"
            @click="$emit('primaryAction')"
          >
            {{ actionText }}
          </button>
        </div>

        <div class="grid gap-[8px] rounded-[18px] bg-[var(--app-surface-muted)] p-[16px]">
          <div class="flex items-center justify-between gap-[12px]">
            <span class="text-[13px] font-[700] leading-[18px] tracking-[0] text-[var(--app-text-muted)]">
              暱稱
            </span>
            <button
              v-if="!isPartnerMode && !isEditingDisplayName"
              class="inline-flex h-[36px] w-[36px] flex-none items-center justify-center rounded-full text-[var(--app-accent)] transition-colors duration-[180ms] hover:bg-[var(--auth-primary-container)] hover:text-[var(--auth-on-primary-container)]"
              type="button"
              aria-label="編輯暱稱"
              @click="$emit('openDisplayNameEdit')"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">edit</span>
            </button>
          </div>

          <strong
            v-if="isPartnerMode || !isEditingDisplayName"
            class="break-words text-[18px] font-[800] leading-[28px] tracking-[0] text-[var(--app-text-strong)]"
          >
            {{ displayName }}
          </strong>

          <div v-else class="grid gap-[12px]">
            <Field
              v-model="displayNameInput"
              class="w-full rounded-[16px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[14px] py-[12px] text-[var(--app-text)] after:hidden focus-within:bg-[var(--app-input-focus-bg)] focus-within:shadow-[0_0_0_4px_var(--app-input-focus-ring)] [&_.van-field__body]:min-h-[24px] [&_.van-field__control]:text-[16px] [&_.van-field__control]:leading-[24px] [&_.van-field__control]:text-[var(--app-text)]"
              type="text"
              clearable
              :border="false"
              maxlength="40"
              placeholder="輸入新的暱稱"
            />
            <div class="grid grid-cols-2 gap-[12px]">
              <button
                class="inline-flex h-[44px] min-h-[44px] items-center justify-center rounded-[14px] border border-[var(--app-button-secondary-border)] bg-white px-[12px] text-[14px] font-[700] leading-[20px] tracking-[0] text-[var(--app-text)] transition-[opacity,transform] duration-[180ms] hover:enabled:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-55"
                type="button"
                :disabled="isSavingProfile"
                @click="$emit('cancelDisplayNameEdit')"
              >
                取消
              </button>
              <button
                class="inline-flex h-[44px] min-h-[44px] items-center justify-center rounded-[14px] border border-[var(--app-button-secondary-border)] bg-white px-[12px] text-[14px] font-[700] leading-[20px] tracking-[0] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[opacity,transform] duration-[180ms] hover:enabled:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-55"
                type="button"
                :disabled="!canSaveDisplayName"
                @click="$emit('saveDisplayName')"
              >
                {{ isSavingProfile ? "儲存中..." : "儲存" }}
              </button>
            </div>
          </div>
        </div>

        <p
          v-if="isPartnerProfileLoading"
          class="rounded-[18px] bg-[var(--app-surface-muted)] p-[16px] text-[14px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
        >
          讀取夥伴資料中...
        </p>

        <dl v-else-if="hasFields" class="grid gap-[12px]">
          <div
            v-for="field in fields"
            :key="field.label"
            class="grid gap-[6px] rounded-[18px] bg-[var(--app-surface-muted)] p-[16px]"
          >
            <dt class="text-[12px] font-[700] leading-[16px] tracking-[0] text-[var(--app-text-muted)]">
              {{ field.label }}
            </dt>
            <dd class="break-words text-[15px] font-[700] leading-[24px] tracking-[0] text-[var(--app-text)]">
              {{ field.value }}
            </dd>
          </div>
        </dl>

        <p
          v-else
          class="rounded-[18px] bg-[var(--app-surface-muted)] p-[16px] text-[14px] font-[700] leading-[22px] tracking-[0] text-[var(--app-text-muted)]"
        >
          {{ emptyText }}
        </p>

        <button
          v-if="canShowDeleteAccount"
          class="inline-flex h-[48px] min-h-[48px] items-center justify-center rounded-[16px] border border-[var(--app-danger)] bg-[var(--app-danger-soft)] px-[16px] text-[15px] font-[800] leading-[20px] tracking-[0] text-[var(--app-danger-text)] transition-[opacity,transform] duration-[180ms] hover:enabled:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-55"
          type="button"
          :disabled="isDeletingAccount"
          @click="$emit('deleteAccount')"
        >
          {{ isDeletingAccount ? "刪除中..." : "刪除帳號" }}
        </button>
      </div>
    </Transition>
  </section>
</template>

<spec lang="md">
## 1. 說明
- 顯示設定頁的個人資料或夥伴設定獨立介面，並以 slide 動畫切換介面內容。

## 2. 功能需求
- 1) 使用者從個人資料進入時，顯示個人資料介面。
- 2) 使用者從夥伴設定進入時，顯示夥伴設定介面。
- 3) 介面切換時，內容以 slide 動畫進入與離開。
- 4) 兩種介面都只顯示暱稱、email、邀請碼。
- 5) 個人暱稱預設顯示為純文字，點擊鉛筆按鈕後切換為輸入欄位。
- 6) 使用者儲存暱稱時，向上送出儲存事件；取消時回復純文字顯示。
- 7) 個人資料介面顯示刪除帳號按鈕；夥伴設定介面不顯示刪除帳號按鈕。
- A1：資料讀取中時顯示讀取文字。
- A2：沒有可顯示資料時顯示空狀態文字。

## 3. 對接口
- props：title：面板標題。
- props：display-name：暱稱顯示文字。
- props：fields：email 與邀請碼欄位清單。
- props：is-partner-mode：是否為夥伴設定模式。
- props：is-editing-display-name：是否正在編輯本人暱稱。
- props：can-save-display-name：是否可儲存暱稱。
- props：is-saving-profile：暱稱儲存狀態。
- props：is-partner-profile-loading：夥伴資料讀取狀態。
- props：can-show-delete-account：是否顯示刪除帳號按鈕。
- props：is-deleting-account：刪除帳號狀態。
- props：action-text：夥伴模式主要操作文字。
- props：empty-text：無資料時顯示文字。
- props：transition-enter-from-class：slide 進場起點 class。
- props：transition-leave-to-class：slide 離場終點 class。
- emit：open-display-name-edit：要求切換為暱稱編輯。
- emit：cancel-display-name-edit：要求取消暱稱編輯。
- emit：save-display-name：要求儲存暱稱。
- emit：delete-account：要求刪除帳號。
- emit：primary-action：要求執行夥伴模式主要操作。
- defineModel：display-name-input：暱稱輸入值。
</spec>
