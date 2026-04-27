<script setup lang="ts">
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import SettingEmptyProfileState from "@/components/setting/SettingEmptyProfileState.vue";
import SettingMenuGroups from "@/components/setting/SettingMenuGroups.vue";
import SettingPointsGuideDialog from "@/components/setting/SettingPointsGuideDialog.vue";
import SettingProfileCard from "@/components/setting/SettingProfileCard.vue";
import SettingSignOutButton from "@/components/setting/SettingSignOutButton.vue";
import SettingTopBar from "@/components/setting/SettingTopBar.vue";
import { useSettingView } from "./composables/useSettingView";

const {
  canSaveDisplayName,
  connectionDays,
  connectionLabel,
  displayName,
  displayNameInput,
  goBack,
  goToNotifications,
  handleAvatarUpload,
  handlePartnerSettings,
  handleSaveDisplayName,
  handleSignOut,
  handleThemeToggle,
  hasProfile,
  isCoupleSubmitting,
  isDarkModeEnabled,
  isPointsGuideDialogOpen,
  isProfileEditorOpen,
  isSavingProfile,
  isSigningOut,
  isUploadingAvatar,
  partnerButtonText,
  partnerStatusText,
  photoUrl,
  points,
  showPointsGuide,
  toggleProfileEditor,
  unreadNotificationsText,
} = useSettingView();
</script>

<template>
  <MobileAppShell>
    <SettingTopBar @back="goBack" />

    <main class="mx-auto grid w-full max-w-[672px] flex-1 gap-[24px] px-[20px] pb-[48px] pt-[8px] sm:px-[28px]">
      <SettingEmptyProfileState v-if="!hasProfile" />

      <template v-else>
        <SettingProfileCard v-model:display-name-input="displayNameInput" :can-save-display-name="canSaveDisplayName"
          :connection-days="connectionDays" :connection-label="connectionLabel" :display-name="displayName"
          :is-editor-open="isProfileEditorOpen" :is-saving-profile="isSavingProfile"
          :is-uploading-avatar="isUploadingAvatar" :partner-status-text="partnerStatusText" :photo-url="photoUrl"
          :points="points" @save-display-name="handleSaveDisplayName" @upload-avatar="handleAvatarUpload" />

        <SettingMenuGroups :is-couple-submitting="isCoupleSubmitting" :is-dark-mode-enabled="isDarkModeEnabled"
          :partner-button-text="partnerButtonText" :unread-notifications-text="unreadNotificationsText"
          @open-profile-editor="toggleProfileEditor" @open-partner-settings="handlePartnerSettings"
          @open-notifications="goToNotifications" @open-points-guide="showPointsGuide"
          @update-dark-mode="handleThemeToggle" />

        <SettingSignOutButton :is-submitting="isSigningOut" @sign-out="handleSignOut" />
      </template>
    </main>

    <SettingPointsGuideDialog v-model:show="isPointsGuideDialogOpen" />
  </MobileAppShell>
</template>

<spec lang="md">
## 1. 說明
- 設定頁整合使用者資料、設定選單、登出操作與點數機制說明彈窗。

## 2. 功能需求
- 1) 使用者資料存在時，顯示個人資料卡、設定選單與登出按鈕。
- 2) 使用者點擊點數機制說明時，開啟點數說明彈窗。
- 3) 使用者關閉點數說明彈窗時，設定頁同步維持彈窗為關閉狀態。
- A1：使用者資料不存在時，顯示空狀態內容。

## 3. 對接口
- props：無。
- emit：無。
- defineModel：無。

## 4. 實作方式
- 使用 useSettingView 組裝設定頁資料、事件處理與彈窗顯示狀態。
- 點數機制說明由 SettingPointsGuideDialog 子元件呈現，設定頁只負責傳遞顯示狀態。
</spec>
