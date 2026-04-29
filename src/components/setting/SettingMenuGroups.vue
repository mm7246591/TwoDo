<script setup lang="ts">
import { Switch } from "vant";

defineProps<{
  isCoupleSubmitting: boolean;
  isDarkModeEnabled: boolean;
  partnerButtonText: string;
  unreadNotificationsText: string;
}>();

defineEmits<{
  openPartnerDetails: [];
  openProfileDetails: [];
  openNotifications: [];
  openPointsGuide: [];
  updateDarkMode: [value: boolean];
}>();
</script>

<template>
  <section class="grid gap-[16px]">
    <div class="overflow-hidden rounded-[24px] bg-[var(--app-surface-strong)] shadow-[0_10px_28px_rgba(148,72,53,0.05)]">
      <button
        class="group flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent p-[24px] text-left transition-colors duration-[180ms] hover:bg-[var(--app-surface-muted)] active:bg-[var(--auth-surface-variant)]"
        type="button"
        @click="$emit('openProfileDetails')"
      >
        <span class="flex min-w-[0px] items-center gap-[12px]">
          <span
            class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center rounded-full bg-[var(--auth-surface-container)] text-[var(--app-accent)] transition-colors duration-[180ms] group-hover:bg-[var(--auth-primary-container)] group-hover:text-[var(--auth-on-primary-container)]"
          >
            <span class="material-symbols-outlined text-[24px]" aria-hidden="true">person</span>
          </span>
          <span class="min-w-[0px] text-[18px] font-[600] leading-[28px] tracking-[0] text-[var(--app-text)]">
            個人資料
          </span>
        </span>
        <span class="material-symbols-outlined text-[24px] text-[var(--app-text-soft)]" aria-hidden="true">
          chevron_right
        </span>
      </button>

      <div class="mx-[24px] h-[1px] bg-[var(--auth-surface-variant)]" />

      <button
        class="group flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent p-[24px] text-left transition-colors duration-[180ms] hover:bg-[var(--app-surface-muted)] active:bg-[var(--auth-surface-variant)] disabled:cursor-not-allowed disabled:opacity-55"
        type="button"
        :disabled="isCoupleSubmitting"
        @click="$emit('openPartnerDetails')"
      >
        <span class="flex min-w-[0px] items-center gap-[12px]">
          <span
            class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center rounded-full bg-[var(--auth-surface-container)] text-[var(--app-accent)] transition-colors duration-[180ms] group-hover:bg-[var(--auth-primary-container)] group-hover:text-[var(--auth-on-primary-container)]"
          >
            <span class="material-symbols-outlined text-[24px]" aria-hidden="true">favorite</span>
          </span>
          <span class="min-w-[0px] text-[18px] font-[600] leading-[28px] tracking-[0] text-[var(--app-text)]">
            {{ partnerButtonText }}
          </span>
        </span>
        <span class="material-symbols-outlined text-[24px] text-[var(--app-text-soft)]" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </div>

    <div class="overflow-hidden rounded-[24px] bg-[var(--app-surface-strong)] shadow-[0_10px_28px_rgba(148,72,53,0.05)]">
      <button
        class="group flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent p-[24px] text-left transition-colors duration-[180ms] hover:bg-[var(--app-surface-muted)] active:bg-[var(--auth-surface-variant)]"
        type="button"
        @click="$emit('openNotifications')"
      >
        <span class="flex min-w-[0px] items-center gap-[12px]">
          <span
            class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center rounded-full bg-[var(--auth-surface-container)] text-[var(--auth-secondary)] transition-colors duration-[180ms] group-hover:bg-[var(--auth-secondary-container)] group-hover:text-[var(--auth-on-secondary-container)]"
          >
            <span class="material-symbols-outlined text-[24px]" aria-hidden="true">notifications</span>
          </span>
          <span class="min-w-[0px] text-[18px] font-[600] leading-[28px] tracking-[0] text-[var(--app-text)]">
            通知偏好
          </span>
        </span>
        <span class="inline-flex items-center gap-[8px] text-[14px] font-[700] leading-[20px] tracking-[0] text-[var(--app-text-soft)]">
          {{ unreadNotificationsText }}
          <span class="material-symbols-outlined text-[24px]" aria-hidden="true">chevron_right</span>
        </span>
      </button>

      <div class="mx-[24px] h-[1px] bg-[var(--auth-surface-variant)]" />

      <button
        class="group flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent p-[24px] text-left transition-colors duration-[180ms] hover:bg-[var(--app-surface-muted)] active:bg-[var(--auth-surface-variant)]"
        type="button"
        @click="$emit('openPointsGuide')"
      >
        <span class="flex min-w-[0px] items-center gap-[12px]">
          <span
            class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center rounded-full bg-[var(--auth-surface-container)] text-[var(--auth-secondary)] transition-colors duration-[180ms] group-hover:bg-[var(--auth-secondary-container)] group-hover:text-[var(--auth-on-secondary-container)]"
          >
            <span class="material-symbols-outlined text-[24px]" aria-hidden="true">loyalty</span>
          </span>
          <span class="min-w-[0px] text-[18px] font-[600] leading-[28px] tracking-[0] text-[var(--app-text)]">
            點數機制說明
          </span>
        </span>
        <span class="material-symbols-outlined text-[24px] text-[var(--app-text-soft)]" aria-hidden="true">
          chevron_right
        </span>
      </button>

      <div class="mx-[24px] h-[1px] bg-[var(--auth-surface-variant)]" />

      <div class="flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent p-[24px]">
        <span class="flex min-w-[0px] items-center gap-[12px]">
          <span class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center rounded-full bg-[var(--auth-surface-container)] text-[var(--auth-secondary)]">
            <span class="material-symbols-outlined text-[24px]" aria-hidden="true">dark_mode</span>
          </span>
          <span class="min-w-[0px] text-[18px] font-[600] leading-[28px] tracking-[0] text-[var(--app-text)]">
            深色模式
          </span>
        </span>

        <Switch
          :model-value="isDarkModeEnabled"
          size="28px"
          active-color="#ff9e85"
          inactive-color="#ede0db"
          aria-label="切換深色模式"
          @update:model-value="$emit('updateDarkMode', $event)"
        />
      </div>
    </div>
  </section>
</template>

<spec lang="md">
## 1. 說明
- 顯示設定頁選單群組，提供資料總覽、通知偏好、點數說明與深色模式入口。

## 2. 功能需求
- 1) 使用者點擊個人資料時，向上要求開啟個人資料介面。
- 2) 使用者點擊夥伴設定時，向上要求開啟夥伴設定介面。
- 3) 使用者點擊通知偏好或點數機制說明時，向上送出對應入口事件。
- 4) 使用者切換深色模式時，向上同步布林值。

## 3. 對接口
- props：is-couple-submitting：配對相關操作是否執行中。
- props：is-dark-mode-enabled：深色模式是否啟用。
- props：partner-button-text：夥伴設定列顯示文字。
- props：unread-notifications-text：未讀通知顯示文字。
- emit：open-profile-details：開啟個人資料介面。
- emit：open-partner-details：開啟夥伴設定介面。
- emit：open-notifications：進入通知偏好。
- emit：open-points-guide：開啟點數說明。
- emit：update-dark-mode(值)：同步深色模式狀態。
- defineModel：無。
</spec>
