<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import SettingEmptyProfileState from "@/components/setting/profile/SettingEmptyProfileState.vue";
import SettingProfileDetailsPanel from "@/components/setting/profile/SettingProfileDetailsPanel.vue";
import SettingTopBar from "@/components/setting/SettingTopBar.vue";
import { useUserStore } from "@/pinia/user";
import { useSettingView } from "./composables/useSettingView";

const route = useRoute();
const userStore = useUserStore();

const {
  activeDetailsFields,
  cancelDisplayNameEdit,
  canShowDeleteAccount,
  canSaveDisplayName,
  detailsDisplayName,
  detailsEmptyText,
  detailsPanelTitle,
  detailsTransitionEnterFromClass,
  detailsTransitionLeaveToClass,
  displayNameInput,
  goBack,
  handleDeleteAccount,
  handlePartnerSettings,
  handleSaveDisplayName,
  hasProfile,
  isDeletingAccount,
  isEditingDisplayName,
  isPartnerDetailsMode,
  isPartnerProfileLoading,
  isSavingProfile,
  openDisplayNameEdit,
  openPartnerDetails,
  openProfileDetails,
  partnerPrimaryActionText,
} = useSettingView();

const pageTitle = computed(() =>
  route.name === "setting-partner" ? "夥伴設定" : "個人資料",
);

watch(
  () => route.name,
  (routeName) => {
    if (routeName === "setting-partner") {
      openPartnerDetails();
      return;
    }

    openProfileDetails();
  },
  { immediate: true },
);

watch(
  () => userStore.profile?.displayName ?? "",
  (nextDisplayName) => {
    displayNameInput.value = nextDisplayName;
  },
  { immediate: true },
);

</script>

<template>
  <MobileAppShell>
    <SettingTopBar :title="pageTitle" @back="goBack" />

    <main
      class="mx-auto grid w-full max-w-[672px] flex-1 gap-[24px] px-[20px] pb-[48px] pt-[8px] sm:px-[28px]"
    >
      <SettingEmptyProfileState v-if="!hasProfile" />

      <SettingProfileDetailsPanel
        v-else
        v-model:display-name-input="displayNameInput"
        :action-text="partnerPrimaryActionText"
        :can-save-display-name="canSaveDisplayName"
        :can-show-delete-account="canShowDeleteAccount"
        :display-name="detailsDisplayName"
        :empty-text="detailsEmptyText"
        :fields="activeDetailsFields"
        :is-deleting-account="isDeletingAccount"
        :is-editing-display-name="isEditingDisplayName"
        :is-partner-mode="isPartnerDetailsMode"
        :is-partner-profile-loading="isPartnerProfileLoading"
        :is-saving-profile="isSavingProfile"
        :title="detailsPanelTitle"
        :transition-enter-from-class="detailsTransitionEnterFromClass"
        :transition-leave-to-class="detailsTransitionLeaveToClass"
        @cancel-display-name-edit="cancelDisplayNameEdit"
        @delete-account="handleDeleteAccount"
        @open-display-name-edit="openDisplayNameEdit"
        @primary-action="handlePartnerSettings"
        @save-display-name="handleSaveDisplayName"
      />
    </main>
  </MobileAppShell>
</template>

<spec lang="md">
## 1. 說明

- 顯示設定中的個人資料或夥伴設定獨立頁面。

## 2. 功能需求

- 1. 使用者進入個人資料路由時，顯示個人資料頁面。
- 2. 使用者進入夥伴設定路由時，顯示夥伴設定頁面。
- 3. 個人資料與夥伴設定頁面只顯示暱稱、email、邀請碼。
- 4. 個人資料頁面可編輯暱稱並顯示刪除帳號按鈕。
- 5. 夥伴設定頁面不可編輯暱稱，且不顯示刪除帳號按鈕。
- 6. 使用者點擊返回時，導頁使用淡入淡出並由左往右的轉場。
- A1：使用者資料不存在時，顯示空狀態內容。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。

## 4. 實作方式

- 使用路由名稱決定目前頁面模式。
- 使用 useSettingView 組裝欄位、暱稱編輯、刪除帳號與夥伴操作事件。
- 內容區塊由 SettingProfileDetailsPanel 呈現。
</spec>
