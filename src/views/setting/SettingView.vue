<script setup lang="ts">
import { watch } from "vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import SettingEmptyProfileState from "@/components/setting/profile/SettingEmptyProfileState.vue";
import SettingMenuGroups from "@/components/setting/SettingMenuGroups.vue";
import SettingPointsGuideDialog from "@/components/setting/SettingPointsGuideDialog.vue";
import SettingProfileCard from "@/components/setting/profile/SettingProfileCard.vue";
import SettingSignOutButton from "@/components/setting/SettingSignOutButton.vue";
import SettingTopBar from "@/components/setting/SettingTopBar.vue";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import { useSettingView } from "./composables/useSettingView";

const userStore = useUserStore();
const notificationsStore = useNotificationsStore();

const {
  connectionDays,
  connectionLabel,
  displayName,
  goBack,
  goToNotifications,
  goToPartnerDetails,
  goToProfileDetails,
  handleAvatarUpload,
  handleSignOut,
  handleThemeToggle,
  hasProfile,
  isCoupleSubmitting,
  isDarkModeEnabled,
  isPointsGuideDialogOpen,
  isSigningOut,
  isUploadingAvatar,
  partnerButtonText,
  partnerStatusText,
  photoUrl,
  points,
  showPointsGuide,
  unreadNotificationsText,
} = useSettingView();

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      notificationsStore.reset();
      return;
    }

    void notificationsStore.syncNotifications(uid, coupleId);
  },
  { immediate: true },
);
</script>

<template>
  <MobileAppShell>
    <SettingTopBar @back="goBack" />

    <main
      class="mx-auto grid w-full max-w-[672px] flex-1 gap-[24px] px-[20px] pb-[48px] pt-[8px] sm:px-[28px]"
    >
      <SettingEmptyProfileState v-if="!hasProfile" />

      <template v-else>
        <SettingProfileCard
          :connection-days="connectionDays"
          :connection-label="connectionLabel"
          :display-name="displayName"
          :is-uploading-avatar="isUploadingAvatar"
          :partner-status-text="partnerStatusText"
          :photo-url="photoUrl"
          :points="points"
          @upload-avatar="handleAvatarUpload"
        />

        <SettingMenuGroups
          :is-couple-submitting="isCoupleSubmitting"
          :is-dark-mode-enabled="isDarkModeEnabled"
          :partner-button-text="partnerButtonText"
          :unread-notifications-text="unreadNotificationsText"
          @open-profile-details="goToProfileDetails"
          @open-partner-details="goToPartnerDetails"
          @open-notifications="goToNotifications"
          @open-points-guide="showPointsGuide"
          @update-dark-mode="handleThemeToggle"
        />

        <SettingSignOutButton
          :is-submitting="isSigningOut"
          @sign-out="handleSignOut"
        />
      </template>
    </main>

    <SettingPointsGuideDialog v-model:show="isPointsGuideDialogOpen" />
  </MobileAppShell>
</template>

<spec lang="md">
## 1. 說明

- 設定頁整合使用者摘要、設定選單、登出操作與點數機制說明彈窗。

## 2. 功能需求

- 1. 使用者資料存在時，顯示個人資料卡、設定選單與登出按鈕。
- 2. 使用者點擊個人資料時，導向個人資料獨立頁面。
- 3. 使用者點擊夥伴設定時，導向夥伴設定獨立頁面。
- 4. 使用者點擊個人資料或夥伴設定時，導頁使用淡入淡出並由右往左的轉場。
- 5. 使用者點擊返回時，導頁使用淡入淡出並由左往右的轉場。
- 6. 使用者點擊點數機制說明時，開啟點數說明彈窗。
- 7. 使用者關閉點數說明彈窗時，設定頁同步維持彈窗為關閉狀態。
- A1：使用者資料不存在時，顯示空狀態內容。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。

## 4. 實作方式

- 使用 useSettingView 組裝設定頁資料、事件處理與彈窗顯示狀態。
- 個人資料與夥伴設定由獨立 route 頁面呈現，設定頁只負責導頁。
- 點數機制說明由 SettingPointsGuideDialog 子元件呈現，設定頁只負責傳遞顯示狀態。
</spec>
